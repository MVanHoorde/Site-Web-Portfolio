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

  Aucun droit administrateur : la tâche est posée pour l'utilisateur
  courant seulement.
================================================================
#>

param(
  [int]    $Minutes = 15,
  [switch] $Retirer,
  [switch] $Etat,
  [string] $NomTache = "SNT - precorrection IA"
)

$ErrorActionPreference = "Stop"
$dossier = Split-Path -Parent $MyInvocation.MyCommand.Path
$journal = Join-Path $dossier "worker.log"

function Info($t) { Write-Host $t }
function Bien($t) { Write-Host "  OK   $t" -ForegroundColor Green }
function Mal ($t) { Write-Host "  !!   $t" -ForegroundColor Red }
function Mou ($t) { Write-Host "  ..   $t" -ForegroundColor DarkGray }

# ---------------------------------------------------------------
#  Retrait
# ---------------------------------------------------------------
if ($Retirer) {
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
  $t = Get-ScheduledTask -TaskName $NomTache -ErrorAction SilentlyContinue
  if (-not $t) { Mou "Tache non installee."; exit 0 }
  $info = Get-ScheduledTaskInfo -TaskName $NomTache
  Info "Tache      : $($t.State)"
  Info "Derniere   : $($info.LastRunTime)  (code $($info.LastTaskResult))"
  Info "Prochaine  : $($info.NextRunTime)"
  if (Test-Path $journal) {
    Info ""
    Info "Dernieres lignes du journal :"
    Get-Content $journal -Tail 12 | ForEach-Object { Mou $_ }
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
Set-Location -LiteralPath '$dossier'
`$debut = Get-Date -Format 'yyyy-MM-dd HH:mm'
`$sortie = & node precorrection-snt.mjs 2>&1 | Out-String
Add-Content -LiteralPath '$journal' -Value ("[" + `$debut + "] " + `$sortie.Trim())
# on ne garde que les 400 dernieres lignes
if ((Get-Content -LiteralPath '$journal' | Measure-Object -Line).Lines -gt 400) {
  `$fin = Get-Content -LiteralPath '$journal' -Tail 300
  Set-Content -LiteralPath '$journal' -Value `$fin
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

Register-ScheduledTask -TaskName $NomTache -Action $action -Trigger $t1 `
  -Settings $reglages -Description "Pre-correction IA des reponses libres SNT (modele local)" | Out-Null

Info ""
Bien "Tache installee : toutes les $Minutes minutes, session ouverte."
Info ""
Info "  Journal      : $journal"
Info "  Voir l'etat  : .\planifier-worker.ps1 -Etat"
Info "  Retirer      : .\planifier-worker.ps1 -Retirer"
Info ""
Mou "Premiere execution : maintenant."
Start-ScheduledTask -TaskName $NomTache
