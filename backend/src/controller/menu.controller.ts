import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/db.js";
import { menuTable } from "../db/schema.js";

export const getMenus = async (req: Request, res: Response) => {
	try {
		const menus = await db.select().from(menuTable);
		res.status(200).json(menus);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching menus" });
	}
};

const getMenuById = async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const menu = await db
			.select()
			.from(menuTable)
			.where(eq(menuTable.id, id))
			.execute();
		if (!menu || menu.length === 0) {
			return res.status(404).json({ message: "Menu not found" });
		}
		return res.status(200).json(menu[0]);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching menu" });
	}
};

const createMenu = async (req: Request, res: Response) => {
	const { name, svg, numsort, url_menu } = req.body;

	try {
		if (!name) {
			return res.status(400).json({ error: "Name is required" });
		}

		await db
			.insert(menuTable)
			.values({
				id: crypto.randomUUID(),
				name,
				svg,
				numsort,
				url_menu,
			})
			.execute();
		return res.status(201).json({ message: "Menu created successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error creating menu" });
	}
};

const updateMenu = async (req: Request, res: Response) => {
	const { name, svg, numsort, url_menu } = req.body;
	const { id } = req.params;

	try {
		const updatedMenu = await db
			.update(menuTable)
			.set({ name, svg, numsort, url_menu })
			.where(eq(menuTable.id, id))
			.returning()
			.execute();

		if (updatedMenu.length === 0) {
			return res.status(404).json({ message: "Menu not found" });
		}

		return res.status(200).json(updatedMenu[0]);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error updating menu" });
	}
};

const deleteMenu = async (req: Request, res: Response) => {
	const { id } = req.params;

	try {
		await db.delete(menuTable).where(eq(menuTable.id, id)).execute();
		return res.status(200).json({ message: "Menu deleted successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error deleting menu" });
	}
};

const getMenuItems = async (req: Request, res: Response) => {
	try {
		const menuItems = await db
			.select({
				icon: menuTable.svg,
				label: menuTable.name,
				url: menuTable.url_menu,
				// numsort: menuTable.numsort, // Include numsort in the selection
			})
			.from(menuTable)
			.orderBy(menuTable.numsort) // Sort by numsort
			.execute();

		return res.status(200).json(menuItems);
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "Error fetching menu items",
		});
	}
};

export default {
	getMenus,
	getMenuById,
	createMenu,
	updateMenu,
	deleteMenu,
	getMenuItems,
};
