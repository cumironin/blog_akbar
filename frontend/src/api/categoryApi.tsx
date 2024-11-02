import { useToast } from "@/hooks/use-toast";
import type { Category } from "@/pages/category/types";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useCreateCategory = async (
	categoryData: Partial<Category>,
): Promise<Category> => {
	const response = await fetch(`${API_BASE_URL}/api/category`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(categoryData),
	});

	if (!response.ok) {
		throw new Error("Failed to create category");
	}

	return response.json();
};

export const useGetCategory = () => {
	const navigate = useNavigate();
	const { toast } = useToast();
	const getCategoryReguest = async (): Promise<Category[]> => {
		const response = await fetch(`${API_BASE_URL}/api/category`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		if (!response.ok) {
			if (response.status === 403) {
				// console.log("403 Forbidden error. Redirecting to dashboard.");
				toast({
					variant: "destructive",
					title: "Unauthorized Access",
					description: "You are not authorized to view categories.",
				});
				navigate("/dashboard");
				throw new Error("Forbidden");
			}
			throw new Error("failed to get categories");
		}

		return response.json();
	};
	const { data: categories } = useQuery({
		queryKey: ["category"],
		queryFn: getCategoryReguest,
	});

	return { categories };
};

export const useGetCategoryById = (id: string | undefined) => {
	const putCategory = useQuery({
		queryKey: ["category", id],
		queryFn: async () => {
			if (!id) throw new Error("Category ID is required");
			const response = await fetch(`${API_BASE_URL}/api/category/${id}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to get category by id");
			}

			const data = await response.json();
			// If the API returns an array, return the first item
			return Array.isArray(data) ? data[0] : data;
		},
		enabled: !!id,
	});

	return putCategory;
};

export const useUpdateCategory = async (
	categoryData: Partial<Category>,
	id: string,
): Promise<Category> => {
	const response = await fetch(`${API_BASE_URL}/api/category/${id}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(categoryData),
	});

	if (!response.ok) {
		throw new Error("Failed to update category");
	}

	return response.json();
};

export const useDeleteCategory = async (id: string) => {
	try {
		const response = await fetch(`${API_BASE_URL}/api/category/${id}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Failed to delete category: ${errorText}`);
			// return await response.json();
		}

		return await response.json();
	} catch (error) {
		console.error("Error in deleteCategory:", error);
		throw error;
	}
};
