import LoginPage from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import RolePermission from "@/pages/authorize/permission/rolePermissionPage";
import { Route } from "react-router-dom";

const AuthRoutes = () => (
	<Route path="/auth">
		<Route path="login" element={<LoginPage />} />
		<Route path="register" element={<Register />} />
		{/* <Route path="permission" element={<RolePermission />} /> */}
	</Route>
);

export default AuthRoutes;
