import express from "express";
import {
	getAllAstroBlog,
	getAstroBlog,
	getAstroBlogByCategory,
	getAstroBlogById,
	getCategories,
	getRelatedAstroBlog,
	getTrendingAstroBlog,
	getUserAvatar,
	searchArticles,
} from "../controller/AstroBlog.Controller.js";

const router = express.Router();

router.get("/", getAstroBlog);
router.get("/allarticle", getAllAstroBlog);
router.get("/categories", getCategories);
router.get("/trending", getTrendingAstroBlog);
router.get("/search", searchArticles);
router.get("/useravatar", getUserAvatar);
router.get("/category/:category", getAstroBlogByCategory);
router.get("/related/:id/:category", getRelatedAstroBlog);
router.get("/:id", getAstroBlogById);

export default router;
