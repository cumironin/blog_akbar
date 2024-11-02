import { Route, Routes } from "react-router-dom";
import Layouts from "./layouts/layouts";
import DashboardRoutes from "./routes/dashboardRoutes";
import CategoryRoutes from "./routes/categoryRoutes";
import AuthRoutes from "./routes/authRoutes";
import RolePermissionRoutes from "./routes/rolePermissionRoutes";
import MediaRoutes from "./routes/mediaRoutes";
import PostRoutes from "./routes/postRoutes";
import SettingRoutes from "./routes/settingRoutes";
import PageRoutes from "./routes/pageRoutes";
import UsersTabRoute from "./routes/usersTabRoutes";

const AppRoutes = () => {
	return (
		<Routes>
			<Route path="/" element={<span>Home Page</span>} />
			{AuthRoutes()}

			<Route element={<Layouts />}>
				{DashboardRoutes()}
				{CategoryRoutes()}
				{MediaRoutes()}
				{RolePermissionRoutes()}
				{PostRoutes()}
				{SettingRoutes()}
				{PageRoutes()}
				{UsersTabRoute()}
			</Route>
		</Routes>
	);
};

export default AppRoutes;
