import express from "express";
import multer from "multer";
import {
	deleteMedia,
	editMediaDescription,
	getMediaList,
	uploadMedia,
} from "../controller/Media.controller.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), uploadMedia);
router.get("/", getMediaList);
router.patch("/:id", editMediaDescription);
router.delete("/:id", deleteMedia); // Changed from PUT to DELETE

export default router;
