const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const postAuthorizeRole = async (permission: any) => {
	const response = await fetch(`${API_BASE_URL}/api/rolepermission`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(permission),
		credentials: "include",
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Permission creation failed");
	}

	return response.json();
};

export const getAuthorizeRole = async () => {
	try {
		const response = await fetch(`${API_BASE_URL}/api/rolepermission`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to fetch roles");
		}

		return response.json();
	} catch (error) {
		console.error("Error fetching roles:", error);
		throw error;
	}
};

export const putAuthorizeRole = async (id: string) => {
	try {
		const response = await fetch(`${API_BASE_URL}/api/rolepermission/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ id }),
			credentials: "include",
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to update role");
		}

		return response.json();
	} catch (error) {
		console.error("Error updating role:", error);
		throw error;
	}
};

export const patchAuthorizeRole = async (
	id: string,
	data: { roleName: string },
) => {
	try {
		const response = await fetch(`${API_BASE_URL}/api/rolepermission/${id}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to update role");
		}

		return await response.json();
	} catch (error) {
		console.error("Error updating role:", error);
		throw error;
	}
};
