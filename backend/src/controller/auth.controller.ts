import type { Request, Response } from "express";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma1 } from "../utils/prisma.js";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        status: false, 
        message: "Name, email, and password are required" 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        status: false, 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        status: false, 
        message: "Please provide a valid email address" 
      });
    }

    const existingUser = await prisma1.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        status: false, 
        message: "An account with this email already exists" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma1.user.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(201).json({ 
      status: true, 
      message: "Account created successfully! You can now login.", 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ 
      status: false, 
      message: "Failed to create account. Please try again later." 
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        status: false, 
        message: "Email and password are required" 
      });
    }

    const user = await prisma1.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        status: false, 
        message: "Invalid email or password" 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        status: false, 
        message: "Invalid email or password" 
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      status: true,
      message: "Login successful! Welcome back.",
      token, // frontend stores in localStorage
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      status: false, 
      message: "Login failed. Please try again later." 
    });
  }
};
