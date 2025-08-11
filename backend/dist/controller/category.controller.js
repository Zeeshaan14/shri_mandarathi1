import { prisma1 } from "../utils/prisma.js";
// Create Category
export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const existing = await prisma1.category.findUnique({ where: { name } });
        if (existing) {
            return res.status(400).json({ message: "Category already exists" });
        }
        const category = await prisma1.category.create({ data: { name } });
        res.status(201).json(category);
    }
    catch (err) {
        console.error("[CREATE_CATEGORY_ERROR]", err);
        res.status(500).json({ message: "Server error" });
    }
};
// Get All Categories
export const getCategories = async (_, res) => {
    try {
        const categories = await prisma1.category.findMany();
        res.json(categories);
    }
    catch {
        res.status(500).json({ message: "Server error" });
    }
};
// Get Category by ID
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Category ID is required" });
        }
        const category = await prisma1.category.findUnique({
            where: { id },
            include: { products: true },
        });
        if (!category)
            return res.status(404).json({ message: "Category not found" });
        res.json(category);
    }
    catch {
        res.status(500).json({ message: "Server error" });
    }
};
// Update Category
export const updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Category ID is required" });
        }
        const category = await prisma1.category.update({
            where: { id },
            data: { name },
        });
        res.json(category);
    }
    catch {
        res.status(500).json({ message: "Server error" });
    }
};
// Delete Category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Category ID is required" });
        }
        await prisma1.category.delete({ where: { id } });
        res.json({ message: "Category deleted" });
    }
    catch {
        res.status(500).json({ message: "Server error" });
    }
};
//# sourceMappingURL=category.controller.js.map