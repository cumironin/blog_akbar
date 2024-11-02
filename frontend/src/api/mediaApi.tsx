// export const API_URL = "http://localhost:5000/api/media";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const uploadMedia = async (
  file: File,
  urlRestrict?: string,
  description?: string
) => {
  const formData = new FormData();
  formData.append("file", file);
  if (urlRestrict) {
    formData.append("urlRestrict", urlRestrict);
  }
  if (description) {
    formData.append("description", description);
  }
  try {
    const response = await fetch(`${API_BASE_URL}/api/media/upload`, {
      method: "POST",
      body: formData,
      credentials: "include", // Add this line to include credentials
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server response:", response.status, errorText);
      throw new Error(
        `Failed to upload media: ${response.status} ${errorText}`
      );
    }
    return response.json();
  } catch (error) {
    console.error("Error in uploadMedia:", error);
    throw error;
  }
};

export const getMediaList = async () => {
  const response = await fetch(`${API_BASE_URL}/api/media`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch media list");
  }
  return response.json();
};

export const deleteMedia = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/media/${id}`, {
    method: "delete", // Changed from PUT to DELETE
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to delete media");
  }
  return response.json();
};

export const editMediaDescription = async (id: string, description: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/media/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description }),
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server response:", response.status, errorText);
      throw new Error(
        `Failed to edit media description: ${response.status} ${errorText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error in editMediaDescription:", error);
    throw error;
  }
};
