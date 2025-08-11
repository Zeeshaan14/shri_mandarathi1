import { Router } from "express";
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from "../controller/product.controller.js";
import { isAdmin, verifyToken } from "../middleware/auth.middleware.js";



const productRouter: Router = Router();

// Public
productRouter.get("/", getProducts);
productRouter.get("/:id", getProductById);

// Admin only
productRouter.post("/", verifyToken, isAdmin, createProduct);
productRouter.put("/:id", verifyToken, isAdmin, updateProduct);
productRouter.delete("/:id", verifyToken, isAdmin, deleteProduct);

export default productRouter;
