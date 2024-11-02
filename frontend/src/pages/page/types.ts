export interface Page {
	id: string;
	title: string;
	content: string;
	author: string;
	image_url?: string;
	metatitle?: string;
	slug?: string;
	createdAt: string;
	publishedAt?: string;
}
