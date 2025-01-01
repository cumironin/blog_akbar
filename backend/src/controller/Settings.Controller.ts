import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/db.js";
import { settingsTable } from "../db/schema.js";

const getSettings = async (req: Request, res: Response) => {
	try {
		const settings = await db.select().from(settingsTable).limit(1).execute();
		if (settings.length === 0) {
			return res.status(404).json({ message: "Settings not found" });
		}
		res.status(200).json(settings[0]);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching settings" });
	}
};

const updateSettings = async (req: Request, res: Response) => {
	const { siteTitle, tagline, showBlogPostTypeNumber, siteAddress } = req.body;

	try {
		const existingSettings = await db
			.select()
			.from(settingsTable)
			.limit(1)
			.execute();

		if (existingSettings.length === 0) {
			return res.status(404).json({ message: "Settings not found" });
		}

		const updatedSettings = await db
			.update(settingsTable)
			.set({ siteTitle, tagline, showBlogPostTypeNumber, siteAddress })
			.where(eq(settingsTable.id, existingSettings[0].id))
			.returning()
			.execute();

		return res.status(200).json(updatedSettings[0]);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error updating settings" });
	}
};

export default {
	getSettings,
	updateSettings,
};
