import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersPage from "./usersPage";
import Profile from "./Profile"; // Make sure this import matches the file name
import { useParams, useNavigate, Link } from "react-router-dom";

const UsersManagement: React.FC = () => {
	const [activeTab, setActiveTab] = useState("users");
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	useEffect(() => {
		if (id) {
			setActiveTab("profile");
		} else {
			setActiveTab("users");
		}
	}, [id]);

	const handleTabChange = (value: string) => {
		setActiveTab(value);
		if (value === "users") {
			navigate("/dashboard/users");
		}
	};

	return (
		<div className="p-2">
			<div className="flex items-center mb-6">
				<h1 className="text-lg font-semibold mr-2">Dashboard</h1>
				<span className="text-gray-500">/</span>
				<h2 className="text-lg font-semibold ml-2">Users Management</h2>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={handleTabChange}
				className="w-full rounded-none"
			>
				<div className="max-w-[1000px] mx-auto">
					<TabsList className="flex justify-start w-full border-b-[1.5px] border-gray-300 bg-none rounded-none p-0">
						<TabsTrigger
							value="users"
							className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-gray-500 data-[state=active]:text-gray-900 data-[state=active]:shadow-none rounded-none"
						>
							Users
						</TabsTrigger>
						<TabsTrigger
							value="profile"
							className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-gray-500 data-[state=active]:text-gray-900 data-[state=active]:shadow-none rounded-none"
						>
							Profile
						</TabsTrigger>
					</TabsList>
					<TabsContent value="users" className="mt-4 rounded-none">
						<UsersPage />
					</TabsContent>
					<TabsContent value="profile" className="mt-4 rounded-none">
						{id && <Profile userId={id} />}
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
};

export default UsersManagement;
