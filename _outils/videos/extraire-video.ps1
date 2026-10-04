# extraire-video.ps1 - une video YouTube en MP4 + son texte, pour ecrire un QCM d'ecoute
#
# Usage, dans PowerShell :
#   . "<chemin du depot>\_outilsideos\extraire-video.ps1"     # une fois par fenetre
#   yt https://youtu.be/XXXXXXXXXXX                               # dans Telechargements
#   yt https://youtu.be/AAA, https://youtu.be/BBB -Dossier "$HOME\Downloads\mon-chapitre"
#   yt https://youtu.be/XXX -TexteSeul                            # sans le MP4
#
# Pour chaque lien : le MP4 (a deposer sur le OneDrive du lycee) et un .txt du
# texte, une ligne par phrase avec son minutage [mm:ss].
#  1. sous-titres de la chaine, ou automatiques ; s'ils manquent, second essai
#     avec un autre client YouTube (ils y sont souvent) ;
#  2. sinon, Whisper ecoute le MP4 sur ce PC - rien n'est envoye.
# Pre-requis : yt-dlp et ffmpeg (deja installes), faster-whisper (pip).
# Les transcriptions sont un texte d'auteur : elles vont dans _transcriptions/
# (exclu de Git), jamais dans assets/.
# Limite connue (04/10/2026) : certaines videos refusent le telechargement
# (jeton anti-robots de YouTube) ; le texte passe, le MP4 se prend a la main.
# Une video sans voix donne des sous-titres automatiques inventes : relire.

function yt {
  param(
    [Parameter(Mandatory)][string[]]$Url,
    [string]$Dossier = (Join-Path $HOME 'Downloads'),
    [switch]$TexteSeul
  )
  foreach ($u in $Url) {
    if ($u -notmatch '(?:v=|youtu\.be/|shorts/|embed/)([\w-]{11})') { Write-Warning "Lien non reconnu : $u"; continue }
    $id = $Matches[1]

    # 1. La vidéo en MP4 + les sous-titres français (ceux de la chaîne s'il y en a, sinon les automatiques)
    $opts = @('-P', $Dossier, '-o', '%(title).70B [%(id)s].%(ext)s',
              '--write-subs', '--write-auto-subs', '--sub-langs', 'fr,fr-orig,fr-FR', '--sub-format', 'vtt')
    if ($TexteSeul) { $opts += '--skip-download' }
    else { $opts += @('-f', 'bv*[ext=mp4][height<=1080]+ba[ext=m4a]/b[ext=mp4]/b', '--merge-output-format', 'mp4') }
    yt-dlp @opts $u
    $vtts = Get-ChildItem -LiteralPath $Dossier -File | Where-Object { $_.Extension -eq '.vtt' -and $_.Name.Contains("[$id]") }
    if (-not $vtts) {
      # Selon le mode d'accès, YouTube montre ou cache les sous-titres : on réessaie autrement
      yt-dlp --extractor-args 'youtube:player_client=tv_simply,web_embedded' --skip-download --ignore-no-formats-error `
        -P $Dossier -o '%(title).70B [%(id)s].%(ext)s' --write-subs --write-auto-subs --sub-langs 'fr,fr-orig,fr-FR' --sub-format vtt $u
    }

    # 2. Sous-titres -> texte lisible, une ligne par phrase, avec son minutage
    $vtts = Get-ChildItem -LiteralPath $Dossier -File | Where-Object { $_.Extension -eq '.vtt' -and $_.Name.Contains("[$id]") }
    if (-not $vtts) {
      # Pas de sous-titres : Whisper écoute la vidéo, sur ce PC (rien n'est envoyé)
      $mp4 = Get-ChildItem -LiteralPath $Dossier -File | Where-Object { $_.Extension -eq '.mp4' -and $_.Name.Contains("[$id]") } | Select-Object -First 1
      if (-not $mp4) { Write-Warning "Pas de sous-titres pour $u, et pas de MP4 à écouter (relancer sans -TexteSeul)"; continue }
      Write-Host "Pas de sous-titres : transcription par Whisper (quelques minutes)..." -ForegroundColor Yellow
      $py = Join-Path $env:TEMP 'yt-whisper.py'
      Set-Content -LiteralPath $py -Encoding UTF8 -Value @'
import sys
from faster_whisper import WhisperModel
f = sys.argv[1]
segments, _ = WhisperModel('small', device='cpu', compute_type='int8').transcribe(f, language='fr')
with open(f.rsplit('.', 1)[0] + '.whisper.txt', 'w', encoding='utf-8') as o:
    for s in segments:
        o.write('[%02d:%02d] %s\n' % (s.start // 60, s.start % 60, s.text.strip()))
'@
      python $py $mp4.FullName
      Write-Host "Texte : $([System.IO.Path]::ChangeExtension($mp4.FullName, '.whisper.txt'))" -ForegroundColor Green
      continue
    }
    foreach ($v in $vtts) {
      $sortie = [System.Collections.Generic.List[string]]::new()
      $temps = ''; $derniere = ''
      foreach ($l in (Get-Content -LiteralPath $v.FullName -Encoding UTF8)) {
        if ($l -match '^(\d{2}:)?(\d{2}:\d{2})\.\d{3} -->') { $temps = $Matches[2]; continue }
        if ($l -match '^(WEBVTT|Kind:|Language:|NOTE)' -or $l -match '^\s*$') { continue }
        $t = [System.Net.WebUtility]::HtmlDecode(($l -replace '<[^>]+>', '')).Trim()
        if ($t -and $t -ne $derniere) { $sortie.Add("[$temps] $t"); $derniere = $t }
      }
      $txt = [System.IO.Path]::ChangeExtension($v.FullName, '.txt')
      Set-Content -LiteralPath $txt -Value $sortie -Encoding UTF8
      Remove-Item -LiteralPath $v.FullName
      Write-Host "Texte : $txt" -ForegroundColor Green
    }
    # fr et fr-orig sont souvent le même texte : on n'en garde qu'un
    $txts = Get-ChildItem -LiteralPath $Dossier -File | Where-Object { $_.Extension -eq '.txt' -and $_.Name.Contains("[$id]") }
    $orig = $txts | Where-Object { $_.Name -like '*.fr-orig.txt' }
    $fr   = $txts | Where-Object { $_.Name -like '*.fr.txt' }
    if ($orig -and $fr -and ((Get-FileHash -LiteralPath $orig.FullName).Hash -eq (Get-FileHash -LiteralPath $fr.FullName).Hash)) {
      Remove-Item -LiteralPath $fr.FullName
    }
  }
}
