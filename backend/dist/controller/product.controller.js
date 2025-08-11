import { prisma1 } from "../utils/prisma.js";
// Create Product
export const createProduct = async (req, res) => {
    try {
        const { name, description, categoryId, imageUrl, variations } = req.body;
        // 1. Check for duplicate SKUs in the request
        const skus = (variations || []).map((v) => v.sku).filter((sku) => sku);
        const uniqueSkus = new Set(skus);
        if (skus.length !== uniqueSkus.size) {
            return res.status(400).json({ message: "Duplicate SKUs found in variations. Each SKU must be unique." });
        }
        // 2. Check for existing SKUs in the database
        if (skus.length > 0) {
            const existing = await prisma1.productVariant.findMany({ where: { sku: { in: skus } }, select: { sku: true } });
            if (existing.length > 0) {
                return res.status(400).json({ message: `The following SKUs already exist: ${existing.map(e => e.sku).join(", ")}` });
            }
        }
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
        res.status(500).json({ message: err?.message || "Server error", error: err });
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
        // Fetch all existing variants for this product
        const existingVariants = await prisma1.productVariant.findMany({ where: { productId: id } });
        const existingVariantIds = existingVariants.map(v => v.id);
        // Find which variants are referenced in OrderItem
        const referencedVariants = await prisma1.orderItem.findMany({
            where: { variantId: { in: existingVariantIds } },
            select: { variantId: true },
        });
        const referencedVariantIds = new Set(referencedVariants.map(v => v.variantId));
        const incomingBySku = Object.fromEntries((variations || []).filter((v) => v.sku).map((v) => [v.sku, v]));
        const toDelete = existingVariants.filter((v) => !referencedVariantIds.has(v.id) && (!v.sku || !incomingBySku[v.sku]));
        const toUpdate = existingVariants.filter((v) => referencedVariantIds.has(v.id) && v.sku && incomingBySku[v.sku]);
        const toCreate = (variations || []).filter((v) => !v.sku || !existingVariants.some((ev) => ev.sku === v.sku));
        // 1. Delete variants not referenced in OrderItem and not present in new list
        for (const v of toDelete) {
            await prisma1.productVariant.delete({ where: { id: v.id } });
        }
        // 2. Update referenced variants (only allowed fields)
        for (const v of toUpdate) {
            if (!v.sku)
                continue;
            const newData = incomingBySku[v.sku];
            if (!newData)
                continue;
            await prisma1.productVariant.update({
                where: { id: v.id },
                data: {
                    size: newData.size,
                    price: newData.price,
                    stock: newData.stock,
                    imageUrl: typeof newData.imageUrl === "undefined" ? null : newData.imageUrl,
                },
            });
        }
        // 3. Create new variants
        for (const v of toCreate) {
            await prisma1.productVariant.create({
                data: {
                    productId: id,
                    size: v.size,
                    price: v.price,
                    stock: v.stock,
                    sku: v.sku,
                    imageUrl: v.imageUrl,
                },
            });
        }
        // 4. Update product fields
        const product = await prisma1.product.update({
            where: { id: id },
            data: {
                name,
                description,
                categoryId,
                imageUrl,
            },
            include: { variations: true },
        });
        res.json(product);
    }
    catch (err) {
        console.error("[UPDATE_PRODUCT_ERROR]", err);
        res.status(500).json({ message: err?.message || "Server error", error: err });
    }
};
// Delete Product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Product ID is required" });
        }
        // First, delete all ProductVariant records for this product
        await prisma1.productVariant.deleteMany({ where: { productId: id } });
        // Then, delete the product itself
        await prisma1.product.delete({ where: { id: id } });
        res.json({ message: "Product deleted" });
    }
    catch (err) {
        console.error("[DELETE_PRODUCT_ERROR]", err);
        res.status(500).json({ message: "Server error" });
    }
};
//# sourceMappingURL=product.controller.js.map