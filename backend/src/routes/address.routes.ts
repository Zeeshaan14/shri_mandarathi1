import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { createAddress, deleteAddress, listAddresses, updateAddress } from "../controller/address.controller.js";

const router: Router = Router();

router.get("/", verifyToken, listAddresses);
router.post("/", verifyToken, createAddress);
router.patch("/:id", verifyToken, updateAddress);
router.delete("/:id", verifyToken, deleteAddress);

export default router;


