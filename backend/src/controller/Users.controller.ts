// Import eq from drizzle-orm for database operations
import { eq } from "drizzle-orm";
// Import necessary modules and dependencies
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/db.js";
import { key, roleTable, userTable } from "../db/schema.js";
import { hashPassword } from "../utils/hash.js";

// Controller function to create a new user
export const createUser = async (req: Request, res: Response) => {
	const { username, email, name, roleId, image_url, password } = req.body;

	try {
		// Check if username already exists
		const existingUsers = await db
			.select()
			.from(userTable)
			.where(eq(userTable.username, username))
			.execute();

		if (existingUsers.length > 0) {
			return res.status(400).json({ message: "Username already exists" });
		}

		// Check if the role exists
		if (roleId) {
			const existingRole = await db
				.select()
				.from(roleTable)
				.where(eq(roleTable.id, roleId))
				.execute();

			if (existingRole.length === 0) {
				return res.status(400).json({ message: "Invalid role" });
			}
		}

		// Hash the password
		const hashedPassword = await hashPassword(password);

		// Create new user
		const userId = uuidv4();
		const newUser = await db
			.insert(userTable)
			.values({
				id: userId,
				username,
				email,
				name,
				roleId,
				image_url,
			})
			.returning()
			.execute();

		// Store hashed password in key table
		await db
			.insert(key)
			.values({
				id: uuidv4(),
				userId,
				hashedPassword,
			})
			.execute();

		// Send successful response
		res.status(201).json(newUser[0]);
	} catch (error) {
		console.error("Error in createUser:", error);
		res.status(500).json({
			message: "Error creating user",
			error: error instanceof Error ? error.message : String(error),
		});
	}
};

// Controller function to get the list of users
export const getUserList = async (req: Request, res: Response) => {
	try {
		// Fetch all users from the database with their roles
		const userList = await db
			.select({
				id: userTable.id,
				username: userTable.username,
				email: userTable.email,
				name: userTable.name,
				roleId: userTable.roleId,
				image_url: userTable.image_url,
				roleName: roleTable.roleName,
			})
			.from(userTable)
			.leftJoin(roleTable, eq(userTable.roleId, roleTable.id));
		res.json(userList);
	} catch (error) {
		// Log and handle any errors
		console.error("Error in getUserList:", error);
		res.status(500).json({ message: "Error fetching user list" });
	}
};

// Controller function to get a single user
export const getUser = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		// Find the user in the database with their role and password
		const user = await db
			.select({
				id: userTable.id,
				username: userTable.username,
				email: userTable.email,
				name: userTable.name,
				roleId: userTable.roleId,
				about_me: userTable.about_me,
				roleName: roleTable.roleName,
				image_url: userTable.image_url,
				hashedPassword: key.hashedPassword,
			})
			.from(userTable)
			.leftJoin(roleTable, eq(userTable.roleId, roleTable.id))
			.leftJoin(key, eq(userTable.id, key.userId))
			.where(eq(userTable.id, id))
			.execute();

		if (user.length === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		// Transform the user object
		const userWithPasswordInfo = {
			...user[0],
			hasPasswordSet: !!user[0].hashedPassword,
			password: user[0].hashedPassword || "", // Keep the actual hashed password
		};

		// Create a new object without the hashedPassword property
		const { hashedPassword, ...userWithoutHashedPassword } =
			userWithPasswordInfo;

		res.json(userWithoutHashedPassword);
	} catch (error) {
		console.error("Error in getUser:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

// Controller function to update a user
export const updateUser = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { username, email, name, roleId, password, image_url } = req.body;

		// Check if the role exists
		if (roleId) {
			const existingRole = await db
				.select()
				.from(roleTable)
				.where(eq(roleTable.id, roleId))
				.execute();

			if (existingRole.length === 0) {
				return res.status(400).json({ message: "Invalid role" });
			}
		}

		// Prepare update object
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const updateData: any = { username, email, name, roleId, image_url };

		// Update the user in the database
		const updatedUser = await db
			.update(userTable)
			.set(updateData)
			.where(eq(userTable.id, id))
			.returning();

		if (updatedUser.length === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		// Update password if provided
		if (password) {
			const hashedPassword = await hashPassword(password);
			await db
				.update(key)
				.set({ hashedPassword })
				.where(eq(key.userId, id))
				.execute();
		}

		res.json(updatedUser[0]);
	} catch (error) {
		console.error("Error in updateUser:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

// Controller function to delete a user
export const deleteUser = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		// Delete the user's key from the database
		await db.delete(key).where(eq(key.userId, id)).execute();

		// Delete the user from the database
		const deletedUser = await db
			.delete(userTable)
			.where(eq(userTable.id, id))
			.returning();

		if (deletedUser.length === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json({ message: "User deleted successfully" });
	} catch (error) {
		console.error("Error in deleteUser:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

// Controller function to get all roles for dropdown
export const getRoles = async (req: Request, res: Response) => {
	try {
		// Fetch all roles from the database
		const roles = await db
			.select({
				id: roleTable.id,
				roleName: roleTable.roleName,
			})
			.from(roleTable)
			.orderBy(roleTable.numsort);

		res.json(roles);
	} catch (error) {
		console.error("Error in getRoles:", error);
		res.status(500).json({ message: "Error fetching roles" });
	}
};

// Controller function to update user profile
export const updateProfile = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { name, about_me } = req.body;

		// Update the user's profile in the database
		const updatedUser = await db
			.update(userTable)
			.set({
				name,
				about_me,
			})
			.where(eq(userTable.id, id))
			.returning({
				id: userTable.id,
				name: userTable.name,
				about_me: userTable.about_me,
			});

		if (updatedUser.length === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json(updatedUser[0]);
	} catch (error) {
		console.error("Error in updateProfile:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};
