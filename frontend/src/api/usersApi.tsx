import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import type { User, Role } from "@/pages/users/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Add this new type for user creation
type CreateUserInput = Omit<User, "id" | "roleName"> & { password: string };

export const useGetUsers = () => {
	return useQuery({
		queryKey: ["users"],
		queryFn: async () => {
			const response = await fetch(`${API_BASE_URL}/api/users`, {
				credentials: "include",
			});
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		},
	});
};

export const useCreateUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (newUser: CreateUserInput) => {
			const response = await fetch(`${API_BASE_URL}/api/users`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newUser),
				credentials: "include",
			});
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || "Network response was not ok");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
};

export const useGetUserById = (id: string | undefined) => {
	return useQuery({
		queryKey: ["user", id],
		queryFn: async () => {
			if (!id) {
				return null;
			}
			const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
				credentials: "include",
			});
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const userData = await response.json();
			// Remove the password field entirely from the frontend data
			const { password, ...userDataWithoutPassword } = userData;
			return {
				...userDataWithoutPassword,
				hasPasswordSet: userData.hasPasswordSet,
			};
		},
		enabled: !!id,
	});
};

export const useUpdateUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			updatedUser,
		}: {
			id: string;
			updatedUser: Partial<User>;
		}) => {
			const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updatedUser),
				credentials: "include",
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || "Failed to update user");
			}

			return response.json();
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			// queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
		},
	});
};

export const useDeleteUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
				method: "put",
				credentials: "include",
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Failed to delete user: ${errorText}`);
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
};

export const useGetRoles = () => {
	return useQuery({
		queryKey: ["roles"],
		queryFn: async () => {
			const response = await fetch(`${API_BASE_URL}/api/users/roles`, {
				credentials: "include",
			});
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json() as Promise<Role[]>;
		},
	});
};

export const useUpdateProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			name,
			about_me,
		}: {
			id: string;
			name: string;
			about_me: string;
		}) => {
			const response = await fetch(`${API_BASE_URL}/api/users/${id}/profile`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ name, about_me }),
				credentials: "include",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to update profile");
			}

			return response.json();
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
		},
	});
};
