import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import CategoryController from "../controller/CategoryController";
// import authorizeMiddleware from "../middleware/authorize.middleware";

const router = Router();

router.get("/", CategoryController.getCategory);
router.post("/", CategoryController.postCategory);
router.patch("/:id", CategoryController.updateCategory);
// router.put("/:id", CategoryController.deleteCategory);
router.delete("/:id", CategoryController.deleteCategory);
router.get("/:id", CategoryController.getCategoryById);

export default router;
