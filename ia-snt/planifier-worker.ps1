<#
================================================================
  planifier-worker.ps1 — faire tourner la pré-correction toute seule
  ----------------------------------------------------------------
  POURQUOI CE SCRIPT
  precorrection-snt.mjs fait UNE passe puis s'arrête : il ramasse les
  copies en attente que personne n'a encore pré-corrigées, écrit son
  analyse, et rend la main. Tant qu'on le lance à la main, les élèves
  attendent que Loïc y pense.

  Ce script installe une tâche planifiée Windows qui le lance toutes
  les N minutes, tant que la session est ouverte.

  POURQUOI UNE TÂCHE PLANIFIÉE ET PAS UN SERVICE
  Un service tourne même sans session ouverte — mais Ollama, lui, a
  besoin de la session pour accéder au GPU dans une installation
  classique. Un service se contenterait donc d'échouer en silence
  toutes les quinze minutes. La tâche planifiée, elle, s'exécute
  exactement quand les conditions sont réunies : Loïc est devant son
  PC, Ollama tourne.

  CE QU'IL NE FAUT PAS EN ATTENDRE
  Rien ne tourne PC éteint. Si les élèves travaillent le dimanche
  soir et que la machine est fermée, leurs copies attendront lundi.
  C'est un choix assumé : le modèle est local et souverain, il vit
  sur cette machine et nulle part ailleurs.

  RGPD — inchangé. Le worker lit des copies pseudonymes, écrit une
  analyse, ne pose aucun statut. Aucune copie n'atteint l'élève sans
  que Loïc l'ait validée depuis le tableau de bord.

  UTILISATION
      cd ia-snt
      powershell -ExecutionPolicy Bypass -File .\planifier-worker.ps1
      powershell -ExecutionPolicy Bypass -File .\planifier-worker.ps1 -Minutes 30
      powershell -ExecutionPolicy Bypass -File .\planifier-worker.ps1 -Retirer
      powershell -ExecutionPolicy Bypass -File .\planifier-worker.ps1 -Etat

  ATTENTION — Register-ScheduledTask EXIGE une élévation sur la
  plupart des configurations Windows (« Accès refusé » constaté le
  31/07/2026). Deux chemins, donc :
      · PowerShell lancé en administrateur → tâche planifiée
      · sans privilèges → -Boucle, qui installe un script en boucle
        lancé à l'ouverture de session par le dossier Démarrage
================================================================
#>

param(
  [int]    $Minutes = 15,
  [switch] $Retirer,
  [switch] $Etat,
  [switch] $Boucle,
  [string] $NomTache = "SNT - precorrection IA"
)

$ErrorActionPreference = "Stop"
$dossier = Split-Path -Parent $MyInvocation.MyCommand.Path
$journal = Join-Path $dossier "worker.log"

function Info($t) { Write-Host $t }
function Bien($t) { Write-Host "  OK   $t" -ForegroundColor Green }
function Mal ($t) { Write-Host "  !!   $t" -ForegroundColor Red }
function Mou ($t) { Write-Host "  ..   $t" -ForegroundColor DarkGray }

$demarrage = [Environment]::GetFolderPath('Startup')
$raccourci = Join-Path $demarrage "snt-worker.cmd"

# ---------------------------------------------------------------
#  Mode boucle — aucun privilège requis
#
#  On dépose un .cmd dans le dossier Démarrage de l'utilisateur :
#  Windows l'exécute à l'ouverture de session, sans rien demander à
#  personne. C'est moins robuste qu'une tâche planifiée (fermer la
#  fenêtre arrête tout) mais cela ne dépend que de l'utilisateur.
# ---------------------------------------------------------------
if ($Boucle) {
  $script = Join-Path $dossier "boucle-worker.ps1"
  if (-not (Test-Path $script)) { Mal "boucle-worker.ps1 introuvable."; exit 1 }

  $contenu = "@echo off`r`n" +
    "start `"`" /min powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$script`" -Minutes $Minutes`r`n"
  Set-Content -LiteralPath $raccourci -Value $contenu -Encoding ASCII

  Info ""
  Bien "Boucle installee au demarrage de ta session."
  Info "  Fichier   : $raccourci"
  Info "  Journal   : $journal"
  Info "  Retirer   : .\planifier-worker.ps1 -Retirer"
  Info ""
  Mou "Elle demarrera a ta prochaine ouverture de session."
  Mou "Pour la lancer tout de suite, dans une fenetre a part :"
  Mou "  powershell -ExecutionPolicy Bypass -File .\boucle-worker.ps1"
  exit 0
}

# ---------------------------------------------------------------
#  Retrait
# ---------------------------------------------------------------
if ($Retirer) {
  if (Test-Path $raccourci) { Remove-Item $raccourci -Force; Bien "Lancement au demarrage supprime." }
  if (Get-ScheduledTask -TaskName $NomTache -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $NomTache -Confirm:$false
    Bien "Tache supprimee. Le worker ne tournera plus tout seul."
  } else {
    Mou "Aucune tache a supprimer."
  }
  exit 0
}

# ---------------------------------------------------------------
#  Etat
# ---------------------------------------------------------------
if ($Etat) {
  if (Test-Path $raccourci) { Bien "Boucle installee au demarrage : $raccourci" }
  $t = Get-ScheduledTask -TaskName $NomTache -ErrorAction SilentlyContinue
  if (-not $t) {
    Mou "Tache planifiee non installee."
    if (Test-Path $journal) {
      Info ""
      Info "Dernieres lignes du journal :"
      Get-Content $journal -Tail 12 -Encoding UTF8 | ForEach-Object { Mou $_ }
    }
    exit 0
  }
  $info = Get-ScheduledTaskInfo -TaskName $NomTache
  Info "Tache      : $($t.State)"
  Info "Derniere   : $($info.LastRunTime)  (code $($info.LastTaskResult))"
  Info "Prochaine  : $($info.NextRunTime)"
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

$scriptWorker = Join-Path $dossier "precorrection-snt.mjs"
if (Test-Path $scriptWorker) { Bien "precorrection-snt.mjs trouve" }
else { Mal "precorrection-snt.mjs introuvable. Lance ce script DEPUIS le dossier ia-snt."; exit 1 }

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
  Mou "Ollama ne repond pas maintenant. Ce n'est pas bloquant, mais la"
  Mou "tache echouera tant qu'il ne tourne pas. Pense a l'activer au"
  Mou "demarrage : Ollama > parametres > 'Launch on login'."
}

# ---------------------------------------------------------------
#  Installation
#
#  La commande enveloppe l'appel pour horodater le journal et le
#  garder court : sans cela, worker.log grossit indefiniment et on
#  ne retrouve rien quand quelque chose cloche.
# ---------------------------------------------------------------
$commande = @"
try {
  [Console]::OutputEncoding = [Text.Encoding]::UTF8
  `$OutputEncoding = [Text.Encoding]::UTF8
} catch {}
Set-Location -LiteralPath '$dossier'
`$debut = Get-Date -Format 'yyyy-MM-dd HH:mm'
`$sortie = & node precorrection-snt.mjs 2>&1 | Out-String
Add-Content -LiteralPath '$journal' -Value ("[" + `$debut + "] " + `$sortie.Trim()) -Encoding UTF8
# on ne garde que les 400 dernieres lignes
if ((Get-Content -LiteralPath '$journal' -Encoding UTF8 | Measure-Object -Line).Lines -gt 400) {
  `$fin = Get-Content -LiteralPath '$journal' -Tail 300 -Encoding UTF8
  Set-Content -LiteralPath '$journal' -Value `$fin -Encoding UTF8
}
"@

$encode = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($commande))

$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-NoProfile -WindowStyle Hidden -EncodedCommand $encode"

# Deux declencheurs : a l'ouverture de session, puis en boucle. La
# repetition est posee sur une duree tres longue plutot qu'infinie,
# certaines versions de Windows refusant l'infini.
$t1 = New-ScheduledTaskTrigger -AtLogOn
$t1.Repetition = (New-ScheduledTaskTrigger -Once -At (Get-Date) `
  -RepetitionInterval (New-TimeSpan -Minutes $Minutes) `
  -RepetitionDuration (New-TimeSpan -Days 365)).Repetition

$reglages = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 30)

if (Get-ScheduledTask -TaskName $NomTache -ErrorAction SilentlyContinue) {
  Unregister-ScheduledTask -TaskName $NomTache -Confirm:$false
}

# Register-ScheduledTask echoue avec « Acces refuse » sans elevation.
# On l'annonce AVANT plutot que de laisser une trace d'erreur.
$identite = [Security.Principal.WindowsIdentity]::GetCurrent()
$estAdmin = (New-Object Security.Principal.WindowsPrincipal($identite)).IsInRole(
              [Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $estAdmin) {
  Info ""
  Mal "Cette fenetre n'est pas administrateur — la tache va etre refusee."
  Info ""
  Info "  Deux solutions :"
  Info "   1. Rouvre PowerShell en administrateur et relance cette commande."
  Info "   2. Passe par la boucle, qui ne demande aucun privilege :"
  Info "        .\planifier-worker.ps1 -Boucle"
  Info ""
  exit 1
}

try {
  Register-ScheduledTask -TaskName $NomTache -Action $action -Trigger $t1 `
    -Settings $reglages -Description "Pre-correction IA des reponses libres SNT (modele local)" | Out-Null
} catch {
  Info ""
  Mal ("Installation refusee : " + $_.Exception.Message)
  Info "  Replie-toi sur la boucle, qui ne demande aucun privilege :"
  Info "    .\planifier-worker.ps1 -Boucle"
  exit 1
}

Info ""
Bien "Tache installee : toutes les $Minutes minutes, session ouverte."
Info ""
Info "  Journal      : $journal"
Info "  Voir l'etat  : .\planifier-worker.ps1 -Etat"
Info "  Retirer      : .\planifier-worker.ps1 -Retirer"
Info ""
Mou "Premiere execution : maintenant."
Start-ScheduledTask -TaskName $NomTache
