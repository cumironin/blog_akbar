import express from "express";
import {
	getAstroBlog,
	getAstroBlogById,
	getRelatedAstroBlog,
	getTrendingAstroBlog,
	getAstroBlogByCategory,
	getCategories,
	getAllAstroBlog,
	getUserAvatar,
	searchArticles,
} from "../controller/AstroBlog.Controller";

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
