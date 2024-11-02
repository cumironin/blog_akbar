// Import necessary modules and dependencies
import type { Request, Response } from "express";
import { db } from "../db/db";
import { imageTable } from "../db/schema";
import { v4 as uuidv4 } from "uuid";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
// Import eq from drizzle-orm for database operations
import { eq } from "drizzle-orm";

// Use process.cwd() as __dirname equivalent
const __dirname = process.cwd();

// Use process.cwd() to get the project root directory
const projectRoot = process.cwd();
const uploadsDir = path.join(projectRoot, "uploads");

// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

// Controller function to handle media upload
export const uploadMedia = async (req: Request, res: Response) => {
	try {
		// Check if a file was uploaded
		if (!req.file) {
			return res.status(400).json({ message: "No file uploaded" });
		}

		// Log file and request body information
		console.log("File received:", req.file);
		console.log("Request body:", req.body);

		// Extract file information
		const { originalname, path: tempPath } = req.file;
		const fileExtension = path.extname(originalname);
		const fileName = `${uuidv4()}${fileExtension}`;
		const destPath = path.join(uploadsDir, fileName);

		// Log file paths
		console.log("Temp path:", tempPath);
		console.log("Destination path:", destPath);

		// Move the uploaded file to its final destination
		await fsPromises.rename(tempPath, destPath);

		// Insert new media record into the database
		const newMedia = await db
			.insert(imageTable)
			.values({
				id: uuidv4(),
				name: originalname,
				url: `/uploads/${fileName}`,
				image: `/uploads/${fileName}`,
				description: req.body.description || "",
			})
			.returning();

		// Log the newly inserted media
		console.log("New media inserted:", newMedia);

		// Send successful response
		res.status(201).json(newMedia[0]);
	} catch (error) {
		// Log and handle any errors
		console.error("Detailed error in uploadMedia:", error);
		res.status(500).json({
			message: "Error uploading media",
			error: error instanceof Error ? error.message : String(error),
		});
	}
};

// Controller function to get the list of media
export const getMediaList = async (req: Request, res: Response) => {
	try {
		// Fetch all media from the database
		const mediaList = await db.select().from(imageTable);
		res.json(mediaList);
	} catch (error) {
		// Log and handle any errors
		console.error(error);
		res.status(500).json({ message: "Error fetching media list" });
	}
};

// Controller function to delete media
export const deleteMedia = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		// Find the media in the database
		const media = await db
			.select()
			.from(imageTable)
			.where(eq(imageTable.id, id))
			.execute();

		if (media.length === 0) {
			return res.status(404).json({ message: "Media not found" });
		}

		// Construct the file path
		const filePath = path.join(process.cwd(), media[0].image || "");

		// Delete the file if it exists
		try {
			await fsPromises.unlink(filePath);
		} catch (error) {
			console.warn(`File not found or could not be deleted: ${filePath}`);
		}

		// Delete the media record from the database
		await db.delete(imageTable).where(eq(imageTable.id, id)).execute();

		res.json({ message: "Media deleted successfully" });
	} catch (error) {
		console.error("Error in deleteMedia:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

// Controller function to edit media description
export const editMediaDescription = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { description } = req.body;

		if (!description) {
			return res.status(400).json({ message: "Description is required" });
		}

		// Find the media in the database
		const media = await db
			.select()
			.from(imageTable)
			.where(eq(imageTable.id, id))
			.execute();

		if (media.length === 0) {
			return res.status(404).json({ message: "Media not found" });
		}

		// Update the media description in the database
		await db
			.update(imageTable)
			.set({ description })
			.where(eq(imageTable.id, id))
			.execute();

		res.json({ message: "Media description updated successfully" });
	} catch (error) {
		console.error("Error in editMediaDescription:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};
