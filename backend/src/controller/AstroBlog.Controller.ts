import type { Request, Response } from "express";
import { db } from "../db/db";
import { eq, ne, and, or, like, sql } from "drizzle-orm";
import {
	categoryTable,
	postOnCategoryTable,
	postTable,
	userTable,
} from "../db/schema";

export const getAstroBlog = async (req: Request, res: Response) => {
	try {
		const astroBlog = await db
			.select({
				id: postTable.id,
				title: postTable.title,
				metatitle: postTable.metatitle,
				slug: postTable.slug,
				content: postTable.content,
				image_url: postTable.image_url,
				createdAt: postTable.createdAt,
				publishedAt: postTable.publishedAt,
				author: userTable.username,
				category: categoryTable.title,
			})
			.from(postTable)
			.leftJoin(userTable, eq(postTable.authorId, userTable.id))
			.leftJoin(
				postOnCategoryTable,
				eq(postTable.id, postOnCategoryTable.postId),
			)
			.leftJoin(
				categoryTable,
				eq(postOnCategoryTable.categoryId, categoryTable.id),
			)
			.limit(4); // Added this line to limit to 4 posts

		res.status(200).json(astroBlog);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching blog posts" });
	}
};

export const getAstroBlogById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const astroBlog = await db
			.select({
				id: postTable.id,
				title: postTable.title,
				metatitle: postTable.metatitle,
				slug: postTable.slug,
				content: postTable.content,
				image_url: postTable.image_url,
				createdAt: postTable.createdAt,
				publishedAt: postTable.publishedAt,
				author: userTable.username,
				category: categoryTable.title,
			})
			.from(postTable)
			.leftJoin(userTable, eq(postTable.authorId, userTable.id))
			.leftJoin(
				postOnCategoryTable,
				eq(postTable.id, postOnCategoryTable.postId),
			)
			.leftJoin(
				categoryTable,
				eq(postOnCategoryTable.categoryId, categoryTable.id),
			)
			.where(eq(postTable.id, id))
			.limit(1);

		if (astroBlog.length === 0) {
			return res.status(404).json({ message: "Blog post not found" });
		}

		res.status(200).json(astroBlog[0]);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching blog post" });
	}
};

export const getRelatedAstroBlog = async (req: Request, res: Response) => {
	try {
		const { id, category } = req.params;

		const relatedPosts = await db
			.select({
				id: postTable.id,
				title: postTable.title,
				image_url: postTable.image_url,
				category: categoryTable.title,
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
			.where(and(eq(categoryTable.title, category), ne(postTable.id, id)))
			.limit(4);

		// Handle case where no related posts are found
		if (!relatedPosts.length) {
			return res.status(404).json({
				message: "No related posts found",
				data: [],
			});
		}

		return res.status(200).json({
			message: "Related posts fetched successfully",
			data: relatedPosts,
		});
	} catch (error) {
		console.error("Error in getRelatedAstroBlog:", error);
		return res.status(500).json({
			message: "Error fetching related posts",
			error: error instanceof Error ? error.message : "Unknown error occurred",
		});
	}
};

export const getTrendingAstroBlog = async (req: Request, res: Response) => {
	try {
		// First get the posts
		const posts = await db
			.select({
				id: postTable.id,
				title: postTable.title,
				image_url: postTable.image_url,
				publishedAt: postTable.publishedAt,
			})
			.from(postTable)
			.orderBy(postTable.publishedAt)
			.limit(5);

		// Then for each post, get a random category
		const trendingPosts = await Promise.all(
			posts.map(async (post) => {
				const categories = await db
					.select({
						category: categoryTable.title,
					})
					.from(postOnCategoryTable)
					.leftJoin(
						categoryTable,
						eq(postOnCategoryTable.categoryId, categoryTable.id),
					)
					.where(eq(postOnCategoryTable.postId, post.id));

				// Randomly select one category
				const randomCategory =
					categories[Math.floor(Math.random() * categories.length)];

				return {
					...post,
					category: randomCategory?.category || null,
				};
			}),
		);

		if (!trendingPosts.length) {
			return res.status(404).json({
				message: "No trending posts found",
				data: [],
			});
		}

		return res.status(200).json({
			message: "Trending posts fetched successfully",
			data: trendingPosts,
		});
	} catch (error) {
		console.error("Error in getTrendingAstroBlog:", error);
		return res.status(500).json({
			message: "Error fetching trending posts",
			error: error instanceof Error ? error.message : "Unknown error occurred",
		});
	}
};

export const getAstroBlogByCategory = async (req: Request, res: Response) => {
	try {
		const { category } = req.params;

		const posts = await db
			.select({
				id: postTable.id,
				title: postTable.title,
				metatitle: postTable.metatitle,
				slug: postTable.slug,
				content: postTable.content,
				image_url: postTable.image_url,
				createdAt: postTable.createdAt,
				publishedAt: postTable.publishedAt,
				author: userTable.username,
				category: categoryTable.title,
			})
			.from(postTable)
			.leftJoin(userTable, eq(postTable.authorId, userTable.id))
			.leftJoin(
				postOnCategoryTable,
				eq(postTable.id, postOnCategoryTable.postId),
			)
			.leftJoin(
				categoryTable,
				eq(postOnCategoryTable.categoryId, categoryTable.id),
			)
			.where(eq(categoryTable.title, category));

		res.status(200).json(posts);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching category posts" });
	}
};

export const getCategories = async (req: Request, res: Response) => {
	try {
		const categories = await db
			.select({
				id: categoryTable.id,
				title: categoryTable.title,
			})
			.from(categoryTable);

		res.status(200).json(categories);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching categories" });
	}
};

export const getAllAstroBlog = async (req: Request, res: Response) => {
	try {
		const posts = await db
			.select({
				id: postTable.id,
				title: postTable.title,
				metatitle: postTable.metatitle,
				slug: postTable.slug,
				content: postTable.content,
				image_url: postTable.image_url,
				createdAt: postTable.createdAt,
				publishedAt: postTable.publishedAt,
				author: userTable.username,
				category: categoryTable.title,
			})
			.from(postTable)
			.leftJoin(userTable, eq(postTable.authorId, userTable.id))
			.leftJoin(
				postOnCategoryTable,
				eq(postTable.id, postOnCategoryTable.postId),
			)
			.leftJoin(
				categoryTable,
				eq(postOnCategoryTable.categoryId, categoryTable.id),
			);

		res.status(200).json(posts);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching blog posts" });
	}
};

export const getUserAvatar = async (req: Request, res: Response) => {
	try {
		const users = await db
			.select({
				username: userTable.username,
				image_url: userTable.image_url,
			})
			.from(userTable)
			.innerJoin(postTable, eq(userTable.id, postTable.authorId))
			.groupBy(userTable.id); // Add this to avoid duplicates

		if (users.length === 0) {
			return res.status(404).json({ message: "No users found" });
		}

		res.status(200).json(users);
	} catch (error) {
		console.error("Error in getUserAvatar:", error);
		res.status(500).json({
			message: "Error fetching users data",
			error: error instanceof Error ? error.message : String(error),
		});
	}
};

export const searchArticles = async (req: Request, res: Response) => {
	try {
		const { keyword } = req.query;

		if (!keyword) {
			return res.status(400).json({ message: "Search keyword is required" });
		}

		// Convert keyword to lowercase for case-insensitive search
		const searchTerm = String(keyword).toLowerCase();

		const searchResults = await db
			.select({
				id: postTable.id,
				title: postTable.title,
				content: postTable.content,
				metatitle: postTable.metatitle,
				image_url: postTable.image_url,
				createdAt: postTable.createdAt,
				publishedAt: postTable.publishedAt,
				author: userTable.username,
				category: categoryTable.title,
			})
			.from(postTable)
			.leftJoin(userTable, eq(postTable.authorId, userTable.id))
			.leftJoin(
				postOnCategoryTable,
				eq(postTable.id, postOnCategoryTable.postId),
			)
			.leftJoin(
				categoryTable,
				eq(postOnCategoryTable.categoryId, categoryTable.id),
			)
			.where(
				or(
					sql`LOWER(${postTable.title}) LIKE ${`%${searchTerm}%`}`,
					sql`LOWER(${postTable.content}) LIKE ${`%${searchTerm}%`}`,
					sql`LOWER(${postTable.metatitle}) LIKE ${`%${searchTerm}%`}`,
				),
			);

		if (searchResults.length === 0) {
			return res.status(404).json({
				message: "No articles found matching the search criteria",
			});
		}

		res.status(200).json(searchResults);
	} catch (error) {
		console.error("Error in searchArticles:", error);
		res.status(500).json({
			message: "Error searching articles",
			error: error instanceof Error ? error.message : String(error),
		});
	}
};
