import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

// =======================================================
// DSC (DIGITAL SIGNATURE CERTIFICATE) CONTROLLER
// Complete lifecycle management for USB tokens & Class 3 DSCs
// =======================================================

export async function getAllDscRecords(req: Request, res: Response) {
  try {
    const { status, search } = req.query;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      const q = String(search);
      where.OR = [
        { dscNumber: { contains: q } },
        { holderName: { contains: q } },
        { pan: { contains: q } },
        { businessName: { contains: q } },
        { usbSerial: { contains: q } },
      ];
    }

    const records = await prisma.dscRecord.findMany({
      where,
      orderBy: { expiryDate: 'asc' },
    });

    return res.json({ success: true, count: records.length, records });
  } catch (error: any) {
    console.error('getAllDscRecords error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve DSC records' });
  }
}

export async function createDscRecord(req: Request, res: Response) {
  try {
    const { holderName, pan, businessName, dscClass, usbSerial, certifyingAuthority, expiryDate } = req.body;

    if (!holderName || !pan || !businessName || !usbSerial || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'holderName, pan, businessName, usbSerial, and expiryDate are required',
      });
    }

    // Auto-generate DSC Number
    const count = await prisma.dscRecord.count();
    const dscNumber = `DSC-${801 + count}`;

    // Calculate days remaining
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    let status: 'Active' | 'ExpiringSoon' | 'Expired' = 'Active';
    if (daysRemaining <= 0) {
      status = 'Expired';
    } else if (daysRemaining <= 30) {
      status = 'ExpiringSoon';
    }

    const newDsc = await prisma.dscRecord.create({
      data: {
        dscNumber,
        holderName,
        pan: pan.toUpperCase(),
        businessName,
        dscClass: dscClass || 'Class 3 - Combo (Sign & Encrypt)',
        usbSerial,
        certifyingAuthority: certifyingAuthority || 'eMudhra',
        expiryDate,
        daysRemaining,
        status,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'DSC Record created successfully',
      record: newDsc,
    });
  } catch (error: any) {
    console.error('createDscRecord error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create DSC record', error: error.message });
  }
}

export async function updateDscRecord(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const { holderName, pan, businessName, dscClass, usbSerial, certifyingAuthority, expiryDate, status } = req.body;

    const data: any = {};
    if (holderName) data.holderName = holderName;
    if (pan) data.pan = pan.toUpperCase();
    if (businessName) data.businessName = businessName;
    if (dscClass) data.dscClass = dscClass;
    if (usbSerial) data.usbSerial = usbSerial;
    if (certifyingAuthority) data.certifyingAuthority = certifyingAuthority;
    if (expiryDate) {
      data.expiryDate = expiryDate;
      const expiry = new Date(expiryDate);
      const now = new Date();
      const diffTime = expiry.getTime() - now.getTime();
      const days = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      data.daysRemaining = days;
      if (days <= 0) data.status = 'Expired';
      else if (days <= 30) data.status = 'ExpiringSoon';
      else data.status = 'Active';
    }
    if (status) data.status = status;

    const updated = await prisma.dscRecord.update({
      where: { id },
      data,
    });

    return res.json({ success: true, message: 'DSC record updated', record: updated });
  } catch (error: any) {
    console.error('updateDscRecord error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update DSC record' });
  }
}

export async function deleteDscRecord(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    await prisma.dscRecord.delete({ where: { id } });
    return res.json({ success: true, message: 'DSC record removed' });
  } catch (error: any) {
    console.error('deleteDscRecord error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete DSC record' });
  }
}
