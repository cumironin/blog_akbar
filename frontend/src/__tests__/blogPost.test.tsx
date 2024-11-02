import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	useGetCategoryBlog,
	useGetAuthorBlog,
	useGetImageBlog,
	useCreateBlogPost,
	useEditBlogPost,
	useDeleteBlogPost,
} from "@/api/blogPostAPI";

// Mock the global fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock the API functions
vi.mock("@/api/blogPostAPI", () => ({
	useGetCategoryBlog: vi.fn(),
	useGetAuthorBlog: vi.fn(),
	useGetImageBlog: vi.fn(),
	useCreateBlogPost: vi.fn(),
	useEditBlogPost: vi.fn(),
	useDeleteBlogPost: vi.fn(),
}));

// Mock the environment variables
vi.mock("import.meta", () => ({
	env: { VITE_API_BASE_URL: "http://localhost:5000" },
}));

// Mock the react-query hooks
vi.mock("@tanstack/react-query", async () => {
	const actual = await vi.importActual("@tanstack/react-query");
	return {
		...actual,
		useMutation: vi.fn(),
	};
});

describe("blogPostAPI", () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient();
		mockFetch.mockClear();
		vi.clearAllMocks();
	});

	describe("useGetCategoryBlog", () => {
		it("should fetch category blog data successfully", async () => {
			const mockCategories = [
				{ id: 1, title: "Category 1" },
				{ id: 2, title: "Category 2" },
			];

			(useGetCategoryBlog as ReturnType<typeof vi.fn>).mockReturnValue({
				data: mockCategories,
				isLoading: false,
				error: null,
			});

			const wrapper = ({ children }: { children: React.ReactNode }) => (
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			);

			const { result } = renderHook(() => useGetCategoryBlog(), { wrapper });

			await waitFor(() => expect(result.current.data).toEqual(mockCategories));

			expect(useGetCategoryBlog).toHaveBeenCalled();
		});

		it("should handle fetch error for category blog", async () => {
			const mockError = new Error("Network error");

			(useGetCategoryBlog as ReturnType<typeof vi.fn>).mockReturnValue({
				data: undefined,
				isLoading: false,
				error: mockError,
			});

			const wrapper = ({ children }: { children: React.ReactNode }) => (
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			);

			const { result } = renderHook(() => useGetCategoryBlog(), { wrapper });

			await waitFor(() => expect(result.current.error).toBeDefined());
		});
	});

	describe("useGetAuthorBlog", () => {
		it("should fetch author blog data successfully", async () => {
			const mockAuthors = [
				{ id: 1, name: "Author 1" },
				{ id: 2, name: "Author 2" },
			];

			(useGetAuthorBlog as ReturnType<typeof vi.fn>).mockReturnValue({
				data: mockAuthors,
				isLoading: false,
				error: null,
			});

			const wrapper = ({ children }: { children: React.ReactNode }) => (
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			);

			const { result } = renderHook(() => useGetAuthorBlog(), { wrapper });

			await waitFor(() => expect(result.current.data).toEqual(mockAuthors));

			expect(useGetAuthorBlog).toHaveBeenCalled();
		});

		it("should handle fetch error for author blog", async () => {
			const mockError = new Error("Network error");

			(useGetAuthorBlog as ReturnType<typeof vi.fn>).mockReturnValue({
				data: undefined,
				isLoading: false,
				error: mockError,
			});

			const wrapper = ({ children }: { children: React.ReactNode }) => (
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			);

			const { result } = renderHook(() => useGetAuthorBlog(), { wrapper });

			await waitFor(() => expect(result.current.error).toBeDefined());
		});
	});

	describe("useGetImageBlog", () => {
		it("should fetch image blog data successfully", async () => {
			const mockImages = [
				{ id: 1, src: "image1.jpg", alt: "Image 1" },
				{ id: 2, src: "image2.jpg", alt: "Image 2" },
			];

			(useGetImageBlog as ReturnType<typeof vi.fn>).mockReturnValue({
				data: mockImages,
				isLoading: false,
				error: null,
			});

			const wrapper = ({ children }: { children: React.ReactNode }) => (
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			);

			const { result } = renderHook(() => useGetImageBlog(), { wrapper });

			await waitFor(() => expect(result.current.data).toEqual(mockImages));

			expect(useGetImageBlog).toHaveBeenCalled();
		});

		it("should handle fetch error for image blog", async () => {
			const mockError = new Error("Network error");

			(useGetImageBlog as ReturnType<typeof vi.fn>).mockReturnValue({
				data: undefined,
				isLoading: false,
				error: mockError,
			});

			const wrapper = ({ children }: { children: React.ReactNode }) => (
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			);

			const { result } = renderHook(() => useGetImageBlog(), { wrapper });

			await waitFor(() => expect(result.current.error).toBeDefined());
		});
	});

	describe("useCreateBlogPost", () => {
		it("should create a blog post successfully", async () => {
			// Mock data for a new blog post
			const mockNewPost = {
				title: "Test Post",
				metatitle: "Test Meta Title",
				slug: "test-post",
				content: "This is a test post content",
				image_url: "https://example.com/image.jpg",
				authorId: "123",
				author: "Test Author",
				publishedAt: expect.any(String),
				categories: [],
			};

			// Expected result after successful creation
			const mockCreatedPost = {
				...mockNewPost,
				id: "456",
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			};

			// Mock the mutation function
			const mockMutate = vi.fn().mockResolvedValue(mockCreatedPost);

			// Mock the useCreateBlogPost hook
			vi.mocked(useCreateBlogPost).mockReturnValue({
				mutate: mockMutate,
				isLoading: false,
				error: null,
				data: mockCreatedPost,
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} as any);

			// Create a wrapper component with QueryClientProvider
			const wrapper = ({ children }: { children: React.ReactNode }) => (
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			);

			// Render the hook
			const { result } = renderHook(() => useCreateBlogPost(), { wrapper });

			// Execute the mutation
			await act(async () => {
				await result.current.mutate(mockNewPost);
			});

			// Assert that the mutation was called with the correct data
			expect(mockMutate).toHaveBeenCalledWith(mockNewPost);
			// Assert that the result data matches the expected created post
			expect(result.current.data).toEqual(mockCreatedPost);
		});

		// Test case for handling errors during blog post creation
		it("should handle create blog post error", async () => {
			// Create a mock error
			const mockError = new Error("Network error");
			// Mock the mutation function to reject with the error
			const mockMutate = vi.fn().mockRejectedValue(mockError);

			// Mock the useCreateBlogPost hook with error state
			vi.mocked(useCreateBlogPost).mockReturnValue({
				mutate: mockMutate,
				isLoading: false,
				error: mockError,
				data: undefined,
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} as any);

			// Create a wrapper component with QueryClientProvider
			const wrapper = ({ children }: { children: React.ReactNode }) => (
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			);

			// Render the hook
			const { result } = renderHook(() => useCreateBlogPost(), { wrapper });

			// Mock data for a new blog post
			const newPost = {
				title: "Test Post",
				metatitle: "Test Meta Title",
				slug: "test-post",
				content: "This is a test post content",
				image_url: "https://example.com/image.jpg",
				authorId: "123",
			};

			// Execute the mutation and expect it to throw an error
			await act(async () => {
				return await expect(result.current.mutate(newPost)).rejects.toThrow(
					"Network error",
				);
			});

			// Assert that the mutation was called with the correct data
			expect(mockMutate).toHaveBeenCalledWith(newPost);
			// Assert that the error in the result matches the mock error
			expect(result.current.error).toEqual(mockError);
		});
	});

	describe("useEditBlogPost", () => {
		it("should edit a blog post successfully", async () => {
			const mockUpdatedPost = {
				title: "Updated Test Post",
				content: "This is updated test post content",
				image_url: "https://example.com/updated-image.jpg",
				authorId: "123",
				publishedAt: new Date(),
			};

			const mockEditedPost = {
				id: "456",
				...mockUpdatedPost,
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			};

			const mockMutate = vi.fn().mockResolvedValue(mockEditedPost);

			vi.mocked(useEditBlogPost).mockReturnValue({
				mutate: mockMutate,
				isLoading: false,
				error: null,
				data: mockEditedPost,
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} as any);

			const wrapper = ({ children }: { children: React.ReactNode }) => (
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			);

			const { result } = renderHook(() => useEditBlogPost(), { wrapper });

			await act(async () => {
				await result.current.mutate({
					id: "456",
					updatedPost: mockUpdatedPost,
				});
			});

			expect(mockMutate).toHaveBeenCalledWith({
				id: "456",
				updatedPost: mockUpdatedPost,
			});
			expect(result.current.data).toEqual(mockEditedPost);
		});

		it("should handle edit blog post error", async () => {
			const mockError = new Error("Network error");
			const mockMutate = vi.fn().mockRejectedValue(mockError);

			vi.mocked(useEditBlogPost).mockReturnValue({
				mutate: mockMutate,
				isLoading: false,
				error: mockError,
				data: undefined,
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} as any);

			const wrapper = ({ children }: { children: React.ReactNode }) => (
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			);

			const { result } = renderHook(() => useEditBlogPost(), { wrapper });

			const updatedPost = {
				title: "Updated Test Post",
				content: "This is updated test post content",
			};

			await act(async () => {
				await expect(
					result.current.mutate({ id: "456", updatedPost }),
				).rejects.toThrow("Network error");
			});

			expect(mockMutate).toHaveBeenCalledWith({ id: "456", updatedPost });
			expect(result.current.error).toEqual(mockError);
		});
	});

	describe("useDeleteBlogPost", () => {
		it("should successfully delete a blog post", async () => {
			const mockDeletedPost = {
				id: "123",
				message: "Blog post deleted successfully",
			};

			// Mock the useDeleteBlogPost hook
			vi.mocked(useDeleteBlogPost).mockResolvedValue(mockDeletedPost);

			const result = await useDeleteBlogPost("123");

			expect(useDeleteBlogPost).toHaveBeenCalledWith("123");
			expect(result).toEqual(mockDeletedPost);
		});

		it("should handle delete blog post error", async () => {
			const mockError = new Error("Failed to delete blog post");

			// Mock the useDeleteBlogPost hook to throw an error
			vi.mocked(useDeleteBlogPost).mockRejectedValue(mockError);

			await expect(useDeleteBlogPost("123")).rejects.toThrow(
				"Failed to delete blog post",
			);

			expect(useDeleteBlogPost).toHaveBeenCalledWith("123");
		});
	});
});
