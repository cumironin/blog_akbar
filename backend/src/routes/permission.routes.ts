import express from "express";
import PermissionController from "../controller/PermissionController";

const router = express.Router();

// Add a new permission
router.post("/", PermissionController.addPermission);

router.get("/userpermission", PermissionController.getRoleUserPermission);

router.get("/:id", PermissionController.getPermission);

// Get all permissions
router.get("/", PermissionController.getPermissions);

// Update a permission
router.patch("/:id", PermissionController.updatePermission);

// Delete a permission
router.delete("/:id", PermissionController.deletePermission);

export default router;
