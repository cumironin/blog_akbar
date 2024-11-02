// import type { Request, Response, NextFunction } from "express";
// import { db } from "../db/db";
// import { session, userTable } from "../db/schema";
// import { eq } from "drizzle-orm";

// export interface AuthenticatedRequest extends Request {
// 	user?: typeof userTable.$inferSelect;
// }

// const authMiddleware = async (
// 	req: AuthenticatedRequest,
// 	res: Response,
// 	next: NextFunction,
// ) => {
// 	const sessionId = req.cookies.sessionId;

// 	if (!sessionId) {
// 		return res.status(401).json({ message: "Unauthorized: No session ID" });
// 	}

// 	try {
// 		// Fetch session
// 		const sessions = await db
// 			.select()
// 			.from(session)
// 			.where(eq(session.id, sessionId))
// 			.execute();

// 		if (sessions.length === 0) {
// 			return res.status(401).json({ message: "Unauthorized: Invalid session" });
// 		}

// 		const currentSession = sessions[0];
// 		const currentTime = Date.now();

// 		// Check session expiration
// 		if (
// 			currentSession.activeExpires < currentTime ||
// 			currentSession.idleExpires < currentTime
// 		) {
// 			// Optionally, delete expired session
// 			await db.delete(session).where(eq(session.id, sessionId)).execute();
// 			return res.status(401).json({ message: "Session expired" });
// 		}

// 		// Update idleExpires
// 		const newIdleExpires = currentTime + 1000 * 60 * 30; // 30 minutes
// 		await db
// 			.update(session)
// 			.set({ idleExpires: newIdleExpires })
// 			.where(eq(session.id, sessionId))
// 			.execute();

// 		// Fetch user
// 		const users = await db
// 			.select()
// 			.from(userTable)
// 			.where(eq(userTable.id, currentSession.userId))
// 			.execute();

// 		if (users.length === 0) {
// 			return res.status(401).json({ message: "Unauthorized: User not found" });
// 		}

// 		req.user = users[0];
// 		next();
// 	} catch (error) {
// 		console.error("Auth Middleware Error:", error);
// 		res.status(500).json({ message: "Internal server error" });
// 	}
// };

// export default authMiddleware;

// // import type { Request, Response, NextFunction } from "express";
// // import { db } from "../db/db";
// // import { permissionTable } from "../db/schema";

// // export const authorize = (requiredPermission: string) => {
// // 	return async (req: Request, res: Response, next: NextFunction) => {
// // 		try {
// // 			const userId = req.user.id; // Assuming user ID is stored in req.user
// // 			const userPermissions = await db
// // 				.select(permissionTable.name)
// // 				.from(permissionTable)
// // 				.innerJoin(
// // 					"role_permission",
// // 					"permission.id",
// // 					"role_permission.permission_id",
// // 				)
// // 				.innerJoin("user_role", "role_permission.role_id", "user_role.role_id")
// // 				.where("user_role.user_id", userId);

// // 			const hasPermission = userPermissions.some(
// // 				(permission) => permission.name === requiredPermission,
// // 			);

// // 			if (hasPermission) {
// // 				next();
// // 			} else {
// // 				res.status(403).json({ message: "Forbidden" });
// // 			}
// // 		} catch (error) {
// // 			res.status(500).json({ message: "Internal Server Error" });
// // 		}
// // 	};
// // };

// // import type { Request, Response, NextFunction } from "express";
// // import { db } from "../db/db";
// // import { eq, and } from "drizzle-orm";
// // import {
// // 	userTable,
// // 	roleTable,
// // 	permissionTable,
// // 	userToRoleTable,
// // 	roleToPermissionTable,
// // } from "../db/schema";

// // export const authorize = (requiredPermission: string) => {
// // 	return async (req: Request, res: Response, next: NextFunction) => {
// // 		try {
// // 			// Assuming user ID is stored in req.user

// // 			const userId = (req.user as { id: string }).id;

// // 			if (!userId) {
// // 				return res.status(401).json({ message: "Unauthorized" });
// // 			}

// // 			const userPermissions = await db
// // 				.select({
// // 					permissionName: permissionTable.name,
// // 				})
// // 				.from(userTable)
// // 				.innerJoin(userToRoleTable, eq(userTable.id, userToRoleTable.userId))
// // 				.innerJoin(roleTable, eq(userToRoleTable.roleId, roleTable.id))
// // 				.innerJoin(
// // 					roleToPermissionTable,
// // 					eq(roleTable.id, roleToPermissionTable.roleId),
// // 				)
// // 				.innerJoin(
// // 					permissionTable,
// // 					eq(roleToPermissionTable.permissionId, permissionTable.id),
// // 				)
// // 				.where(eq(userTable.id, userId));

// // 			const hasPermission = userPermissions.some(
// // 				(permission) => permission.permissionName === requiredPermission,
// // 			);

// // 			if (hasPermission) {
// // 				next();
// // 			} else {
// // 				res.status(403).json({ message: "Forbidden" });
// // 			}
// // 		} catch (error) {
// // 			console.error("Authorization error:", error);
// // 			res.status(500).json({ message: "Internal Server Error" });
// // 		}
// // 	};
// // };
