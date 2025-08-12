import type { Request, Response } from "express";
import { prisma1 } from "../utils/prisma.js";

// Admin: Get all users with order count and recent orders
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Only allow admin
    const user = (req as any).user;
    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const users = await prisma1.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { orders: true } },
        orders: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// Admin: Update user role
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const admin = (req as any).user;
    if (!admin || admin.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { id } = req.params;
    const { role } = req.body;
    if (!id || !role) {
      return res.status(400).json({ message: "User ID and role are required" });
    }
    const updated = await prisma1.user.update({
      where: { id },
      data: { role },
    });
    res.json({ message: "User role updated", user: updated });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};
