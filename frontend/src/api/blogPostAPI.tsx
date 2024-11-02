import type { BlogPost } from "@/pages/post/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useGetCategoryBlog = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/blog/categoryblog`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Category fetch error:", errorText);
        throw new Error(`Network response was not ok: ${errorText}`);
      }
      return response.json();
    },
  });
};

export const useGetAuthorBlog = () => {
  return useQuery({
    queryKey: ["authors"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/blog/userblog`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Author fetch error:", errorText);
        throw new Error(`Network response was not ok: ${errorText}`);
      }
      return response.json();
    },
  });
};

export const useGetImageBlog = () => {
  return useQuery({
    queryKey: ["imageblogs"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/blog/imageblog`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Image blog fetch error:", errorText);
        throw new Error(`Network response was not ok: ${errorText}`);
      }
      return response.json();
    },
  });
};

export const usetGetBlogPost = () => {
  const getBlogPost = async (): Promise<BlogPost[]> => {
    const response = await fetch(`${API_BASE_URL}/api/blog`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Error fetch usetGetBlogPost");
    }
    return response.json();
  };

  const { data: blogpost } = useQuery({
    queryKey: ["blogposts"],
    queryFn: getBlogPost,
  });

  return { blogpost };
};

export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newPost: Omit<BlogPost, "id" | "createdAt" | "updatedAt">
    ) => {
      const response = await fetch(`${API_BASE_URL}/api/blog/createblog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...newPost,
          categories: newPost.categories || [],
          image_url: newPost.image_url || "",
          metatitle: newPost.metatitle || "",
          slug: newPost.slug || "",
          publishedAt: newPost.publishedAt.toISOString(),
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Network response was not ok");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error: Error) => {
      console.error("Error creating blog post:", error);
    },
  });
};

export const useEditBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: async ({
      id,
      updatedPost,
    }: {
      id: string;
      updatedPost: Partial<Omit<BlogPost, "id" | "createdAt" | "updatedAt">>;
    }) => {
      const response = await fetch(`${API_BASE_URL}/api/blog/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...updatedPost,
          categories: updatedPost.categories || [],
          image_url: updatedPost.image_url || "",
          metatitle: updatedPost.metatitle || "",
          slug: updatedPost.slug || "",
          publishedAt: updatedPost.publishedAt
            ? new Date(updatedPost.publishedAt).toISOString()
            : undefined,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Network response was not ok");
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", variables.id] });
    },
  });
};

export const useDeleteBlogPost = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/blog/${id}`, {
      method: "PUT", // Changed from PUT to DELETE
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete category: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    throw error;
  }
};

export const useGetBlogPostById = (id: string | undefined) => {
  return useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`${API_BASE_URL}/api/blog/${id}`, {
        method: "GET", // Changed from PUT to DELETE
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Network error");
      }

      return response.json();
    },
    enabled: !!id,
  });
};

export const useDeleteAllBlogPost = async (ids: string[]) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/blog/deleteMultiple`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete multiple blog posts: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error in deleteAllBlogPosts:", error);
    throw error;
  }
};
