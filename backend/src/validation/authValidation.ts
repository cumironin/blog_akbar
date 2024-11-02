import { z } from "zod";

export const userSchema = z.object({
	id: z.string().min(1),
	username: z.string().min(1).max(256),
	email: z.string().email().max(100),
	name: z.string().max(100),
	createdAt: z.date().optional(),
});

export type UserInput = z.infer<typeof userSchema>;
