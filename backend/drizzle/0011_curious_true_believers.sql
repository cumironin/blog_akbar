ALTER TABLE "auth_user" ADD COLUMN "role_id" varchar;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_user" ADD CONSTRAINT "auth_user_role_id_Role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."Role"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
