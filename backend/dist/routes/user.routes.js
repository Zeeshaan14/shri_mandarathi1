import { Router } from "express";
import { getAllUsers, updateUserRole } from "../controller/user.controller.js";
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js";
const userRouter = Router();
userRouter.get("/", verifyToken, isAdmin, getAllUsers);
userRouter.patch("/:id/role", verifyToken, isAdmin, updateUserRole);
export default userRouter;
//# sourceMappingURL=user.routes.js.map