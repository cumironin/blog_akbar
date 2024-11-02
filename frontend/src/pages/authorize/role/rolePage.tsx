import { useEffect, useState, useCallback } from "react";
import SearchTable from "./searchTable";
import RoleTable from "./roleTable";
import AddNewRole from "./addNewRole";
import { getAuthorizeRole } from "@/api/authorizeRoleApi";
import type { Role } from "./type";
import { useQuery } from "@tanstack/react-query";

// Define the main RolePage component
const RolePage: React.FC = () => {
	// Initialize state variables
	const [searchTerm, setSearchTerm] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
	const [initialRoleName, setInitialRoleName] = useState("");

	// Set up query for fetching roles
	const { data: roles, refetch: fetchRoles } = useQuery<Role[], Error>({
		queryKey: ["authorizeRoles"],
		queryFn: getAuthorizeRole,
	});

	// Handle dialog open/close
	const handleDialogOpenChange = useCallback((open: boolean) => {
		setIsDialogOpen(open);
		// in other words, if open not true, reset the editing role id and initial role name
		if (!open) {
			setEditingRoleId(null);
			setInitialRoleName("");
		}
	}, []);

	// Handle role addition/editing
	const handleRoleAdded = useCallback(() => {
		fetchRoles(); // Refresh the role list after adding/editing
	}, [fetchRoles]);

	// Render the component
	return (
		<div className="p-2">
			{/* Page header */}
			{/* <div className="flex items-center mb-6">
				<h1 className="text-lg font-semibold mr-2">Dashboard</h1>
				<span className="text-gray-500">/</span>
				<h2 className="text-lg font-semibold ml-2">Role Management</h2>
			</div> */}

			{/* Main content */}
			<div className="bg-white rounded-lg shadow-md p-6">
				{/* Search and Add New Role components */}
				<div className="flex justify-between mb-6">
					<SearchTable searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
					<AddNewRole
						isDialogOpen={isDialogOpen}
						handleDialogOpenChange={handleDialogOpenChange}
						onRoleAdded={handleRoleAdded}
						editingRoleId={editingRoleId}
						initialRoleName={initialRoleName}
					/>
				</div>

				{/* Role Table component */}
				<RoleTable
					searchTerm={searchTerm}
					setEditingRoleId={setEditingRoleId}
					setInitialRoleName={setInitialRoleName}
					setIsDialogOpen={setIsDialogOpen}
				/>
			</div>
		</div>
	);
};

// Export the RolePage component
export default RolePage;
