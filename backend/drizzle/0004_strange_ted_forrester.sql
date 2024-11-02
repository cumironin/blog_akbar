ALTER TABLE "role_permission" RENAME COLUMN "url_restrict" TO "url_access";--> statement-breakpoint
ALTER TABLE "permission" ADD COLUMN "url_restrict" varchar(255);