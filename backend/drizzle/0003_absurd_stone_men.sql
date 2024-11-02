ALTER TABLE "sub_menu" DROP CONSTRAINT "sub_menu_permission_id_permission_id_fk";
--> statement-breakpoint
ALTER TABLE "permission" ADD COLUMN "sub_menu_id" varchar;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "permission" ADD CONSTRAINT "permission_sub_menu_id_sub_menu_id_fk" FOREIGN KEY ("sub_menu_id") REFERENCES "public"."sub_menu"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "sub_menu" DROP COLUMN IF EXISTS "permission_id";