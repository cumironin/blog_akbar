// This middleware handles user authorization by checking session validity and user permissions

import { eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";
import { db } from "../db/db.js";
import {
	permissionTable,
	roleToPermissionTable,
	session,
	userTable,
} from "../db/schema.js";

// Extend the Request interface to include a user property
export interface AuthenticatedRequest extends Request {
	user?: typeof userTable.$inferSelect;
}

const authorizeMiddleware = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	// Extract the session ID from the request cookies
	const sessionId = req.cookies.sessionId;

	if (!sessionId) {
		console.log("Unauthorized: No session ID provided");
		return res
			.status(401)
			.json({ message: "Unauthorized: No session ID provided" });
	}

	try {
		const [userSessionWithUser] = await db
			.select({
				session: session,
				user: userTable,
			})
			.from(session)
			.where(eq(session.id, sessionId))
			.leftJoin(userTable, eq(session.userId, userTable.id))
			.limit(1)
			.execute();

		console.log("User session with user:", userSessionWithUser);

		if (!userSessionWithUser || !userSessionWithUser.user) {
			console.log("Unauthorized: Invalid session or user not found");
			return res
				.status(401)
				.json({ message: "Unauthorized: Invalid session or user not found" });
		}

		const { user } = userSessionWithUser;
		console.log("User:", user);

		const userRolesAndPermissions = await db
			.select({
				roleId: userTable.roleId,
				permissionId: roleToPermissionTable.permissionId,
				urlAccess: roleToPermissionTable.urlAccess,
			})
			.from(userTable)
			.where(eq(userTable.id, user.id))
			.leftJoin(
				roleToPermissionTable,
				eq(userTable.roleId, roleToPermissionTable.roleId),
			)
			.execute();
		console.log("User roles and permissions:", userRolesAndPermissions);

		if (userRolesAndPermissions.length === 0) {
			console.log("Forbidden: No roles or permissions assigned");
			return res
				.status(403)
				.json({ message: "Forbidden: No roles or permissions assigned" });
		}

		const requestUrl = req.originalUrl.split("?")[0];
		const requestMethod = req.method.toLowerCase();
		console.log(`Request URL: ${requestUrl}, Method: ${requestMethod}`);

		const isAuthorized = userRolesAndPermissions.some((perm) => {
			console.log("Checking permission:", perm);

			if (perm.urlAccess === null) {
				console.log(`Access denied: urlAccess is null for user ${user.id}`);
				return false;
			}

			// Parse the URL access JSON string
			// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
			let urlAccess;
			try {
				// Remove trailing commas and parse the JSON
				const cleanedUrlAccess = perm.urlAccess.replace(/,\s*$/, "");
				urlAccess = JSON.parse(cleanedUrlAccess);
				console.log("Parsed urlAccess:", urlAccess);
			} catch (error) {
				console.error("Error parsing urlAccess:", error);
				return false;
			}

			// Map HTTP methods to CRUD operations
			const methodMap: { [key: string]: string } = {
				get: "read",
				post: "create",
				put: "delete",
				patch: "update",
				delete: "delete",
			};
			const accessType = methodMap[requestMethod];
			console.log("Access type for method", requestMethod, ":", accessType);

			// Check if the user has permission for the current HTTP method
			if (!accessType || !urlAccess[accessType]) {
				console.log(`No access for method ${requestMethod}, access restricted`);
				return false;
			}

			// Get the list of allowed URLs for the current access type
			const allowedUrls = urlAccess[accessType]
				.split(",")
				.map((url: string) => url.trim());

			console.log("Allowed URLs:", allowedUrls);

			// Check if the requested URL matches any of the allowed URLs
			return allowedUrls.some((path: string) => {
				// Remove HTTP method prefix from the path
				const cleanPath = path.replace(/^(get|post|put|patch|delete):/, "");
				const regexPattern = `^${cleanPath.replace(/:\w+/g, "[^/]+").replace(/\//g, "\\/")}$`;
				const regex = new RegExp(regexPattern);
				const isMatch = regex.test(requestUrl);
				console.log(
					`URL ${isMatch ? "matches" : "does not match"} regex: ${regex}`,
				);
				return isMatch;
			});
		});

		if (!isAuthorized) {
			console.log("Authorization check failed for user:", user.id);
			console.log(
				"User roles and permissions:",
				JSON.stringify(userRolesAndPermissions, null, 2),
			);
			return res.status(403).json({ message: "Forbidden: Access denied" });
		}

		next();
	} catch (error) {
		console.log("Authorization error:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export default authorizeMiddleware;
