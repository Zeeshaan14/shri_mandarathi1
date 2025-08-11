// src/routes/cart.routes.ts
import { Router } from "express";
import { addToCart, clearCart, getCart, removeCartItem, updateCartItem } from "../controller/cart.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
const router = Router();
// Add item to cart (auth required)
router.post("/add", verifyToken, addToCart);
// Get cart for the authenticated user (userId param is ignored; derived from token)
router.get("/:userId", verifyToken, getCart);
// Update quantity of a cart item (auth required)
router.patch("/item/:cartItemId", verifyToken, updateCartItem);
// Remove a single cart item (auth required)
router.delete("/item/:cartItemId", verifyToken, removeCartItem);
// Clear entire cart for a user (auth required)
router.delete("/clear/:userId", verifyToken, clearCart);
export default router;
//# sourceMappingURL=cart.routes.js.map