# apercu_pptx.ps1 — exporte chaque diapositive d'un .pptx en PNG, par PowerPoint.
#
# POURQUOI — l'étape 4 des consignes (contrôle visuel) n'est pas facultative :
# sur T1-C2 elle a révélé, après un contrôle géométrique vert, « SUR LA FICHE »
# coupé sur huit diapositives et deux équations mal alignées. PowerPoint est
# installé sur le poste ; ni LibreOffice ni pywin32 ne le sont.
#
# C'est AUSSI le test de validité du fichier : PowerPoint refuse d'ouvrir un
# .pptx corrompu, et le script échoue alors avec son message.
#
# Cité par CONSIGNES-diaporama-PC.md depuis le 20/09/2026 mais absent du dépôt
# jusqu'au 22/09 : écrit en produisant le diaporama de T1-C1.
#
# USAGE
#   powershell -File apercu_pptx.ps1 -Pptx <fichier.pptx> -Sortie <dossier> [-Largeur 1600]
param(
  [Parameter(Mandatory = $true)][string]$Pptx,
  [Parameter(Mandatory = $true)][string]$Sortie,
  [int]$Largeur = 1600
)

$ErrorActionPreference = 'Stop'
$app = $null; $pres = $null
try {
  New-Item -ItemType Directory -Force -Path $Sortie | Out-Null
  $dossier = (Resolve-Path $Sortie).Path
  $app = New-Object -ComObject PowerPoint.Application
  # lecture seule, sans fenêtre
  $pres = $app.Presentations.Open((Resolve-Path $Pptx).Path, $true, $false, $false)
  $hauteur = [int]($Largeur * $pres.PageSetup.SlideHeight / $pres.PageSetup.SlideWidth)
  foreach ($s in $pres.Slides) {
    $f = Join-Path $dossier ("diapo-{0:D2}.png" -f $s.SlideIndex)
    $s.Export($f, "PNG", $Largeur, $hauteur)
  }
  Write-Output ("{0} diapositive(s) exportée(s) dans {1}" -f $pres.Slides.Count, $dossier)
}
catch { Write-Output "ECHEC : $($_.Exception.Message)"; exit 1 }
finally {
  if ($pres) { $pres.Close() }
  if ($app) { $app.Quit() }
}
