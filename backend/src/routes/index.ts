import type { Express } from "express";
import BlogPostRoute from "./BlogPost.routes";
import AuthRoute from "./auth.routes";
import AuthorizePermission from "./authorize.routes";
import CategoryRoute from "./category.routes";
import DashboardRoute from "./dashboard.routes";
import MediaRoute from "./media.routes";
import MenuRoute from "./menu.routes";
import Page from "./page.routes";
import PermissionRoute from "./permission.routes";
import Settings from "./settings.routes";
import Users from "./users.routes";
import AstroBlogRoute from "./astroBlog.routes";

import cookieParser from "cookie-parser";
import authorizeMiddleware from "../middleware/authorize.middleware";

import path from "node:path";
import cors from "cors";
import express from "express";
import morgan from "morgan";

const routes = [
	{ path: "/api/dashboard", router: DashboardRoute },
	{ path: "/api/category", router: CategoryRoute },
	{ path: "/api/auth", router: AuthRoute },
	{ path: "/api/rolepermission", router: AuthorizePermission },
	{ path: "/api/media", router: MediaRoute },
	{ path: "/api/blog", router: BlogPostRoute },
	{ path: "/api/permissions", router: PermissionRoute },
	{ path: "/api/menu", router: MenuRoute },
	{ path: "/api/settings", router: Settings },
	{ path: "/api/pages", router: Page },
	{ path: "/api/users", router: Users },
	// { path: "/api/astroblog", router: AstroBlogRoute },
];

export default (app: Express) => {
	app.use(express.static("public"));
	app.use(cookieParser());
	app.use(
		cors({
			origin: [
				"http://localhost:5173",
				"http://localhost:5174",
				"http://localhost:3000",
			], // Allow both origins
			credentials: true,
		}),
	);
	app.use(express.static(path.join(process.cwd(), "public")));
	app.use(morgan("combined"));
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
	app.use("/api/astroblog", AstroBlogRoute);

	// Routes that don't require session checks
	// app.use("/api/public", (req, res) => {
	// 	res.json({ message: "This is a public route" });
	// });

	// Make AstroBlog route public

	app.use((req, res, next) => {
		if (
			req.path.startsWith("/api/auth") ||
			req.path.startsWith("/api/users/") ||
			req.path === "/api/permissions/userpermission" ||
			req.path === "/api/menu/items" ||
			req.path.startsWith("/api/astro-blog")
		) {
			return next();
		}
		return authorizeMiddleware(req, res, next);
	});

	// Route setup
	for (const { path, router } of routes) {
		app.use(path, router);
	}
};
