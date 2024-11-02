interface Props {
	endpoint: string;
	query?: Record<string, string>;
	wrappedByKey?: string;
	WrappedByList?: boolean;
}

export const fetchApi = async <T>({
	endpoint,
	query,
	wrappedByKey,
	WrappedByList,
}: Props): Promise<T> => {
	if (endpoint.startsWith("/")) {
		endpoint = endpoint.slice(1);
	}

	// Construct the URL with query parameters
	const url = new URL(`${import.meta.env.BLOG_URL}/${endpoint}`);
	if (query) {
		// biome-ignore lint/complexity/noForEach: <explanation>
		Object.entries(query).forEach(([key, value]) => {
			url.searchParams.append(key, value);
		});
	}

	try {
		const response = await fetch(url.toString(), {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		// Handle wrapping
		let result = data;
		if (wrappedByKey) {
			result = data[wrappedByKey];
		}
		if (WrappedByList) {
			result = Array.isArray(result) ? result[0] : result;
		}

		return result as T;
	} catch (error) {
		console.error("Fetch error:", error);
		throw error;
	}
};

export async function fetchApiById<T>({
	endpoint,
	id,
}: {
	endpoint: string;
	id: string;
}): Promise<T | null> {
	try {
		// Use BLOG_URL instead of PUBLIC_BACKEND_URL
		const url = new URL(`${import.meta.env.BLOG_URL}/${endpoint}/${id}`);

		const response = await fetch(url.toString());

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Fetch error:", error);
		return null;
	}
}

export async function fetchRelatedArticles<T>({
	id,
	category,
}: {
	id: string;
	category: string;
}): Promise<T | null> {
	try {
		const url = new URL(
			`${import.meta.env.BLOG_URL}/api/astroblog/related/${id}/${category}`,
		);

		const response = await fetch(url.toString());

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data.data;
	} catch (error) {
		console.error("Fetch error:", error);
		return null;
	}
}

export async function fetchTrendingArticles<T>(): Promise<T | null> {
	try {
		const url = new URL(`${import.meta.env.BLOG_URL}/api/astroblog/trending`);

		const response = await fetch(url.toString());

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data.data;
	} catch (error) {
		console.error("Fetch error:", error);
		return null;
	}
}

export async function fetchArticlesByCategory<T>({
	category,
}: {
	category: string;
}): Promise<T | null> {
	try {
		const url = new URL(
			`${import.meta.env.BLOG_URL}/api/astroblog/category/${category}`,
		);

		const response = await fetch(url.toString(), {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		const processedData = data?.data ?? data;
		return {
			data: Array.isArray(processedData) ? processedData : [processedData],
		} as T;
	} catch (error) {
		console.error("Fetch error:", error);
		return null;
	}
}

export async function fetchCategories<T>(): Promise<T | null> {
	try {
		const url = new URL(`${import.meta.env.BLOG_URL}/api/astroblog/categories`);

		const response = await fetch(url.toString(), {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		return {
			data: data.data || data,
		} as T;
	} catch (error) {
		console.error("Fetch categories error:", error);
		return null;
	}
}

export async function getAllAstroBlog<T>(p0?: {
	endpoint: string;
}): Promise<T | null> {
	try {
		const url = new URL(`${import.meta.env.BLOG_URL}/api/astroblog/allarticle`);
		console.log("Fetching all articles from:", url.toString());

		const response = await fetch(url.toString(), {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		console.log("Received data:", data);

		const result = {
			data: data.data || data,
		} as T;
		console.log("Processed result:", result);

		return result;
	} catch (error) {
		console.error("Fetch all articles error:", error);
		return null;
	}
}

export async function getUserAvatar<T>(): Promise<T | null> {
	try {
		const url = new URL(`${import.meta.env.BLOG_URL}/api/astroblog/useravatar`);
		console.log("Fetching username from:", url.toString());

		const response = await fetch(url.toString(), {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		console.log("Received username data:", data);

		return {
			data: data.data || data,
		} as T;
	} catch (error) {
		console.error("Fetch username error:", error);
		return null;
	}
}

export async function searchArticles<T>(keyword: string): Promise<T | null> {
	try {
		const url = new URL(`${import.meta.env.BLOG_URL}/api/astroblog/search`);
		url.searchParams.append("keyword", keyword);
		console.log("Searching articles from:", url.toString());

		const response = await fetch(url.toString(), {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		console.log("Search results:", data);

		return {
			data: data.data || data,
		} as T;
	} catch (error) {
		console.error("Search articles error:", error);
		return null;
	}
}
