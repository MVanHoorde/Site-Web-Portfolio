@echo off
setlocal EnableDelayedExpansion
rem ============================================================
rem  SAUVEGARDE HEBDOMADAIRE — base Supabase  snt-vanhoorde
rem ------------------------------------------------------------
rem  Ce que fait ce script, dans l'ordre :
rem    1. charge la configuration (adresse, mot de passe, dossier)
rem    2. verifie que tout est en place, sinon s'arrete
rem    3. ecrit un fichier .sql complet du schema  public
rem    4. inscrit une ligne dans la table  sauvegardes
rem    5. ajoute une ligne au journal  journal.log
rem
rem  Il ne contient AUCUN secret : tout vient du fichier de
rem  configuration situe hors du depot.
rem ============================================================


rem ------------------------------------------------------------
rem  1. Configuration
rem ------------------------------------------------------------
set "CONFIG=%USERPROFILE%\.supabase-vanhoorde\config.bat"

if not exist "%CONFIG%" (
  echo [ARRET] Fichier de configuration introuvable :
  echo         %CONFIG%
  echo.
  echo Recopier  bdd\outils\config-exemple.bat  a cet emplacement,
  echo puis y renseigner le mot de passe.
  exit /b 1
)

call "%CONFIG%"


rem ------------------------------------------------------------
rem  2. Verifications avant de commencer
rem ------------------------------------------------------------
if "%PGPASSWORD%"=="" (
  echo [ARRET] Le mot de passe n'est pas renseigne dans la configuration.
  exit /b 1
)
if "%PGPASSWORD%"=="A_REMPLIR_DANS_LA_COPIE" (
  echo [ARRET] Le mot de passe est reste sur sa valeur d'exemple.
  exit /b 1
)

where pg_dump >nul 2>&1
if errorlevel 1 (
  echo [ARRET] pg_dump est introuvable. Verifier l'installation :
  echo         scoop install postgresql
  exit /b 1
)

if not exist "%SUPA_DEST%" mkdir "%SUPA_DEST%"


rem ------------------------------------------------------------
rem  3. Le dump
rem ------------------------------------------------------------
rem  La date est demandee a PowerShell plutot qu'a la variable
rem  %date% de Windows : cette derniere change de format selon la
rem  langue du systeme, ce qui casserait le nom du fichier.
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HHmm"') do set "HORODATE=%%i"

set "NOM=snt-vanhoorde_%HORODATE%.sql"
set "CHEMIN=%SUPA_DEST%\%NOM%"

echo.
echo Sauvegarde en cours vers  %CHEMIN%
echo.

rem  --schema=public : on ne sauvegarde que NOS tables. Les schemas
rem  internes de Supabase (auth, storage...) appartiennent a la
rem  plateforme et se restaurent d'eux-memes sur un projet neuf.
pg_dump "%SUPA_URL%" --schema=public --no-owner --no-privileges --file="%CHEMIN%"

if errorlevel 1 (
  echo [ECHEC] pg_dump a rencontre une erreur. Aucune ligne enregistree.
  echo %HORODATE%  ECHEC  pg_dump>> "%SUPA_DEST%\journal.log"
  exit /b 1
)

rem  Taille du fichier obtenu, en octets.
for %%A in ("%CHEMIN%") do set "OCTETS=%%~zA"

if "%OCTETS%"=="0" (
  echo [ECHEC] Le fichier produit est vide. Aucune ligne enregistree.
  echo %HORODATE%  ECHEC  fichier vide>> "%SUPA_DEST%\journal.log"
  exit /b 1
)

echo Fichier ecrit : %OCTETS% octets.


rem ------------------------------------------------------------
rem  4. La trace en base
rem ------------------------------------------------------------
rem  ON_ERROR_STOP=1 : psql renvoie une erreur au lieu de continuer
rem  silencieusement si l'insertion echoue.
psql "%SUPA_URL%" -v ON_ERROR_STOP=1 -q -c "insert into public.sauvegardes (libelle, motif, fichier, octets) values ('Sauvegarde hebdomadaire', 'tache planifiee Windows', '%NOM%', %OCTETS%);"

if errorlevel 1 (
  echo [AVERTISSEMENT] Le fichier de sauvegarde est bien la, mais la
  echo                 ligne n'a pas pu etre inscrite dans la base.
  echo %HORODATE%  PARTIEL  %NOM%  %OCTETS% octets  ^(trace en base manquante^)>> "%SUPA_DEST%\journal.log"
  exit /b 2
)


rem ------------------------------------------------------------
rem  5. Journal local
rem ------------------------------------------------------------
echo %HORODATE%  OK  %NOM%  %OCTETS% octets>> "%SUPA_DEST%\journal.log"

echo.
echo Sauvegarde terminee.
endlocal
exit /b 0
