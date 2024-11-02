import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetPermissions } from "@/api/permissionApi"; // Update this import

interface RoleDropdownProps {
	selectedRole: string | null;
	setSelectedRole: (role: string) => void;
	handleSave: () => void;
}

const RoleDropdown: React.FC<RoleDropdownProps> = ({
	selectedRole,
	setSelectedRole,
	handleSave,
}) => {
	const { data: roles, isLoading, error } = useGetPermissions();

	if (isLoading) return <div>Loading roles...</div>;
	if (error) return <div>Error loading roles: {error.message}</div>;

	return (
		<div className="flex items-center gap-4">
			<Select onValueChange={(value) => setSelectedRole(value)}>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder="Select a role" />
				</SelectTrigger>
				<SelectContent>
					{roles?.map((role) => (
						<SelectItem key={role.id} value={role.id.toString()}>
							{role.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{selectedRole && <Button onClick={handleSave}>Save Permissions</Button>}
		</div>
	);
};

export default RoleDropdown;
