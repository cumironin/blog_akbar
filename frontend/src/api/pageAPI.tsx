import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import type { Page } from "@/pages/page/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useGetPages = () => {
  return useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/pages`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
  });
};

export const useCreatePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newPage: Omit<Page, "id" | "createdAt" | "updatedAt">
    ) => {
      const response = await fetch(`${API_BASE_URL}/api/pages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPage),
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Network response was not ok");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
};

export const useGetAuthors = () => {
  return useQuery({
    queryKey: ["pageAuthors"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/pages/author`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
  });
};

export const useEditPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updatedPage,
    }: {
      id: string;
      updatedPage: Partial<Page>;
    }) => {
      const response = await fetch(`${API_BASE_URL}/api/pages/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPage),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", response.status, errorText);
        throw new Error(`Failed to update page: ${errorText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
};

export const useDeletePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/api/pages/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete page: ${errorText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
};

export const useGetPageById = (id: string | undefined) => {
  return useQuery({
    queryKey: ["page", id],
    queryFn: async () => {
      if (!id) {
        console.log("No ID provided to useGetPageById");
        return null;
      }
      console.log("Fetching page with ID:", id);
      const response = await fetch(`${API_BASE_URL}/api/pages/${id}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Fetched page data:", data);
      return data;
    },
    enabled: !!id,
  });
};

export const useDeleteMultiplePages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await fetch(`${API_BASE_URL}/api/pages/deleteMultiple`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete multiple pages: ${errorText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
};
