import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('ar', 'en');
  CREATE TABLE "articles_locales" (
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  DROP INDEX "articles_slug_idx";
  ALTER TABLE "articles_locales" ADD CONSTRAINT "articles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;

  -- Carry existing rows' title/slug/content into the new locales table as
  -- "ar" (the default locale, and the language all current data is in)
  -- before the source columns are dropped below.
  INSERT INTO "articles_locales" ("title", "slug", "content", "_locale", "_parent_id")
  SELECT "title", "slug", "content", 'ar', "id" FROM "articles";

  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "articles_locales_locale_parent_id_unique" ON "articles_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "articles" DROP COLUMN "title";
  ALTER TABLE "articles" DROP COLUMN "slug";
  ALTER TABLE "articles" DROP COLUMN "content";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "articles_locales" CASCADE;
  ALTER TABLE "articles" ADD COLUMN "title" varchar NOT NULL;
  ALTER TABLE "articles" ADD COLUMN "slug" varchar NOT NULL;
  ALTER TABLE "articles" ADD COLUMN "content" jsonb;
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  DROP TYPE "public"."_locales";`)
}
