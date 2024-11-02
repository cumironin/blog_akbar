import { db } from "../db/db";
import { categoryTable } from "../db/schema";

export const showCategory = async () => {
	// const allCategories = await db.select().from(categoryTable);
	// return allCategories;

	const category = await db
		.select({
			id: categoryTable.id,
			title: categoryTable.title,
			description: categoryTable.description,
			slug: categoryTable.slug,
			metatitle: categoryTable.metatitle,
		})
		.from(categoryTable);

	return category;
};

export const addCategory = async (categoryData: {
	id: string;
	title: string;
	metatitle: string;
	slug: string;
	description: string;
}) => {
	try {
		const newCategory = await db
			.insert(categoryTable)
			.values(categoryData)
			.returning();
		return newCategory[0];
	} catch (error) {
		console.error("Error adding category:", error);
		throw new Error("Failed to add category");
	}
};

export default {
	showCategory,
	addCategory,
};
