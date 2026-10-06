import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

// =======================================================
// LIVE CHAT & CONVERSATIONS CONTROLLER
// Realtime message threads for team & client visitor desk
// =======================================================

export async function getConversations(req: Request, res: Response) {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Last message preview
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return res.json({ success: true, conversations });
  } catch (error: any) {
    console.error('getConversations error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve conversations' });
  }
}

export async function getMessages(req: Request, res: Response) {
  try {
    const conversationId = String(req.params.conversationId);

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    return res.json({ success: true, count: messages.length, messages });
  } catch (error: any) {
    console.error('getMessages error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
}

export async function createConversation(req: Request, res: Response) {
  try {
    const { type, name, initialMessage, senderName } = req.body;

    const conv = await prisma.conversation.create({
      data: {
        type: type || 'DIRECT',
        name: name || 'General Conversation',
      },
    });

    if (initialMessage) {
      await prisma.message.create({
        data: {
          conversationId: conv.id,
          senderId: 'SYSTEM',
          senderName: senderName || 'Support Executive',
          senderRole: 'Executive',
          text: initialMessage,
        },
      });
    }

    return res.status(201).json({ success: true, conversation: conv });
  } catch (error: any) {
    console.error('createConversation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create conversation' });
  }
}

export async function sendMessage(req: Request, res: Response) {
  try {
    const { conversationId, senderId, senderName, senderRole, text } = req.body;

    if (!conversationId || !text) {
      return res.status(400).json({ success: false, message: 'conversationId and text are required' });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: senderId || 'user',
        senderName: senderName || 'Team Member',
        senderRole: senderRole || 'Executive',
        text,
        isDelivered: true,
        isRead: false,
      },
    });

    // Touch conversation updated timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return res.status(201).json({ success: true, message });
  } catch (error: any) {
    console.error('sendMessage error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send message' });
  }
}
