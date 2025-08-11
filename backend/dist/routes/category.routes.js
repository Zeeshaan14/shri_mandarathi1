import { Router } from "express";
import { createCategory, deleteCategory, getCategories, getCategoryById, updateCategory } from "../controller/category.controller.js";
import { isAdmin, verifyToken } from "../middleware/auth.middleware.js";
const categoryRouter = Router();
// Public
categoryRouter.get("/", getCategories);
categoryRouter.get("/:id", getCategoryById);
// Admin only
categoryRouter.post("/", verifyToken, isAdmin, createCategory);
categoryRouter.put("/:id", verifyToken, isAdmin, updateCategory);
categoryRouter.delete("/:id", verifyToken, isAdmin, deleteCategory);
export default categoryRouter;
//# sourceMappingURL=category.routes.js.map