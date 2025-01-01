import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import SettingsController from "../controller/Settings.Controller.js";

const router = Router();

router.get("/", SettingsController.getSettings);
router.patch("/", SettingsController.updateSettings); // Changed from "/:id" to "/"

export default router;
