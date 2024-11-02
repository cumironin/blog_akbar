import AuthorizedRoute from "@/routes/ AuthorizedRoute";
import { Route } from "react-router-dom";
import SettingsPage from "../pages/settings/settingsPage";

const SettingsRoutes = () => (
	<Route path="dashboard/settings">
		<Route
			index
			element={
				<AuthorizedRoute
					element={<SettingsPage />}
					path="/dashboard/settings"
					method="GET"
				/>
			}
		/>
	</Route>
);

export default SettingsRoutes;
