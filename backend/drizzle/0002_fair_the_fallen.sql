DROP TABLE "role_menu";--> statement-breakpoint
ALTER TABLE "sub_menu" ADD COLUMN "permission_id" varchar NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sub_menu" ADD CONSTRAINT "sub_menu_permission_id_permission_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permission"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
