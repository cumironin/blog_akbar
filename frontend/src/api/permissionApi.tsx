const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import type { Permission, Role } from "@/pages/authorize/permission/types";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AddPermissionData {
  name: string;
  description: string;
  menu_id: string;
  urlAccess: {
    create: string | null;
    read: string | null;
    update: string | null;
    delete: string | null;
  };
}

export const addPermission = async (
  permission: AddPermissionData
): Promise<Permission> => {
  const response = await fetch(`${API_BASE_URL}/api/permissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(permission),
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Server error response:", errorData);
    throw new Error(errorData.error || "Permission creation failed");
  }

  const data = await response.json();
  return data.permission;
};

export const getPermissions = async (): Promise<Role[]> => {
  const response = await fetch(`${API_BASE_URL}/api/permissions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to get permissions: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export const useGetPermissions = () => {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: getPermissions,
  });
};

interface UpdatePermissionData {
  permissionId: string;
  roleId: string;
  urlAccess: {
    create: string | null;
    read: string | null;
    update: string | null;
    delete: string | null;
  };
}

export const updatePermission = async (
  data: UpdatePermissionData
): Promise<Permission> => {
  try {
    // Validate required fields
    if (!data.permissionId || !data.roleId || !data.urlAccess) {
      throw new Error("Missing required fields for updating permission");
    }

    console.log("Sending update permission request with data:", data);
    const response = await fetch(
      `${API_BASE_URL}/api/permissions/${data.permissionId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Server error response:", errorData);
      throw new Error(`Failed to update permission: ${errorData.error}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating permission:", error);
    throw error;
  }
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePermission,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      return data;
    },
  });
};

// interface DeletePermissionData {
// 	roleId: string;
// 	permissionId: string;
// }

export const deletePermission = async (permissionId: string) => {
  const response = await fetch(
    `${API_BASE_URL}/api/permissions/${permissionId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete permission: ${response.statusText}`);
  }

  return response.json();
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
};

export const getPermission = async (
  permissionId: string
): Promise<Permission> => {
  const response = await fetch(
    `${API_BASE_URL}/api/permissions/${permissionId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get permission: ${response.statusText}`);
  }

  return await response.json();
};

export const useGetPermission = () => {
  return useMutation({
    mutationFn: getPermission,
  });
};

export interface UserPermissionResponse {
  message: string;
  userId: string;
  session: string;
  permissions: {
    roleId: string;
    permissionId: string;
    urlAccess: string;
  }[];
}

export const getRoleUserPermission =
  async (): Promise<UserPermissionResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/api/permissions/userpermission`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get user permissions: ${response.statusText}`);
    }

    return await response.json();
  };

export const useGetRoleUserPermission = () => {
  return useQuery({
    queryKey: ["userRolePermissions"],
    queryFn: getRoleUserPermission,
  });
};

// ... you can keep the existing useGetPermission hook if needed for other parts of your application
