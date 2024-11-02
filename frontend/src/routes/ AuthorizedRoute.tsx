import useAuth from "@/hooks/useAuth";
import { useMemo } from "react";
import { Navigate } from "react-router-dom";

interface AuthorizedRouteProps {
	element: React.ReactElement;
	path: string;
	method: string;
}

const AuthorizedRoute: React.FC<AuthorizedRouteProps> = ({
	element,
	path,
	method,
}) => {
	const { isAuthorized, isLoading, error } = useAuth();

	console.log(`Checking authorization for path: ${path}, method: ${method}`);
	// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
	console.log(`isAuthorized result:`, isAuthorized(path, method));

	return useMemo(() => {
		if (isLoading) {
			// You might want to show a loading indicator here
			return <div>Loading...</div>;
		}

		if (error) {
			// Handle error state
			console.error("Authorization error:", error);
			return <Navigate to="/error" replace />;
		}

		if (!isAuthorized(path, method)) {
			console.log(`Not authorized, redirecting to dashboard - path: ${path}`);
			return <Navigate to="/dashboard" replace />;
		}

		console.log(`Rendering authorized content - path: ${path}`);
		return element;
	}, [isAuthorized, isLoading, error, element, path, method]);
};

export default AuthorizedRoute;
