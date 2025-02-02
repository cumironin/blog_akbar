import { Router } from "express";
import MenuController from "../controller/menu.controller.js";
import menuController from "../controller/menu.controller.js";

const router = Router();

router.get("/", MenuController.getMenus);
router.get("/items", menuController.getMenuItems);
router.get("/:id", MenuController.getMenuById);
router.post("/", MenuController.createMenu);
router.patch("/:id", MenuController.updateMenu);
router.delete("/:id", MenuController.deleteMenu);

export default router;
