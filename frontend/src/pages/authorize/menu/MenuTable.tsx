import type React from "react";
import { useState } from "react";
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
import { useGetMenus, useDeleteMenu } from "@/api/menuApi";
import type { Menu } from "./types";

interface MenuTableProps {
	searchTerm: string;
	setEditingMenuId: (id: string) => void;
	setInitialMenuData: (data: {
		name: string;
		numsort: number;
		svg: string;
		url_menu: string;
	}) => void;
	setIsDialogOpen: (open: boolean) => void;
}

const MenuTable: React.FC<MenuTableProps> = ({
	searchTerm,
	setEditingMenuId,
	setInitialMenuData,
	setIsDialogOpen,
}) => {
	const { data: menus, isLoading, isError, error } = useGetMenus();
	const deleteMenuMutation = useDeleteMenu();
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 5;

	if (isLoading) return <div>Loading...</div>;
	if (isError) return <div>Error: {error?.message}</div>;

	const handleDeleteMenu = (id: string) => {
		deleteMenuMutation.mutate(id);
	};

	const handleEditMenu = (menu: Menu) => {
		setEditingMenuId(menu.id);
		setInitialMenuData({
			name: menu.name,
			numsort: menu.numsort,
			svg: menu.svg,
			url_menu: menu.url_menu,
		});
		setIsDialogOpen(true);
	};

	const filteredMenus = menus?.filter((menu) =>
		menu.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const indexOfLastMenu = currentPage * itemsPerPage;
	const indexOfFirstMenu = indexOfLastMenu - itemsPerPage;
	const currentMenus =
		filteredMenus?.slice(indexOfFirstMenu, indexOfLastMenu) || [];
	const totalPages = Math.ceil((filteredMenus?.length || 0) / itemsPerPage);

	const handleNextPage = () => {
		setCurrentPage((prev) => Math.min(prev + 1, totalPages));
	};

	const handlePrevPage = () => {
		setCurrentPage((prev) => Math.max(prev - 1, 1));
	};

	return (
		<>
			<Table className="border border-gray-200">
				<TableHeader>
					<TableRow className="bg-gray-50">
						<TableHead>No.</TableHead>
						<TableHead>Name</TableHead>
						<TableHead>SVG</TableHead>
						<TableHead>URL</TableHead>
						<TableHead>Action</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{currentMenus.map((menu, index) => (
						<TableRow key={menu.id} className="hover:bg-gray-50">
							<TableCell>{indexOfFirstMenu + index + 1}</TableCell>
							<TableCell>{menu.name}</TableCell>
							<TableCell>{menu.svg}</TableCell>
							<TableCell>{menu.url_menu}</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" className="h-8 w-8 p-0">
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => handleEditMenu(menu)}>
											Edit
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => handleDeleteMenu(menu.id)}>
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
					Showing {indexOfFirstMenu + 1} to{" "}
					{Math.min(indexOfLastMenu, filteredMenus?.length || 0)} of{" "}
					{filteredMenus?.length || 0} entries
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

export default MenuTable;
