import { Router } from "express";
import { isAdmin, verifyToken } from "../middleware/auth.middleware.js";
import { createCategory, getCategories } from "../controller/category.controller.js";
const categoryRouter = Router();
categoryRouter.post("/", verifyToken, isAdmin, createCategory);
categoryRouter.get("/", getCategories);
export default categoryRouter;
//# sourceMappingURL=category.routes.js.map