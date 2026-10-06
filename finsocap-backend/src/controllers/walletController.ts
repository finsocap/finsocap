import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

// =======================================================
// WALLET & TRANSACTION CONTROLLER
// Handles partner balance, transactions ledger, and QR payments
// =======================================================

/**
 * Get wallet details by Partner ID
 * GET /api/wallet/partner/:partnerId
 */
export async function getPartnerWallet(req: Request, res: Response) {
  try {
    const partnerId = String(req.params.partnerId);

    const existingWallet = await prisma.wallet.findUnique({
      where: { partnerId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    let wallet = existingWallet;

    // Auto-create wallet if it doesn't exist yet for this partner
    if (!wallet) {
      const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
      if (!partner) {
        return res.status(404).json({ success: false, message: 'Partner not found' });
      }

      wallet = await prisma.wallet.create({
        data: {
          partnerId,
          balance: 0,
          pendingDues: 0,
          lifetimeEarn: 0,
        },
        include: {
          transactions: true,
        },
      });
    }

    return res.json({
      success: true,
      wallet: {
        id: wallet.id,
        partnerId: wallet.partnerId,
        balance: wallet.balance,
        pendingDues: wallet.pendingDues,
        lifetimeEarn: wallet.lifetimeEarn,
        transactions: wallet.transactions || [],
      },
    });
  } catch (error: any) {
    console.error('getPartnerWallet error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch wallet', error: error.message });
  }
}

/**
 * Record a transaction (Credit/Debit/UPI settlement)
 * POST /api/wallet/transaction
 */
export async function createTransaction(req: Request, res: Response) {
  try {
    const { walletId, partnerId, amount, type, description, referenceId, utrNumber } = req.body;

    let targetWalletId = walletId;

    if (!targetWalletId && partnerId) {
      let wallet = await prisma.wallet.findUnique({ where: { partnerId } });
      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: { partnerId, balance: 0, pendingDues: 0, lifetimeEarn: 0 },
        });
      }
      targetWalletId = wallet.id;
    }

    if (!targetWalletId) {
      return res.status(400).json({ success: false, message: 'walletId or partnerId is required' });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid transaction amount' });
    }

    // Execute transaction in a DB transaction
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          walletId: targetWalletId,
          amount: numericAmount,
          type: type === 'DEBIT' ? 'DEBIT' : 'CREDIT',
          status: 'SUCCESS',
          description: description || 'Account adjustment',
          referenceId: referenceId || null,
          utrNumber: utrNumber || null,
        },
      });

      const balanceChange = type === 'DEBIT' ? -numericAmount : numericAmount;
      const lifetimeAddition = type === 'CREDIT' ? numericAmount : 0;

      const updatedWallet = await tx.wallet.update({
        where: { id: targetWalletId },
        data: {
          balance: { increment: balanceChange },
          lifetimeEarn: { increment: lifetimeAddition },
        },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      return { transaction, updatedWallet };
    });

    return res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('createTransaction error:', error);
    return res.status(500).json({ success: false, message: 'Transaction failed', error: error.message });
  }
}

/**
 * List all wallets for Admin Overview
 * GET /api/wallet/all
 */
export async function getAllWallets(req: Request, res: Response) {
  try {
    const wallets = await prisma.wallet.findMany({
      include: {
        partner: {
          select: {
            id: true,
            partnerId: true,
            name: true,
            phone: true,
            shopName: true,
            city: true,
            tier: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return res.json({ success: true, count: wallets.length, wallets });
  } catch (error: any) {
    console.error('getAllWallets error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch wallets' });
  }
}
