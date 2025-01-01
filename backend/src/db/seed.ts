import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
	categoryTable,
	imageTable,
	menuTable,
	permissionTable,
	postOnCategoryTable,
	postTable,
	roleTable,
	roleToPermissionTable,
	userTable,
} from "./schema.js";

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
			url_menu: faker.internet.url(),
			svg: faker.image.dataUri({ type: "svg-base64" }),
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
	await db.insert(roleToPermissionTable).values(dataRolePermission);
	await db.insert(postOnCategoryTable).values(dataPostCategory);
	console.log("Seed done");
};

main();
