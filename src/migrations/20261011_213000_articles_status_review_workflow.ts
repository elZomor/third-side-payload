import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_articles_status" ADD VALUE IF NOT EXISTS 'ready_for_review';
  ALTER TYPE "public"."enum_articles_status" ADD VALUE IF NOT EXISTS 'in_review';
  ALTER TYPE "public"."enum_articles_status" ADD VALUE IF NOT EXISTS 'approved';
  ALTER TYPE "public"."enum_articles_status" ADD VALUE IF NOT EXISTS 'rejected';
  ALTER TABLE "articles" ALTER COLUMN "status" SET DEFAULT 'ready_for_review';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles" ALTER COLUMN "status" SET DEFAULT 'draft';`)
}
