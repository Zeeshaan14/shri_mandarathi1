import type { Request, Response } from "express";
import { prisma1 } from "../utils/prisma.js";

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, shipping } = req.body as any;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ 
        status: false,
        message: "Authentication required" 
      });
    }

    // Ensure the user exists to avoid FK violations and provide a clearer error
    try {
      const existingUser = await prisma1.user.findUnique({ where: { id: userId } });
      if (!existingUser) {
        return res.status(400).json({ 
          status: false,
          message: "User not found. Please login again." 
        });
      }
    } catch (err: any) {
      return res.status(500).json({ 
        status: false,
        message: "Failed to verify user. Please try again later." 
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ 
        status: false,
        message: "Order must contain at least one item" 
      });
    }

    if (!shipping || !shipping.fullName || !shipping.phone || !shipping.line1 || !shipping.city || !shipping.state || !shipping.postalCode || !shipping.country) {
      return res.status(400).json({ 
        status: false,
        message: "Complete shipping information is required (name, phone, address, city, state, postal code, country)" 
      });
    }

    // Validate phone number format
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(shipping.phone.replace(/\s/g, ''))) {
      return res.status(400).json({ 
        status: false,
        message: "Please provide a valid phone number" 
      });
    }

    try {
      const order = await prisma1.$transaction(async (tx: any) => {
        let total = 0;
        const orderItemsData: any[] = [];

        for (const item of items) {
          if (!item.variantId || !item.quantity || item.quantity < 1) {
            throw new Error("Invalid item data. Each item must have a variant ID and positive quantity.");
          }

          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            include: { product: true }
          });

          if (!variant) {
            throw new Error(`Product variant not found: ${item.variantId}`);
          }

          if (variant.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${variant.product?.name || 'product'}. Only ${variant.stock} available.`);
          }

          const variantPrice = Number(variant.price);
          total += variantPrice * item.quantity;

          // Decrease stock
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });

          orderItemsData.push({
            variantId: item.variantId,
            quantity: item.quantity,
            price: variantPrice,
          });
        }

        const newOrder = await tx.order.create({
          data: {
            userId,
            total,
            status: "PENDING",
            shippingFullName: shipping.fullName,
            shippingPhone: shipping.phone,
            shippingLine1: shipping.line1,
            shippingLine2: shipping.line2,
            shippingCity: shipping.city,
            shippingState: shipping.state,
            shippingPostalCode: shipping.postalCode,
            shippingCountry: shipping.country,
            items: {
              create: orderItemsData,
            },
          },
          include: {
            items: { include: { variant: { include: { product: true } } } },
          },
        });

        return newOrder;
      });

      res.status(201).json({
        status: true,
        message: "Order created successfully",
        order
      });
    } catch (error: any) {
      console.error("[CREATE_ORDER_ERROR]", error.message);
      res.status(400).json({ 
        status: false,
        message: error.message || "Failed to create order" 
      });
    }
  } catch (error: any) {
    console.error("[CREATE_ORDER_ERROR]", error);
    res.status(500).json({ 
      status: false,
      message: "Failed to create order. Please try again later." 
    });
  }
};

// Cancel order + rollback stock
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    if (!id) {
      return res.status(400).json({ 
        status: false,
        message: "Order ID is required" 
      });
    }

    try {
      const updatedOrder = await prisma1.$transaction(async (tx: any) => {
        const order = await tx.order.findUnique({
          where: { id },
          include: { items: true }, // include items to access order.items
        });

        if (!order) {
          throw new Error("Order not found");
        }
        
        if (order.status === "CANCELLED") {
          throw new Error("Order is already cancelled");
        }

        if (order.status === "DELIVERED") {
          throw new Error("Cannot cancel a delivered order");
        }

        if (user.role !== "ADMIN" && order.userId !== user.userId) {
          throw new Error("You are not authorized to cancel this order");
        }

        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }

        return await tx.order.update({
          where: { id },
          data: { status: "CANCELLED" },
          include: { items: true },
        });
      });

      res.json({
        status: true,
        message: "Order cancelled successfully",
        order: updatedOrder
      });
    } catch (error: any) {
      console.error("[CANCEL_ORDER_ERROR]", error.message);
      res.status(400).json({ 
        status: false,
        message: error.message || "Failed to cancel order" 
      });
    }
  } catch (error: any) {
    console.error("[CANCEL_ORDER_ERROR]", error);
    res.status(500).json({ 
      status: false,
      message: "Failed to cancel order. Please try again later." 
    });
  }
};

// Get all orders
export const getOrders = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ 
        status: false,
        message: "Authentication required" 
      });
    }

    const orders = await prisma1.order.findMany({
      where: user.role === "ADMIN" ? {} : { userId: user.userId },
      include: {
        user: true,
        items: { include: { variant: { include: { product: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    
    res.json({
      status: true,
      orders,
      totalOrders: orders.length
    });
  } catch (error: any) {
    console.error("[GET_ORDERS_ERROR]", error);
    res.status(500).json({ 
      status: false,
      message: "Failed to fetch orders. Please try again later." 
    });
  }
};

// Get single order
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    if (!id) {
      return res.status(400).json({ 
        status: false,
        message: "Order ID is required" 
      });
    }

    if (!user) {
      return res.status(401).json({ 
        status: false,
        message: "Authentication required" 
      });
    }

    const order = await prisma1.order.findUnique({
      where: { id },
      include: { items: { include: { variant: { include: { product: true } } } } },
    });

    if (!order) {
      return res.status(404).json({ 
        status: false,
        message: "Order not found" 
      });
    }
    
    if (user.role !== "ADMIN" && order.userId !== user.userId) {
      return res.status(403).json({ 
        status: false,
        message: "You are not authorized to view this order" 
      });
    }

    res.json({
      status: true,
      order
    });
  } catch (error: any) {
    console.error("[GET_ORDER_BY_ID_ERROR]", error);
    res.status(500).json({ 
      status: false,
      message: "Failed to fetch order. Please try again later." 
    });
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = (req as any).user;

    if (!id) {
      return res.status(400).json({ 
        status: false,
        message: "Order ID is required" 
      });
    }

    if (!status) {
      return res.status(400).json({ 
        status: false,
        message: "Order status is required" 
      });
    }

    if (!user) {
      return res.status(401).json({ 
        status: false,
        message: "Authentication required" 
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({ 
        status: false,
        message: "Only administrators can update order status" 
      });
    }

    // Validate status values
    const validStatuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        status: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
      });
    }

    const order = await prisma1.order.update({
      where: { id },
      data: { status },
      include: { items: true }, // Include items to avoid undefined later if accessed
    });

    res.json({
      status: true,
      message: "Order status updated successfully",
      order
    });
  } catch (error: any) {
    console.error("[UPDATE_ORDER_STATUS_ERROR]", error);
    res.status(500).json({ 
      status: false,
      message: "Failed to update order status. Please try again later." 
    });
  }
};
