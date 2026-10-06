import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

// =======================================================
// ANALYTICS & DASHBOARD METRICS CONTROLLER
// Aggregates real-time KPIs for Admin and Mobile App
// =======================================================

export async function getDashboardStats(req: Request, res: Response) {
  try {
    const [
      totalPartners,
      activePartners,
      pendingPartners,
      totalClients,
      totalTasks,
      completedTasks,
      inProgressTasks,
      totalLicences,
      totalServices,
      totalDsc,
    ] = await Promise.all([
      prisma.partner.count(),
      prisma.partner.count({ where: { status: 'Active' } }),
      prisma.partner.count({ where: { status: 'Pending' } }),
      prisma.client.count(),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'Completed' } }),
      prisma.task.count({ where: { status: 'InProgress' } }),
      prisma.licence.count(),
      prisma.service.count({ where: { status: 'Active' } }),
      prisma.dscRecord.count(),
    ]);

    // Financial calculations
    const wallets = await prisma.wallet.findMany();
    const totalPlatformBalance = wallets.reduce((acc, w) => acc + w.balance, 0);
    const totalPendingDues = wallets.reduce((acc, w) => acc + w.pendingDues, 0);
    const totalLifetimeEarned = wallets.reduce((acc, w) => acc + w.lifetimeEarn, 0);

    // Calculate SLA completion percentage
    const slaRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 98;

    return res.json({
      success: true,
      stats: {
        partners: {
          total: totalPartners,
          active: activePartners,
          pending: pendingPartners,
        },
        clients: {
          total: totalClients,
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          inProgress: inProgressTasks,
          slaRate: `${slaRate}%`,
        },
        compliance: {
          totalLicences,
          totalDsc,
        },
        servicesCatalog: {
          activeCount: totalServices,
        },
        finances: {
          platformBalance: totalPlatformBalance,
          pendingDues: totalPendingDues,
          lifetimeEarned: totalLifetimeEarned,
          currency: 'INR',
        },
      },
    });
  } catch (error: any) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to compute dashboard stats', error: error.message });
  }
}
