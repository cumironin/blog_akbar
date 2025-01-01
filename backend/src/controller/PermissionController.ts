import { and, eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/db.js";
import {
	menuTable,
	permissionTable,
	roleToPermissionTable,
	session,
	userTable,
} from "../db/schema.js";
import { roleTable } from "../db/schema.js";

const addPermission = async (req: Request, res: Response) => {
	try {
		const { name, description, menu_id, urlAccess } = req.body;

		console.log("Received permission data:", req.body);

		if (!name || !description || !menu_id || !urlAccess) {
			console.log("Missing required fields:", {
				name,
				description,
				menu_id,
				urlAccess,
			});
			return res.status(400).json({
				error: "Name, description, menu_id, and urlAccess are required",
			});
		}

		const newPermissionId = uuidv4();
		const urlRestrict = JSON.stringify(urlAccess);

		await db.transaction(async (tx) => {
			// Insert into permissionTable
			await tx.insert(permissionTable).values({
				id: newPermissionId,
				name,
				description,
				menuId: menu_id,
				urlRestrict,
			});

			// Fetch all existing roles
			const roles = await tx.select().from(roleTable);

			// Insert into roleToPermissionTable for each role
			for (const role of roles) {
				await tx.insert(roleToPermissionTable).values({
					id: uuidv4(),
					roleId: role.id,
					permissionId: newPermissionId,
					urlAccess: JSON.stringify(urlAccess),
				});
			}
		});

		res.status(201).json({
			message: "Permission added successfully for all roles",
			permission: {
				id: newPermissionId,
				name,
				description,
				menu_id,
				urlRestrict,
				urlAccess,
			},
		});
	} catch (error) {
		console.error("Detailed error in adding permission:", error);
		res.status(500).json({
			error: "Internal server error",
			details: error instanceof Error ? error.message : String(error),
		});
	}
};

const updatePermission = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { roleId, urlAccess } = req.body;

		console.log("Received update permission request:");
		console.log("Params:", JSON.stringify({ id }, null, 2));
		console.log("Body:", JSON.stringify({ roleId, urlAccess }, null, 2));

		if (!id || !roleId || !urlAccess) {
			console.log(
				"Missing required fields. Received data:",
				JSON.stringify({ id, roleId, urlAccess }, null, 2),
			);
			return res.status(400).json({
				error: "Missing required fields",
				receivedData: { id, roleId, urlAccess },
			});
		}

		await db.transaction(async (tx) => {
			// Update only urlAccess in role_permission table
			await tx
				.update(roleToPermissionTable)
				.set({
					urlAccess: JSON.stringify(urlAccess),
				})
				.where(
					and(
						eq(roleToPermissionTable.roleId, roleId),
						eq(roleToPermissionTable.permissionId, id),
					),
				);
		});

		res.status(200).json({
			message: "Permission updated successfully",
			permission: {
				id,
				roleId,
				urlAccess,
			},
		});
	} catch (error) {
		console.error("Error updating permission:", error);
		res.status(500).json({
			error: "Internal server error",
			details: error instanceof Error ? error.message : String(error),
		});
	}
};

const deletePermission = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		if (!id) {
			return res.status(400).json({
				error: "Permission ID is required",
			});
		}

		await db.transaction(async (tx) => {
			// Delete from role_permission table
			await tx
				.delete(roleToPermissionTable)
				.where(eq(roleToPermissionTable.permissionId, id));

			// Delete from permission table
			await tx.delete(permissionTable).where(eq(permissionTable.id, id));
		});

		res.status(200).json({ message: "Permission deleted successfully" });
	} catch (error) {
		console.error("Error deleting permission:", error);
		res.status(500).json({
			error: "Internal server error",
			details: error instanceof Error ? error.message : String(error),
		});
	}
};

const getPermissions = async (req: Request, res: Response) => {
	try {
		const permissions = await db
			.select({
				roleId: roleTable.id,
				roleName: roleTable.roleName,
				permissionId: permissionTable.id,
				permissionName: permissionTable.name,
				permissionDescription: permissionTable.description,
				permissionUrlRestrict: permissionTable.urlRestrict,
				menuId: menuTable.id,
				menuName: menuTable.name,
				menuSvg: menuTable.svg,
				urlAccess: roleToPermissionTable.urlAccess,
			})
			.from(roleTable)
			.leftJoin(
				roleToPermissionTable,
				eq(roleTable.id, roleToPermissionTable.roleId),
			)
			.leftJoin(
				permissionTable,
				eq(roleToPermissionTable.permissionId, permissionTable.id),
			)
			.leftJoin(menuTable, eq(permissionTable.menuId, menuTable.id))
			.execute();

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const formattedPermissions = permissions.reduce<Record<string, any>>(
			(acc, permission) => {
				if (!acc[permission.roleId]) {
					acc[permission.roleId] = {
						id: permission.roleId,
						name: permission.roleName || "",
						permissions: [],
					};
				}

				if (permission.permissionId) {
					acc[permission.roleId].permissions.push({
						id: permission.permissionId,
						name: permission.permissionName || "",
						description: permission.permissionDescription || "",
						urlRestrict: permission.permissionUrlRestrict || "",
						menu: {
							id: permission.menuId || "",
							name: permission.menuName || "",
							svg: permission.menuSvg || "",
						},
						urlAccess: permission.urlAccess
							? JSON.parse(permission.urlAccess)
							: null,
					});
				}

				return acc;
			},
			{},
		);

		res.status(200).json(Object.values(formattedPermissions));
	} catch (error) {
		console.error("Error fetching permissions:", error);
		res.status(500).json({
			error: "Internal server error",
			details: error instanceof Error ? error.message : String(error),
		});
	}
};

const getPermission = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		console.log(`Fetching permission with id: ${id}`);

		const permission = await db
			.select({
				id: permissionTable.id,
				name: permissionTable.name,
				description: permissionTable.description,
				urlRestrict: permissionTable.urlRestrict,
				menuId: menuTable.id,
				menuName: menuTable.name,
				menuSvg: menuTable.svg,
			})
			.from(permissionTable)
			.leftJoin(menuTable, eq(permissionTable.menuId, menuTable.id))
			.where(eq(permissionTable.id, id))
			.execute();

		// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
		console.log(`Permission query result:`, permission);

		if (permission.length === 0) {
			console.log(`Permission with id ${id} not found`);
			return res.status(404).json({ error: "Permission not found" });
		}

		const urlAccess = await db
			.select({
				urlAccess: roleToPermissionTable.urlAccess,
			})
			.from(roleToPermissionTable)
			.where(eq(roleToPermissionTable.permissionId, id))
			.execute();

		// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
		console.log(`URL Access query result:`, urlAccess);

		const formattedPermission = {
			id: permission[0].id,
			name: permission[0].name,
			description: permission[0].description,
			urlRestrict: permission[0].urlRestrict,
			menu: {
				id: permission[0].menuId,
				name: permission[0].menuName,
				svg: permission[0].menuSvg,
			},
			urlAccess: urlAccess[0]?.urlAccess
				? JSON.parse(urlAccess[0].urlAccess)
				: {
						create: null,
						read: null,
						update: null,
						delete: null,
					},
		};

		// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
		console.log(`Sending formatted permission:`, formattedPermission);
		res.status(200).json(formattedPermission);
	} catch (error) {
		console.error("Error fetching permission:", error);
		res.status(500).json({
			error: "Internal server error",
			details: error instanceof Error ? error.message : String(error),
		});
	}
};

// access to user data
export interface AuthenticatedRequest extends Request {
	user?: typeof userTable.$inferSelect;
}

// akses to rolepermission
const getRoleUserPermission = async (
	req: AuthenticatedRequest,
	res: Response,
) => {
	console.log("getRoleUserPermission called");
	console.log("Session ID from cookie:", req.cookies.sessionId);
	try {
		const sessionId = req.cookies.sessionId;

		if (!sessionId) {
			console.log("No session ID provided");
			return res
				.status(401)
				.json({ message: "Unauthorized: No session ID provided" });
		}

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

		if (!userSessionWithUser || !userSessionWithUser.user) {
			return res
				.status(401)
				.json({ message: "Unauthorized: Invalid session or user not found" });
		}

		const { user } = userSessionWithUser;

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

		if (userRolesAndPermissions.length === 0) {
			return res.status(200).json({
				message: "No permissions found for the user",
				userId: user.id,
				roleId: user.roleId,
			});
		}

		res.status(200).json({
			message: "User roles and permissions retrieved successfully",
			userId: user.id,
			permissions: userRolesAndPermissions,
		});
	} catch (error) {
		console.error("Error in getRoleUserPermission:", error);
		res.status(500).json({
			error: "Internal server error",
			details: error instanceof Error ? error.message : String(error),
		});
	}
};

export default {
	addPermission,
	getPermissions,
	updatePermission,
	deletePermission,
	getPermission,
	getRoleUserPermission,
};
