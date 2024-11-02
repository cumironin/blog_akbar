import React from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getAuthorizeRole,
	putAuthorizeRole,
	patchAuthorizeRole,
} from "@/api/authorizeRoleApi";

interface Role {
	id: string;
	roleName: string;
}

interface RoleTableProps {
	searchTerm: string;
	setEditingRoleId: (id: string) => void;
	setInitialRoleName: (name: string) => void;
	setIsDialogOpen: (open: boolean) => void;
}

const RoleTable: React.FC<RoleTableProps> = ({
	searchTerm,
	setEditingRoleId,
	setInitialRoleName,
	setIsDialogOpen,
}) => {
	const queryClient = useQueryClient();

	const {
		data: roles,
		isLoading,
		isError,
		error,
	} = useQuery<Role[], Error>({
		queryKey: ["authorizeRoles"],
		queryFn: getAuthorizeRole,
	});

	const deleteMutation = useMutation({
		mutationFn: putAuthorizeRole,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["authorizeRoles"] });
		},
	});

	const handleDeleteRole = (id: string) => {
		deleteMutation.mutate(id);
	};

	// THIS CODE NO USE AT ALL because patchAuthorizeRole already done in addNewRole submit method
	const patchMutation = useMutation({
		mutationFn: (params: { id: string; data: { roleName: string } }) =>
			patchAuthorizeRole(params.id, params.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["authorizeRoles"] });
		},
	});

	const handlePatchRoles = (id: string) => {
		// Find the role to edit based on the provided id
		const roleToEdit = roles?.find((role) => role.id === id);

		if (roleToEdit) {
			// Open the dialog for editing
			setIsDialogOpen(true);

			// Set up the state for editing the role
			setEditingRoleId(roleToEdit.id);
			setInitialRoleName(roleToEdit.roleName);

			// Trigger the patch mutation with the role's id and current name
			patchMutation.mutate({ id, data: { roleName: roleToEdit.roleName } });
		}
	};

	// Filtering roles based on search term
	const filteredRoles = React.useMemo(() => {
		if (!roles) return [];
		if (!searchTerm) return roles;
		return roles.filter((role) =>
			role.roleName.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}, [roles, searchTerm]);

	// Pagination logic
	const [currentPage, setCurrentPage] = React.useState(1);
	const itemsPerPage = 5;
	const indexOfLastRole = currentPage * itemsPerPage;
	const indexOfFirstRole = indexOfLastRole - itemsPerPage;
	const currentRoles = filteredRoles.slice(indexOfFirstRole, indexOfLastRole);
	const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);

	const handleNextPage = () => {
		setCurrentPage((prev) => Math.min(prev + 1, totalPages));
	};

	const handlePrevPage = () => {
		setCurrentPage((prev) => Math.max(prev - 1, 1));
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (isError) {
		return <div>Error: {error.message}</div>;
	}

	return (
		<>
			<Table className="border border-gray-200">
				<TableHeader>
					<TableRow className="bg-gray-50">
						<TableHead>ID</TableHead>
						<TableHead>Role Name</TableHead>
						<TableHead>Action</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{currentRoles.map((role, index) => (
						<TableRow key={role.id} className="hover:bg-gray-50">
							<TableCell>{indexOfFirstRole + index + 1}</TableCell>
							<TableCell>{role.roleName}</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" className="h-8 w-8 p-0">
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => handlePatchRoles(role.id)}>
											Edit
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => handleDeleteRole(role.id)}>
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<div className="flex items-center justify-between space-x-2 py-4">
				<div>
					Showing {indexOfFirstRole + 1} to{" "}
					{Math.min(indexOfLastRole, filteredRoles?.length || 0)} of{" "}
					{filteredRoles?.length || 0} entries
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handlePrevPage}
						disabled={currentPage === 1}
					>
						<ChevronLeft className="h-4 w-4" />
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={handleNextPage}
						disabled={currentPage === totalPages || totalPages === 0}
					>
						Next
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</>
	);
};

export default RoleTable;
