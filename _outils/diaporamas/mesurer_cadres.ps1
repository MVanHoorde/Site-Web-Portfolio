# mesurer_cadres.ps1 — compare, pour chaque zone de texte, la hauteur RÉELLE
# du texte (PowerPoint la calcule : TextRange.BoundHeight) à la hauteur du
# cadre qui est censé le contenir.
#
# POURQUOI — le générateur estime la hauteur d'un cadre à partir du nombre de
# caractères. L'estimation ignorait la taille des runs : les quatre équations
# de l'exercice 11, écrites en 22 pt dans un cadre calculé pour du 15 pt,
# sortaient du cadre. Une estimation ne se vérifie pas par une autre
# estimation — ici c'est PowerPoint qui mesure.
#
# USAGE
#   powershell -File mesurer_cadres.ps1 -Pptx <fichier.pptx>
param([Parameter(Mandatory = $true)][string]$Pptx)

$ErrorActionPreference = 'Stop'
$CM = 360000
$app = $null; $pres = $null
try {
  $app = New-Object -ComObject PowerPoint.Application
  $pres = $app.Presentations.Open((Resolve-Path $Pptx).Path, $true, $false, $false)

  # les cadres : rectangles pleins sans texte, qui servent de contenant
  $cadres = @{}
  foreach ($s in $pres.Slides) {
    $liste = @()
    foreach ($sh in $s.Shapes) {
      # un bloc plein écran (fond d'intercalaire, bandeau) n'est pas un
      # cadre de contenu : le compter en faisait un « creux » de 8 cm.
      if ($sh.HasTextFrame -eq -1 -and $sh.TextFrame.TextRange.Length -eq 0 `
          -and $sh.Width -gt 200 -and $sh.Height -gt 40 `
          -and -not ($sh.Width -gt 900 -and $sh.Height -gt 480)) {
        $liste += , @($sh.Left, $sh.Top, $sh.Width, $sh.Height)
      }
    }
    $cadres[$s.SlideIndex] = $liste
  }

  $souci = 0
  foreach ($s in $pres.Slides) {
    # pour chaque cadre : le bas du texte le plus bas qu'il contient
    $plusBas = @{}
    $apercus = @{}
    foreach ($sh in $s.Shapes) {
      if ($sh.HasTextFrame -ne -1) { continue }
      $tr = $sh.TextFrame.TextRange
      if ($tr.Length -eq 0) { continue }
      $bas = $sh.Top + $tr.BoundHeight
      $i = 0
      foreach ($c in $cadres[$s.SlideIndex]) {
        if ($sh.Left -ge $c[0] - 2 -and $sh.Left -lt $c[0] + $c[2] -and `
            $sh.Top -ge $c[1] - 2 -and $sh.Top -lt $c[1] + $c[3]) {
          if (-not $plusBas.ContainsKey($i) -or $bas -gt $plusBas[$i]) {
            $plusBas[$i] = $bas
            $apercus[$i] = ($tr.Text.Substring(0, [math]::Min(46, $tr.Text.Length)) -replace "`r|`n", ' ')
          }
          break
        }
        $i++
      }
    }
    for ($i = 0; $i -lt $cadres[$s.SlideIndex].Count; $i++) {
      if (-not $plusBas.ContainsKey($i)) { continue }
      $c = $cadres[$s.SlideIndex][$i]
      $ecart = [math]::Round(($plusBas[$i] - ($c[1] + $c[3])) / 28.35, 2)
      if ($ecart -gt 0.05) {
        Write-Output ("diapo {0,2} - DEBORDE de {1} cm : {2}" -f $s.SlideIndex, $ecart, $apercus[$i])
        $souci++
      }
      elseif ($ecart -lt -1.6) {
        Write-Output ("diapo {0,2} - creux de {1} cm   : {2}" -f $s.SlideIndex, (-$ecart), $apercus[$i])
      }
    }
  }
  if ($souci -eq 0) { Write-Output "aucun texte ne deborde de son cadre" }
  else { Write-Output "$souci cadre(s) a reprendre" }
}
catch { Write-Output "ECHEC : $($_.Exception.Message)"; exit 1 }
finally {
  if ($pres) { $pres.Close() }
  if ($app) { $app.Quit() }
}
