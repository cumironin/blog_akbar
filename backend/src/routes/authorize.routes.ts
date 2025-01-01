import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import AuthorizeController from "../controller/AuthorizeController.js";

const router = Router();

router.post("/", AuthorizeController.postRole);
router.get("/", AuthorizeController.getRole);
router.put("/:id", AuthorizeController.putRole);
router.patch("/:id", AuthorizeController.patchRole);
export default router;
