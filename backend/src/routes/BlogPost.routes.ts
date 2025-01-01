import { Router } from "express";
import BlogPostController from "../controller/BlogPostController.js";

const router = Router();

router.get("/", BlogPostController.getBlogPost);
router.get("/categoryblog", BlogPostController.getCategoryBlog);
router.get("/userblog", BlogPostController.getAuthorBlog);
router.get("/imageblog", BlogPostController.getImageBlog);

router.post("/createblog", BlogPostController.createBlogPost);

router.patch("/:id", BlogPostController.editBlogPost);

router.put("/:id", BlogPostController.deleteBlogPost);
router.get("/:id", BlogPostController.getBlogPostById);
router.delete("/deleteMultiple", BlogPostController.deleteMultipleBlogPosts);

export default router;

// router.get("/", BlogPostController.getBlogPost);
// router.get("/categoryblog", BlogPostController.getCategoryBlog);
// router.get("/userblog", BlogPostController.getAuthorBlog);
// router.get("/imageblog", BlogPostController.getImageBlog);
// router.get("/:id", BlogPostController.getBlogPostById);

// read:
// get:/api/blog,
// get:/api/blog/categoryblog,
// get:/api/blog/userblog,
// get:/api/blog/imageblog,
// get:/api/blog/:id

// create: post:/api/blog/createblog

// update: patch:/api/blog/:id

// delete:
// put:/api/blog/:id,
// delete:/api/blog/deleteMultiple
