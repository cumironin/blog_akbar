import { useDeleteUser, useGetUsers } from "@/api/usersApi";
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
import { useToast } from "@/hooks/use-toast";
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
import { Link } from "react-router-dom";
import type { User } from "./types";

const UsersPage: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const navigate = useNavigate();
	const { data: users, isLoading, error } = useGetUsers();
	const queryClient = useQueryClient();
	const { toast } = useToast();

	const filteredUsers: User[] =
		users?.filter(
			(user: User) =>
				user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
				user.email.toLowerCase().includes(searchTerm.toLowerCase()),
		) ?? [];

	const deleteUser = useDeleteUser();
	const deleteMutation = useMutation({
		mutationFn: (id: string) => deleteUser.mutateAsync(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast({
				title: "User deleted",
				description: "The user has been successfully deleted.",
			});
		},
		onError: (error) => {
			console.error("Error deleting user:", error);
			toast({
				title: "Error",
				description: "Failed to delete user. Please try again.",
				variant: "destructive",
			});
		},
	});

	const handleDelete = (id: string) => {
		if (window.confirm("Are you sure you want to delete this user?")) {
			deleteMutation.mutate(id);
		}
	};

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>An error occurred: {error.message}</div>;

	return (
		<div className="p-2">
			<div className="bg-white rounded-lg shadow-md p-6">
				<div className="flex justify-between mb-6">
					<div className="relative w-1/3">
						<Input
							type="text"
							placeholder="Search by username or email"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 pr-4 py-2"
						/>
						<Search
							className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
							size={20}
						/>
					</div>
					<Button
						className="bg-black text-white"
						onClick={() => navigate("/dashboard/users/create")}
					>
						<Plus className="mr-2" size={20} />
						Create User
					</Button>
				</div>

				<Table className="border border-gray-200">
					<TableHeader>
						<TableRow className="bg-gray-50">
							<TableHead>No.</TableHead>
							<TableHead>User</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredUsers.map((user, index) => (
							<TableRow key={user.id} className="hover:bg-gray-50">
								<TableCell>{index + 1}</TableCell>
								<TableCell>
									<div className="flex items-center">
										{(() => {
											const imageUrl = user.image_url
												? `${import.meta.env.VITE_API_BASE_URL}${user.image_url}`
												: "https://via.placeholder.com/32";

											return (
												<img
													src={imageUrl}
													alt={user.username}
													className="w-8 h-8 rounded-full mr-2 object-cover"
													onError={(e) => {
														console.log(
															"Image load error for user:",
															user.username,
														);
														e.currentTarget.src =
															"https://via.placeholder.com/32";
													}}
												/>
											);
										})()}
										<span>
											<Link
												to={`/dashboard/users/${user.id}`}
												className="text-blue-600 hover:underline"
											>
												{user.username}
											</Link>
										</span>
									</div>
								</TableCell>
								<TableCell>{user.email}</TableCell>
								<TableCell>{user.roleName}</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" className="h-8 w-8 p-0">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												onClick={() =>
													navigate(`/dashboard/users/${user.id}/edit`)
												}
											>
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => handleDelete(user.id)}>
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

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
	);
};

export default UsersPage;
