// src/controllers/cart.controller.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// Helper to get or create cart by userId (assuming userId is unique in Cart schema)
async function getOrCreateCart(userId) {
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
export const addToCart = async (req, res) => {
    try {
        const { userId, variantId, quantity } = req.body;
        if (!userId || !variantId || typeof quantity !== "number" || quantity < 1) {
            return res.status(400).json({ message: "Missing or invalid fields" });
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
            const updatedItem = await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
            return res.json({ message: "Cart updated", item: updatedItem });
        }
        else {
            const newItem = await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    variantId,
                    quantity,
                },
            });
            return res.json({ message: "Item added to cart", item: newItem });
        }
    }
    catch (error) {
        console.error("Add to cart error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};
// Get user's cart with items and product details
export const getCart = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId)
            return res.status(400).json({ message: "User ID is required" });
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
            return res.json({ message: "Cart is empty", items: [] });
        }
        return res.json(cart);
    }
    catch (error) {
        console.error("Get cart error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};
// Update quantity of a cart item
export const updateCartItem = async (req, res) => {
    try {
        const { cartItemId } = req.params;
        const { quantity } = req.body;
        if (!cartItemId)
            return res.status(400).json({ message: "Cart item ID is required" });
        if (typeof quantity !== "number" || quantity < 1)
            return res.status(400).json({ message: "Quantity must be at least 1" });
        const updatedItem = await prisma.cartItem.update({
            where: { id: cartItemId },
            data: { quantity },
        });
        return res.json({ message: "Item quantity updated", item: updatedItem });
    }
    catch (error) {
        console.error("Update cart item error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};
// Remove a single item from cart
export const removeCartItem = async (req, res) => {
    try {
        const { cartItemId } = req.params;
        if (!cartItemId)
            return res.status(400).json({ message: "Cart item ID is required" });
        await prisma.cartItem.delete({
            where: { id: cartItemId },
        });
        return res.json({ message: "Item removed from cart" });
    }
    catch (error) {
        console.error("Remove cart item error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};
// Clear entire cart for a user
export const clearCart = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId)
            return res.status(400).json({ message: "User ID is required" });
        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart)
            return res.json({ message: "Cart already empty" });
        await prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });
        return res.json({ message: "Cart cleared" });
    }
    catch (error) {
        console.error("Clear cart error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};
//# sourceMappingURL=cart.controller.js.map