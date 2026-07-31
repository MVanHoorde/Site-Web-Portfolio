<#
================================================================
  boucle-worker.ps1 — la pré-correction en continu, sans privilèges
  ----------------------------------------------------------------
  POURQUOI CE SECOND CHEMIN
  Register-ScheduledTask exige une élévation sur la plupart des
  configurations Windows — refus « Accès refusé » constaté le
  31/07/2026. Ce script fait le même travail sans aucun privilège :
  une simple boucle, lancée à l'ouverture de session par un fichier
  déposé dans le dossier Démarrage de l'utilisateur.

  DIFFÉRENCE AVEC LA TÂCHE PLANIFIÉE
  La tâche planifiée est gérée par Windows : elle survit à la
  fermeture de la fenêtre, se relance seule, se surveille. Ici, c'est
  un processus PowerShell ordinaire : si on le ferme, il s'arrête.
  C'est moins robuste, mais cela ne dépend que de l'utilisateur —
  et sur un poste d'établissement, c'est souvent le seul chemin.

  Le reste est identique : rien ne tourne PC éteint, et le worker ne
  fait que préparer. Aucune copie n'atteint l'élève sans validation
  humaine depuis le tableau de bord.

  UTILISATION DIRECTE
      powershell -ExecutionPolicy Bypass -File .\boucle-worker.ps1
      powershell -ExecutionPolicy Bypass -File .\boucle-worker.ps1 -Minutes 30

  INSTALLATION AU DÉMARRAGE (voir planifier-worker.ps1 -Boucle)
================================================================
#>

param(
  [int] $Minutes = 15,
  [switch] $UneFois
)

$ErrorActionPreference = "Continue"

# Sans cela, les accents de node ressortent en charabia dans le
# journal (« Rien +� pr+�-corriger »), constaté le 31/07/2026 :
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
  # Mieux vaut un message clair qu'une trace d'erreur toutes les
  # quinze minutes dans le journal.
  try {
    $null = Invoke-WebRequest -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 3 -UseBasicParsing
  } catch {
    Noter "Ollama ne repond pas — passe ignoree."
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

if ($UneFois) { UnePasse; exit 0 }

Noter "Boucle demarree — une passe toutes les $Minutes minutes. Fermer la fenetre arrete tout."
while ($true) {
  UnePasse
  Start-Sleep -Seconds ($Minutes * 60)
}
