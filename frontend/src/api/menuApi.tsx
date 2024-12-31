import type { Menu, MenuItem } from "@/pages/authorize/menu/types"; // Assuming you have a Menu type defined
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create Menu
export const useCreateMenu = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (menuData: Partial<Menu>): Promise<Menu> => {
			const response = await fetch(`${API_BASE_URL}/api/menu`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify(menuData),
			});

			if (!response.ok) {
				throw new Error("Failed to create menu");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["menus"] });
		},
	});
};

// Get All Menus
export const useGetMenus = () => {
	return useQuery({
		queryKey: ["menus"],
		queryFn: async (): Promise<Menu[]> => {
			const response = await fetch(`${API_BASE_URL}/api/menu`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to get menus");
			}

			return response.json();
		},
	});
};

// Get Menu by ID
export const useGetMenuById = (id: string | undefined) => {
	return useQuery({
		queryKey: ["menu", id],
		queryFn: async (): Promise<Menu> => {
			if (!id) throw new Error("Menu ID is required");
			const response = await fetch(`${API_BASE_URL}/api/menu/${id}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to get menu by id");
			}

			return response.json();
		},
		enabled: !!id,
	});
};

// Update Menu
export const useUpdateMenu = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			menuData,
			id,
		}: {
			menuData: Partial<Menu>;
			id: string;
		}): Promise<Menu> => {
			const response = await fetch(`${API_BASE_URL}/api/menu/${id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify(menuData),
			});

			if (!response.ok) {
				throw new Error("Failed to update menu");
			}

			return response.json();
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: ["menus"] });
			queryClient.invalidateQueries({ queryKey: ["menu", variables.id] });
		},
	});
};

// Delete Menu
export const useDeleteMenu = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<void> => {
			const response = await fetch(`${API_BASE_URL}/api/menu/${id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to delete menu");
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["menus"] });
		},
	});
};

// Get Menu Items
export const useGetMenuItems = () => {
	return useQuery({
		queryKey: ["menuItems"],
		queryFn: async (): Promise<MenuItem[]> => {
			const response = await fetch(`${API_BASE_URL}/api/menu/items`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to fetch menu items");
			}

			return response.json();
		},
	});
};
