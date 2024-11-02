import { Router } from "express";
import AuthController from "../controller/Auth.Controller";

const router = Router();

router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.loginUser);
router.post("/logout", AuthController.logoutUser);
router.get("/session", AuthController.getSessionId);


export default router;
