import UsersTab from "@/pages/users/UsersTab";
import UserForm from "../pages/users/usersForm";
import Profile from "@/pages/users/Profile";
import { Route, useParams } from "react-router-dom";

const ProfileWrapper = () => {
	const { id } = useParams();
	return <Profile userId={id || ""} />;
};

const UsersTabRoute = () => (
	<Route path="/dashboard">
		<Route path="users" element={<UsersTab />}>
			<Route index element={<UsersTab />} />
			<Route path=":id" element={<ProfileWrapper />} />
		</Route>
		<Route path="users/create" element={<UserForm />} />
		<Route path="users/:id/edit" element={<UserForm />} />
	</Route>
);

export default UsersTabRoute;
