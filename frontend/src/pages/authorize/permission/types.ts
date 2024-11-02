// import type { Menu } from "../menu/types";

export interface Permission {
	id: string;
	name: string;
	description: string;
	menu: { id: string; name: string; svg: string };
	menuId?: string; // Add this line to support both structures
	urlRestrict: {
		create: string;
		read: string;
		update: string;
		delete: string;
	};
	urlAccess: {
		create: string | null;
		read: string | null;
		update: string | null;
		delete: string | null;
	};
}

export type Role = {
	id: string;
	name: string;
	permissions: Permission[];
};

// Remove RolePermission type as it's not needed
