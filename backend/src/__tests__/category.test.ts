import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import CategoryController from "../controller/CategoryController";
// import * as categoryService from "../services/category.service";
import { db } from "../db/db";
import { categoryTable } from "../db/schema";
// import crypto from "node:crypto";

// Mock the dependencies
vi.mock("../services/category.service");
vi.mock("../db/db");
vi.mock("node:crypto");

describe("CategoryController", () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let responseObject: { statusCode?: number; json?: unknown };

	beforeEach(() => {
		mockRequest = {
			params: {},
			body: {},
		};
		responseObject = {};
		mockResponse = {
			status: vi.fn().mockImplementation((code: number) => {
				responseObject.statusCode = code;
				return mockResponse;
			}),
			json: vi.fn().mockImplementation((data: unknown) => {
				responseObject.json = data;
				return mockResponse;
			}),
		} as Partial<Response>;
		vi.resetAllMocks();
	});

	// describe("getCategory", () => {
	// 	it("should return categories with status 200", async () => {
	// 		const mockCategories = [
	// 			{ id: 1, name: "Category 1" },
	// 			{ id: 2, name: "Category 2" },
	// 		];
	// 		vi.spyOn(db, "select").mockReturnValue({
	// 			from: vi.fn().mockResolvedValue(mockCategories),
	// 			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	// 		} as any);

	// 		const req = {} as Request;
	// 		const res = {
	// 			status: vi.fn().mockReturnThis(),
	// 			json: vi.fn(),
	// 		} as unknown as Response;

	// 		await CategoryController.getCategory(req, res);

	// 		expect(res.status).toHaveBeenCalledWith(200);
	// 		expect(res.json).toHaveBeenCalledWith(mockCategories);
	// 	});

	// 	it("should return 500 status on error", async () => {
	// 		vi.spyOn(db, "select").mockImplementation(() => {
	// 			throw new Error("Database error");
	// 		});

	// 		const req = {} as Request;
	// 		const res = {
	// 			status: vi.fn().mockReturnThis(),
	// 			json: vi.fn(),
	// 		} as unknown as Response;

	// 		await CategoryController.getCategory(req, res);

	// 		expect(res.status).toHaveBeenCalledWith(500);
	// 		expect(res.json).toHaveBeenCalledWith({
	// 			message: "Error fetching categories",
	// 		});
	// 	});
	// });

	// describe("getCategoryById", () => {
	// 	it("should return a category with status 200", async () => {
	// 		const mockCategory = { id: "1", name: "Category 1" };
	// 		vi.spyOn(db, "select").mockReturnValue({
	// 			from: vi.fn().mockReturnValue({
	// 				where: vi.fn().mockReturnValue({
	// 					execute: vi.fn().mockResolvedValue([mockCategory]),
	// 				}),
	// 			}),
	// 			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	// 		} as any);

	// 		const req = { params: { id: "1" } } as unknown as Request;
	// 		const res = {
	// 			status: vi.fn().mockReturnThis(),
	// 			json: vi.fn(),
	// 		} as unknown as Response;

	// 		await CategoryController.getCategoryById(req, res);

	// 		expect(res.status).toHaveBeenCalledWith(200);
	// 		expect(res.json).toHaveBeenCalledWith(mockCategory);
	// 	});

	// 	it("should return 404 status when category is not found", async () => {
	// 		vi.spyOn(db, "select").mockReturnValue({
	// 			from: vi.fn().mockReturnValue({
	// 				where: vi.fn().mockReturnValue({
	// 					execute: vi.fn().mockResolvedValue([]),
	// 				}),
	// 			}),
	// 			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	// 		} as any);

	// 		const req = { params: { id: "1" } } as unknown as Request;
	// 		const res = {
	// 			status: vi.fn().mockReturnThis(),
	// 			json: vi.fn(),
	// 		} as unknown as Response;

	// 		await CategoryController.getCategoryById(req, res);

	// 		expect(res.status).toHaveBeenCalledWith(404);
	// 		expect(res.json).toHaveBeenCalledWith({ message: "Category not found" });
	// 	});

	// 	it("should return 500 status on error", async () => {
	// 		vi.spyOn(db, "select").mockImplementation(() => {
	// 			throw new Error("Database error");
	// 		});

	// 		const req = { params: { id: "1" } } as unknown as Request;
	// 		const res = {
	// 			status: vi.fn().mockReturnThis(),
	// 			json: vi.fn(),
	// 		} as unknown as Response;

	// 		await CategoryController.getCategoryById(req, res);

	// 		expect(res.status).toHaveBeenCalledWith(500);
	// 		expect(res.json).toHaveBeenCalledWith({
	// 			message: "Error fetching category",
	// 		});
	// 	});
	// });

	// describe("postCategory", () => {
	// 	it("should create a category with status 201", async () => {
	// 		const mockCategory = {
	// 			title: "New Category",
	// 			description: "Description",
	// 		};
	// 		vi.spyOn(db, "insert").mockReturnValue({
	// 			values: vi.fn().mockReturnValue({
	// 				execute: vi.fn().mockResolvedValue(undefined),
	// 			}),
	// 			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	// 		} as any);

	// 		const req = { body: mockCategory } as Request;
	// 		const res = {
	// 			status: vi.fn().mockReturnThis(),
	// 			json: vi.fn(),
	// 		} as unknown as Response;

	// 		await CategoryController.postCategory(req, res);

	// 		expect(res.status).toHaveBeenCalledWith(201);
	// 		expect(res.json).toHaveBeenCalledWith({
	// 			message: "category post created successfully",
	// 		});
	// 	});

	// 	it("should return 400 status when title or description is missing", async () => {
	// 		const req = { body: {} } as Request;
	// 		const res = {
	// 			status: vi.fn().mockReturnThis(),
	// 			json: vi.fn(),
	// 		} as unknown as Response;

	// 		await CategoryController.postCategory(req, res);

	// 		expect(res.status).toHaveBeenCalledWith(400);
	// 		expect(res.json).toHaveBeenCalledWith({
	// 			error: "Title and description are required",
	// 		});
	// 	});

	// 	it("should return 500 status on error", async () => {
	// 		vi.spyOn(db, "insert").mockImplementation(() => {
	// 			throw new Error("Database error");
	// 		});

	// 		const req = {
	// 			body: { title: "New Category", description: "Description" },
	// 		} as Request;
	// 		const res = {
	// 			status: vi.fn().mockReturnThis(),
	// 			json: vi.fn(),
	// 		} as unknown as Response;

	// 		await CategoryController.postCategory(req, res);

	// 		expect(res.status).toHaveBeenCalledWith(500);
	// 		expect(res.json).toHaveBeenCalledWith({
	// 			message: "Error creating category",
	// 		});
	// 	});
	// });

	// describe("updateCategory", () => {
	// 	it("should update a category with status 200", async () => {
	// 		const mockUpdatedCategory = {
	// 			id: "1",
	// 			title: "Updated Category",
	// 			description: "Updated Description",
	// 		};
	// 		vi.spyOn(db, "update").mockReturnValue({
	// 			set: vi.fn().mockReturnValue({
	// 				where: vi.fn().mockReturnValue({
	// 					returning: vi.fn().mockReturnValue({
	// 						execute: vi.fn().mockResolvedValue([mockUpdatedCategory]),
	// 					}),
	// 				}),
	// 			}),
	// 			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	// 		} as any);

	// 		const req = {
	// 			params: { id: "1" },
	// 			body: { title: "Updated Category", description: "Updated Description" },
	// 		} as unknown as Request;
	// 		const res = {
	// 			status: vi.fn().mockReturnThis(),
	// 			json: vi.fn(),
	// 		} as unknown as Response;

	// 		await CategoryController.updateCategory(req, res);

	// 		expect(res.status).toHaveBeenCalledWith(200);
	// 		expect(res.json).toHaveBeenCalledWith(mockUpdatedCategory);
	// 	});

	// 	it("should return 404 status when category is not found", async () => {
	// 		vi.spyOn(db, "update").mockReturnValue({
	// 			set: vi.fn().mockReturnValue({
	// 				where: vi.fn().mockReturnValue({
	// 					returning: vi.fn().mockReturnValue({
	// 						execute: vi.fn().mockResolvedValue([]),
	// 					}),
	// 				}),
	// 			}),
	// 			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	// 		} as any);

	// 		const req = {
	// 			params: { id: "1" },
	// 			body: { title: "Updated Category", description: "Updated Description" },
	// 		} as unknown as Request;
	// 		const res = {
	// 			status: vi.fn().mockReturnThis(),
	// 			json: vi.fn(),
	// 		} as unknown as Response;

	// 		await CategoryController.updateCategory(req, res);

	// 		expect(res.status).toHaveBeenCalledWith(404);
	// 		expect(res.json).toHaveBeenCalledWith({ message: "Category not found" });
	// 	});

	// 	it("should return 500 status on error", async () => {
	// 		vi.spyOn(db, "update").mockImplementation(() => {
	// 			throw new Error("Database error");
	// 		});

	// 		const req = {
	// 			params: { id: "1" },
	// 			body: { title: "Updated Category", description: "Updated Description" },
	// 		} as unknown as Request;
	// 		const res = {
	// 			status: vi.fn().mockReturnThis(),
	// 			json: vi.fn(),
	// 		} as unknown as Response;

	// 		await CategoryController.updateCategory(req, res);

	// 		expect(res.status).toHaveBeenCalledWith(500);
	// 		expect(res.json).toHaveBeenCalledWith({
	// 			message: "Error updating category",
	// 		});
	// 	});
	// });

	describe("deleteCategory", () => {
		it("should delete a category with status 201", async () => {
			vi.spyOn(db, "delete").mockReturnValue({
				where: vi.fn().mockReturnValue({
					execute: vi.fn().mockResolvedValue({ rowCount: 1 }),
				}),
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} as any);

			const req = { params: { id: "1" } } as unknown as Request;
			const res = {
				status: vi.fn().mockReturnThis(),
				json: vi.fn(),
			} as unknown as Response;

			await CategoryController.deleteCategory(req, res);

			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith({
				message: "category post deleted successfully",
			});
		});

		it("should return 500 status on error", async () => {
			vi.spyOn(db, "delete").mockReturnValue({
				where: vi.fn().mockReturnValue({
					execute: vi.fn().mockRejectedValue(new Error("Database error")),
				}),
			} as any);

			const req = { params: { id: "1" } } as unknown as Request;
			const res = {
				status: vi.fn().mockReturnThis(),
				json: vi.fn(),
			} as unknown as Response;

			await CategoryController.deleteCategory(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				message: "Error deleting category",
			});
		});
	});
});
