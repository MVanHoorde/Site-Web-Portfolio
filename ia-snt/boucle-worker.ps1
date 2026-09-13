<#
================================================================
  boucle-worker.ps1  -  lancer la pré-correction, au bon moment
  ----------------------------------------------------------------
  Trois façons de l'appeler, une par besoin. Le calendrier lui-même
  vit dans horaires-worker.psd1, jamais ici.

  -UneFois    une passe, puis s'arrête.
              C'est ce que lance la tâche planifiée à l'ouverture de
              session et à 18 h.

  -Seance     tient toute une séance : une passe toutes les 5 minutes
              jusqu'à la fin du créneau en cours (marge comprise),
              puis s'arrête. Pendant ce temps, il EMPÊCHE LA MISE EN
              VEILLE : un PC réveillé par une minuterie, sans personne
              devant, se rendort de lui-même au bout de deux minutes
              environ  -  bien avant la première copie. Lancé hors
              créneau, il ne fait rien.
              C'est ce que lance la tâche « (seances) », qui réveille
              le PC 10 minutes avant chaque séance.

  (sans option)  le mode sans privilèges : tourne en permanence et
              suit le calendrier tout seul  -  une passe au démarrage,
              toutes les 5 minutes en séance, une à 18 h. Lancé à
              l'ouverture de session par le dossier Démarrage (voir
              planifier-worker.ps1 -Boucle). Il ne sait PAS réveiller
              le PC : pour ça, il faut la tâche planifiée, donc un
              PowerShell administrateur.

  Dans tous les cas : rien ne tourne PC éteint, et le worker ne fait
  que préparer. Aucune copie n'atteint l'élève sans validation
  humaine depuis le tableau de bord.
================================================================
#>

param(
  [switch] $UneFois,
  [switch] $Seance
)

$ErrorActionPreference = "Continue"

# Sans cela, les accents de node ressortent en charabia dans le
# journal (" Rien +� pr+�-corriger "), constaté le 31/07/2026 :
# node écrit en UTF-8, la console PowerShell lit en page de codes
# héritée. On aligne les deux, dans les deux sens.
try {
  [Console]::OutputEncoding = [Text.Encoding]::UTF8
  $OutputEncoding = [Text.Encoding]::UTF8
  $PSDefaultParameterValues['*:Encoding'] = 'utf8'
} catch {}

$dossier = Split-Path -Parent $MyInvocation.MyCommand.Path
$journal = Join-Path $dossier "worker.log"
Set-Location -LiteralPath $dossier

$H = Import-PowerShellDataFile -LiteralPath (Join-Path $dossier "horaires-worker.psd1")

function Noter($texte) {
  $ligne = "[" + (Get-Date -Format 'yyyy-MM-dd HH:mm') + "] " + $texte
  Write-Host $ligne
  try { Add-Content -LiteralPath $journal -Value $ligne -Encoding UTF8 -ErrorAction Stop } catch {}
}

function Tronquer {
  # Sans cela, worker.log grossit indéfiniment et devient inutile le
  # jour où l'on cherche pourquoi quelque chose a échoué.
  try {
    if (-not (Test-Path $journal)) { return }
    $n = (Get-Content -LiteralPath $journal | Measure-Object -Line).Lines
    if ($n -gt 400) {
      $fin = Get-Content -LiteralPath $journal -Tail 300 -Encoding UTF8
      Set-Content -LiteralPath $journal -Value $fin -Encoding UTF8
    }
  } catch {}
}

function UnePasse {
  # Ollama d'abord : sans lui, le worker échoue de façon peu lisible.
  try {
    $null = Invoke-WebRequest -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 5 -UseBasicParsing
  } catch {
    Noter "Ollama ne repond pas  -  passe ignoree."
    return
  }

  try {
    $sortie = & node precorrection-snt.mjs 2>&1 | Out-String
    $sortie = $sortie.Trim()
    if ($sortie) {
      # Une passe sans rien à faire ne mérite pas trois lignes de
      # journal : on ne garde que l'essentiel.
      if ($sortie -match "0 r.ponse|Aucune") { Noter "Rien a pre-corriger." }
      else { Noter $sortie }
    }
  } catch {
    Noter ("Echec : " + $_.Exception.Message)
  }
  Tronquer
}

# ---------------------------------------------------------------
#  Le calendrier
#  Renvoie la fin (marge comprise) du créneau qui contient $quand, ou
#  $null. $avance élargit le début : la tâche « seances » démarre
#  avant l'heure, au réveil du PC, et doit se reconnaître en séance.
# ---------------------------------------------------------------
function FinDuCreneau([datetime] $quand, [int] $avance) {
  foreach ($s in $H.Seances) {
    if ($quand.DayOfWeek.ToString() -ne $s.Jour) { continue }
    $debut = [datetime]::ParseExact($quand.ToString('yyyy-MM-dd') + ' ' + $s.Debut, 'yyyy-MM-dd HH:mm', $null)
    $fin   = [datetime]::ParseExact($quand.ToString('yyyy-MM-dd') + ' ' + $s.Fin,   'yyyy-MM-dd HH:mm', $null)
    $debut = $debut.AddMinutes(-$avance)
    $fin   = $fin.AddMinutes($H.MargeApresMinutes)
    if ($quand -ge $debut -and $quand -lt $fin) { return $fin }
  }
  return $null
}

# Empêcher la veille pendant une séance. SetThreadExecutionState est
# l'appel qu'utilisent les lecteurs vidéo : il ne rallume pas l'écran,
# il interdit seulement au système de se rendormir, et la consigne
# tombe d'elle-même quand le processus se termine.
function GarderEveille([bool] $oui) {
  try {
    if (-not ("Eveil.Etat" -as [type])) {
      Add-Type -Namespace Eveil -Name Etat -MemberDefinition @"
[System.Runtime.InteropServices.DllImport("kernel32.dll")]
public static extern uint SetThreadExecutionState(uint esFlags);
"@
    }
    # ES_CONTINUOUS (0x80000000) | ES_SYSTEM_REQUIRED (0x00000001)
    $drapeaux = if ($oui) { [uint32]2147483649 } else { [uint32]2147483648 }
    $null = [Eveil.Etat]::SetThreadExecutionState($drapeaux)
  } catch {
    Noter ("Impossible d'empecher la veille : " + $_.Exception.Message)
  }
}

# ---------------------------------------------------------------
#  -UneFois
# ---------------------------------------------------------------
if ($UneFois) { UnePasse; exit 0 }

# ---------------------------------------------------------------
#  -Seance
# ---------------------------------------------------------------
if ($Seance) {
  $fin = FinDuCreneau (Get-Date) ($H.ReveilAvantMinutes + 5)
  if (-not $fin) { Noter "Seance : aucun creneau en cours, rien a faire."; exit 0 }
  Noter ("Seance : une passe toutes les " + $H.PasSeanceMinutes + " min jusqu'a " + $fin.ToString('HH:mm') + ".")
  GarderEveille $true
  try {
    while ((Get-Date) -lt $fin) {
      $t0 = Get-Date
      UnePasse
      $reste = $H.PasSeanceMinutes * 60 - ((Get-Date) - $t0).TotalSeconds
      if ($reste -gt 0) { Start-Sleep -Seconds ([int][math]::Ceiling($reste)) }
    }
  } finally {
    GarderEveille $false
  }
  Noter "Seance terminee."
  exit 0
}

# ---------------------------------------------------------------
#  Sans option : la boucle permanente, qui suit le calendrier seule.
#  Elle se réveille chaque minute pour regarder l'heure ; une passe
#  ne part que si le calendrier le demande.
# ---------------------------------------------------------------
Noter "Boucle demarree  -  suit horaires-worker.psd1. Fermer la fenetre arrete tout."
UnePasse
$derniere = Get-Date
$soirFait = (Get-Date).ToString('yyyy-MM-dd')
if ((Get-Date).ToString('HH:mm') -lt $H.HeureDuSoir) { $soirFait = '' }

while ($true) {
  Start-Sleep -Seconds 60
  $maintenant = Get-Date

  if (FinDuCreneau $maintenant 0) {
    if (($maintenant - $derniere).TotalMinutes -ge ($H.PasSeanceMinutes - 0.5)) {
      UnePasse; $derniere = Get-Date
    }
    continue
  }

  $jour = $maintenant.ToString('yyyy-MM-dd')
  if ($soirFait -ne $jour -and $maintenant.ToString('HH:mm') -ge $H.HeureDuSoir) {
    UnePasse; $derniere = Get-Date; $soirFait = $jour
  }
}
