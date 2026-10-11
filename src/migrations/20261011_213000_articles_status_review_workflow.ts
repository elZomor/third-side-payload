import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Postgres forbids using a newly added enum value in the same transaction
// that adds it (ADD VALUE commits are deferred until the transaction ends),
// so this only adds the values — the follow-up migration sets the new
// default once these are safely committed.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_articles_status" ADD VALUE IF NOT EXISTS 'ready_for_review';
  ALTER TYPE "public"."enum_articles_status" ADD VALUE IF NOT EXISTS 'in_review';
  ALTER TYPE "public"."enum_articles_status" ADD VALUE IF NOT EXISTS 'approved';
  ALTER TYPE "public"."enum_articles_status" ADD VALUE IF NOT EXISTS 'rejected';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Postgres can't drop enum values; nothing to revert.
}
