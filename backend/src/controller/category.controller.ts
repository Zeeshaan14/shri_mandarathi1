import type { Request, Response } from "express";
import { prisma1 } from "../utils/prisma.js";

// Create Category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        status: false,
        message: "Category name is required" 
      });
    }

    const existing = await prisma1.category.findUnique({ where: { name: name.trim() } });
    if (existing) {
      return res.status(400).json({ 
        status: false,
        message: "A category with this name already exists" 
      });
    }
    
    const category = await prisma1.category.create({ data: { name: name.trim() } });
    res.status(201).json({
      status: true,
      message: "Category created successfully",
      category
    });
  } catch (err) {
    console.error("[CREATE_CATEGORY_ERROR]", err);
    res.status(500).json({ 
      status: false,
      message: "Failed to create category. Please try again later." 
    });
  }
};

// Get All Categories
export const getCategories = async (_: Request, res: Response) => {
  try {
    const categories = await prisma1.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({
      status: true,
      categories
    });
  } catch (err) {
    console.error("[GET_CATEGORIES_ERROR]", err);
    res.status(500).json({ 
      status: false,
      message: "Failed to fetch categories. Please try again later." 
    });
  }
};

// Get Category by ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ 
        status: false,
        message: "Category ID is required" 
      });
    }
    
    const category = await prisma1.category.findUnique({
      where: { id },
      include: { products: true },
    });
    
    if (!category) {
      return res.status(404).json({ 
        status: false,
        message: "Category not found" 
      });
    }
    
    res.json({
      status: true,
      category
    });
  } catch (err) {
    console.error("[GET_CATEGORY_BY_ID_ERROR]", err);
    res.status(500).json({ 
      status: false,
      message: "Failed to fetch category. Please try again later." 
    });
  }
};

// Update Category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        status: false,
        message: "Category ID is required" 
      });
    }

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        status: false,
        message: "Category name is required" 
      });
    }

    // Check if category exists
    const existingCategory = await prisma1.category.findUnique({ where: { id } });
    if (!existingCategory) {
      return res.status(404).json({ 
        status: false,
        message: "Category not found" 
      });
    }

    // Check if name already exists (excluding current category)
    const duplicateName = await prisma1.category.findFirst({
      where: { 
        name: name.trim(),
        id: { not: id }
      }
    });
    
    if (duplicateName) {
      return res.status(400).json({ 
        status: false,
        message: "A category with this name already exists" 
      });
    }

    const category = await prisma1.category.update({
      where: { id },
      data: { name: name.trim() },
    });
    
    res.json({
      status: true,
      message: "Category updated successfully",
      category
    });
  } catch (err) {
    console.error("[UPDATE_CATEGORY_ERROR]", err);
    res.status(500).json({ 
      status: false,
      message: "Failed to update category. Please try again later." 
    });
  }
};

// Delete Category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        status: false,
        message: "Category ID is required" 
      });
    }

    // Check if category exists
    const existingCategory = await prisma1.category.findUnique({ 
      where: { id },
      include: { products: true }
    });
    
    if (!existingCategory) {
      return res.status(404).json({ 
        status: false,
        message: "Category not found" 
      });
    }

    // Check if category has products
    if (existingCategory.products && existingCategory.products.length > 0) {
      return res.status(409).json({ 
        status: false,
        message: "Cannot delete category: It contains products. Please remove or reassign products first." 
      });
    }

    await prisma1.category.delete({ where: { id } });
    res.json({ 
      status: true,
      message: "Category deleted successfully" 
    });
  } catch (err) {
    console.error("[DELETE_CATEGORY_ERROR]", err);
    res.status(500).json({ 
      status: false,
      message: "Failed to delete category. Please try again later." 
    });
  }
};
