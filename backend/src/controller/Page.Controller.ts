import { eq, inArray } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/db.js";
import { pageTable, userTable } from "../db/schema.js";

const getPages = async (req: Request, res: Response) => {
	try {
		const pages = await db
			.select({
				id: pageTable.id,
				title: pageTable.title,
				author: userTable.username,
				createdAt: pageTable.createdAt,
			})
			.from(pageTable)
			.leftJoin(userTable, eq(pageTable.authorId, userTable.id));
		return res.status(200).json(pages);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching pages" });
	}
};

const createPage = async (req: Request, res: Response) => {
	try {
		const {
			title,
			content,
			authorId,
			image_url,
			metatitle,
			slug,
			publishedAt,
		} = req.body;

		if (!title || !content || !authorId) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		const [newPage] = await db
			.insert(pageTable)
			.values({
				id: crypto.randomUUID(),
				title,
				content,
				authorId,
				image_url,
				metatitle,
				slug,
				createdAt: new Date(),
				publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
			})
			.returning();

		console.log("Inserted page:", newPage);
		res
			.status(201)
			.json({ message: "Page created successfully", page: newPage });
	} catch (error) {
		console.error("Error in createPage:", error);
		res.status(500).json({
			message: "Error creating page",
			error: (error as Error).message,
		});
	}
};

const getAuthorPage = async (req: Request, res: Response) => {
	console.log("getAuthorPage route hit");
	try {
		const user = await db
			.select({
				id: userTable.id,
				name: userTable.username,
			})
			.from(userTable);
		return res.status(200).json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching user" });
	}
};

const editPage = async (req: Request, res: Response) => {
	try {
		const {
			title,
			content,
			authorId,
			image_url,
			metatitle,
			slug,
			publishedAt,
		} = req.body;
		const { id } = req.params;

		const [updatedPage] = await db
			.update(pageTable)
			.set({
				title,
				content,
				authorId,
				image_url,
				metatitle,
				slug,
				publishedAt: publishedAt ? new Date(publishedAt) : undefined,
			})
			.where(eq(pageTable.id, id))
			.returning();

		console.log("Updated page:", updatedPage);
		res
			.status(200)
			.json({ message: "Page updated successfully", page: updatedPage });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error updating page" });
	}
};

const deletePage = async (req: Request, res: Response) => {
	const { id } = req.params;

	try {
		await db.delete(pageTable).where(eq(pageTable.id, id)).execute();
		return res.status(200).json({ message: "Page deleted successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error deleting page" });
	}
};

const getPageById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const page = await db
			.select()
			.from(pageTable)
			.where(eq(pageTable.id, id))
			.leftJoin(userTable, eq(pageTable.authorId, userTable.id))
			.execute();

		if (page.length === 0) {
			return res.status(404).json({ message: "Page not found" });
		}

		return res.status(200).json(page[0]);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching page" });
	}
};

const deleteMultiplePages = async (req: Request, res: Response) => {
	try {
		const { ids } = req.body;

		if (!Array.isArray(ids) || ids.length === 0) {
			return res.status(400).json({ message: "Invalid or empty array of ids" });
		}

		const result = await db
			.delete(pageTable)
			.where(inArray(pageTable.id, ids))
			.execute();

		console.log(`Deleted ${result.rowCount} pages`);
		return res
			.status(200)
			.json({ message: "Pages deleted successfully", count: result.rowCount });
	} catch (error) {
		console.error("Error in deleteMultiplePages:", error);
		res.status(500).json({ message: "Error deleting pages" });
	}
};

export default {
	getPages,
	createPage,
	editPage,
	deletePage,
	getPageById,
	deleteMultiplePages,
	getAuthorPage,
};
