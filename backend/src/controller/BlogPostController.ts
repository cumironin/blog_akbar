import { eq, inArray } from "drizzle-orm";
import { type Request, type Response, response } from "express";
import { array } from "zod";
import { db } from "../db/db.js";
import {
	categoryTable,
	imageTable,
	postOnCategoryTable,
	postTable,
	userTable,
} from "../db/schema.js";

const getCategoryBlog = async (req: Request, res: Response) => {
	try {
		const categories = await db
			.select({
				id: categoryTable.id,
				title: categoryTable.title,
			})
			.from(categoryTable);
		return res.status(200).json(categories);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching categories" });
	}
};

const getBlogPost = async (req: Request, res: Response) => {
	try {
		const blogpost = await db
			.select({
				id: postTable.id,
				title: postTable.title,
				author: userTable.username,
				createdAt: postTable.createdAt,
			})
			.from(postTable)
			.leftJoin(userTable, eq(postTable.authorId, userTable.id));
		return res.status(200).json(blogpost);
	} catch (error) {
		res.status(500).json({ message: "Error fetch blogposts" });
	}
};

const getAuthorBlog = async (req: Request, res: Response) => {
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

const getImageBlog = async (req: Request, res: Response) => {
	try {
		const image = await db
			.select({
				id: imageTable.id,
				url: imageTable.url,
				description: imageTable.description,
			})
			.from(imageTable);
		return res.status(200).json(image);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching imageurl" });
	}
};

const createBlogPost = async (req: Request, res: Response) => {
	try {
		const {
			title,
			content,
			authorId,
			categories,
			image_url,
			metatitle,
			slug,
			publishedAt,
		} = req.body;

		console.log("Received data:", req.body);

		if (!title || !content || !authorId) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		await db.transaction(async (tx) => {
			const [newPost] = await tx
				.insert(postTable)
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

			console.log("Inserted post:", newPost);

			if (categories && categories.length > 0) {
				await tx.insert(postOnCategoryTable).values(
					categories.map((categoryId: string) => ({
						id: crypto.randomUUID(),
						postId: newPost.id,
						categoryId,
					})),
				);
			}
		});

		res.status(201).json({ message: "Blog post created successfully" });
	} catch (error) {
		console.error("Error in createBlogPost:", error);
		res.status(500).json({
			message: "Error creating blog post",
			error: (error as Error).message,
		});
	}
};

const editBlogPost = async (req: Request, res: Response) => {
	try {
		const {
			title,
			content,
			authorId,
			categories,
			image_url,
			metatitle,
			slug,
			publishedAt,
		} = req.body;

		const { id } = req.params;

		await db.transaction(async (tx) => {
			const [updatePost] = await tx
				.update(postTable)
				.set({
					title,
					content,
					authorId,
					image_url,
					metatitle,
					slug,
					publishedAt: publishedAt ? new Date(publishedAt) : undefined,
				})
				.where(eq(postTable.id, id))
				.returning();
			console.log("Updated post:", updatePost);

			await tx
				.delete(postOnCategoryTable)
				.where(eq(postOnCategoryTable.postId, id));

			if (categories && categories.length > 0) {
				await tx.insert(postOnCategoryTable).values(
					categories.map((categoryId: string) => ({
						id: crypto.randomUUID(),
						postId: id,
						categoryId,
					})),
				);
			}
		});

		res.status(200).json({ message: "Blogpost Update successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error updating BlogPost" });
	}
};

const deleteBlogPost = async (req: Request, res: Response) => {
	const { id } = req.params;

	try {
		await db.delete(postTable).where(eq(postTable.id, id)).execute();
		return res.status(201).json({ message: "blogpost deleted successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error deleting blogpost" });
	}
};

const getBlogPostById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const post = await db
			.select({
				id: postTable.id,
				title: postTable.title,
				content: postTable.content,
				authorId: postTable.authorId,
				image_url: postTable.image_url,
				metatitle: postTable.metatitle,
				slug: postTable.slug,
				publishedAt: postTable.publishedAt,
				categories: categoryTable.id,
			})
			.from(postTable)
			.leftJoin(
				postOnCategoryTable,
				eq(postTable.id, postOnCategoryTable.postId),
			)
			.leftJoin(
				categoryTable,
				eq(postOnCategoryTable.categoryId, categoryTable.id),
			)
			.where(eq(postTable.id, id))
			.execute();

		if (post.length === 0) {
			return res.status(404).json({ message: "Blog post not found" });
		}

		const formattedPost = {
			...post[0],
			categories: post.map((p) => p.categories).filter(Boolean),
		};

		return res.status(200).json(formattedPost);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching blog post" });
	}
};

const deleteMultipleBlogPosts = async (req: Request, res: Response) => {
	try {
		const { ids } = req.body;

		if (!Array.isArray(ids) || ids.length === 0) {
			return res.status(400).json({ message: "invalid or empty array ids" });
		}

		await db.transaction(async (tx) => {
			await tx
				.delete(postOnCategoryTable)
				.where(inArray(postOnCategoryTable.postId, ids))
				.execute();
			const result = await tx
				.delete(postTable)
				.where(inArray(postTable.id, ids))
				.execute();
			console.log(`Deleted ${result.rowCount} blog posts`);
		});

		return res.status(200).json({ message: "Blog posts deleted successfully" });
	} catch (error) {
		console.error("Error in deleteMultipleBlogPosts:", error);
		res.status(500).json({ message: "Error deleting blog posts" });
	}
};

export default {
	getCategoryBlog,
	getAuthorBlog,
	getImageBlog,
	createBlogPost,
	editBlogPost,
	getBlogPost,
	deleteBlogPost,
	getBlogPostById,
	deleteMultipleBlogPosts,
};
