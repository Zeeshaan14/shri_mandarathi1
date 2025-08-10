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
                variations: {
                    create: variations, // Expect array of { size, price, stock, sku?, imageUrl? }
                },
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
export const getProducts = async (req, res) => {
    try {
        const products = await prisma1.product.findMany({
            include: { category: true, variations: true },
        });
        res.json(products);
    }
    catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
//# sourceMappingURL=product.controller.js.map