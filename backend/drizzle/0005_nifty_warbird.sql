DROP TABLE "sub_menu";--> statement-breakpoint
ALTER TABLE "permission" DROP CONSTRAINT "permission_sub_menu_id_sub_menu_id_fk";
--> statement-breakpoint
ALTER TABLE "permission" ADD COLUMN "menu_id" varchar;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "permission" ADD CONSTRAINT "permission_menu_id_menu_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menu"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "permission" DROP COLUMN IF EXISTS "sub_menu_id";