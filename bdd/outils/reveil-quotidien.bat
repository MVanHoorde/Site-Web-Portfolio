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
endlocal
exit /b 0
