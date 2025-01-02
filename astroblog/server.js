import express from "express";
import { handler } from "./dist/server/entry.mjs";

const app = express();
const port = Number.parseInt(process.env.PORT || "3000", 10);

// Add error handling middleware
app.use((err, req, res, next) => {
	console.error("Error:", err);

	// Handle API connection errors more gracefully
	if (err.code === "ECONNREFUSED") {
		return res.status(503).send("API service unavailable");
	}

	res.status(500).send("Something broke!");
});

// Add request logging with more details
app.use((req, res, next) => {
	console.log(
		`${new Date().toISOString()} - ${req.method} ${req.url} - API URL: ${process.env.BLOG_API_URL}`,
	);
	next();
});

// Add middleware to handle Astro SSR
app.use(handler);

// Add function to check API health
async function checkApiHealth(apiUrl) {
	try {
		const response = await fetch(`${apiUrl}/health/liveness`);
		if (response.status !== 200 && response.status !== 401) {
			throw new Error(
				`API health check failed with status: ${response.status}`,
			);
		}
		return true;
	} catch (error) {
		console.error("API health check failed:", error);
		return false;
	}
}

const startServer = async () => {
	try {
		const apiUrl = process.env.BLOG_API_URL;
		if (!apiUrl) {
			throw new Error("BLOG_API_URL environment variable is not set");
		}

		console.log(`Checking API availability at ${apiUrl}/health/liveness`);

		// Add retry logic for API health check
		let isApiHealthy = false;
		let retries = 5;

		while (!isApiHealthy && retries > 0) {
			isApiHealthy = await checkApiHealth(apiUrl);
			if (!isApiHealthy) {
				console.log(
					`API not ready, retrying... (${retries} attempts remaining)`,
				);
				await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
				retries--;
			}
		}

		if (!isApiHealthy) {
			throw new Error("Failed to connect to API after multiple attempts");
		}

		const server = await new Promise((resolve, reject) => {
			const s = app.listen(port, "0.0.0.0", () => {
				console.log(`Server is running on http://0.0.0.0:${port}`);
				console.log(`Using API URL: ${apiUrl}`);
				resolve(s);
			});

			s.on("error", (error) => {
				console.error("Server error:", error);
				reject(error);
			});
		});

		return server;
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
};

startServer();
