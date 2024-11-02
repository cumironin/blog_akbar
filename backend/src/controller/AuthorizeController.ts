import type { NextFunction, Request, Response } from "express";
import { db } from "../db/db";
import { roleTable } from "../db/schema";
import { eq } from "drizzle-orm";

const getRole = async (req: Request, res: Response) => {
	const roles = await db
		.select()
		.from(roleTable)
		.orderBy(roleTable.id)
		.execute();

	try {
		if (roles.length === 0) {
			return res.status(404).json({ message: "No roles found" });
		}

		return res.status(200).json(roles);
	} catch (error) {
		console.error("Role Input Error:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

const postRole = async (req: Request, res: Response) => {
	const { roleName } = req.body;

	try {
		const existingRole = await db
			.select()
			.from(roleTable)
			.where(eq(roleTable.roleName, roleName))
			.execute();

		if (existingRole.length > 0) {
			return res.status(400).json({ message: "Role name already exists" });
		}

		await db
			.insert(roleTable)
			.values({ id: crypto.randomUUID(), roleName })
			.execute();

		return res.status(201).json({ message: "Role created successfully" });
	} catch (error) {
		console.error("Role Input Error:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
};

const putRole = async (req: Request, res: Response) => {
	const { id } = req.body;

	try {
		const { id } = req.body;

		await db.delete(roleTable).where(eq(roleTable.id, id)).execute();

		return res.status(200).json({ message: "Role deleted successfully" });
	} catch (error) {
		console.error("Role Input Error:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
};

const patchRole = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { roleName } = req.body;

	try {
		// Check if the role exists
		// const existingRole = await db
		// 	.select()
		// 	.from(roleTable)
		// 	.where(eq(roleTable.id, id))
		// 	.execute();

		// if (existingRole.length === 0) {
		// 	return res.status(404).json({ message: "Role not found" });
		// }

		// Check if the new role name already exists
		const duplicateRole = await db
			.select()
			.from(roleTable)
			.where(eq(roleTable.roleName, roleName))
			.execute();

		if (duplicateRole.length > 0 && duplicateRole[0].id !== id) {
			return res.status(400).json({ message: "Role name already exists" });
		}

		// Update the role
		await db
			.update(roleTable)
			.set({ roleName })
			.where(eq(roleTable.id, id))
			.execute();

		return res.status(200).json({ message: "Role updated successfully" });
	} catch (error) {
		console.error("Role Update Error:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
};

export default {
	postRole,
	getRole,
	putRole,
	patchRole,
};
