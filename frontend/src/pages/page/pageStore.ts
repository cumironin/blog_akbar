import { create } from "zustand";
import type { Page } from "./types";

interface PageState {
	pages: Page[];
	currentPage: Page | null;
	searchTerm: string;
	selectedPages: string[];
	isLoading: boolean;
	error: string | null;
	setPages: (pages: Page[]) => void;
	setCurrentPage: (page: Page | null) => void;
	setSearchTerm: (term: string) => void;
	setSelectedPages: (pageIds: string[]) => void;
	addPage: (page: Page) => void;
	updatePage: (updatedPage: Page) => void;
	removePage: (pageId: string) => void;
	removeMultiplePages: (pageIds: string[]) => void;
	setIsLoading: (isLoading: boolean) => void;
	setError: (error: string | null) => void;
}

export const usePageStore = create<PageState>((set) => ({
	pages: [],
	currentPage: null,
	searchTerm: "",
	selectedPages: [],
	isLoading: false,
	error: null,
	setPages: (pages) => set({ pages }),
	setCurrentPage: (page) => set({ currentPage: page }),
	setSearchTerm: (term) => set({ searchTerm: term }),
	setSelectedPages: (pageIds) => set({ selectedPages: pageIds }),
	addPage: (page) => set((state) => ({ pages: [...state.pages, page] })),
	updatePage: (updatedPage) =>
		set((state) => ({
			pages: state.pages.map((page) =>
				page.id === updatedPage.id ? updatedPage : page,
			),
			currentPage:
				updatedPage.id === state.currentPage?.id
					? updatedPage
					: state.currentPage,
		})),
	removePage: (pageId) =>
		set((state) => ({
			pages: state.pages.filter((page) => page.id !== pageId),
			selectedPages: state.selectedPages.filter((id) => id !== pageId),
		})),
	removeMultiplePages: (pageIds) =>
		set((state) => ({
			pages: state.pages.filter((page) => !pageIds.includes(page.id)),
			selectedPages: state.selectedPages.filter((id) => !pageIds.includes(id)),
		})),
	setIsLoading: (isLoading) => set({ isLoading }),
	setError: (error) => set({ error }),
}));
