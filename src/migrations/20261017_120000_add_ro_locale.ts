import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Adds Romanian to the locale enum. Postgres forbids using a newly added
// enum value in the transaction that adds it, which is fine here: nothing in
// this migration uses 'ro'.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."_locales" ADD VALUE IF NOT EXISTS 'ro';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Postgres can't drop enum values; Romanian rows (if any) are left in place.
}
