export type User = {
	id: string;
	username: string;
	email: string;
	name: string;
	roleId: string | null;
	about_me: string | null;
	roleName: string | null;
	image_url?: string;
};

export type Role = {
	id: string;
	roleName: string;
};
