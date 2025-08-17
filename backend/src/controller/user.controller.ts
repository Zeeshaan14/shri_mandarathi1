import type { Request, Response } from "express";
import { prisma1 } from "../utils/prisma.js";

// Admin: Get all users with order count and recent orders
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Only allow admin
    const user = (req as any).user;
    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ 
        status: false,
        message: "Access denied. Admin privileges required." 
      });
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
    
    res.json({
      status: true,
      users,
      totalUsers: users.length
    });
  } catch (err: any) {
    console.error("[GET_ALL_USERS_ERROR]", err);
    res.status(500).json({ 
      status: false,
      message: "Failed to fetch users. Please try again later." 
    });
  }
};

// Admin: Update user role
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const admin = (req as any).user;
    if (!admin || admin.role !== "ADMIN") {
      return res.status(403).json({ 
        status: false,
        message: "Access denied. Admin privileges required." 
      });
    }
    
    const { id } = req.params;
    const { role } = req.body;
    
    if (!id) {
      return res.status(400).json({ 
        status: false,
        message: "User ID is required" 
      });
    }
    
    if (!role || !["ADMIN", "CUSTOMER"].includes(role)) {
      return res.status(400).json({ 
        status: false,
        message: "Valid role (ADMIN or CUSTOMER) is required" 
      });
    }

    // Check if user exists
    const existingUser = await prisma1.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ 
        status: false,
        message: "User not found" 
      });
    }

    // Prevent admin from changing their own role
    if (id === admin.userId) {
      return res.status(400).json({ 
        status: false,
        message: "You cannot change your own role" 
      });
    }

    const updated = await prisma1.user.update({
      where: { id },
      data: { role },
    });
    
    res.json({ 
      status: true,
      message: "User role updated successfully", 
      user: updated 
    });
  } catch (err: any) {
    console.error("[UPDATE_USER_ROLE_ERROR]", err);
    res.status(500).json({ 
      status: false,
      message: "Failed to update user role. Please try again later." 
    });
  }
};
