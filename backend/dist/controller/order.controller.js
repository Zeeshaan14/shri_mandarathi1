import { prisma1 } from "../utils/prisma.js";
// Create a new order
export const createOrder = async (req, res) => {
    const { items, shipping } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
    }
    if (!items || items.length === 0) {
        return res.status(400).json({ message: "No items in order" });
    }
    if (!shipping || !shipping.fullName || !shipping.phone || !shipping.line1 || !shipping.city || !shipping.state || !shipping.postalCode || !shipping.country) {
        return res.status(400).json({ message: "Missing shipping details" });
    }
    try {
        const order = await prisma1.$transaction(async (tx) => {
            let total = 0;
            const orderItemsData = [];
            for (const item of items) {
                const variant = await tx.productVariant.findUnique({
                    where: { id: item.variantId },
                });
                if (!variant) {
                    throw new Error(`Variant not found: ${item.variantId}`);
                }
                if (variant.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${variant.id}`);
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
                    items: { include: { variant: true } },
                },
            });
            return newOrder;
        });
        res.status(201).json(order);
    }
    catch (error) {
        console.error("[CREATE_ORDER_ERROR]", error.message);
        res.status(500).json({ message: error.message });
    }
};
// Cancel order + rollback stock
export const cancelOrder = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    if (!id) {
        return res.status(400).json({ message: "Order ID is required" });
    }
    try {
        const updatedOrder = await prisma1.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id },
                include: { items: true }, // include items to access order.items
            });
            if (!order)
                throw new Error("Order not found");
            if (order.status === "CANCELLED")
                throw new Error("Order already cancelled");
            if (user.role !== "ADMIN" && order.userId !== user.id) {
                throw new Error("Not authorized to cancel this order");
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
        res.json(updatedOrder);
    }
    catch (error) {
        console.error("[CANCEL_ORDER_ERROR]", error.message);
        res.status(500).json({ message: error.message });
    }
};
// Get all orders
export const getOrders = async (req, res) => {
    const user = req.user;
    try {
        const orders = await prisma1.order.findMany({
            where: user.role === "ADMIN" ? {} : { userId: user.id },
            include: { items: { include: { variant: true } } },
        });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Get single order
export const getOrderById = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    if (!id) {
        return res.status(400).json({ message: "Order ID is required" });
    }
    try {
        const order = await prisma1.order.findUnique({
            where: { id },
            include: { items: { include: { variant: true } } },
        });
        if (!order)
            return res.status(404).json({ message: "Order not found" });
        if (user.role !== "ADMIN" && order.userId !== user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Update order status (Admin only)
export const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!id) {
        return res.status(400).json({ message: "Order ID is required" });
    }
    try {
        const order = await prisma1.order.update({
            where: { id },
            data: { status },
            include: { items: true }, // Include items to avoid undefined later if accessed
        });
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//# sourceMappingURL=order.controller.js.map