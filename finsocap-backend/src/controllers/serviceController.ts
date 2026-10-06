import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

// 1. GET ALL SERVICES (Catalog)
export const getAllServices = async (req: Request, res: Response) => {
  try {
    const { category, status } = req.query;

    const where: any = {};
    if (category && category !== "ALL") where.category = String(category);
    if (status && status !== "ALL") where.status = String(status);

    const services = await prisma.service.findMany({
      where,
      orderBy: { id: "asc" },
    });

    return res.json({ success: true, count: services.length, data: services });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 2. CREATE SERVICE
export const createService = async (req: Request, res: Response) => {
  try {
    const { name, category, recurring, frequency, price, gov, time, status, description } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: "Service name and category are required." });
    }

    const service = await prisma.service.create({
      data: {
        name: name.trim(),
        category: category.trim(),
        recurring: Boolean(recurring),
        frequency: frequency || "One Time",
        price: Number(price) || 0,
        gov: Number(gov) || 0,
        time: time || "3 - 5 Days",
        status: status || "Active",
        description,
      },
    });

    return res.status(201).json({ success: true, message: "Service created", data: service });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 3. UPDATE SERVICE
export const updateService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const service = await prisma.service.update({
      where: { id: Number(id) },
      data: updates,
    });

    return res.json({ success: true, message: "Service updated", data: service });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 4. TOGGLE / DELETE SERVICE
export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.service.delete({ where: { id: Number(id) } });
    return res.json({ success: true, message: "Service deleted" });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
