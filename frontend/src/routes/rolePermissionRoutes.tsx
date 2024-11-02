// import RolePermission from "@/pages/authorize/permission/rolePermissionPage";
// import Role from "@/pages/authorize/role/rolePage";
import PermissionManagement from "@/pages/authorize/PermissionManagementTab";

import { Route } from "react-router-dom";

const RolePermissionRoutes = () => (
	<Route path="/authorization">
		{/* <Route path="permission" element={<RolePermission />} /> */}
		<Route path="permission" element={<PermissionManagement />} />

		{/* <Route path="role" element={<Role />} /> */}
	</Route>
);

export default RolePermissionRoutes;
