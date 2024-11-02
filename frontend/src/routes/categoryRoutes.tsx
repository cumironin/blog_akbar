import FormCategory from "@/pages/category/formCategory";
import { Route } from "react-router-dom";
import CategoryPage from "../pages/category/categoryPage";
import AuthorizedRoute from "./ AuthorizedRoute";

const CategoryRoutes = () => (
	<>
		<Route
			path="/dashboard/category"
			element={
				<AuthorizedRoute
					element={<CategoryPage />}
					path="/dashboard/category"
					method="GET"
				/>
			}
		/>
		<Route
			path="/dashboard/category/create"
			element={
				<AuthorizedRoute
					element={<FormCategory />}
					path="/dashboard/category/create"
					method="POST"
				/>
			}
		/>
		<Route
			path="/dashboard/category/:id"
			element={
				<AuthorizedRoute
					element={<FormCategory />}
					path="/dashboard/category/:id"
					method="PUT"
				/>
			}
		/>
	</>
);

export default CategoryRoutes;
