import {
	useDeleteAllBlogPost,
	useDeleteBlogPost,
	usetGetBlogPost,
} from "@/api/blogPostAPI";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import useAuth from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
	ChevronLeft,
	ChevronRight,
	MoreHorizontal,
	Plus,
	Trash2,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchTable from "../authorize/role/searchTable";
import type { BlogPost } from "./types";

const BlogList: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [selectedAll, setSelectedAll] = useState(false);
	const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
	const { checkElementPermission } = useAuth();

	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { blogpost } = usetGetBlogPost();

	const filteredBlogPost =
		blogpost?.filter((post: BlogPost) =>
			post.title.toLowerCase().includes(searchTerm.toLowerCase()),
		) ?? [];

	const deleteAllBlogPostsMutation = useMutation({
		mutationFn: useDeleteAllBlogPost,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["blogposts"] });
			setSelectedPosts([]);
			setSelectedAll(false);
		},
		onError: (error) => {
			console.error("error deleting all blogposts:", error);
		},
	});

	const handleSelectAll = (checked: boolean) => {
		setSelectedAll(checked);
		if (checked) {
			setSelectedPosts(filteredBlogPost?.map((posts) => posts.id) || []);
		} else {
			setSelectedPosts([]);
		}
	};

	const handleSelectPost = (id: string, checked: boolean) => {
		if (checked) {
			setSelectedPosts((prev) => [...prev, id]);
		} else {
			setSelectedPosts((prev) => prev.filter((postId) => postId !== id));
		}
	};

	const handleDeleteSelected = () => {
		if (selectedPosts.length > 0) {
			deleteAllBlogPostsMutation.mutate(selectedPosts);
		}
	};

	const deleteBlogPostMutation = useMutation({
		mutationFn: useDeleteBlogPost,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["blogposts"] });
		},
		onError: (error) => {
			console.error("Error deleting blogpost:", error);
		},
	});

	const handleDeleteBlog = (id: string) => {
		deleteBlogPostMutation.mutate(id);
	};

	// Updated pagination logic
	const itemsPerPage = 5;
	const indexOfLastBlog = currentPage * itemsPerPage;
	const indexOfFirstBlog = indexOfLastBlog - itemsPerPage;
	const currentBlogs =
		filteredBlogPost?.slice(indexOfFirstBlog, indexOfLastBlog) || [];
	const totalPages = Math.ceil((filteredBlogPost?.length || 0) / itemsPerPage);

	const handleNextPage = () => {
		setCurrentPage((prev) => Math.min(prev + 1, totalPages));
	};

	const handlePrevPage = () => {
		setCurrentPage((prev) => Math.max(prev - 1, 1));
	};

	return (
		<div className="p-2">
			{/* Page header */}
			<div className="flex items-center mb-6">
				<h1 className="text-lg font-semibold mr-2">Dashboard</h1>
				<span className="text-gray-500">/</span>
				<h2 className="text-lg font-semibold ml-2">Blog Management</h2>
			</div>

			{/* Main content */}
			<div className="bg-white rounded-lg shadow-md p-6">
				{/* Search and Add New Blog components */}
				<div className="flex justify-between mb-6">
					<SearchTable searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
					<div className="flex space-x-2">
						{/* <Button onClick={insertRow}> */}
						{checkElementPermission("blog", "create") && (
							<Button onClick={() => navigate("/dashboard/blog/new")}>
								<Plus className="h-4 w-4 mr-2" />
								Insert New Blog
							</Button>
						)}
						{checkElementPermission("blog", "delete") && (
							<Button variant="destructive" onClick={handleDeleteSelected}>
								<Trash2 className="h-4 w-4 mr-2" />
								Delete Selected
							</Button>
						)}
					</div>
				</div>

				{/* Updated Blog Table */}
				<div className="rounded-md border">
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow className="bg-gray-50">
									<TableHead className="w-[50px]">
										<Checkbox
											checked={selectedAll}
											onCheckedChange={handleSelectAll}
										/>
									</TableHead>
									<TableHead className="w-[100px]">No</TableHead>
									<TableHead>Title</TableHead>
									<TableHead>Author</TableHead>
									<TableHead>Date</TableHead>
									<TableHead className="w-[100px]">Action</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{currentBlogs.map((blog, index) => (
									<TableRow key={blog.id} className="hover:bg-gray-50">
										<TableCell>
											<Checkbox
												checked={selectedPosts.includes(blog.id)}
												onCheckedChange={(checked) =>
													handleSelectPost(blog.id, checked as boolean)
												}
											/>
										</TableCell>
										<TableCell>{indexOfFirstBlog + index + 1}</TableCell>
										<TableCell>{blog.title}</TableCell>
										<TableCell>{String(blog.author)}</TableCell>
										<TableCell>
											{blog.createdAt
												? format(new Date(blog.createdAt), "dd-MM-yyyy")
												: "Not Published"}
										</TableCell>
										<TableCell>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" className="h-8 w-8 p-0">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													{checkElementPermission("blog", "update") ||
													checkElementPermission("blog", "delete") ? (
														<>
															{checkElementPermission("blog", "update") && (
																<DropdownMenuItem
																	onClick={() =>
																		navigate(`/dashboard/blog/${blog.id}`)
																	}
																	className="text-gray-600 hover:text-gray-800"
																>
																	Edit
																</DropdownMenuItem>
															)}
															{checkElementPermission("blog", "delete") && (
																<DropdownMenuItem
																	onClick={() => handleDeleteBlog(blog.id)}
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
					</div>
				</div>

				{/* Updated Pagination */}
				<div className="flex items-center justify-between space-x-2 py-4">
					<div>
						Showing {indexOfFirstBlog + 1} to{" "}
						{Math.min(indexOfLastBlog, filteredBlogPost?.length || 0)} of{" "}
						{filteredBlogPost?.length || 0} entries
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
			</div>
		</div>
	);
};

export default BlogList;
