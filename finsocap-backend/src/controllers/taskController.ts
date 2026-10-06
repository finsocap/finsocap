import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

// 1. GET ALL TASKS (With Filters, Search & Partner-scope for Flutter App)
export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const { status, partner, partnerId, category, search, priority } = req.query;

    const where: any = {};
    if (status && status !== "ALL") where.status = String(status);
    if (priority && priority !== "ALL") where.priority = String(priority);
    if (category && category !== "ALL") where.category = String(category);
    if (partner) where.partner = { contains: String(partner) };
    if (partnerId) where.partnerId = String(partnerId);

    if (search && String(search).trim()) {
      const q = String(search).trim();
      where.OR = [
        { id: { contains: q } },
        { client: { contains: q } },
        { phone: { contains: q } },
        { business: { contains: q } },
        { service: { contains: q } },
        { partner: { contains: q } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        comments: { orderBy: { createdAt: "asc" } },
        files: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 2. GET TASK BY ID
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        comments: { orderBy: { createdAt: "asc" } },
        files: true,
        licences: true,
      },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    return res.json({ success: true, data: task });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 3. CREATE TASK (Application submission from Flutter Partner App or Web Dashboard)
export const createTask = async (req: Request, res: Response) => {
  try {
    const {
      partner,
      partnerPhone,
      partnerId,
      client,
      phone,
      business,
      category,
      service,
      due,
      assignee,
      priority,
      sales,
      comments,
      files,
    } = req.body;

    if (!client || !phone || !service) {
      return res.status(400).json({ success: false, message: "Client name, phone, and service are required." });
    }

    // Auto-generate sequential task id: T-1001, T-1002
    const count = await prisma.task.count();
    const taskId = `T-${1001 + count}`;

    const todayStr = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // Auto due date (+7 days)
    const dueStr =
      due ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

    const task = await prisma.task.create({
      data: {
        id: taskId,
        partner: partner || "Direct Head Office",
        partnerPhone,
        partnerId,
        client: client.trim(),
        phone: phone.trim(),
        business: business || client.trim(),
        category: category || "Compliance",
        service: service.trim(),
        status: "Pending",
        date: todayStr,
        due: dueStr,
        assignee: assignee || "",
        priority: priority || "Normal",
        sales: sales || partner || "",
      },
    });

    // Add initial comment if passed
    if (comments && Array.isArray(comments)) {
      for (const text of comments) {
        await prisma.taskComment.create({
          data: { taskId: task.id, text, author: partner || "System" },
        });
      }
    }

    // Add files if passed
    if (files && Array.isArray(files)) {
      for (const f of files) {
        await prisma.taskAttachment.create({
          data: {
            taskId: task.id,
            fileName: typeof f === "string" ? f : f.name,
            fileUrl: typeof f === "string" ? `/uploads/${f}` : f.url,
          },
        });
      }
    }

    // Create or update Client record automatically
    const existingClient = await prisma.client.findFirst({
      where: { phone: phone.trim() },
    });

    if (existingClient) {
      await prisma.client.update({
        where: { id: existingClient.id },
        data: { tasks: { increment: 1 }, last: todayStr },
      });
    } else {
      await prisma.client.create({
        data: {
          name: client.trim(),
          phone: phone.trim(),
          business: business || client.trim(),
          partner: partner || "Direct",
          partnerId,
          tasks: 1,
          last: todayStr,
          status: "Active",
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      taskId: task.id,
      data: task,
    });
  } catch (error: any) {
    console.error("Create task error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 4. UPDATE TASK STATUS & DETAILS
export const updateTask = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updates = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: updates,
    });

    return res.json({ success: true, message: "Task updated", data: task });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 5. ADD COMMENT TO TASK
export const addTaskComment = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { text, author } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: "Comment text is required." });
    }

    const comment = await prisma.taskComment.create({
      data: {
        taskId: id,
        text,
        author: author || "Staff Desk",
      },
    });

    return res.status(201).json({ success: true, message: "Comment added", data: comment });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 6. COMPLETE TASK & CREATE LICENCE (Matched from task completion modal)
export const completeTaskWithLicence = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const {
      licenseNumber,
      clientName,
      clientNumber,
      partnerName,
      partnerNumber,
      serviceName,
      type,
      issueDate,
      expiryDate,
      portalUser,
      portalPassword,
    } = req.body;

    // Update task
    await prisma.task.update({
      where: { id },
      data: {
        status: "Completed",
        license: licenseNumber || `LIC-${Date.now()}`,
      },
    });

    // Create Licence record
    if (licenseNumber) {
      await prisma.licence.create({
        data: {
          task: id,
          taskId: id,
          partner: partnerName || "Direct Partner",
          partnerPhone: partnerNumber,
          client: clientName || "Valued Client",
          phone: clientNumber || "",
          type: type || "Official Certificate",
          category: "Compliance",
          service: serviceName || "General Service",
          number: licenseNumber,
          issue: issueDate || new Date().toLocaleDateString("en-GB"),
          expiry: expiryDate || "25-09-2027",
          user: portalUser || "PORTAL_USER",
          password: portalPassword || "Pass@123",
          status: "Active",
          url: true,
          files: 1,
        },
      });
    }

    return res.json({ success: true, message: "Task marked completed and licence issued successfully." });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
