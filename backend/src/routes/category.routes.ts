import { Router } from "express";
import { createCategory, deleteCategory, getCategories, getCategoryById, updateCategory } from "../controller/category.controller.js";
import { isAdmin, verifyToken } from "../middleware/auth.middleware.js";



const router: Router = Router();

// Public
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Admin only
router.post("/", verifyToken, isAdmin, createCategory);
router.put("/:id", verifyToken, isAdmin, updateCategory);
router.delete("/:id", verifyToken, isAdmin, deleteCategory);

export default router;
