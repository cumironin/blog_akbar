import { useDeleteCategory, useGetCategory } from "@/api/categoryApi";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import useAuth from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	ChevronLeft,
	ChevronRight,
	MoreHorizontal,
	Plus,
	Search,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Category } from "./types";

const CategoryPage: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const navigate = useNavigate();
	const { categories } = useGetCategory();
	const queryClient = useQueryClient();
	const { checkElementPermission } = useAuth();

	const filteredCategories =
		categories?.filter(
			(category: Category) =>
				category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				category.description.toLowerCase().includes(searchTerm.toLowerCase()),
		) ?? [];

	const deleteMutation = useMutation({
		mutationFn: useDeleteCategory,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["category"] });
		},
		onError: (error) => {
			console.error("Error deleting category:", error);
		},
	});

	const handleDelete = (id: string) => {
		deleteMutation.mutate(id);
	};

	return (
		<div className="p-2">
			<div className="flex items-center mb-6">
				<h1 className="text-lg font-semibold mr-2">Dashboard</h1>
				<span className="text-gray-500">/</span>
				<h2 className="text-lg font-semibold ml-2">Category</h2>
			</div>

			<div className="bg-white rounded-lg shadow-md p-6">
				<div className="flex justify-between mb-6">
					<div className="relative w-1/3">
						<Input
							type="text"
							placeholder="Search by title or description"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 pr-4 py-2"
						/>
						<Search
							className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
							size={20}
						/>
					</div>
					{checkElementPermission("category", "create") && (
						<Button
							className="bg-black text-white"
							onClick={() => navigate("/dashboard/category/create")}
						>
							<Plus className="mr-2" size={20} />
							Create Category
						</Button>
					)}
				</div>

				<Table className="border border-gray-200">
					<TableHeader>
						<TableRow className="bg-gray-50">
							<TableHead>No.</TableHead>
							<TableHead>Title</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredCategories?.map((category, index) => (
							<TableRow key={category.id} className="hover:bg-gray-50">
								<TableCell>{index + 1}</TableCell>
								<TableCell>{category.title}</TableCell>
								<TableCell>{category.description}</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" className="h-8 w-8 p-0">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											{checkElementPermission("category", "update") ||
											checkElementPermission("category", "delete") ? (
												<>
													{checkElementPermission("category", "update") && (
														<DropdownMenuItem
															onClick={() => {
																if (category.id) {
																	navigate(
																		`/dashboard/category/${category.id}`,
																	);
																} else {
																	console.error("Category ID is undefined");
																}
															}}
															className="text-gray-600 hover:text-gray-800"
														>
															Edit
														</DropdownMenuItem>
													)}
													{checkElementPermission("category", "delete") && (
														<DropdownMenuItem
															onClick={() => handleDelete(category.id)}
															className="text-gray-600 hover:text-gray-800"
														>
															Delete
														</DropdownMenuItem>
													)}
												</>
											) : (
												<DropdownMenuItem
													className="text-gray-400 cursor-not-allowed"
													disabled
												>
													No access to action
												</DropdownMenuItem>
											)}
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				<div className="flex items-center justify-end space-x-2 py-4">
					<Button variant="outline" size="sm">
						<ChevronLeft className="h-4 w-4" />
						Previous
					</Button>
					<Button variant="outline" size="sm">
						Next
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
};

export default CategoryPage;
