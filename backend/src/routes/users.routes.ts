import { Router } from "express";
import {
	createUser,
	getUserList,
	getUser,
	updateUser,
	deleteUser,
	getRoles,
	updateProfile,
} from "../controller/Users.controller";

const router = Router();

router.post("/", createUser);
router.get("/", getUserList);
router.get("/roles", getRoles);
router.get("/:id", getUser);
router.patch("/:id", updateUser);
router.put("/:id", deleteUser);
router.patch("/:id/profile", updateProfile);

export default router;
