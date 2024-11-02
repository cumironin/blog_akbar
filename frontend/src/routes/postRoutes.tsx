import BlogList from "@/pages/post/blogList";
import BlogPostEditor from "@/pages/post/postPage";
import { Route } from "react-router-dom";
import AuthorizedRoute from "./ AuthorizedRoute";

const PostRoutes = () => (
	<>
		<Route
			path="/dashboard/blog"
			element={
				<AuthorizedRoute element={<BlogList />} path="/api/blog" method="GET" />
			}
		/>

		{/* /dashboard/blog/new */}
		<Route
			path="/dashboard/blog/new"
			element={
				<AuthorizedRoute
					element={<BlogPostEditor />}
					path="/api/blog/createblog"
					method="POST"
				/>
			}
		/>
		<Route
			path="/dashboard/blog/:id"
			element={
				<AuthorizedRoute
					element={<BlogPostEditor />}
					path="/api/blog/:id"
					method="GET"
				/>
			}
		/>
	</>
);

export default PostRoutes;
