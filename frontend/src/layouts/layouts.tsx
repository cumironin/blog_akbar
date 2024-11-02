import type React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Toaster } from "@/components/ui/toaster";

const Layouts: React.FC = () => {
	return (
		<div className="flex h-screen">
			<Sidebar />
			<div className="flex flex-col flex-1">
				<Header />
				<main className="flex-1 p-6 bg-gray-100">
					<Toaster />
					<Outlet />
				</main>
			</div>
		</div>
	);
};

export default Layouts;
