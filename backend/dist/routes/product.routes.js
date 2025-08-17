import { Router } from "express";
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from "../controller/product.controller.js";
import { isAdmin, verifyToken } from "../middleware/auth.middleware.js";
import { uploadWithFields } from "../middleware/upload.middleware.js"; // ⬅ Import updated Multer middleware
const productRouter = Router();
// Public
productRouter.get("/", getProducts);
productRouter.get("/:id", getProductById);
// Admin only (with image upload support)
productRouter.post("/", verifyToken, isAdmin, uploadWithFields, createProduct);
productRouter.put("/:id", verifyToken, isAdmin, uploadWithFields, updateProduct);
productRouter.delete("/:id", verifyToken, isAdmin, deleteProduct);
export default productRouter;
//# sourceMappingURL=product.routes.js.map