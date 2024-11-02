import AuthorizedRoute from "@/routes/ AuthorizedRoute";
import { Route } from "react-router-dom";
import MediaPage from "../pages/media/mediaPage";

const MediaRoutes = () => (
	<Route path="dashboard/media">
		<Route
			index
			element={
				<AuthorizedRoute
					element={<MediaPage />}
					path="/dashboard/media"
					method="GET"
				/>
			}
		/>
	</Route>
);

export default MediaRoutes;
