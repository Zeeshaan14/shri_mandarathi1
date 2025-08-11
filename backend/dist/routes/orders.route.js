import { Router } from "express";
import { createOrder, getOrderById, getOrders, updateOrderStatus } from "../controller/order.controller.js";
import { isAdmin, verifyToken } from "../middleware/auth.middleware.js";
const orderRouter = Router();
// Customer places order
orderRouter.post("/", verifyToken, createOrder);
// Get orders (role-based filtering)
orderRouter.get("/", verifyToken, getOrders);
// Get single order
orderRouter.get("/:id", verifyToken, getOrderById);
// Admin updates order status
orderRouter.patch("/:id", verifyToken, isAdmin, updateOrderStatus);
// Admin deletes order
// orderRouter.delete("/:id", verifyToken, isAdmin, deleteOrder);
export default orderRouter;
//# sourceMappingURL=orders.route.js.map