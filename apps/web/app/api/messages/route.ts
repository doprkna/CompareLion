import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { logMessageSent, logXpGain } from "@/lib/activity";
import { publishEvent } from "@/lib/realtime";
import { notifyMessage, notifyXpGain } from "@/lib/notify";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email } 
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: { 
        OR: [
          { senderId: user.id }, 
          { receiverId: user.id }
        ] 
      },
      include: { 
        sender: { select: { id: true, email: true, name: true } },
        receiver: { select: { id: true, email: true, name: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error('[API] Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { toEmail, content } = await req.json();

    if (!toEmail || !content) {
      return NextResponse.json(
        { error: "toEmail and content are required" },
        { status: 400 }
      );
    }

    const sender = await prisma.user.findUnique({ 
      where: { email: session.user.email } 
    });
    
    const receiver = await prisma.user.findUnique({ 
      where: { email: toEmail } 
    });

    if (!sender || !receiver) {
      return NextResponse.json(
        { error: "Invalid users" },
        { status: 400 }
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: { 
        senderId: sender.id, 
        receiverId: receiver.id, 
        content 
      },
    });

    // Give XP reward for social interaction
    await prisma.user.update({
      where: { id: sender.id },
      data: { xp: { increment: 5 } },
    });

    // Log activities
    await logMessageSent(sender.id, receiver.email);
    await logXpGain(sender.id, 5, "Message sent");

    // Create notifications
    await notifyMessage(receiver.id, sender.email, content);
    await notifyXpGain(sender.id, 5, "Message sent");

    // Publish events for real-time updates (local + Redis)
    await publishEvent("message:new", {
      senderId: sender.id,
      senderEmail: sender.email,
      receiverId: receiver.id,
      receiverEmail: receiver.email,
      content: content.slice(0, 50), // Truncate for privacy
    });

    await publishEvent("xp:update", {
      userId: sender.id,
      newXp: (sender.xp || 0) + 5,
      oldXp: sender.xp || 0,
      gain: 5,
      source: "Message sent",
    });

    await publishEvent("activity:new", {
      userId: sender.id,
      type: "message",
      title: "Message Sent",
      description: `To: ${receiver.email}`,
    });

    return NextResponse.json({ 
      success: true, 
      message,
      xpGained: 5 
    });
  } catch (error) {
    console.error('[API] Error sending message:', error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}

