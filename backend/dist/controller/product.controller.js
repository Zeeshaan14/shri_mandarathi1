import { prisma1 } from "../utils/prisma.js";
// Create Product
export const createProduct = async (req, res) => {
    try {
        const { name, description, categoryId, imageUrl, variations } = req.body;
        const category = await prisma1.category.findUnique({ where: { id: categoryId } });
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        const product = await prisma1.product.create({
            data: {
                name,
                description,
                categoryId,
                imageUrl,
                variations: { create: variations },
            },
            include: { variations: true },
        });
        res.status(201).json(product);
    }
    catch (err) {
        console.error("[CREATE_PRODUCT_ERROR]", err);
        res.status(500).json({ message: "Server error" });
    }
};
// Get All Products
export const getProducts = async (_, res) => {
    try {
        const products = await prisma1.product.findMany({
            include: { category: true, variations: true },
        });
        res.json(products);
    }
    catch {
        res.status(500).json({ message: "Server error" });
    }
};
// Get Product by ID
export const getProductById = async (req, res) => {
    try {
        const product = await prisma1.product.findUnique({
            where: { id: req.params.id },
            include: { category: true, variations: true },
        });
        if (!product)
            return res.status(404).json({ message: "Product not found" });
        res.json(product);
    }
    catch {
        res.status(500).json({ message: "Server error" });
    }
};
// Update Product
export const updateProduct = async (req, res) => {
    try {
        const { name, description, categoryId, imageUrl, variations } = req.body;
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Product ID is required" });
        }
        const product = await prisma1.product.update({
            where: { id: id },
            data: {
                name,
                description,
                categoryId,
                imageUrl,
                variations: {
                    deleteMany: {}, // remove old
                    create: variations, // add new
                },
            },
            include: { variations: true },
        });
        res.json(product);
    }
    catch (err) {
        console.error("[UPDATE_PRODUCT_ERROR]", err);
        res.status(500).json({ message: "Server error" });
    }
};
// Delete Product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Product ID is required" });
        }
        await prisma1.product.delete({ where: { id: id } });
        res.json({ message: "Product deleted" });
    }
    catch {
        res.status(500).json({ message: "Server error" });
    }
};
//# sourceMappingURL=product.controller.js.map