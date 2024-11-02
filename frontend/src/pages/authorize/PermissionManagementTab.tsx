import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RolePage from "./role/rolePage";
import MenuPage from "./menu/menuPage";
import RolePermissionConnection from "./permission/rolePermissionPage";

const PermissionManagement: React.FC = () => {
	const [activeTab, setActiveTab] = useState("menu");

	return (
		<div className="p-2">
			<div className="flex items-center mb-6">
				<h1 className="text-lg font-semibold mr-2">Dashboard</h1>
				<span className="text-gray-500">/</span>
				<h2 className="text-lg font-semibold ml-2">Permission Management</h2>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full rounded-none"
			>
				<div className="max-w-[1000px] mx-auto">
					<TabsList className="flex justify-start w-full border-b-[1.5px] border-gray-300 bg-none rounded-none p-0">
						<TabsTrigger
							value="menu"
							className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-gray-500 data-[state=active]:text-gray-900 data-[state=active]:shadow-none rounded-none"
						>
							Menu
						</TabsTrigger>
						<TabsTrigger
							value="role"
							className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-gray-500 data-[state=active]:text-gray-900 data-[state=active]:shadow-none rounded-none"
						>
							Role
						</TabsTrigger>

						<TabsTrigger
							value="rolePermissions"
							className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-gray-500 data-[state=active]:text-gray-900 data-[state=active]:shadow-none rounded-none"
						>
							Role Permissions
						</TabsTrigger>
					</TabsList>
					<TabsContent value="menu" className="mt-4 rounded-none">
						<MenuPage />
					</TabsContent>
					<TabsContent value="role" className="mt-4 rounded-none">
						<RolePage />
					</TabsContent>
					<TabsContent value="rolePermissions" className="mt-4 rounded-none">
						<RolePermissionConnection />
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
};

export default PermissionManagement;
