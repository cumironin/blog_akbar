import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MediaPage from "../pages/media/mediaPage";
import * as mediaApi from "@/api/mediaApi";
import { Toaster } from "@/components/ui/toaster";

// Mock the mediaApi functions
vi.mock("@/api/mediaApi", () => ({
	getMediaList: vi.fn(),
	uploadMedia: vi.fn(),
	deleteMedia: vi.fn(),
}));

// Mock the environment variable
vi.mock("import.meta.env", () => ({
	VITE_API_BASE_URL: "http://test-api.com",
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => "mock-url");

describe("MediaPage", () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					retry: false,
				},
			},
		});
		vi.resetAllMocks();
	});

	const renderComponent = () => {
		return render(
			<QueryClientProvider client={queryClient}>
				<Toaster />
				<MediaPage />
			</QueryClientProvider>,
		);
	};

	it("renders the component with correct headings", async () => {
		vi.mocked(mediaApi.getMediaList).mockResolvedValue([]);
		renderComponent();
		await waitFor(() => {
			expect(screen.getByText("Dashboard")).toBeTruthy();
			expect(screen.getByText("Media Management")).toBeTruthy();
		});
	});

	it("uploads a file when the form is submitted", async () => {
		// Mock API calls
		vi.mocked(mediaApi.getMediaList).mockResolvedValue([]);
		// Mock uploadMedia API call
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		vi.mocked(mediaApi.uploadMedia).mockResolvedValue({} as any);

		// Render the MediaPage component
		renderComponent();

		// Wait for and click the "Add Image" button
		await waitFor(() => {
			fireEvent.click(screen.getByText("Add Image"));
		});

		// Find form elements
		const fileInput = screen.getByTestId("fileInput");
		const descriptionInput = screen.getByPlaceholderText("Description");
		const submitButton = screen.getByText("Upload");

		// Create a dummy file
		const file = new File(["dummy content"], "test.png", { type: "image/png" });
		// Simulate file selection
		fireEvent.change(fileInput, { target: { files: [file] } });
		// Enter description
		fireEvent.change(descriptionInput, {
			target: { value: "Test description" },
		});
		// Click upload button
		fireEvent.click(submitButton);

		// Assert that uploadMedia was called with correct arguments
		await waitFor(() => {
			expect(mediaApi.uploadMedia).toHaveBeenCalledWith(
				file,
				"",
				"Test description",
			);
			expect(mediaApi.uploadMedia).toHaveBeenCalledWith(
				file,
				"",
				"Test description",
			);
		});
	});

	// it("deletes a media item when delete is clicked", async () => {
	// 	const mockMediaList = [
	// 		{
	// 			id: "1",
	// 			name: "Image 1",
	// 			url: "/image1.jpg",
	// 			image: "/image1.jpg",
	// 			description: "Description 1",
	// 		},
	// 	];
	// 	vi.mocked(mediaApi.getMediaList).mockResolvedValue(mockMediaList);
	// 	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	// 	vi.mocked(mediaApi.deleteMedia).mockResolvedValue({} as any);

	// 	renderComponent();

	// 	// Wait for the loading state to disappear
	// 	await waitFor(() => {
	// 		expect(screen.queryByText("Loading...")).toBeNull();
	// 	});

	// 	// Check if the media list is rendered
	// 	const mediaItem = await screen.findByText("Image 1", {}, { timeout: 5000 });
	// 	expect(mediaItem).toBeTruthy();

	// 	// Click the "More" button
	// 	const moreButton = screen.getByLabelText("More");
	// 	fireEvent.click(moreButton);

	// 	// Wait for the delete button to appear and click it
	// 	const deleteButton = await screen.findByText("Delete");
	// 	fireEvent.click(deleteButton);

	// 	// Wait for the delete API call to be made
	// 	await waitFor(() => {
	// 		expect(mediaApi.deleteMedia).toHaveBeenCalledWith("1");
	// 	});

	// 	// Optionally, check if the item has been removed from the list
	// 	await waitFor(() => {
	// 		expect(screen.queryByText("Image 1")).toBeNull();
	// 	});
	// });
});
