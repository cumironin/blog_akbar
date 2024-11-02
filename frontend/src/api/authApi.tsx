import { z } from "zod";

// Define the API base URL from the environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Define the login schema using Zod validation
const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

// Define the type for login credentials
export type LoginCredentials = z.infer<typeof loginSchema>;

// Define the loginUser function to handle user login
export const loginUser = async (credentials: LoginCredentials) => {
	// Validate the login credentials using the loginSchema
	const validatedCredentials = loginSchema.parse(credentials);

	// Send a POST request to the login endpoint with the validated credentials
	const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(validatedCredentials),
		credentials: "include",
	});

	// Check if the response is successful
	if (!response.ok) {
		// If the response is not successful, parse the error message and throw an error
		const errorData = await response.json();
		throw new Error(errorData.message || "Login failed");
	}

	// If the response is successful, return the response data
	return response.json();
};

// Define the logoutUser function to handle user logout
export const logoutUser = async () => {
	// Send a POST request to the logout endpoint
	const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
		method: "POST",
		credentials: "include",
	});

	// Check if the response is successful
	if (!response.ok) {
		// If the response is not successful, parse the error message and throw an error
		const errorData = await response.json();
		throw new Error(errorData.message || "Logout failed");
	}

	// If the response is successful, return the response data
	return response.json();
};

// Define the handleLoginError function to handle login errors
export const handleLoginError = async (error: Error) => {
	// Check if the error message is "Login failed"
	if (error.message === "Login failed") {
		// If the error is "Login failed", redirect the user to the login page
		window.location.href = "/auth/login";
	} else {
		// If the error is not "Login failed", log the error to the console and throw the error
		console.error("Login error:", error);
		throw error;
	}
};

// Define the loginAgainUser function to handle user login with error handling
export const loginAgainUser = async (credentials: LoginCredentials) => {
	try {
		// Validate the login credentials using the loginSchema
		const validatedCredentials = loginSchema.parse(credentials);

		// Send a POST request to the login endpoint with the validated credentials
		const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(validatedCredentials),
			credentials: "include",
		});

		// Check if the response is successful
		if (!response.ok) {
			// If the response is not successful, throw an error
			throw new Error("Login failed");
		}

		// If the response is successful, return the response data
		return response.json();
	} catch (error) {
		// If there is an error, call the handleLoginError function to handle the error
		await handleLoginError(error as Error);
	}
};

// Define the RegisterCredentials type
type RegisterCredentials = {
	username: string;
	email: string;
	name: string;
	password: string;
};

// Define the registerUser function to handle user registration
export const registerUser = async (credentials: RegisterCredentials) => {
	try {
		// Send a POST request to the register endpoint with the credentials
		const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(credentials),
			credentials: "include",
		});

		// Check if the response is successful
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Registration failed");
		}

		// If the response is successful, return the response data
		return response.json();
	} catch (error) {
		console.error("Registration error:", error);
		throw error;
	}
};

// Define the getSessionId function to retrieve the session ID
export const getSessionId = async () => {
	try {
		// Send a GET request to the getSessionId endpoint
		const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
			method: "GET",
			credentials: "include",
		});

		if (!response.ok) {
			if (response.status === 401) {
				throw new Error("Unauthorized");
			}
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to get session ID");
		}

		// If the response is successful, return the response data
		return response.json();
	} catch (error) {
		console.error("Get Session ID error:", error);
		throw error;
	}
};

// Add this function to your authApi.tsx file
export const fetchUserDetails = async (userId: string) => {
	try {
		const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
			method: "GET",
			credentials: "include",
		});

		if (!response.ok) {
			if (response.status === 401) {
				throw new Error("Unauthorized");
			}
			throw new Error("Failed to fetch user details");
		}

		return response.json();
	} catch (error) {
		console.error("Error fetching user details:", error);
		throw error;
	}
};
