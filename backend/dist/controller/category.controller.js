import { prisma1 } from "../utils/prisma.js";
// Create Category
export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const existing = await prisma1.category.findUnique({ where: { name } });
        if (existing) {
            return res.status(400).json({ message: "Category already exists" });
        }
        const category = await prisma1.category.create({
            data: { name },
        });
        res.status(201).json(category);
    }
    catch (err) {
        console.error("[CREATE_CATEGORY_ERROR]", err);
        res.status(500).json({ message: "Server error" });
    }
};
// Get All Categories
export const getCategories = async (req, res) => {
    try {
        const categories = await prisma1.category.findMany();
        res.json(categories);
    }
    catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
//# sourceMappingURL=category.controller.js.map