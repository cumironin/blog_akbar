import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";
// import { showCategory } from "../services/category.service";
import { db } from "../db/db.js";
import { categoryTable } from "../db/schema.js";

export const getCategory = async (req: Request, res: Response) => {
	try {
		const categories = await db.select().from(categoryTable);
		res.status(200).json(categories);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching categories" });
	}
};

const getCategoryById = async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const category = await db
			.select()
			.from(categoryTable)
			.where(eq(categoryTable.id, id))
			.execute();
		if (!category || category.length === 0) {
			return res.status(404).json({ message: "Category not found" });
		}
		return res.status(200).json(category[0]);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching category" });
	}
};

const postCategory = async (req: Request, res: Response) => {
	const { title, description } = req.body;

	console.log("Title:", title);
	console.log("Description:", description);

	function createSlug(title: string | undefined): string {
		if (!title) return "";
		return title
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, "") // Remove non-word chars (except spaces and dashes)
			.replace(/[\s_-]+/g, "-") // Replace spaces and underscores with a single dash
			.replace(/^-+|-+$/g, ""); // Remove leading/trailing dashes
	}

	try {
		if (!title || !description) {
			return res
				.status(400)
				.json({ error: "Title and description are required" });
		}

		const slug = createSlug(title);
		const metaTitle = title;
		const descAsString = description as string;
		await db
			.insert(categoryTable)
			.values({
				id: crypto.randomUUID(),
				title,
				slug,
				metatitle: metaTitle,
				description: descAsString,
			})
			.execute();
		return res
			.status(201)
			.json({ message: "category post created successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error creating category" });
	}
};

const updateCategory = async (req: Request, res: Response) => {
	const { title, description } = req.body;
	const { id } = req.params;

	try {
		const updatedCategory = await db
			.update(categoryTable)
			.set({ title, description })
			.where(eq(categoryTable.id, id))
			.returning()
			.execute();

		if (updatedCategory.length === 0) {
			return res.status(404).json({ message: "Category not found" });
		}

		return res.status(200).json(updatedCategory[0]);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error updating category" });
	}
};

const deleteCategory = async (req: Request, res: Response) => {
	const { id } = req.params;

	try {
		const result = await db
			.delete(categoryTable)
			.where(eq(categoryTable.id, id))
			.execute();

		if (result.rowCount === 0) {
			return res.status(404).json({ message: "Category not found" });
		}

		return res.status(200).json({ message: "Category deleted successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error deleting category" });
	}
};

export default {
	getCategory,
	getCategoryById,
	postCategory,
	updateCategory,
	deleteCategory,
};
