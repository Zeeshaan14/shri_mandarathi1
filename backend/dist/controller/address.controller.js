import { prisma1 } from "../utils/prisma.js";
export const listAddresses = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                status: false,
                message: "Authentication required"
            });
        }
        const addresses = await prisma1.address.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });
        res.json({
            status: true,
            addresses,
            totalAddresses: addresses.length
        });
    }
    catch (error) {
        console.error("[LIST_ADDRESSES_ERROR]", error);
        res.status(500).json({
            status: false,
            message: "Failed to fetch addresses. Please try again later."
        });
    }
};
export const createAddress = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                status: false,
                message: "Authentication required"
            });
        }
        const { label, fullName, phone, line1, line2, city, state, postalCode, country, isDefault } = req.body || {};
        if (!fullName || !phone || !line1 || !city || !state || !postalCode || !country) {
            return res.status(400).json({
                status: false,
                message: "Missing required fields: fullName, phone, line1, city, state, postalCode, and country are required"
            });
        }
        // Validate phone number format
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            return res.status(400).json({
                status: false,
                message: "Please provide a valid phone number"
            });
        }
        if (isDefault) {
            await prisma1.address.updateMany({
                where: { userId },
                data: { isDefault: false }
            });
        }
        const address = await prisma1.address.create({
            data: {
                userId,
                label,
                fullName,
                phone,
                line1,
                line2,
                city,
                state,
                postalCode,
                country,
                isDefault: !!isDefault
            },
        });
        res.status(201).json({
            status: true,
            message: "Address added successfully",
            address
        });
    }
    catch (error) {
        console.error("[CREATE_ADDRESS_ERROR]", error);
        res.status(500).json({
            status: false,
            message: "Failed to create address. Please try again later."
        });
    }
};
export const updateAddress = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        if (!userId) {
            return res.status(401).json({
                status: false,
                message: "Authentication required"
            });
        }
        if (!id) {
            return res.status(400).json({
                status: false,
                message: "Address ID is required"
            });
        }
        const { label, fullName, phone, line1, line2, city, state, postalCode, country, isDefault } = req.body || {};
        if (!fullName || !phone || !line1 || !city || !state || !postalCode || !country) {
            return res.status(400).json({
                status: false,
                message: "Missing required fields: fullName, phone, line1, city, state, postalCode, and country are required"
            });
        }
        // Validate phone number format
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            return res.status(400).json({
                status: false,
                message: "Please provide a valid phone number"
            });
        }
        const existing = await prisma1.address.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            return res.status(404).json({
                status: false,
                message: "Address not found"
            });
        }
        if (isDefault) {
            await prisma1.address.updateMany({
                where: { userId },
                data: { isDefault: false }
            });
        }
        const address = await prisma1.address.update({
            where: { id },
            data: {
                label,
                fullName,
                phone,
                line1,
                line2,
                city,
                state,
                postalCode,
                country,
                isDefault: !!isDefault
            },
        });
        res.json({
            status: true,
            message: "Address updated successfully",
            address
        });
    }
    catch (error) {
        console.error("[UPDATE_ADDRESS_ERROR]", error);
        res.status(500).json({
            status: false,
            message: "Failed to update address. Please try again later."
        });
    }
};
export const deleteAddress = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        if (!userId) {
            return res.status(401).json({
                status: false,
                message: "Authentication required"
            });
        }
        if (!id) {
            return res.status(400).json({
                status: false,
                message: "Address ID is required"
            });
        }
        const existing = await prisma1.address.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            return res.status(404).json({
                status: false,
                message: "Address not found"
            });
        }
        await prisma1.address.delete({ where: { id } });
        res.json({
            status: true,
            message: "Address deleted successfully"
        });
    }
    catch (error) {
        console.error("[DELETE_ADDRESS_ERROR]", error);
        res.status(500).json({
            status: false,
            message: "Failed to delete address. Please try again later."
        });
    }
};
//# sourceMappingURL=address.controller.js.map