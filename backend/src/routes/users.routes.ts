import { Router } from "express";
import {
	createUser,
	deleteUser,
	getRoles,
	getUser,
	getUserList,
	updateProfile,
	updateUser,
} from "../controller/Users.controller.js";

const router = Router();

router.post("/", createUser);
router.get("/", getUserList);
router.get("/roles", getRoles);
router.get("/:id", getUser);
router.patch("/:id", updateUser);
router.put("/:id", deleteUser);
router.patch("/:id/profile", updateProfile);

export default router;
