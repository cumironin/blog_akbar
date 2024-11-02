// Import necessary UI components and utilities
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	patchAuthorizeRole,
	postAuthorizeRole,
	putAuthorizeRole,
} from "@/api/authorizeRoleApi";
import { useEffect } from "react";

// Define the schema for role validation
const roleSchema = z.object({
	roleName: z.string().max(20, "Role name must be 20 characters or less"),
});

// Define the type for the form data
type RoleFormData = z.infer<typeof roleSchema>;

// Define the props interface for the AddNewRole component
interface AddNewRoleProps {
	isDialogOpen: boolean;
	handleDialogOpenChange: (open: boolean) => void;
	onRoleAdded: () => void;
	editingRoleId: string | null;
	initialRoleName: string;
}

// Define the AddNewRole component
const AddNewRole: React.FC<AddNewRoleProps> = ({
	isDialogOpen,
	handleDialogOpenChange,
	onRoleAdded,
	editingRoleId,
	initialRoleName,
}) => {
	// Initialize form handling with react-hook-form
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<RoleFormData>({
		resolver: zodResolver(roleSchema),
		defaultValues: { roleName: initialRoleName },
	});

	// Reset form when initialRoleName changes
	useEffect(() => {
		reset({ roleName: initialRoleName });
	}, [initialRoleName, reset]);

	// Handle form submission
	const onSubmit = async (data: RoleFormData) => {
		try {
			// Update existing role or create new role based on editingRoleId
			if (editingRoleId) {
				await patchAuthorizeRole(editingRoleId, data);
			} else {
				await postAuthorizeRole(data);
			}
			reset();
			onRoleAdded(); // Refresh the table
			handleDialogOpenChange(false); // Close the dialog
		} catch (error) {
			console.error("Error saving role:", error);
		}
	};

	// Render the component
	return (
		<Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
			<DialogTrigger asChild>
				<Button className="bg-black text-white">
					<Plus className="mr-2" size={20} />
					Add New Role
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{editingRoleId ? "Edit Role" : "Add New Role"}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="grid gap-4 py-4">
						<Input placeholder="Role name" {...register("roleName")} />
						{errors.roleName && (
							<p className="text-red-500">{errors.roleName.message}</p>
						)}
					</div>
					<Button type="submit">
						{editingRoleId ? "Update Role" : "Add Role"}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
};

// Export the AddNewRole component
export default AddNewRole;
