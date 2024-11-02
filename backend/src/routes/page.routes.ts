import { Router } from "express";
import PageController from "../controller/Page.Controller";

const router = Router();

// Move the '/author' route to the top

router.get("/", PageController.getPages);
router.get("/author", PageController.getAuthorPage);
router.post("/", PageController.createPage);
router.get("/:id", PageController.getPageById);
router.patch("/:id", PageController.editPage);
router.delete("/deleteMultiple", PageController.deleteMultiplePages);
router.delete("/:id", PageController.deletePage);

export default router;
