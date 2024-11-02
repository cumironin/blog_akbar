import { useState } from "react";
import SearchInput from "./SearchInput";
import MenuTable from "./MenuTable";
import NewMenuForm from "./NewMenuForm";
import { useGetMenus } from "@/api/menuApi";

const MenuPage: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
	const [initialMenuData, setInitialMenuData] = useState({
		name: "",
		numsort: 0,
		svg: "",
	});

	const { data: menus, isLoading, isError, error } = useGetMenus();

	const handleDialogOpenChange = (open: boolean) => {
		setIsDialogOpen(open);
		if (!open) {
			setEditingMenuId(null);
			setInitialMenuData({ name: "", numsort: 0, svg: "" });
		}
	};

	if (isLoading) return <div>Loading...</div>;
	if (isError) return <div>Error: {error?.message}</div>;

	return (
		<div className="p-2">
			<div className="bg-white rounded-lg shadow-md p-6">
				<div className="flex justify-between mb-6">
					<SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
					<NewMenuForm
						isDialogOpen={isDialogOpen}
						handleDialogOpenChange={handleDialogOpenChange}
						editingMenuId={editingMenuId}
						initialMenuData={initialMenuData}
					/>
				</div>

				<MenuTable
					searchTerm={searchTerm}
					setEditingMenuId={setEditingMenuId}
					setInitialMenuData={setInitialMenuData}
					setIsDialogOpen={setIsDialogOpen}
				/>
			</div>
		</div>
	);
};

export default MenuPage;
