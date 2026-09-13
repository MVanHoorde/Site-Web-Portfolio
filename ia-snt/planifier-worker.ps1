<#
================================================================
  planifier-worker.ps1  -  faire tourner la pré-correction toute seule
  ----------------------------------------------------------------
  POURQUOI CE SCRIPT
  precorrection-snt.mjs fait UNE passe puis s'arrête : il ramasse les
  copies en attente que personne n'a encore pré-corrigées, écrit son
  analyse, et rend la main. Tant qu'on le lance à la main, les élèves
  attendent que Loïc y pense.

  Ce script installe DEUX tâches planifiées Windows, qui suivent le
  calendrier de horaires-worker.psd1 :

    « SNT - precorrection IA »            ouverture de session + 18 h
        Une passe, sans réveiller le PC : à 18 h, seulement s'il est
        allumé. Le matin, c'est l'ouverture de session qui ramasse ce
        qui est arrivé depuis la veille.

    « SNT - precorrection IA (seances) »  chaque séance de SNT
        Réveille le PC 10 min avant le début, puis une passe toutes les
        5 min jusqu'à 15 min après la fin (boucle-worker.ps1 -Seance).

  Deux tâches et non une : le réveil est un réglage de la TÂCHE, pas
  du déclencheur. Une tâche unique réveillerait aussi le PC à 18 h tous
  les soirs, ce qu'on ne veut pas.

  CE QUE LE RÉVEIL SAIT FAIRE, ET CE QU'IL NE SAIT PAS
  Il sort le PC de VEILLE. Il ne l'allume pas s'il est éteint : ça, seul
  le BIOS le peut (option « RTC Alarm » ou « Power On By RTC »). Et même
  allumé par le BIOS, le PC resterait à l'écran de connexion, or Ollama
  a besoin d'une session ouverte pour accéder au GPU. D'où la consigne :
  les soirs qui précèdent une séance, METTRE EN VEILLE, NE PAS ÉTEINDRE.
  Prérequis Windows vérifié le 13/09/2026 : « Autoriser les minuteurs
  de sortie de veille » est activé sur secteur.

  POURQUOI UNE TÂCHE PLANIFIÉE ET PAS UN SERVICE
  Un service tourne même sans session ouverte  -  mais Ollama, lui, a
  besoin de la session pour accéder au GPU dans une installation
  classique. Un service se contenterait donc d'échouer en silence.

  RGPD  -  inchangé. Le worker lit des copies pseudonymes, écrit une
  analyse, ne pose aucun statut. Aucune copie n'atteint l'élève sans
  que Loïc l'ait validée depuis le tableau de bord.

  UTILISATION  (PowerShell ADMINISTRATEUR, depuis le dossier ia-snt)
      powershell -ExecutionPolicy Bypass -File .\planifier-worker.ps1
      powershell -ExecutionPolicy Bypass -File .\planifier-worker.ps1 -Etat
      powershell -ExecutionPolicy Bypass -File .\planifier-worker.ps1 -Retirer
      powershell -ExecutionPolicy Bypass -File .\planifier-worker.ps1 -Boucle

  Changer les horaires : modifier horaires-worker.psd1, puis relancer
  la première commande. Elle remplace les deux tâches.

  ATTENTION  -  Register-ScheduledTask EXIGE une élévation sur la
  plupart des configurations Windows (" Accès refusé " constaté le
  31/07/2026). Sans privilèges, -Boucle installe à la place une boucle
  lancée à l'ouverture de session par le dossier Démarrage : elle suit
  le même calendrier, mais ne sait pas réveiller le PC.
================================================================
#>

param(
  [switch] $Retirer,
  [switch] $Etat,
  [switch] $Boucle
)

$ErrorActionPreference = "Stop"
$dossier = Split-Path -Parent $MyInvocation.MyCommand.Path
$journal = Join-Path $dossier "worker.log"
$script  = Join-Path $dossier "boucle-worker.ps1"

$TacheJour    = "SNT - precorrection IA"
$TacheSeances = "SNT - precorrection IA (seances)"
$Taches       = @($TacheJour, $TacheSeances)

function Info($t) { Write-Host $t }
function Bien($t) { Write-Host "  OK   $t" -ForegroundColor Green }
function Mal ($t) { Write-Host "  !!   $t" -ForegroundColor Red }
function Mou ($t) { Write-Host "  ..   $t" -ForegroundColor DarkGray }

$demarrage = [Environment]::GetFolderPath('Startup')
$raccourci = Join-Path $demarrage "snt-worker.cmd"

$fichierHoraires = Join-Path $dossier "horaires-worker.psd1"
if (-not (Test-Path $fichierHoraires)) { Mal "horaires-worker.psd1 introuvable."; exit 1 }
$H = Import-PowerShellDataFile -LiteralPath $fichierHoraires

# ---------------------------------------------------------------
#  Mode boucle  -  aucun privilège requis
# ---------------------------------------------------------------
if ($Boucle) {
  if (-not (Test-Path $script)) { Mal "boucle-worker.ps1 introuvable."; exit 1 }

  $contenu = "@echo off`r`n" +
    "start `"`" /min powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$script`"`r`n"
  Set-Content -LiteralPath $raccourci -Value $contenu -Encoding ASCII

  Info ""
  Bien "Boucle installee au demarrage de ta session (calendrier de horaires-worker.psd1)."
  Info "  Fichier   : $raccourci"
  Info "  Journal   : $journal"
  Info "  Retirer   : .\planifier-worker.ps1 -Retirer"
  Info ""
  Mou "Elle ne sait PAS sortir le PC de veille : pour ca, il faut les taches"
  Mou "planifiees, donc ce script lance dans un PowerShell administrateur."
  exit 0
}

# ---------------------------------------------------------------
#  Retrait
# ---------------------------------------------------------------
if ($Retirer) {
  if (Test-Path $raccourci) { Remove-Item $raccourci -Force; Bien "Lancement au demarrage supprime." }
  foreach ($n in $Taches) {
    if (Get-ScheduledTask -TaskName $n -ErrorAction SilentlyContinue) {
      Unregister-ScheduledTask -TaskName $n -Confirm:$false
      Bien "Tache supprimee : $n"
    } else {
      Mou "Pas de tache : $n"
    }
  }
  exit 0
}

# ---------------------------------------------------------------
#  Etat
# ---------------------------------------------------------------
if ($Etat) {
  if (Test-Path $raccourci) { Bien "Boucle installee au demarrage : $raccourci" }
  foreach ($n in $Taches) {
    $t = Get-ScheduledTask -TaskName $n -ErrorAction SilentlyContinue
    Info ""
    if (-not $t) { Mou "Non installee : $n"; continue }
    $info = Get-ScheduledTaskInfo -TaskName $n
    Info "$n"
    Info "  Etat       : $($t.State)   (reveil du PC : $($t.Settings.WakeToRun))"
    Info "  Derniere   : $($info.LastRunTime)  (code $($info.LastTaskResult))"
    Info "  Prochaine  : $($info.NextRunTime)"
  }
  if (Test-Path $journal) {
    Info ""
    Info "Dernieres lignes du journal :"
    Get-Content $journal -Tail 12 -Encoding UTF8 | ForEach-Object { Mou $_ }
  }
  exit 0
}

# ---------------------------------------------------------------
#  Verifications avant d'installer quoi que ce soit.
#  Une tache planifiee qui echoue en silence est pire que pas de
#  tache du tout : on verifie donc que tout est la AVANT.
# ---------------------------------------------------------------
Info ""
Info "Verifications"

if (Test-Path (Join-Path $dossier "precorrection-snt.mjs")) { Bien "precorrection-snt.mjs trouve" }
else { Mal "precorrection-snt.mjs introuvable. Lance ce script DEPUIS le dossier ia-snt."; exit 1 }

if (Test-Path $script) { Bien "boucle-worker.ps1 trouve" }
else { Mal "boucle-worker.ps1 introuvable."; exit 1 }

if (Test-Path (Join-Path $dossier ".env")) { Bien ".env present" }
else { Mal ".env introuvable : le worker ne pourra pas joindre Supabase."; exit 1 }

$node = (Get-Command node -ErrorAction SilentlyContinue)
if ($node) { Bien "node : $($node.Source)" }
else { Mal "node introuvable dans le PATH."; exit 1 }

# Ollama : on ne bloque pas, on avertit. Il peut etre eteint au
# moment ou l'on installe la tache et demarrer plus tard.
try {
  $null = Invoke-WebRequest -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 3 -UseBasicParsing
  Bien "Ollama repond sur le port 11434"
} catch {
  Mou "Ollama ne repond pas maintenant. Ce n'est pas bloquant, mais les"
  Mou "passes echoueront tant qu'il ne tourne pas. Pense a l'activer au"
  Mou "demarrage : Ollama > parametres > 'Launch on login'."
}

$identite = [Security.Principal.WindowsIdentity]::GetCurrent()
$estAdmin = (New-Object Security.Principal.WindowsPrincipal($identite)).IsInRole(
              [Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $estAdmin) {
  Info ""
  Mal "Cette fenetre n'est pas administrateur  -  les taches vont etre refusees."
  Info ""
  Info "  Deux solutions :"
  Info "   1. Rouvre PowerShell en administrateur et relance cette commande."
  Info "   2. Passe par la boucle, qui ne demande aucun privilege"
  Info "      (mais ne sait pas reveiller le PC) :"
  Info "        .\planifier-worker.ps1 -Boucle"
  Info ""
  exit 1
}

# ---------------------------------------------------------------
#  Construction
# ---------------------------------------------------------------
# HEURE LOCALE, PAS UTC. New-ScheduledTaskTrigger écrit l'heure de départ
# en temps universel (« 2026-09-13T16:00:00Z » pour 18 h), et Windows la
# tient alors pour une heure absolue : au passage à l'heure d'hiver, tout
# glisserait d'une heure (constaté au test du 13/09/2026). Sans suffixe,
# l'heure suit l'horloge du PC, changements d'heure compris.
function HeureLocale($declencheur, [datetime] $heure) {
  $declencheur.StartBoundary = (Get-Date).Date.Add($heure.TimeOfDay).ToString('yyyy-MM-ddTHH:mm:ss')
  $declencheur
}

function Action([string] $option) {
  New-ScheduledTaskAction -Execute "powershell.exe" -WorkingDirectory $dossier `
    -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$script`" $option"
}

# Tache 1 : ouverture de session + le soir.
# Pas de StartWhenAvailable : un 18 h manque parce que le PC etait
# eteint n'a pas a etre rattrape, l'ouverture de session suivante le fait.
$declJour = @(
  (New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME),
  (HeureLocale (New-ScheduledTaskTrigger -Daily -At $H.HeureDuSoir) ([datetime]::ParseExact($H.HeureDuSoir, 'HH:mm', $null)))
)
$reglagesJour = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 30)

# Tache 2 : un declencheur hebdomadaire par seance, a (debut - reveil).
# WakeToRun sort le PC de veille. StartWhenAvailable rattrape une seance
# si le PC s'allume en plein creneau : boucle-worker verifie lui-meme
# qu'on est encore dedans, et ne fait rien sinon.
$declSeances = @()
$lignes = @()
foreach ($s in $H.Seances) {
  $debut = [datetime]::ParseExact($s.Debut, 'HH:mm', $null)
  $fin   = [datetime]::ParseExact($s.Fin,   'HH:mm', $null)
  $reveil = $debut.AddMinutes(-$H.ReveilAvantMinutes)
  $declSeances += HeureLocale (New-ScheduledTaskTrigger -Weekly -DaysOfWeek $s.Jour -At $reveil) $reveil
  $lignes += ("{0,-9} reveil {1}  ->  passes {2} a {3}" -f $s.Jour, $reveil.ToString('HH:mm'),
              $debut.ToString('HH:mm'), $fin.AddMinutes($H.MargeApresMinutes).ToString('HH:mm'))
}
$reglagesSeances = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
  -WakeToRun -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Hours 3)

# Session interactive de l'utilisateur : c'est elle qui donne acces au GPU.
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

foreach ($n in $Taches) {
  if (Get-ScheduledTask -TaskName $n -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $n -Confirm:$false
  }
}

try {
  Register-ScheduledTask -TaskName $TacheJour -Action (Action "-UneFois") -Trigger $declJour `
    -Settings $reglagesJour -Principal $principal `
    -Description "Pre-correction IA SNT : une passe a l'ouverture de session et a $($H.HeureDuSoir) (modele local)" | Out-Null
  Register-ScheduledTask -TaskName $TacheSeances -Action (Action "-Seance") -Trigger $declSeances `
    -Settings $reglagesSeances -Principal $principal `
    -Description "Pre-correction IA SNT pendant les seances : reveille le PC, une passe toutes les $($H.PasSeanceMinutes) min" | Out-Null
} catch {
  Info ""
  Mal ("Installation refusee : " + $_.Exception.Message)
  Info "  Replie-toi sur la boucle, qui ne demande aucun privilege :"
  Info "    .\planifier-worker.ps1 -Boucle"
  exit 1
}

# L'ancienne boucle du dossier Demarrage ferait double emploi.
if (Test-Path $raccourci) { Remove-Item $raccourci -Force; Mou "Ancienne boucle du dossier Demarrage retiree." }

Info ""
Bien "Taches installees."
Info ""
Info "  $TacheJour"
Info "    ouverture de session, et $($H.HeureDuSoir) si le PC est allume"
Info "  $TacheSeances  (reveille le PC)"
$lignes | ForEach-Object { Info "    $_" }
Info ""
Info "  Journal      : $journal"
Info "  Voir l'etat  : .\planifier-worker.ps1 -Etat"
Info "  Retirer      : .\planifier-worker.ps1 -Retirer"
Info ""
Mou "Rappel : le reveil sort le PC de VEILLE, il ne l'allume pas s'il est eteint."
Mou "Premiere passe : maintenant."
Start-ScheduledTask -TaskName $TacheJour
