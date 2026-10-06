import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";

// 1. GET ALL PARTNERS (With Filters & Search for Web Dashboard)
export const getAllPartners = async (req: Request, res: Response) => {
  try {
    const { status, tier, search } = req.query;

    const where: any = {};
    if (status && status !== "ALL") where.status = String(status);
    if (tier && tier !== "ALL") where.tier = String(tier);

    if (search && String(search).trim()) {
      const q = String(search).trim();
      where.OR = [
        { name: { contains: q } },
        { partnerId: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
        { shopName: { contains: q } },
        { city: { contains: q } },
      ];
    }

    const partners = await prisma.partner.findMany({
      where,
      include: {
        documents: true,
        _count: {
          select: { tasks: true, clients: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const sanitized = partners.map(({ password, ...p }) => p);

    return res.json({
      success: true,
      count: sanitized.length,
      data: sanitized,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 2. GET PARTNER BY ID / PARTNER_ID
export const getPartnerById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const partner = await prisma.partner.findFirst({
      where: {
        OR: [{ id }, { partnerId: id }],
      },
      include: {
        documents: true,
        tasks: { take: 10, orderBy: { createdAt: "desc" } },
        licences: true,
      },
    });

    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found" });
    }

    const { password, ...partnerData } = partner;
    return res.json({ success: true, data: partnerData });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 3. REGISTER / APPLY FOR FRANCHISE (From Flutter Mobile App or Web)
export const registerPartner = async (req: Request, res: Response) => {
  try {
    const {
      name,
      phone,
      email,
      dob,
      shopName,
      currentAddress,
      completeShopAddress,
      panNumber,
      adhaarNumber,
      city,
      state,
      password,
      documents,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: "Name and phone number are required." });
    }

    const cleanPhone = String(phone).trim();

    // Check if phone already registered
    const existing = await prisma.partner.findFirst({
      where: {
        OR: [{ phone: cleanPhone }, { userId: cleanPhone }],
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A partner application already exists with this mobile number.",
        partnerId: existing.partnerId,
      });
    }

    // Auto-generate sequential Partner ID: P-101 onwards
    const count = await prisma.partner.count();
    const partnerId = `P-${101 + count}`;
    const shortName = `${partnerId} • ${name.trim()}`;

    // Hash password if provided
    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const todayStr = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // Create partner record
    const partner = await prisma.partner.create({
      data: {
        partnerId,
        name: name.trim(),
        shortName,
        phone: cleanPhone,
        userId: cleanPhone,
        email: email?.trim(),
        password: hashedPassword,
        dob,
        shopName,
        currentAddress,
        completeShopAddress,
        panNumber: panNumber ? String(panNumber).toUpperCase() : undefined,
        adhaarNumber,
        city: city || "Patna",
        state: state || "Bihar",
        status: "Pending", // Needs Admin approval
        tier: "Gold Franchise",
        registeredAt: todayStr,
      },
    });

    // Handle documents if uploaded
    if (documents && Array.isArray(documents)) {
      for (const doc of documents) {
        if (doc.fileName && doc.fileUrl) {
          await prisma.partnerDocument.create({
            data: {
              partnerId: partner.id,
              type: doc.type || "genericDoc",
              fileName: doc.fileName,
              fileUrl: doc.fileUrl,
            },
          });
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: "Franchise partner application registered successfully. Awaiting admin approval.",
      partnerId,
      partner: {
        id: partner.id,
        partnerId: partner.partnerId,
        name: partner.name,
        phone: partner.phone,
        status: partner.status,
      },
    });
  } catch (error: any) {
    console.error("Partner register error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 4. VERIFY & APPROVE PARTNER (Admin Action)
export const approvePartner = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const partner = await prisma.partner.findFirst({
      where: { OR: [{ id }, { partnerId: id }] },
    });

    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found" });
    }

    const updated = await prisma.partner.update({
      where: { id: partner.id },
      data: { status: "Active" },
    });

    return res.json({
      success: true,
      message: `Partner ${partner.partnerId} (${partner.name}) approved and activated successfully.`,
      partner: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 5. UPDATE PARTNER DETAILS (Admin or Self Edit)
export const updatePartner = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updates = req.body;

    const partner = await prisma.partner.findFirst({
      where: { OR: [{ id }, { partnerId: id }] },
    });

    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found" });
    }

    if (updates.name && !updates.shortName) {
      updates.shortName = `${partner.partnerId} • ${updates.name.trim()}`;
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updated = await prisma.partner.update({
      where: { id: partner.id },
      data: updates,
    });

    const { password, ...safe } = updated;
    return res.json({ success: true, message: "Partner updated", data: safe });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 6. TOGGLE STATUS (Active / Deactivated)
export const togglePartnerStatus = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const partner = await prisma.partner.findFirst({
      where: { OR: [{ id }, { partnerId: id }] },
    });

    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found" });
    }

    const newStatus = partner.status === "Active" ? "Deactivated" : "Active";
    const updated = await prisma.partner.update({
      where: { id: partner.id },
      data: { status: newStatus },
    });

    return res.json({
      success: true,
      message: `Partner status switched to ${newStatus}`,
      status: newStatus,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 7. CHANGE PARTNER PASSWORD (From Flutter App Profile)
export const changePartnerPassword = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters." });
    }

    const partner = await prisma.partner.findFirst({
      where: { OR: [{ id }, { partnerId: id }] },
    });

    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found" });
    }

    if (partner.password && currentPassword) {
      const match = await bcrypt.compare(currentPassword, partner.password).catch(() => partner.password === currentPassword);
      if (!match && partner.password !== currentPassword) {
        return res.status(400).json({ success: false, message: "Incorrect current password." });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.partner.update({
      where: { id: partner.id },
      data: { password: hashedPassword },
    });

    return res.json({ success: true, message: "Password updated successfully." });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
