import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";

// ===================================================
// CLIENTS CONTROLLER
// ===================================================
export const getAllClients = async (req: Request, res: Response) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return res.json({ success: true, count: clients.length, data: clients });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createClient = async (req: Request, res: Response) => {
  try {
    const { name, phone, business, partner, partnerId, status } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: "Client name and phone are required." });
    }

    const todayStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const client = await prisma.client.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        business: business || name.trim(),
        partner: partner || "Direct",
        partnerId,
        tasks: 0,
        last: todayStr,
        status: status || "Active",
      },
    });

    return res.status(201).json({ success: true, message: "Client created", data: client });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const client = await prisma.client.update({
      where: { id },
      data: req.body,
    });
    return res.json({ success: true, message: "Client updated", data: client });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ===================================================
// LICENCES CONTROLLER
// ===================================================
export const getAllLicences = async (req: Request, res: Response) => {
  try {
    const licences = await prisma.licence.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, count: licences.length, data: licences });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateLicence = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const licence = await prisma.licence.update({
      where: { id },
      data: req.body,
    });
    return res.json({ success: true, message: "Licence updated", data: licence });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteLicence = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.licence.delete({ where: { id } });
    return res.json({ success: true, message: "Licence deleted" });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ===================================================
// USERS / TEAM CONTROLLER
// ===================================================
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        dept: true,
        skill: true,
        skills: true,
        status: true,
        access: true,
        _count: { select: { assignedTasks: true } },
      },
      orderBy: { id: "asc" },
    });

    const formatted = users.map((u) => ({
      ...u,
      tasks: u._count.assignedTasks,
      skills: u.skills ? u.skills.split(",").map((s) => s.trim()) : [u.skill],
    }));

    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role, dept, skill, skills, access } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: "Name, email, and phone are required." });
    }

    const hashedPassword = await bcrypt.hash(password || "Password@123", 10);
    const skillsStr = Array.isArray(skills) ? skills.join(", ") : skill || "Compliance";

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: hashedPassword,
        role: role || "Executive",
        dept: dept || "Operations",
        skill: skill || skillsStr.split(",")[0] || "Compliance",
        skills: skillsStr,
        status: "Active",
        access: access || "Employee",
      },
    });

    const { password: _, ...safe } = user;
    return res.status(201).json({ success: true, message: "User created", data: safe });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { password, skills, ...rest } = req.body;

    const data: any = { ...rest };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    if (skills) {
      data.skills = Array.isArray(skills) ? skills.join(", ") : skills;
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data,
    });

    const { password: _, ...safe } = user;
    return res.json({ success: true, message: "User updated", data: safe });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: Number(id) } });
    return res.json({ success: true, message: "User deleted" });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
