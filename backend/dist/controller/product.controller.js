import { prisma1 } from "../utils/prisma.js";
import { IMAGEKIT_ENABLED, uploadToImageKit } from "../utils/imagekit.js";
import fs from "fs";
import path from "path";
// Create Product
export const createProduct = async (req, res) => {
    try {
        // Debug: Log the entire request body
        console.log("🔍 CREATE_PRODUCT - Request body:", req.body);
        console.log("🔍 CREATE_PRODUCT - Request body keys:", Object.keys(req.body));
        console.log("🔍 CREATE_PRODUCT - name:", req.body.name);
        console.log("🔍 CREATE_PRODUCT - description:", req.body.description);
        console.log("🔍 CREATE_PRODUCT - categoryId:", req.body.categoryId);
        console.log("🔍 CREATE_PRODUCT - variations:", req.body.variations);
        // Additional debugging for multipart form data
        console.log("🔍 CREATE_PRODUCT - Request headers:", req.headers);
        console.log("🔍 CREATE_PRODUCT - Content-Type:", req.headers['content-type']);
        console.log("🔍 CREATE_PRODUCT - Files:", req.files);
        const { name, description, categoryId } = req.body;
        // Additional debugging for form data
        console.log("🔍 CREATE_PRODUCT - Form data analysis:");
        console.log("  - req.body type:", typeof req.body);
        console.log("  - req.body keys:", Object.keys(req.body));
        console.log("  - name type:", typeof name, "value:", name);
        console.log("  - description type:", typeof description, "value:", description);
        console.log("  - categoryId type:", typeof categoryId, "value:", categoryId);
        // Validation
        if (!name || !categoryId) {
            console.log("❌ CREATE_PRODUCT - Validation failed:");
            console.log("  - name:", name, "| valid:", !!name);
            console.log("  - description:", description, "| valid:", true); // Description can be empty
            console.log("  - categoryId:", categoryId, "| valid:", !!categoryId);
            return res.status(400).json({
                status: false,
                message: "Product name and category are required"
            });
        }
        // variations can arrive as JSON string when multipart/form-data is used
        let variationsRaw = req.body?.variations;
        if (typeof variationsRaw === "string") {
            try {
                variationsRaw = JSON.parse(variationsRaw);
            }
            catch {
                return res.status(400).json({
                    status: false,
                    message: "Invalid variations format. Please check your data."
                });
            }
        }
        const variations = Array.isArray(variationsRaw) ? variationsRaw : [];
        if (variations.length === 0) {
            return res.status(400).json({
                status: false,
                message: "At least one product variation is required"
            });
        }
        let imageUrl;
        // Upload main product image if provided
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const imageFile = req.files.find(file => file.fieldname === 'image');
            if (imageFile) {
                console.log(`📁 Processing image upload: ${imageFile.originalname} (${imageFile.size} bytes)`);
                try {
                    if (IMAGEKIT_ENABLED) {
                        console.log('🖼️ Using ImageKit for image upload');
                        const result = await uploadToImageKit(imageFile.buffer, imageFile.originalname, "products");
                        imageUrl = result.url;
                        console.log(`✅ Image uploaded to ImageKit: ${imageUrl}`);
                    }
                    else {
                        console.log('💾 Using local storage for image upload');
                        // Local file path (served from /uploads)
                        // @ts-ignore multer adds path when using diskStorage
                        const localPath = imageFile.path;
                        if (!localPath) {
                            throw new Error("Local upload path missing");
                        }
                        const fileName = localPath.split("uploads").pop()?.replace(/^[/\\]/, "");
                        const baseUrl = `${req.protocol}://${req.get("host")}`;
                        imageUrl = `${baseUrl}/uploads/${fileName}`;
                        console.log(`✅ Image saved locally: ${imageUrl}`);
                    }
                }
                catch (e) {
                    console.error("❌ Primary upload method failed:", e?.message || e);
                    // Only run fallback if ImageKit was enabled and failed
                    if (IMAGEKIT_ENABLED) {
                        console.log('🔄 ImageKit failed, attempting local storage fallback...');
                        try {
                            const uploadDir = path.join(process.cwd(), "uploads");
                            if (!fs.existsSync(uploadDir))
                                fs.mkdirSync(uploadDir, { recursive: true });
                            const ext = path.extname(imageFile.originalname) || ".bin";
                            const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
                            const fullPath = path.join(uploadDir, fileName);
                            await fs.promises.writeFile(fullPath, imageFile.buffer);
                            const baseUrl = `${req.protocol}://${req.get("host")}`;
                            imageUrl = `${baseUrl}/uploads/${fileName}`;
                            console.log(`✅ Fallback local upload successful: ${imageUrl}`);
                        }
                        catch (diskErr) {
                            console.error("❌ Local upload fallback also failed:", diskErr?.message || diskErr);
                            return res.status(500).json({
                                status: false,
                                message: "Image upload failed. Please try again later.",
                                error: diskErr?.message || "Unknown error"
                            });
                        }
                    }
                    else {
                        // If local storage was the primary method and it failed, return error
                        return res.status(500).json({
                            status: false,
                            message: "Image upload failed. Please try again later.",
                            error: e?.message || "Unknown error"
                        });
                    }
                }
            }
        }
        // Normalize types and validate
        const normalizedVariations = (variations || []).map((v) => ({
            size: v.size,
            price: Number(v.price),
            stock: Number(v.stock),
            sku: v.sku || null,
        }));
        if (normalizedVariations.some((v) => !v.size || Number.isNaN(v.price) || Number.isNaN(v.stock))) {
            return res.status(400).json({
                status: false,
                message: "Invalid variations data. Please check size, price, and stock values."
            });
        }
        if (normalizedVariations.some((v) => v.price <= 0)) {
            return res.status(400).json({
                status: false,
                message: "Product price must be greater than zero"
            });
        }
        if (normalizedVariations.some((v) => v.stock < 0)) {
            return res.status(400).json({
                status: false,
                message: "Product stock cannot be negative"
            });
        }
        // Check duplicate SKUs
        const skus = normalizedVariations.map((v) => v.sku).filter(Boolean);
        const uniqueSkus = new Set(skus);
        if (skus.length !== uniqueSkus.size) {
            return res.status(400).json({
                status: false,
                message: "Duplicate SKUs found. Each variation must have a unique SKU."
            });
        }
        // Check existing SKUs in DB
        if (skus.length > 0) {
            const existing = await prisma1.productVariant.findMany({
                where: { sku: { in: skus } },
                select: { sku: true },
            });
            if (existing.length > 0) {
                return res.status(400).json({
                    status: false,
                    message: `The following SKUs already exist: ${existing.map((e) => e.sku).join(", ")}`,
                });
            }
        }
        const category = await prisma1.category.findUnique({ where: { id: categoryId } });
        if (!category) {
            return res.status(404).json({
                status: false,
                message: "Selected category not found"
            });
        }
        // Log the final imageUrl that will be saved to database
        console.log(`💾 Saving product to database with imageUrl: ${imageUrl}`);
        const product = await prisma1.product.create({
            data: {
                name: name,
                description: description || "", // Ensure description is never undefined
                category: { connect: { id: categoryId } },
                imageUrl: imageUrl ?? null,
                variations: { create: normalizedVariations },
            },
            include: { variations: true },
        });
        res.status(201).json({
            status: true,
            message: "Product created successfully",
            product
        });
    }
    catch (err) {
        console.error("[CREATE_PRODUCT_ERROR]", err);
        res.status(500).json({
            status: false,
            message: "Failed to create product. Please try again later."
        });
    }
};
// Get All Products
export const getProducts = async (_, res) => {
    try {
        const products = await prisma1.product.findMany({
            include: { category: true, variations: true },
        });
        res.json({
            status: true,
            products
        });
    }
    catch (err) {
        console.error("[GET_PRODUCTS_ERROR]", err);
        res.status(500).json({
            status: false,
            message: "Failed to fetch products. Please try again later."
        });
    }
};
// Get Product by ID
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                status: false,
                message: "Product ID is required"
            });
        }
        const product = await prisma1.product.findUnique({
            where: { id: id },
            include: { category: true, variations: true },
        });
        if (!product) {
            return res.status(404).json({
                status: false,
                message: "Product not found"
            });
        }
        res.json({
            status: true,
            product
        });
    }
    catch (err) {
        console.error("[GET_PRODUCT_BY_ID_ERROR]", err);
        res.status(500).json({
            status: false,
            message: "Failed to fetch product. Please try again later."
        });
    }
};
// Update Product
export const updateProduct = async (req, res) => {
    try {
        const { name, description, categoryId, imageUrl, variations } = req.body;
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                status: false,
                message: "Product ID is required"
            });
        }
        if (!name || !categoryId) {
            return res.status(400).json({
                status: false,
                message: "Product name and category are required"
            });
        }
        // Check if product exists
        const existingProduct = await prisma1.product.findUnique({ where: { id } });
        if (!existingProduct) {
            return res.status(404).json({
                status: false,
                message: "Product not found"
            });
        }
        let newImageUrl = imageUrl; // Default to existing imageUrl from request body
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const imageFile = req.files.find(file => file.fieldname === 'image');
            if (imageFile) {
                console.log(`📁 Processing image update: ${imageFile.originalname} (${imageFile.size} bytes)`);
                try {
                    if (IMAGEKIT_ENABLED) {
                        console.log('🖼️ Using ImageKit for image update');
                        const result = await uploadToImageKit(imageFile.buffer, imageFile.originalname, "products");
                        newImageUrl = result.url;
                        console.log(`✅ Image updated on ImageKit: ${newImageUrl}`);
                    }
                    else {
                        console.log('💾 Using local storage for image update');
                        // Local file path (served from /uploads)
                        const uploadDir = path.join(process.cwd(), "uploads");
                        if (!fs.existsSync(uploadDir))
                            fs.mkdirSync(uploadDir, { recursive: true });
                        const ext = path.extname(imageFile.originalname) || ".bin";
                        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
                        const fullPath = path.join(uploadDir, fileName);
                        await fs.promises.writeFile(fullPath, imageFile.buffer);
                        const baseUrl = `${req.protocol}://${req.get("host")}`;
                        newImageUrl = `${baseUrl}/uploads/${fileName}`;
                        console.log(`✅ Image updated locally: ${newImageUrl}`);
                    }
                }
                catch (e) {
                    console.error("❌ Image update failed:", e?.message || e);
                    return res.status(500).json({
                        status: false,
                        message: "Image update failed. Please try again later.",
                        error: e?.message || "Unknown error"
                    });
                }
            }
        }
        else {
            // No new file uploaded, keep existing imageUrl
            console.log(`📷 No new image uploaded, keeping existing imageUrl: ${newImageUrl}`);
        }
        // Log the final newImageUrl that will be saved to database
        console.log(`💾 Updating product in database with newImageUrl: ${newImageUrl}`);
        const existingVariants = await prisma1.productVariant.findMany({ where: { productId: id } });
        const existingVariantIds = existingVariants.map((v) => v.id);
        const referencedOrderVariants = await prisma1.orderItem.findMany({
            where: { variantId: { in: existingVariantIds } },
            select: { variantId: true },
        });
        const referencedCartVariants = await prisma1.cartItem.findMany({
            where: { variantId: { in: existingVariantIds } },
            select: { variantId: true },
        });
        const referencedVariantIds = new Set([
            ...referencedOrderVariants.map((v) => v.variantId),
            ...referencedCartVariants.map((v) => v.variantId),
        ]);
        const incomingBySku = Object.fromEntries((variations || []).filter((v) => v.sku).map((v) => [v.sku, v]));
        const toDelete = existingVariants.filter((v) => !referencedVariantIds.has(v.id) && (!v.sku || !incomingBySku[v.sku]));
        const toUpdate = existingVariants.filter((v) => referencedVariantIds.has(v.id) && v.sku && incomingBySku[v.sku]);
        const toCreate = (variations || []).filter((v) => !v.sku || !existingVariants.some((ev) => ev.sku === v.sku));
        for (const v of toDelete) {
            await prisma1.productVariant.delete({ where: { id: v.id } });
        }
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
                    imageUrl: newData.imageUrl ?? null,
                },
            });
        }
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
        const product = await prisma1.product.update({
            where: { id },
            data: {
                name,
                description: description || "", // Ensure description is never undefined
                categoryId,
                imageUrl: newImageUrl,
            },
            include: { variations: true },
        });
        res.json({
            status: true,
            message: "Product updated successfully",
            product
        });
    }
    catch (err) {
        console.error("[UPDATE_PRODUCT_ERROR]", err);
        res.status(500).json({
            status: false,
            message: "Failed to update product. Please try again later."
        });
    }
};
// Delete Product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                status: false,
                message: "Product ID is required"
            });
        }
        // Check if product exists
        const existingProduct = await prisma1.product.findUnique({ where: { id } });
        if (!existingProduct) {
            return res.status(404).json({
                status: false,
                message: "Product not found"
            });
        }
        // Gather variant ids for this product
        const variants = await prisma1.productVariant.findMany({
            where: { productId: id },
            select: { id: true },
        });
        const variantIds = variants.map((v) => v.id);
        // Clear from carts first (safe to delete)
        if (variantIds.length > 0) {
            await prisma1.cartItem.deleteMany({ where: { variantId: { in: variantIds } } });
        }
        // Block delete if any referencing order is not DELIVERED or CANCELLED
        if (variantIds.length > 0) {
            const activeOrderRefs = await prisma1.orderItem.findMany({
                where: {
                    variantId: { in: variantIds },
                    order: {
                        NOT: {
                            status: { in: ["DELIVERED", "CANCELLED"] }
                        }
                    }
                },
                select: { id: true, orderId: true, order: { select: { status: true } } },
            });
            if (activeOrderRefs.length > 0) {
                const blockingOrders = activeOrderRefs.map((ref) => ({ orderId: ref.orderId, status: ref.order?.status })).filter(Boolean);
                return res.status(409).json({
                    status: false,
                    message: "Cannot delete product: It has active order history. Consider disabling/hiding it instead.",
                    blockingOrders,
                });
            }
        }
        // Delete OrderItems for delivered/cancelled orders referencing these variants
        if (variantIds.length > 0) {
            await prisma1.orderItem.deleteMany({
                where: {
                    variantId: { in: variantIds },
                    order: {
                        status: { in: ["DELIVERED", "CANCELLED"] }
                    }
                }
            });
        }
        // Safe to delete variants and product
        await prisma1.productVariant.deleteMany({ where: { productId: id } });
        await prisma1.product.delete({ where: { id } });
        res.json({
            status: true,
            message: "Product deleted successfully"
        });
    }
    catch (err) {
        console.error("[DELETE_PRODUCT_ERROR]", err);
        res.status(500).json({
            status: false,
            message: "Failed to delete product. Please try again later."
        });
    }
};
//# sourceMappingURL=product.controller.js.map