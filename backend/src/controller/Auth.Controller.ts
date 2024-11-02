import bcrypt from "bcrypt";
import { eq } from "drizzle-orm"; // Import the eq function
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/db";
import { key, session, userTable } from "../db/schema";
import { hashPassword } from "../utils/hash";

const registerUser = async (req: Request, res: Response) => {
	const { username, email, name, password } = req.body;

	try {
		// Check if username already exists using the eq function
		const existingUsers = await db
			.select()
			.from(userTable)
			.where(eq(userTable.username, username)) // Use eq function here
			.execute();

		if (existingUsers.length > 0) {
			return res.status(400).json({ message: "Username already exists" });
		}

		// Hash the password
		const hashedPassword = await hashPassword(password);

		// Create new user
		const userId = uuidv4();
		await db
			.insert(userTable)
			.values({
				id: userId,
				username,
				email,
				name,
			})
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

		res.status(201).json({ message: "User registered successfully" });
	} catch (error) {
		console.error("Registration Error:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

const loginUser = async (req: Request, res: Response) => {
	const { email, password } = req.body;
	try {
		const existingUsersByEmail = await db
			.select()
			.from(userTable)
			.where(eq(userTable.email, email))
			.execute();

		if (existingUsersByEmail.length === 0) {
			return res.status(400).json({ message: "Invalid email" });
		}

		const fetchedUser = existingUsersByEmail[0];

		// Fetch hashed password from key table
		const userKey = await db
			.select()
			.from(key)
			.where(eq(key.userId, fetchedUser.id))
			.execute();

		if (userKey.length === 0) {
			return res.status(400).json({ message: "Invalid password" });
		}

		const hashedPassword = userKey[0].hashedPassword;

		// Compare passwords
		const isMatch = await bcrypt.compare(password, hashedPassword || "");

		if (!isMatch) {
			return res.status(400).json({ message: "Invalid password" });
		}
		// Create a new session
		const sessionId = uuidv4();
		const currentTime = Date.now();
		const activeExpires = currentTime + 1000 * 60 * 60 * 24; // 24 hours
		const idleExpires = currentTime + 1000 * 60 * 30; // 30 minutes

		await db
			.insert(session)
			.values({
				id: sessionId,
				userId: fetchedUser.id,
				activeExpires,
				idleExpires,
			})
			.execute();

		// Set session ID in HttpOnly cookie
		res.cookie("sessionId", sessionId, { httpOnly: true, secure: true });

		res.status(200).json({ message: "Login successful" });
	} catch (error) {
		console.error("Login Error:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

const logoutUser = async (req: Request, res: Response) => {
	try {
		const sessionId = req.cookies?.sessionId;

		if (!sessionId) {
			return res.status(400).json({ message: "No active session" });
		}

		// Delete the session from the database
		await db.delete(session).where(eq(session.id, sessionId)).execute();

		// Clear the session cookie
		res.clearCookie("sessionId");

		res.status(200).json({ message: "Logout successful" });
	} catch (error) {
		console.error("Logout Error:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

const getSessionId = async (req: Request, res: Response) => {
	try {
		const sessionId = req.cookies?.sessionId;

		if (!sessionId) {
			return res.status(401).json({ message: "No active session" });
		}

		// Fetch the session from the database
		const sessionData = await db
			.select()
			.from(session)
			.where(eq(session.id, sessionId))
			.execute();

		if (sessionData.length === 0) {
			return res.status(401).json({ message: "Invalid session" });
		}

		// Check if the session has expired
		const currentTime = Date.now();
		if (currentTime > sessionData[0].idleExpires) {
			// Delete the expired session
			await db.delete(session).where(eq(session.id, sessionId)).execute();
			res.clearCookie("sessionId");
			return res.status(401).json({ message: "Session expired" });
		}

		// Update the session expiry times
		const activeExpires = currentTime + 1000 * 60 * 60 * 24; // 24 hours
		const idleExpires = currentTime + 1000 * 60 * 30; // 30 minutes

		await db
			.update(session)
			.set({ activeExpires, idleExpires })
			.where(eq(session.id, sessionId))
			.execute();

		res
			.status(200)
			.json({ sessionId: sessionData[0].id, userId: sessionData[0].userId });
	} catch (error) {
		console.error("Get Session ID Error:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export default {
	registerUser,
	loginUser,
	logoutUser,
	getSessionId,
};
