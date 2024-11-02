// import type { User } from "../auth/type";

export type BlogPost = {
	id: string;
	title: string;
	content: string;
	authorId: string;
	categories?: string[];
	image_url?: string;
	metatitle?: string;
	slug?: string;
	publishedAt: Date;
	createdAt: Date;
	updatedAt: Date;
	// author: User["id"];
	author?: { id: string; name: string };
};
