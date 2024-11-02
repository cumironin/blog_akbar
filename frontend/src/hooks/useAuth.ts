import { useGetRoleUserPermission } from "@/api/permissionApi";
import { useCallback } from "react";

interface Permission {
	roleId: string;
	permissionId: string;
	urlAccess: string | null;
}

const useAuth = () => {
	const { data, isLoading, error } = useGetRoleUserPermission();

	const isAuthorized = useCallback(
		(requestUrl: string, requestMethod: string): boolean => {
			console.log(
				`Checking authorization for URL: ${requestUrl}, Method: ${requestMethod}`,
			);

			if (isLoading || !data || !data.permissions) {
				console.log("Still loading or no permissions data, returning false");
				return false;
			}

			// Generic mapping function for frontend routes to API routes
			const mapFrontendToApiRoute = (frontendRoute: string): string => {
				const parts = frontendRoute.split("/").filter(Boolean);
				if (parts[0] === "dashboard" && parts.length > 1) {
					return `/api/${parts.slice(1).join("/")}`;
				}
				return frontendRoute;
			};

			const apiRoute = mapFrontendToApiRoute(requestUrl);
			console.log(
				`Mapped frontend route ${requestUrl} to API route ${apiRoute}`,
			);

			return data.permissions.some((perm: Permission) => {
				if (perm.urlAccess === null) {
					console.log("urlAccess is null, access restricted");
					return false;
				}

				// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
				let urlAccess;
				try {
					const cleanedUrlAccess = perm.urlAccess.replace(/,\s*$/, "");
					urlAccess = JSON.parse(cleanedUrlAccess);
					console.log("Parsed urlAccess:", urlAccess);
				} catch (error) {
					console.error("Error parsing urlAccess:", error);
					return false;
				}

				const methodMap: { [key: string]: string } = {
					get: "read",
					post: "create",
					put: "update",
					patch: "update",
					delete: "delete",
				};
				const accessType = methodMap[requestMethod.toLowerCase()];

				if (!accessType || !urlAccess[accessType]) {
					console.log("No access for this method, access restricted");
					return false;
				}

				const allowedUrls = urlAccess[accessType]
					.split(",")
					.map((url: string) => url.trim());

				return allowedUrls.some((path: string) => {
					// Remove the HTTP method from the beginning of the path
					const cleanPath = path.replace(/^(get|post|put|patch|delete):/, "");

					// Create a less strict regex pattern
					const regexPattern = cleanPath
						.replace(/:\w+/g, "[^/]+")
						.replace(/\//g, "\\/");
					const regex = new RegExp(`^${regexPattern}`);

					const isMatch = regex.test(apiRoute);
					console.log(
						`URL ${isMatch ? "matches" : "does not match"} regex: ${regex}`,
					);
					return isMatch;
				});
			});
		},
		[isLoading, data],
	);

	const checkElementPermission = useCallback(
		(elementType: string, action: string): boolean => {
			if (isLoading || !data || !data.permissions) {
				return false;
			}

			return data.permissions.some((perm: Permission) => {
				if (perm.urlAccess === null) {
					return false;
				}

				// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
				let urlAccess;
				try {
					const cleanedUrlAccess = perm.urlAccess.replace(/,\s*$/, "");
					urlAccess = JSON.parse(cleanedUrlAccess);
				} catch (error) {
					console.error("Error parsing urlAccess:", error);
					return false;
				}

				const accessType = action.toLowerCase();

				if (!urlAccess[accessType]) {
					return false;
				}

				const allowedUrls = urlAccess[accessType]
					.split(",")
					.map((url: string) => url.trim());

				return allowedUrls.some((path: string) => {
					const cleanPath = path.replace(/^(get|post|put|patch|delete):/, "");
					return cleanPath.includes(elementType.toLowerCase());
				});
			});
		},
		[isLoading, data],
	);

	return { isAuthorized, checkElementPermission, isLoading, error };
};

export default useAuth;
