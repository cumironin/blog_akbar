import { Route } from "react-router-dom";

const DashboardRoutes = () => (
	<Route path="dashboard">
		<Route index element={<span>This is Dashboard all</span>} />
	</Route>
);

export default DashboardRoutes;
