CREATE TABLE IF NOT EXISTS "page" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"meta_title" varchar(200),
	"slug" varchar(200),
	"content" text NOT NULL,
	"image_url" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	"author_id" varchar NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page" ADD CONSTRAINT "page_author_id_auth_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
