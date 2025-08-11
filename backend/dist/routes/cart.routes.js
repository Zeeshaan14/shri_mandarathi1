// src/routes/cart.routes.ts
import { Router } from "express";
import { addToCart, clearCart, getCart, removeCartItem, updateCartItem } from "../controller/cart.controller.js";
const router = Router();
// Add item to cart
router.post("/add", addToCart);
// Get cart for a user
router.get("/:userId", getCart);
// Update quantity of a cart item
router.patch("/item/:cartItemId", updateCartItem);
// Remove a single cart item
router.delete("/item/:cartItemId", removeCartItem);
// Clear entire cart for a user
router.delete("/clear/:userId", clearCart);
export default router;
//# sourceMappingURL=cart.routes.js.map