import {
	useDeletePermission,
	useGetPermissions,
	useUpdatePermission,
	// useGetPermission,
} from "@/api/permissionApi";
import type React from "react";
import { useEffect, useState } from "react";
import FormPermission from "./FormPermission";
import PermissionPaging from "./PermissionPaging";
import PermissionTable from "./PermissionTable";
import RoleDropdown from "./RoleDropdown";
import type { Permission, Role } from "./types";
// import { Button } from "@/components/ui/button";

const RolePermissionConnection: React.FC = () => {
	const [selectedRole, setSelectedRole] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
	const [editingPermission, setEditingPermission] = useState<Permission | null>(
		null,
	);
	const itemsPerPage = 5;

	const { data: roles, isLoading, error, refetch } = useGetPermissions();
	const updatePermissionMutation = useUpdatePermission();
	const deletePermissionMutation = useDeletePermission();
	// const getPermissionQuery = useGetPermission();

	const selectedRoleData = roles?.find((role) => role.id === selectedRole);
	const [permissions, setPermissions] = useState<Permission[]>([]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (selectedRoleData) {
			console.log(
				"Selected role data:",
				JSON.stringify(selectedRoleData, null, 2),
			);
			setPermissions(
				selectedRoleData.permissions.map((permission) => ({
					...permission,
					menu: permission.menu || { id: "", name: "", svg: "" },
					// originalUrlAccess: { ...permission.urlAccess },
					urlRestrict:
						typeof permission.urlRestrict === "string"
							? JSON.parse(permission.urlRestrict)
							: permission.urlRestrict,
				})),
			);
		}
	}, [selectedRole, selectedRoleData]);

	const handleRowCheckboxToggle = (permissionId: string) => {
		setSelectedPermissions((prev) =>
			prev.includes(permissionId)
				? prev.filter((id) => id !== permissionId)
				: [...prev, permissionId],
		);
	};

	const handlePermissionToggle = (
		permissionId: string,
		action: "create" | "read" | "update" | "delete",
		checked: boolean,
		urlRestrictValue: string,
	) => {
		console.log(
			`Toggle: ${permissionId}, ${action}, ${checked}, UrlRestrict: ${urlRestrictValue}`,
		);

		setPermissions((prevPermissions) =>
			prevPermissions.map((permission) => {
				if (permission.id === permissionId) {
					return {
						...permission,
						urlAccess: {
							...permission.urlAccess,
							[action]: checked ? urlRestrictValue : null,
						},
					};
				}
				return permission;
			}),
		);
	};

	const handleAddPermission = (newPermission: Permission) => {
		setPermissions((prev) => [
			...prev,
			{
				...newPermission,
				// Remove this line
				// originalUrlAccess: { ...newPermission.urlAccess },
			},
		]);
	};

	const handleUpdatePermission = (updatedPermission: Permission) => {
		setPermissions((prev) =>
			prev.map((p) =>
				p.id === updatedPermission.id
					? {
							...updatedPermission,
							// Remove this line
							// originalUrlAccess: { ...updatedPermission.urlAccess },
						}
					: p,
			),
		);
	};

	const handleDeletePermission = async (permissionId: string) => {
		try {
			await deletePermissionMutation.mutateAsync(permissionId);
			setPermissions((prev) => prev.filter((p) => p.id !== permissionId));
		} catch (error) {
			console.error("Error deleting permission:", error);
		}
	};

	const handleEditPermission = (permission: Permission) => {
		console.log("Editing permission:", permission);
		setEditingPermission(permission);
	};

	const handleSavePermissions = async () => {
		if (!selectedRole) return;

		console.log("All permissions:", JSON.stringify(permissions, null, 2));

		const updatedPermissions = permissions
			.map((permission) => {
				console.log(
					"Processing permission:",
					JSON.stringify(permission, null, 2),
				);

				if (!permission.id || !permission.urlAccess) {
					console.error(
						`Missing fields for permission ${permission.id}: id or urlAccess`,
					);
					return null;
				}

				return {
					permissionId: permission.id,
					roleId: selectedRole,
					urlAccess: permission.urlAccess,
				};
			})
			.filter((p): p is NonNullable<typeof p> => p !== null);

		if (updatedPermissions.length !== permissions.length) {
			console.error(
				`${permissions.length - updatedPermissions.length} permissions are missing required fields and will not be updated.`,
			);
		}

		try {
			console.log("Permissions to be updated:", updatedPermissions);
			if (updatedPermissions.length > 0) {
				await Promise.all(
					updatedPermissions.map((permission) =>
						updatePermissionMutation.mutateAsync(permission),
					),
				);
				console.log("Permissions saved successfully");
				await refetch();
			} else {
				console.log("No permissions to update");
			}
		} catch (error) {
			console.error("Error updating permissions:", error);
		}
	};

	const paginatedPermissions = permissions.slice(
		(currentPage - 10) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	const totalPages = Math.ceil(permissions.length / itemsPerPage);

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<div className="p-2">
			<div className="bg-white rounded-lg shadow-md p-6">
				<div className="mb-4 flex items-center justify-between">
					<RoleDropdown
						selectedRole={selectedRole}
						setSelectedRole={setSelectedRole}
						handleSave={handleSavePermissions}
					/>
					{selectedRole && (
						<FormPermission
							selectedRole={selectedRole}
							onAddPermission={handleAddPermission}
							editingPermission={editingPermission}
							onEditPermission={(updatedPermission: Permission | null) => {
								if (updatedPermission !== null) {
									handleUpdatePermission(updatedPermission);
								}
								setEditingPermission(null);
							}}
						/>
					)}
				</div>

				{selectedRole && permissions.length > 0 && (
					<>
						<PermissionTable
							permissions={paginatedPermissions}
							selectedPermissions={selectedPermissions}
							handleRowCheckboxToggle={handleRowCheckboxToggle}
							handleDeletePermission={handleDeletePermission}
							mainCheckbox={
								selectedPermissions.length === paginatedPermissions.length
							}
							handleMainCheckboxToggle={() => {
								if (
									selectedPermissions.length === paginatedPermissions.length
								) {
									setSelectedPermissions([]);
								} else {
									setSelectedPermissions(paginatedPermissions.map((p) => p.id));
								}
							}}
							handleEditPermission={handleEditPermission}
							handlePermissionToggle={handlePermissionToggle}
						/>
						<PermissionPaging
							currentPage={currentPage}
							totalPages={totalPages}
							setCurrentPage={setCurrentPage}
						/>
					</>
				)}
			</div>
		</div>
	);
};

export default RolePermissionConnection;
