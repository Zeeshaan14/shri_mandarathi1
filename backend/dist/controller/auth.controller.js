import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma1 } from "../utils/prisma.js";
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await prisma1.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ status: false, message: "Email already in use" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma1.user.create({
            data: { name, email, password: hashedPassword },
        });
        res.status(201).json({ status: true, message: "User registered successfully", user });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: "Server error" });
    }
};
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma1.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ status: false, message: "User not found" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ status: false, message: "Invalid credentials" });
        }
        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(200).json({
            status: true,
            message: "Login successful",
            token, // frontend stores in localStorage
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: "Server error" });
    }
};
//# sourceMappingURL=auth.controller.js.map