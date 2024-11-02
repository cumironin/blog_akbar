CREATE TABLE IF NOT EXISTS "settings" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"site_title" varchar(255) NOT NULL,
	"tagline" varchar(255),
	"show_blog_post_type_number" integer NOT NULL,
	"site_address" varchar(255) NOT NULL
);
