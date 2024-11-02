import { z } from "zod";

export const categorySchema = z.object({
	id: z.string().min(1),
	title: z.string(),
	metatitle: z.string(),
	slug: z.string(),
	description: z.string(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
