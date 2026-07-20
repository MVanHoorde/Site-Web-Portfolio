


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."archive_version_reponse"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.texte is distinct from old.texte then

    -- a) on range l'ANCIENNE version dans l'archive
    insert into public.reponses_versions (
      reponse_id, eleve_id, code_activite, version,
      texte, statut, correction_ia, commentaire_prof, envoye_le
    ) values (
      old.id, old.eleve_id, old.code_activite, old.version,
      old.texte, old.statut, old.correction_ia, old.commentaire_prof,
      old.envoye_le
    );

    -- b) la nouvelle rédaction repart proprement à zéro
    new.version          = old.version + 1;
    new.statut           = 'en_attente';
    new.correction_ia    = null;
    new.commentaire_prof = null;
    new.envoye_le        = now();
    new.corrige_le       = null;

  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."archive_version_reponse"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."touche_maj_le"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.maj_le = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."touche_maj_le"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."classes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "libelle" "text" NOT NULL,
    "annee_scolaire" "text" NOT NULL,
    "actif" boolean DEFAULT true NOT NULL,
    "cree_le" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "classes_code_check" CHECK (("char_length"("code") = 6)),
    CONSTRAINT "classes_code_majuscules" CHECK (("code" = "upper"("code")))
);


ALTER TABLE "public"."classes" OWNER TO "postgres";


COMMENT ON TABLE "public"."classes" IS 'Classes réelles. Le code à 6 caractères est la clé d''entrée élève.';



COMMENT ON COLUMN "public"."classes"."code" IS 'Code d''accès à 6 caractères, TOUJOURS en majuscules (contrainte). Le client doit appliquer .toUpperCase() avant d''interroger.';



CREATE TABLE IF NOT EXISTS "public"."eleves" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auth_id" "uuid" NOT NULL,
    "pseudo" "text" NOT NULL,
    "classe_id" "uuid" NOT NULL,
    "cree_le" timestamp with time zone DEFAULT "now"() NOT NULL,
    "vu_le" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "eleves_pseudo_check" CHECK ((("char_length"("pseudo") >= 2) AND ("char_length"("pseudo") <= 24)))
);


ALTER TABLE "public"."eleves" OWNER TO "postgres";


COMMENT ON TABLE "public"."eleves" IS 'Élèves, identifiés par pseudonyme uniquement. Aucune donnée nominative.';



CREATE TABLE IF NOT EXISTS "public"."evenements" (
    "id" bigint NOT NULL,
    "eleve_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "charge" "jsonb" DEFAULT '{"v": 1}'::"jsonb" NOT NULL,
    "horodatage" timestamp with time zone DEFAULT "now"() NOT NULL,
    "saison" "text" DEFAULT '2026-2027'::"text" NOT NULL,
    CONSTRAINT "evenements_type_check" CHECK ((("char_length"("type") >= 1) AND ("char_length"("type") <= 60)))
);


ALTER TABLE "public"."evenements" OWNER TO "postgres";


COMMENT ON TABLE "public"."evenements" IS 'Journal en AJOUT SEUL. Ne jamais supprimer : compenser.';



ALTER TABLE "public"."evenements" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."evenements_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."progression" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "eleve_id" "uuid" NOT NULL,
    "domaine" "text" NOT NULL,
    "cle" "text" NOT NULL,
    "valeur" "jsonb" DEFAULT '{"v": 1}'::"jsonb" NOT NULL,
    "maj_le" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "progression_cle_check" CHECK ((("char_length"("cle") >= 1) AND ("char_length"("cle") <= 80))),
    CONSTRAINT "progression_domaine_check" CHECK (("domaine" = ANY (ARRAY['cours'::"text", 'deverrouillage'::"text", 'rpg'::"text", 'profil'::"text"])))
);


ALTER TABLE "public"."progression" OWNER TO "postgres";


COMMENT ON TABLE "public"."progression" IS 'État courant de chaque élève. L''historique est dans evenements.';



CREATE TABLE IF NOT EXISTS "public"."reponses_libres" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "eleve_id" "uuid" NOT NULL,
    "code_activite" "text" NOT NULL,
    "texte" "text" NOT NULL,
    "statut" "text" DEFAULT 'en_attente'::"text" NOT NULL,
    "correction_ia" "jsonb",
    "commentaire_prof" "text",
    "envoye_le" timestamp with time zone DEFAULT "now"() NOT NULL,
    "corrige_le" timestamp with time zone,
    "version" integer DEFAULT 1 NOT NULL,
    CONSTRAINT "reponses_libres_code_activite_check" CHECK ((("char_length"("code_activite") >= 3) AND ("char_length"("code_activite") <= 20))),
    CONSTRAINT "reponses_libres_statut_check" CHECK (("statut" = ANY (ARRAY['en_attente'::"text", 'en_cours'::"text", 'corrige'::"text", 'signale'::"text"]))),
    CONSTRAINT "reponses_libres_texte_check" CHECK ((("char_length"("texte") >= 1) AND ("char_length"("texte") <= 2000))),
    CONSTRAINT "reponses_libres_version_check" CHECK (("version" >= 1))
);


ALTER TABLE "public"."reponses_libres" OWNER TO "postgres";


COMMENT ON TABLE "public"."reponses_libres" IS 'Copies de texte libre. Le worker lit les en_attente et repose son résultat.';



COMMENT ON COLUMN "public"."reponses_libres"."version" IS 'Numéro de la rédaction en cours. 1 = premier jet. Incrémenté automatiquement par le déclencheur d''archivage.';



CREATE TABLE IF NOT EXISTS "public"."reponses_versions" (
    "id" bigint NOT NULL,
    "reponse_id" "uuid" NOT NULL,
    "eleve_id" "uuid" NOT NULL,
    "code_activite" "text" NOT NULL,
    "version" integer NOT NULL,
    "texte" "text" NOT NULL,
    "statut" "text" NOT NULL,
    "correction_ia" "jsonb",
    "commentaire_prof" "text",
    "envoye_le" timestamp with time zone NOT NULL,
    "archive_le" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "reponses_versions_version_check" CHECK (("version" >= 1))
);


ALTER TABLE "public"."reponses_versions" OWNER TO "postgres";


COMMENT ON TABLE "public"."reponses_versions" IS 'Archive des rédactions remplacées. Ajout seul : ne jamais supprimer.';



ALTER TABLE "public"."reponses_versions" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."reponses_versions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."sauvegardes" (
    "id" bigint NOT NULL,
    "libelle" "text" NOT NULL,
    "motif" "text",
    "fichier" "text",
    "octets" bigint,
    "faite_le" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."sauvegardes" OWNER TO "postgres";


COMMENT ON TABLE "public"."sauvegardes" IS 'Journal des exports. Le dump lui-même vit hors de la base.';



ALTER TABLE "public"."sauvegardes" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."sauvegardes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE OR REPLACE VIEW "public"."v_reponses_fil" WITH ("security_invoker"='true') AS
 SELECT "reponses_versions"."eleve_id",
    "reponses_versions"."code_activite",
    "reponses_versions"."version",
    "reponses_versions"."texte",
    "reponses_versions"."statut",
    "reponses_versions"."correction_ia",
    "reponses_versions"."commentaire_prof",
    "reponses_versions"."envoye_le",
    false AS "courante"
   FROM "public"."reponses_versions"
UNION ALL
 SELECT "reponses_libres"."eleve_id",
    "reponses_libres"."code_activite",
    "reponses_libres"."version",
    "reponses_libres"."texte",
    "reponses_libres"."statut",
    "reponses_libres"."correction_ia",
    "reponses_libres"."commentaire_prof",
    "reponses_libres"."envoye_le",
    true AS "courante"
   FROM "public"."reponses_libres";


ALTER VIEW "public"."v_reponses_fil" OWNER TO "postgres";


COMMENT ON VIEW "public"."v_reponses_fil" IS 'Toutes les rédactions d''un élève (archivées + courante), ordonnables par version.';



ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."eleves"
    ADD CONSTRAINT "eleves_auth_id_key" UNIQUE ("auth_id");



ALTER TABLE ONLY "public"."eleves"
    ADD CONSTRAINT "eleves_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."evenements"
    ADD CONSTRAINT "evenements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."progression"
    ADD CONSTRAINT "progression_eleve_id_domaine_cle_key" UNIQUE ("eleve_id", "domaine", "cle");



ALTER TABLE ONLY "public"."progression"
    ADD CONSTRAINT "progression_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reponses_libres"
    ADD CONSTRAINT "reponses_libres_eleve_id_code_activite_key" UNIQUE ("eleve_id", "code_activite");



ALTER TABLE ONLY "public"."reponses_libres"
    ADD CONSTRAINT "reponses_libres_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reponses_versions"
    ADD CONSTRAINT "reponses_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reponses_versions"
    ADD CONSTRAINT "reponses_versions_reponse_id_version_key" UNIQUE ("reponse_id", "version");



ALTER TABLE ONLY "public"."sauvegardes"
    ADD CONSTRAINT "sauvegardes_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "eleves_pseudo_par_classe" ON "public"."eleves" USING "btree" ("classe_id", "lower"("pseudo"));



CREATE INDEX "evenements_eleve_temps" ON "public"."evenements" USING "btree" ("eleve_id", "horodatage" DESC);



CREATE INDEX "evenements_saison" ON "public"."evenements" USING "btree" ("saison", "horodatage" DESC);



CREATE INDEX "reponses_a_corriger" ON "public"."reponses_libres" USING "btree" ("envoye_le") WHERE ("statut" = 'en_attente'::"text");



CREATE INDEX "versions_par_eleve_activite" ON "public"."reponses_versions" USING "btree" ("eleve_id", "code_activite", "version");



CREATE OR REPLACE TRIGGER "progression_maj_le" BEFORE UPDATE ON "public"."progression" FOR EACH ROW EXECUTE FUNCTION "public"."touche_maj_le"();



CREATE OR REPLACE TRIGGER "reponses_archivage" BEFORE UPDATE ON "public"."reponses_libres" FOR EACH ROW EXECUTE FUNCTION "public"."archive_version_reponse"();



ALTER TABLE ONLY "public"."eleves"
    ADD CONSTRAINT "eleves_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."eleves"
    ADD CONSTRAINT "eleves_classe_id_fkey" FOREIGN KEY ("classe_id") REFERENCES "public"."classes"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."evenements"
    ADD CONSTRAINT "evenements_eleve_id_fkey" FOREIGN KEY ("eleve_id") REFERENCES "public"."eleves"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."progression"
    ADD CONSTRAINT "progression_eleve_id_fkey" FOREIGN KEY ("eleve_id") REFERENCES "public"."eleves"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reponses_libres"
    ADD CONSTRAINT "reponses_libres_eleve_id_fkey" FOREIGN KEY ("eleve_id") REFERENCES "public"."eleves"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reponses_versions"
    ADD CONSTRAINT "reponses_versions_eleve_id_fkey" FOREIGN KEY ("eleve_id") REFERENCES "public"."eleves"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reponses_versions"
    ADD CONSTRAINT "reponses_versions_reponse_id_fkey" FOREIGN KEY ("reponse_id") REFERENCES "public"."reponses_libres"("id") ON DELETE CASCADE;



ALTER TABLE "public"."classes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."eleves" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."evenements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."progression" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reponses_libres" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reponses_versions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sauvegardes" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."archive_version_reponse"() TO "anon";
GRANT ALL ON FUNCTION "public"."archive_version_reponse"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."archive_version_reponse"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."touche_maj_le"() TO "anon";
GRANT ALL ON FUNCTION "public"."touche_maj_le"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."touche_maj_le"() TO "service_role";


















GRANT ALL ON TABLE "public"."classes" TO "anon";
GRANT ALL ON TABLE "public"."classes" TO "authenticated";
GRANT ALL ON TABLE "public"."classes" TO "service_role";



GRANT ALL ON TABLE "public"."eleves" TO "anon";
GRANT ALL ON TABLE "public"."eleves" TO "authenticated";
GRANT ALL ON TABLE "public"."eleves" TO "service_role";



GRANT ALL ON TABLE "public"."evenements" TO "anon";
GRANT ALL ON TABLE "public"."evenements" TO "authenticated";
GRANT ALL ON TABLE "public"."evenements" TO "service_role";



GRANT ALL ON SEQUENCE "public"."evenements_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."evenements_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."evenements_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."progression" TO "anon";
GRANT ALL ON TABLE "public"."progression" TO "authenticated";
GRANT ALL ON TABLE "public"."progression" TO "service_role";



GRANT ALL ON TABLE "public"."reponses_libres" TO "anon";
GRANT ALL ON TABLE "public"."reponses_libres" TO "authenticated";
GRANT ALL ON TABLE "public"."reponses_libres" TO "service_role";



GRANT ALL ON TABLE "public"."reponses_versions" TO "anon";
GRANT ALL ON TABLE "public"."reponses_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."reponses_versions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."reponses_versions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."reponses_versions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."reponses_versions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."sauvegardes" TO "anon";
GRANT ALL ON TABLE "public"."sauvegardes" TO "authenticated";
GRANT ALL ON TABLE "public"."sauvegardes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."sauvegardes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."sauvegardes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."sauvegardes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."v_reponses_fil" TO "anon";
GRANT ALL ON TABLE "public"."v_reponses_fil" TO "authenticated";
GRANT ALL ON TABLE "public"."v_reponses_fil" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































