import type React from "react";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
	DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Permission } from "./types";
import { useGetMenus } from "@/api/menuApi";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addPermission, updatePermission } from "@/api/permissionApi";

interface FormPermissionProps {
	selectedRole: string;
	onAddPermission: (newPermission: Permission) => void;
	editingPermission: Permission | null;
	onEditPermission: (updatedPermission: Permission | null) => void;
}

const permissionSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().min(1, "Description is required"),
	menu_id: z.string().min(1, "Menu is required"),
	urlAccess: z.object({
		create: z.string(),
		read: z.string(),
		update: z.string(),
		delete: z.string(),
	}),
});

type PermissionFormData = z.infer<typeof permissionSchema>;

const FormPermission: React.FC<FormPermissionProps> = ({
	selectedRole,
	onAddPermission,
	editingPermission,
	onEditPermission,
}) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const { data: menus, isLoading: isLoadingMenus } = useGetMenus();
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		control,
	} = useForm<PermissionFormData>({
		resolver: zodResolver(permissionSchema),
		defaultValues: {
			name: "",
			description: "",
			menu_id: "",
			urlAccess: {
				create: "",
				read: "",
				update: "",
				delete: "",
			},
		},
	});

	useEffect(() => {
		if (editingPermission) {
			console.log("Editing permission:", editingPermission);
			reset({
				name: editingPermission.name,
				description: editingPermission.description,
				menu_id: editingPermission.menuId,
				urlAccess: {
					create: editingPermission.urlAccess.create || "",
					read: editingPermission.urlAccess.read || "",
					update: editingPermission.urlAccess.update || "",
					delete: editingPermission.urlAccess.delete || "",
				},
			});
			setIsDialogOpen(true);
		}
	}, [editingPermission, reset]);

	const handleAddClick = () => {
		reset(); // Reset the form
		onEditPermission(null); // Clear the editingPermission
		setIsDialogOpen(true);
	};

	const onSubmit = async (data: PermissionFormData) => {
		console.log("Form submitted with data:", data);
		if (editingPermission) {
			// Handle editing
			const updatedPermission: Permission = {
				...editingPermission,
				...data,
				menuId: data.menu_id,
			};
			onEditPermission(updatedPermission);
		} else {
			// Handle adding
			const selectedMenu = menus?.find((menu) => menu.id === data.menu_id);
			if (!selectedMenu) {
				console.error("Selected menu not found");
				return;
			}

			try {
				const newPermission = await addPermission({
					name: data.name,
					description: data.description,
					menu_id: data.menu_id,
					urlAccess: data.urlAccess,
				});
				onAddPermission(newPermission);
				setIsDialogOpen(false);
			} catch (error) {
				console.error("Error adding permission:", error);
				// Handle error (e.g., show error message to user)
			}
		}
	};

	return (
		<>
			<Button onClick={handleAddClick}>
				<Plus className="mr-2 h-4 w-4" /> Add Permission
			</Button>
			<Dialog
				open={isDialogOpen}
				onOpenChange={(open) => {
					if (!open) {
						console.log("Closing dialog, resetting editingPermission");
						onEditPermission(null);
					}
					setIsDialogOpen(open);
				}}
			>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>
							{editingPermission ? "Edit" : "Add New"} Permission
						</DialogTitle>
						<DialogDescription>
							Fill in the details to{" "}
							{editingPermission ? "edit the" : "add a new"} permission.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="name" className="text-right">
								Name
							</Label>
							<Input id="name" {...register("name")} className="col-span-3" />
							{errors.name && (
								<p className="text-red-500 col-span-3 col-start-2">
									{errors.name.message}
								</p>
							)}
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="description" className="text-right">
								Description
							</Label>
							<Input
								id="description"
								{...register("description")}
								className="col-span-3"
							/>
							{errors.description && (
								<p className="text-red-500 col-span-3 col-start-2">
									{errors.description.message}
								</p>
							)}
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="menu" className="text-right">
								Menu
							</Label>
							<Controller
								name="menu_id"
								control={control}
								render={({ field }) => (
									<Select onValueChange={field.onChange} value={field.value}>
										<SelectTrigger className="col-span-3">
											<SelectValue placeholder="Select a menu" />
										</SelectTrigger>
										<SelectContent>
											{isLoadingMenus ? (
												<SelectItem value="">Loading...</SelectItem>
											) : (
												menus?.map((menu) => (
													<SelectItem key={menu.id} value={menu.id}>
														{menu.name}
													</SelectItem>
												))
											)}
										</SelectContent>
									</Select>
								)}
							/>
							{errors.menu_id && (
								<p className="text-red-500 col-span-3 col-start-2">
									{errors.menu_id.message}
								</p>
							)}
						</div>
						<Separator className="my-4" />
						{["create", "read", "update", "delete"].map((action) => (
							<div key={action} className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor={action} className="text-right capitalize">
									{action}
								</Label>
								<Input
									id={action}
									{...register(
										`urlAccess.${action}` as
											| "urlAccess.create"
											| "urlAccess.read"
											| "urlAccess.update"
											| "urlAccess.delete",
									)}
									className="col-span-3"
									onChange={(e) => {
										console.log(`${action} input changed:`, e.target.value);
									}}
								/>
							</div>
						))}
						<DialogFooter>
							<Button type="submit">
								{editingPermission ? "Update" : "Add"} Permission
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default FormPermission;
