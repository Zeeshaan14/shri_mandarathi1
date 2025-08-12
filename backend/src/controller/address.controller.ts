import type { Request, Response } from "express";
import { prisma1 } from "../utils/prisma.js";

export const listAddresses = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId as string | undefined
  if (!userId) return res.status(401).json({ message: "Unauthorized" })
  try {
    const addresses = await prisma1.address.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })
    res.json(addresses)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const createAddress = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId as string | undefined
  if (!userId) return res.status(401).json({ message: "Unauthorized" })
  const { label, fullName, phone, line1, line2, city, state, postalCode, country, isDefault } = req.body || {}
  if (!fullName || !phone || !line1 || !city || !state || !postalCode || !country) {
    return res.status(400).json({ message: "Missing required fields" })
  }
  try {
    if (isDefault) {
      await prisma1.address.updateMany({ where: { userId }, data: { isDefault: false } })
    }
    const address = await prisma1.address.create({
      data: { userId, label, fullName, phone, line1, line2, city, state, postalCode, country, isDefault: !!isDefault },
    })
    res.status(201).json(address)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const updateAddress = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId as string | undefined
  const { id } = req.params
  if (!userId) return res.status(401).json({ message: "Unauthorized" })
  if (!id) return res.status(400).json({ message: "Address ID is required" })
  const { label, fullName, phone, line1, line2, city, state, postalCode, country, isDefault } = req.body || {}
  try {
    const existing = await prisma1.address.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) return res.status(404).json({ message: "Address not found" })
    if (isDefault) {
      await prisma1.address.updateMany({ where: { userId }, data: { isDefault: false } })
    }
    const address = await prisma1.address.update({
      where: { id },
      data: { label, fullName, phone, line1, line2, city, state, postalCode, country, isDefault: !!isDefault },
    })
    res.json(address)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteAddress = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId as string | undefined
  const { id } = req.params
  if (!userId) return res.status(401).json({ message: "Unauthorized" })
  if (!id) return res.status(400).json({ message: "Address ID is required" })
  try {
    const existing = await prisma1.address.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) return res.status(404).json({ message: "Address not found" })
    await prisma1.address.delete({ where: { id } })
    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}


