import { Router } from "express";
import { isAdmin, verifyToken } from "../middleware/auth.middleware.js";
import { createProduct, getProducts } from "../controller/product.controller.js";
const productRouter = Router();
productRouter.post("/", verifyToken, isAdmin, createProduct);
productRouter.get("/", getProducts);
export default productRouter;
//# sourceMappingURL=product.routes.js.map