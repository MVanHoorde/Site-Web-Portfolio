@echo off
setlocal
rem ============================================================
rem  REVEIL QUOTIDIEN — base Supabase  (projet ztyvuiaohxekuyjeoaxz)
rem ------------------------------------------------------------
rem  Un projet du plan gratuit est mis en pause apres 7 jours
rem  sans activite de base de donnees. Ce script pose une
rem  question triviale a la base, une fois par jour, pour que
rem  le compteur reparte de zero.
rem
rem  Il ne lit rien de sensible, n'ecrit rien en base, et ne
rem  contient aucun secret : tout vient du fichier de
rem  configuration situe hors du depot.
rem ============================================================


rem ------------------------------------------------------------
rem  1. Configuration
rem ------------------------------------------------------------
set "CONFIG=%USERPROFILE%\.supabase-vanhoorde\config.bat"

if not exist "%CONFIG%" (
  echo [ARRET] Fichier de configuration introuvable :
  echo         %CONFIG%
  exit /b 1
)

call "%CONFIG%"

if "%PGPASSWORD%"=="" (
  echo [ARRET] Le mot de passe n'est pas renseigne dans la configuration.
  exit /b 1
)

where psql >nul 2>&1
if errorlevel 1 (
  echo [ARRET] psql est introuvable. Verifier l'installation :
  echo         scoop install postgresql
  exit /b 1
)

if not exist "%SUPA_DEST%" mkdir "%SUPA_DEST%"


rem ------------------------------------------------------------
rem  2. La requete
rem ------------------------------------------------------------
rem  On interroge une VRAIE table plutot que d'ecrire  select 1 :
rem  c'est bien l'activite sur les donnees qui est comptee.
rem  -t -A : sortie brute, sans en-tete ni cadre.
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HH:mm"') do set "HORODATE=%%i"

psql "%SUPA_URL%" -v ON_ERROR_STOP=1 -t -A -c "select count(*) from public.classes;" >nul 2>&1

if errorlevel 1 (
  echo [ECHEC] La base n'a pas repondu.
  echo %HORODATE%  ECHEC>> "%SUPA_DEST%\reveil.log"
  exit /b 1
)

echo %HORODATE%  OK>> "%SUPA_DEST%\reveil.log"


rem ------------------------------------------------------------
rem  3. L'occupation des quotas (06/10/2026)
rem ------------------------------------------------------------
rem  Les photos deposees par les eleves (stockage  depots ) et les
rem  collegues qui utilisent la meme base font monter l'occupation.
rem  Une ligne par jour dans  occupation.log  ; au-dela de 70 % d'un
rem  quota, un fichier ALERTE-QUOTA-SUPABASE.txt apparait sur le
rem  Bureau, et  node verifier.mjs  le signale aussi.
rem  Quoi faire : bdd\outils\occupation.sql (detail et purge).
rem  Une mesure qui echoue ne fait pas echouer le reveil.
set "MESURE="
for /f "delims=" %%m in ('psql "%SUPA_URL%" -t -A -f "%~dp0occupation-ligne.sql" 2^>nul') do set "MESURE=%%m"
if not defined MESURE goto :fin
echo %MESURE%>> "%SUPA_DEST%\occupation.log"
echo %MESURE% | findstr /c:"etat=ALERTE" >nul
if errorlevel 1 goto :fin
powershell -NoProfile -Command "Set-Content -Encoding UTF8 -Path ([Environment]::GetFolderPath('Desktop') + '\ALERTE-QUOTA-SUPABASE.txt') -Value ('La base Supabase du site approche de sa limite (plus de 70 %% d''un quota).', '%MESURE%', '', 'Quoi faire : ouvrir Claude Code dans le depot et lui demander d''examiner l''occupation (bdd/outils/occupation.sql).', 'Une purge des photos deposees libere de la place sans toucher aux reponses ni a la progression.', '', 'Ce fichier peut etre supprime : il reviendra tant que le seuil est depasse.')"

:fin
endlocal
exit /b 0
