@echo off
rem ============================================================
rem  MODELE de configuration — NE PAS REMPLIR CE FICHIER-CI
rem ============================================================
rem
rem  Ce fichier est un exemple, versionne dans le depot.
rem  Il ne doit JAMAIS contenir de mot de passe.
rem
rem  Marche a suivre :
rem    1. copier ce fichier vers
rem         %USERPROFILE%\.supabase-vanhoorde\config.bat
rem    2. remplir la ligne PGPASSWORD dans la COPIE seulement
rem
rem  La copie vit hors du depot Git : elle ne peut donc pas
rem  partir sur GitHub par inadvertance.
rem ============================================================


rem --- Adresse de la base (Session pooler, region Paris) -------
rem  Aucun mot de passe dans cette ligne : il est fourni a part,
rem  par la variable PGPASSWORD ci-dessous. Ainsi, un mot de passe
rem  contenant des caracteres speciaux ne casse pas l'adresse.
set "SUPA_URL=postgresql://postgres.ztyvuiaohxekuyjeoaxz@aws-0-eu-west-3.pooler.supabase.com:5432/postgres?sslmode=require"


rem --- Mot de passe de la base --------------------------------
rem  Celui choisi a la creation du projet Supabase.
rem  A recopier depuis le gestionnaire de mots de passe.
set "PGPASSWORD=A_REMPLIR_DANS_LA_COPIE"


rem --- Dossier ou atterrissent les sauvegardes -----------------
set "SUPA_DEST=C:\Sauvegardes-SNT"
