import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { logMessageSent, logXpGain } from "@/lib/activity";
import { publishEvent } from "@/lib/realtime";
import { notifyMessage, notifyXpGain } from "@/lib/notify";
import { safeAsync, authError, notFoundError, validationError } from "@/lib/api-handler";
import { z } from "zod";

const SendMessageSchema = z.object({
  toEmail: z.string().email(),
  content: z.string().min(1).max(1000)
});

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError();
  }

  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email } 
  });
  
  if (!user) {
    return notFoundError('User');
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
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError();
  }

  const body = await req.json();
  const { toEmail, content } = SendMessageSchema.parse(body);

  const sender = await prisma.user.findUnique({ 
    where: { email: session.user.email } 
  });
  
  const receiver = await prisma.user.findUnique({ 
    where: { email: toEmail } 
  });

  if (!sender || !receiver) {
    return validationError("Invalid sender or receiver");
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
});

