// src/controllers/cart.controller.ts
import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";

const prisma = new PrismaClient();

// Helper to get or create cart by userId (assuming userId is unique in Cart schema)
async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }
  return cart;
}

// Add item to cart
export const addToCart = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user as { userId: string } | undefined
    const userId = authUser?.userId
    const { variantId, quantity } = req.body;

    if (!userId) {
      return res.status(401).json({ 
        status: false,
        message: "Authentication required" 
      });
    }

    if (!variantId) {
      return res.status(400).json({ 
        status: false,
        message: "Product variant ID is required" 
      });
    }

    if (typeof quantity !== "number" || quantity < 1) {
      return res.status(400).json({ 
        status: false,
        message: "Quantity must be a positive number" 
      });
    }

    // Check if variant exists and has sufficient stock
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true }
    });

    if (!variant) {
      return res.status(404).json({ 
        status: false,
        message: "Product variant not found" 
      });
    }

    if (variant.stock < quantity) {
      return res.status(400).json({ 
        status: false,
        message: `Only ${variant.stock} items available in stock` 
      });
    }

    const cart = await getOrCreateCart(userId);

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > variant.stock) {
        return res.status(400).json({ 
          status: false,
          message: `Cannot add ${quantity} more items. Only ${variant.stock - existingItem.quantity} additional items available.` 
        });
      }

      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
      return res.json({ 
        status: true,
        message: "Cart updated successfully", 
        item: updatedItem 
      });
    } else {
      const newItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity,
        },
      });
      return res.json({ 
        status: true,
        message: "Item added to cart successfully", 
        item: newItem 
      });
    }
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({ 
      status: false,
      message: "Failed to add item to cart. Please try again later." 
    });
  }
};

// Get user's cart with items and product details
export const getCart = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user as { userId: string } | undefined
    const userId = authUser?.userId
    
    if (!userId) {
      return res.status(401).json({ 
        status: false,
        message: "Authentication required" 
      });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
    });

    if (!cart) {
      return res.json({ 
        status: true,
        message: "Cart is empty", 
        items: [],
        totalItems: 0,
        totalValue: 0
      });
    }

    const totalItems = cart.items.reduce((sum: number, item: any) => sum + Number(item.quantity), 0);
    const totalValue = cart.items.reduce((sum: number, item: any) => sum + (Number(item.variant.price) * Number(item.quantity)), 0);

    return res.json({
      status: true,
      cart: {
        ...cart,
        totalItems,
        totalValue
      }
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({ 
      status: false,
      message: "Failed to fetch cart. Please try again later." 
    });
  }
};

// Update quantity of a cart item
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    const authUser = (req as any).user as { userId: string } | undefined;
    const userId = authUser?.userId;

    if (!userId) {
      return res.status(401).json({ 
        status: false,
        message: "Authentication required" 
      });
    }
    
    if (!cartItemId) {
      return res.status(400).json({ 
        status: false,
        message: "Cart item ID is required" 
      });
    }
    
    if (typeof quantity !== "number" || quantity < 1) {
      return res.status(400).json({ 
        status: false,
        message: "Quantity must be at least 1" 
      });
    }

    // Ensure the cart item belongs to the authenticated user's cart
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { 
        cart: true,
        variant: true
      },
    });

    if (!cartItem) {
      return res.status(404).json({ 
        status: false,
        message: "Cart item not found" 
      });
    }
    
    if (cartItem.cart.userId !== userId) {
      return res.status(403).json({ 
        status: false,
        message: "You can only modify your own cart" 
      });
    }

    // Check stock availability
    if (quantity > cartItem.variant.stock) {
      return res.status(400).json({ 
        status: false,
        message: `Only ${cartItem.variant.stock} items available in stock` 
      });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    return res.json({ 
      status: true,
      message: "Item quantity updated successfully", 
      item: updatedItem 
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    return res.status(500).json({ 
      status: false,
      message: "Failed to update cart item. Please try again later." 
    });
  }
};

// Remove a single item from cart
export const removeCartItem = async (req: Request, res: Response) => {
  try {
    const { cartItemId } = req.params;
    const authUser = (req as any).user as { userId: string } | undefined;
    const userId = authUser?.userId;

    if (!userId) {
      return res.status(401).json({ 
        status: false,
        message: "Authentication required" 
      });
    }
    
    if (!cartItemId) {
      return res.status(400).json({ 
        status: false,
        message: "Cart item ID is required" 
      });
    }

    // Ensure the cart item belongs to the authenticated user's cart
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem) {
      return res.status(404).json({ 
        status: false,
        message: "Cart item not found" 
      });
    }
    
    if (cartItem.cart.userId !== userId) {
      return res.status(403).json({ 
        status: false,
        message: "You can only modify your own cart" 
      });
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return res.json({ 
      status: true,
      message: "Item removed from cart successfully" 
    });
  } catch (error) {
    console.error("Remove cart item error:", error);
    return res.status(500).json({ 
      status: false,
      message: "Failed to remove item from cart. Please try again later." 
    });
  }
};

// Clear entire cart for a user
export const clearCart = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user as { userId: string } | undefined
    const userId = authUser?.userId
    
    if (!userId) {
      return res.status(401).json({ 
        status: false,
        message: "Authentication required" 
      });
    }

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      return res.json({ 
        status: true,
        message: "Cart is already empty" 
      });
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return res.json({ 
      status: true,
      message: "Cart cleared successfully" 
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    return res.status(500).json({ 
      status: false,
      message: "Failed to clear cart. Please try again later." 
    });
  }
};
