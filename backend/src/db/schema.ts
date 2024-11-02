import { relations } from "drizzle-orm";
import {
	bigint,
	integer,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

// Define the user table schema
export const userTable = pgTable("auth_user", {
	id: varchar("id", { length: 255 }).primaryKey(),
	numsort: serial("numshort"),
	username: varchar("username", { length: 256 }).unique(),
	email: varchar("email", { length: 100 }),
	name: varchar("name", { length: 100 }),
	image_url: varchar("image_url", { length: 255 }),
	about_me: text("about_me"),
	createdAt: timestamp("created_at").defaultNow(),
	roleId: varchar("role_id").references(() => roleTable.id, {
		onDelete: "set null",
	}),
});

// Define the post table schema
export const postTable = pgTable("post", {
	id: varchar("id", { length: 255 }).primaryKey().notNull(),
	title: varchar("title", { length: 200 }).notNull(),
	metatitle: varchar("meta_title", { length: 200 }),
	slug: varchar("slug", { length: 200 }),
	content: text("content").notNull(),
	image_url: varchar("image_url", { length: 255 }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	publishedAt: timestamp("published_at"),
	authorId: varchar("author_id")
		.notNull()
		.references(() => userTable.id, { onDelete: "cascade" }),
});

// Define relations for the user table
export const userRelations = relations(userTable, ({ many, one }) => ({
	post: many(postTable),
	page: many(pageTable),
	role: one(roleTable, {
		fields: [userTable.roleId],
		references: [roleTable.id],
	}),
}));

// Define relations for the post table
export const postRelations = relations(postTable, ({ one, many }) => ({
	author: one(userTable, {
		fields: [postTable.authorId],
		references: [userTable.id],
	}),
	categoryPost: many(postOnCategoryTable),
	postMeta: many(postMetaTable), // Changed from userToRoleTable to postMetaTable
}));

// Define the category table schema
export const categoryTable = pgTable("category", {
	id: varchar("id", { length: 255 }).primaryKey(),
	title: varchar("title", { length: 200 }),
	metatitle: varchar("meta_title", { length: 200 }),
	slug: varchar("slug", { length: 200 }),
	description: text("description"),
});

// Define relations for the category table
export const categoryRelation = relations(categoryTable, ({ many }) => ({
	postCategory: many(postOnCategoryTable),
}));

// Define the junction table for posts and categories
export const postOnCategoryTable = pgTable("post_categories", {
	id: varchar("id", { length: 255 }).primaryKey(),
	postId: varchar("post_id")
		.notNull()
		.references(() => postTable.id, { onDelete: "cascade" })
		.notNull(),
	categoryId: varchar("category_id")
		.notNull()
		.references(() => categoryTable.id, { onDelete: "cascade" })
		.notNull(),
});

// Define relations for the post-category junction table
export const postOnCategoryRelations = relations(
	postOnCategoryTable,
	({ one }) => ({
		post: one(postTable, {
			fields: [postOnCategoryTable.postId],
			references: [postTable.id],
		}),
		category: one(categoryTable, {
			fields: [postOnCategoryTable.categoryId],
			references: [categoryTable.id],
		}),
	}),
);

// Define the image table schema
export const imageTable = pgTable("linkImage", {
	id: varchar("id", { length: 255 }).primaryKey(),
	url: varchar("url", { length: 255 }),
	name: varchar("name", { length: 255 }),
	image: varchar("image", { length: 255 }),
	description: varchar("description", { length: 255 }),
});

// Define the post meta table schema
export const postMetaTable = pgTable("post_meta", {
	id: varchar("id", { length: 255 }).primaryKey(),
	key: varchar("key", { length: 100 }),
	content: text("content"),
	postMetaId: varchar("post_meta_id")
		.notNull()
		.references(() => postTable.id, { onDelete: "cascade" })
		.notNull(),
});

// Define relations for the post meta table
export const PostMetaRelation = relations(postMetaTable, ({ one }) => ({
	metaPost: one(postTable, {
		fields: [postMetaTable.postMetaId],
		references: [postTable.id],
	}),
}));

// Define the role table schema
export const roleTable = pgTable("Role", {
	id: varchar("id", { length: 255 }).primaryKey(),
	numsort: integer("numsort"),
	roleName: varchar("role_name", { length: 100 }),
});

// Define relations for the role table
export const roleTableRelations = relations(roleTable, ({ many }) => ({
	rolePermission: many(roleToPermissionTable),
	users: many(userTable),
}));

// Define the role-permission junction table
export const roleToPermissionTable = pgTable("role_permission", {
	id: varchar("id", { length: 255 }).primaryKey(),
	roleId: varchar("role_id")
		.notNull()
		.references(() => roleTable.id, { onDelete: "cascade" })
		.notNull(),
	permissionId: varchar("permission_id")
		.notNull()
		.references(() => permissionTable.id, { onDelete: "cascade" })
		.notNull(),
	urlAccess: text("url_access"), // Changed from urlRestrict to urlAccess
});

// Define the permission table schema
export const permissionTable = pgTable("permission", {
	id: varchar("id", { length: 255 }).primaryKey(),
	name: varchar("name", { length: 100 }),
	description: varchar("description", { length: 255 }),
	urlRestrict: text("url_restrict"), // Changed from varchar to text
	menuId: varchar("menu_id").references(() => menuTable.id, {
		onDelete: "set null",
	}),
});

// Define relations for the permission table
export const permissionTableRelations = relations(
	permissionTable,
	({ many, one }) => ({
		permissionRole: many(roleToPermissionTable),
		menu: one(menuTable, {
			fields: [permissionTable.menuId],
			references: [menuTable.id],
		}),
	}),
);

// Define the menu table schema
export const menuTable = pgTable("menu", {
	id: varchar("id", { length: 255 }).primaryKey(),
	numsort: integer("numsort"),
	name: varchar("name", { length: 100 }),
	svg: varchar("svg", { length: 512 }),
	url_menu: varchar("url_menu", { length: 255 }), // Added url_menu field
});

// Define relations for the menu table
export const menuTableRelations = relations(menuTable, ({ many }) => ({
	permissions: many(permissionTable),
}));

// Define the session table schema
export const session = pgTable("user_session", {
	id: varchar("id", { length: 255 }).primaryKey(),
	userId: varchar("user_id")
		.notNull()
		.references(() => userTable.id),
	activeExpires: bigint("active_expires", { mode: "number" }).notNull(),
	idleExpires: bigint("idle_expires", { mode: "number" }).notNull(),
});

// Define the key table schema
export const key = pgTable("user_key", {
	id: varchar("id", { length: 255 }).primaryKey(),
	userId: varchar("user_id")
		.notNull()
		.references(() => userTable.id),
	hashedPassword: varchar("hashed_password", { length: 255 }),
});

// Define the settings table schema
export const settingsTable = pgTable("settings", {
	id: varchar("id", { length: 255 }).primaryKey(),
	siteTitle: varchar("site_title", { length: 255 }).notNull(),
	tagline: varchar("tagline", { length: 255 }),
	showBlogPostTypeNumber: integer("show_blog_post_type_number").notNull(),
	siteAddress: varchar("site_address", { length: 255 }).notNull(),
});

// Define the page table schema
export const pageTable = pgTable("page", {
	id: varchar("id", { length: 255 }).primaryKey().notNull(),
	title: varchar("title", { length: 200 }).notNull(),
	metatitle: varchar("meta_title", { length: 200 }),
	slug: varchar("slug", { length: 200 }),
	content: text("content").notNull(),
	image_url: varchar("image_url", { length: 255 }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	publishedAt: timestamp("published_at"),
	authorId: varchar("author_id")
		.notNull()
		.references(() => userTable.id, { onDelete: "cascade" }),
});

// Define relations for the page table
export const pageRelations = relations(pageTable, ({ one }) => ({
	author: one(userTable, {
		fields: [pageTable.authorId],
		references: [userTable.id],
	}),
}));
