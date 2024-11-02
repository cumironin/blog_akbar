ALTER TABLE "role_permission" ADD COLUMN "url_restrict" text;--> statement-breakpoint
ALTER TABLE "permission" DROP COLUMN IF EXISTS "url_restrict";