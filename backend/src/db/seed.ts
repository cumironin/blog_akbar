import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
	categoryTable,
	imageTable,
	postTable,
	postOnCategoryTable,
	userTable,
	roleTable,
	userToRoleTable,
	roleToPermissionTable,
	permissionTable,
	menuTable,
	subMenuTable,
	roleToMenuTable,
} from "./schema";
import { fa, faker } from "@faker-js/faker";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const { Pool } = pg;

const main = async () => {
	const client = new Pool({
		connectionString: process.env.DATABASE_URL,
	});

	const db = drizzle(client);

	const dataUser: (typeof userTable.$inferInsert)[] = [];
	for (let i = 0; i < 6; i++) {
		dataUser.push({
			id: faker.string.uuid(),
			email: faker.internet.email(),
			username: faker.internet.userName(),
			name: faker.internet.displayName(),
			createdAt: faker.date.anytime(),
		});
	}

	const datapost: (typeof postTable.$inferInsert)[] = [];
	for (let i = 0; i < 10; i++) {
		datapost.push({
			id: faker.string.uuid(),
			title: faker.lorem.sentence(5),
			metatitle: faker.lorem.sentence(5),
			slug: faker.lorem.slug(),
			content: faker.lorem.paragraphs(10),
			createdAt: faker.date.anytime(),
			updatedAt: faker.date.anytime(),
			authorId: faker.helpers.arrayElement(dataUser).id,
		});
	}

	const dataImage: (typeof imageTable.$inferInsert)[] = [];
	for (let i = 0; i < 6; i++) {
		dataImage.push({
			id: faker.string.uuid(),
			url: faker.internet.url(),
			name: faker.lorem.words(),
			image: faker.image.avatar(),
			description: faker.lorem.sentence(5),
		});
	}

	const dataCategory: (typeof categoryTable.$inferInsert)[] = [];
	for (let i = 0; i < 3; i++) {
		dataCategory.push({
			id: faker.string.uuid(),
			title: faker.lorem.sentence(6),
			metatitle: faker.lorem.sentence(6),
			slug: faker.lorem.slug(),
			description: faker.lorem.paragraph(),
		});
	}

	const dataRole: (typeof roleTable.$inferInsert)[] = [];
	for (let i = 0; i < 3; i++) {
		dataRole.push({
			id: faker.string.uuid(),
			roleName: faker.lorem.words(),
		});
	}

	const dataPermission: (typeof permissionTable.$inferInsert)[] = [];
	for (let i = 0; i < 16; i++) {
		dataPermission.push({
			id: faker.string.uuid(),
			name: faker.lorem.word(),
			urlRestrict: faker.internet.url(),
		});
	}

	const dataMenu: (typeof menuTable.$inferInsert)[] = [];
	for (let i = 0; i < 6; i++) {
		dataMenu.push({
			id: faker.string.uuid(),
			name: faker.lorem.words(),
			urlRestrict: faker.internet.url(),
			svg: faker.image.dataUri({ type: "svg-base64" }),
		});
	}

	const dataSubMenu: (typeof subMenuTable.$inferInsert)[] = [];
	for (let i = 0; i < 4; i++) {
		dataSubMenu.push({
			id: faker.string.uuid(),
			name: faker.lorem.words(),
			urlRestrict: faker.internet.url(),
			menuId: faker.helpers.arrayElement(dataMenu).id,
		});
	}

	const dataRoleMenu: (typeof roleToMenuTable.$inferInsert)[] = [];
	for (let i = 0; i < 20; i++) {
		dataRoleMenu.push({
			id: faker.string.uuid(),
			roleId: faker.helpers.arrayElement(dataRole).id,
			menuId: faker.helpers.arrayElement(dataMenu).id,
		});
	}

	const dataRolePermission: (typeof roleToPermissionTable.$inferInsert)[] = [];
	for (let i = 0; i < 20; i++) {
		dataRolePermission.push({
			id: faker.string.uuid(),
			roleId: faker.helpers.arrayElement(dataRole).id,
			permissionId: faker.helpers.arrayElement(dataPermission).id,
		});
	}

	const dataUserRole: (typeof userToRoleTable.$inferInsert)[] = [];
	for (let i = 0; i < 20; i++) {
		dataUserRole.push({
			id: faker.string.uuid(),
			roleId: faker.helpers.arrayElement(dataRole).id,
			userId: faker.helpers.arrayElement(dataUser).id,
		});
	}

	const dataPostCategory: (typeof postOnCategoryTable.$inferInsert)[] = [];
	for (let i = 0; i < 20; i++) {
		dataPostCategory.push({
			id: faker.string.uuid(),
			postId: faker.helpers.arrayElement(datapost).id,
			categoryId: faker.helpers.arrayElement(dataCategory).id,
		});
	}

	console.log("Seed start");
	await db.insert(userTable).values(dataUser);
	await db.insert(postTable).values(datapost);
	await db.insert(imageTable).values(dataImage);
	await db.insert(categoryTable).values(dataCategory);
	await db.insert(roleTable).values(dataRole);
	await db.insert(permissionTable).values(dataPermission);
	await db.insert(menuTable).values(dataMenu);
	await db.insert(subMenuTable).values(dataSubMenu);
	await db.insert(userToRoleTable).values(dataUserRole);
	await db.insert(roleToPermissionTable).values(dataRolePermission);
	await db.insert(roleToMenuTable).values(dataRoleMenu);
	await db.insert(postOnCategoryTable).values(dataPostCategory);

	console.log("Seed done");
};

main();
