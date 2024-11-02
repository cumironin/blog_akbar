import type { Settings } from "@/pages/settings/types";
import { useQuery } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useGetSettings = () => {
	const getSettingsRequest = async (): Promise<Settings> => {
		const response = await fetch(`${API_BASE_URL}/api/settings`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		if (!response.ok) {
			throw new Error("Failed to get settings");
		}

		return response.json();
	};

	return useQuery({
		queryKey: ["settings"],
		queryFn: getSettingsRequest,
	});
};

export const useGetSettingsById = (id: string | undefined) => {
	const getSettings = useQuery({
		queryKey: ["settings", id],
		queryFn: async () => {
			if (!id) throw new Error("Settings ID is required");
			const response = await fetch(`${API_BASE_URL}/api/settings/${id}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to get settings by id");
			}

			const data = await response.json();
			// If the API returns an array, return the first item
			return Array.isArray(data) ? data[0] : data;
		},
		enabled: !!id,
	});

	return getSettings;
};

export const useUpdateSettings = async (
	settingsData: Partial<Settings>,
): Promise<Settings> => {
	const response = await fetch(`${API_BASE_URL}/api/settings`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(settingsData),
	});

	if (!response.ok) {
		throw new Error("Failed to update settings");
	}

	return response.json();
};
