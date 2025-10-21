import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { publishEvent } from "@/lib/realtime";
import { notify } from "@/lib/notify";
import { updateKarma } from "@/lib/karma";
import { updateUserScores } from "@/lib/scores";

const truthOrDarePrompts = [
  "What's your most embarrassing moment from the past year?",
  "What's one thing you've always wanted to try but haven't?",
  "If you could have dinner with anyone, who would it be?",
  "What's your biggest fear?",
  "Share a secret talent nobody knows about",
  "What would you do with a million dollars?",
  "Who was your first crush?",
  "What's your guilty pleasure?",
];

/**
 * GET /api/challenges - List challenges
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const challenges = await prisma.challenge.findMany({
      where: {
        OR: [
          { initiatorId: user.id },
          { receiverId: user.id },
        ],
      },
      include: {
        initiator: {
          select: { id: true, name: true, email: true, image: true },
        },
        receiver: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      challenges,
    });
  } catch (error) {
    console.error("[API] Error fetching challenges:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/challenges - Create or update challenge
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { receiverEmail, type, message } = await req.json();

    if (!receiverEmail) {
      return NextResponse.json({ error: "receiverEmail required" }, { status: 400 });
    }

    const receiver = await prisma.user.findUnique({
      where: { email: receiverEmail },
      select: { id: true, name: true, email: true },
    });

    if (!receiver) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 });
    }

    if (receiver.id === user.id) {
      return NextResponse.json({ error: "Cannot challenge yourself" }, { status: 400 });
    }

    // Generate prompt based on type
    let prompt = "";
    if (type === "truth_or_dare") {
      prompt = truthOrDarePrompts[Math.floor(Math.random() * truthOrDarePrompts.length)];
    }

    // Create challenge
    const challenge = await prisma.challenge.create({
      data: {
        initiatorId: user.id,
        receiverId: receiver.id,
        type: type || "random",
        message: message || null,
        prompt,
        status: "pending",
      },
    });

    // Notify receiver
    await notify(
      receiver.id,
      "system",
      "🧩 Challenge Received!",
      `${user.email} dared you: ${prompt || 'Answer the challenge!'}`
    );

    // Broadcast event
    await publishEvent("challenge:new", {
      initiatorId: user.id,
      receiverId: receiver.id,
      challengeId: challenge.id,
      type: challenge.type,
    });

    return NextResponse.json({
      success: true,
      challenge,
    });
  } catch (error) {
    console.error("[API] Error creating challenge:", error);
    return NextResponse.json(
      { error: "Failed to create challenge" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/challenges - Accept/decline/complete challenge
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { challengeId, action, response } = await req.json();

    if (!challengeId || !action) {
      return NextResponse.json(
        { error: "challengeId and action required" },
        { status: 400 }
      );
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        initiator: { select: { id: true, email: true } },
        receiver: { select: { id: true, email: true } },
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    // Only receiver can accept/decline, both can complete
    if (action === "accept") {
      if (challenge.receiverId !== user.id) {
        return NextResponse.json({ error: "Only receiver can accept" }, { status: 403 });
      }

      const updated = await prisma.challenge.update({
        where: { id: challengeId },
        data: {
          status: "accepted",
          respondedAt: new Date(),
        },
      });

      // Reward karma for accepting
      await updateKarma(user.id, 5);

      await notify(
        challenge.initiatorId,
        "system",
        "Challenge Accepted!",
        `${user.id === challenge.receiverId ? challenge.receiver.email : 'User'} accepted your challenge!`
      );

      await publishEvent("challenge:update", {
        challengeId,
        status: "accepted",
        receiverId: user.id,
      });

      return NextResponse.json({
        success: true,
        challenge: updated,
        karmaGained: 5,
      });
    }

    if (action === "decline") {
      if (challenge.receiverId !== user.id) {
        return NextResponse.json({ error: "Only receiver can decline" }, { status: 403 });
      }

      const updated = await prisma.challenge.update({
        where: { id: challengeId },
        data: {
          status: "declined",
          respondedAt: new Date(),
        },
      });

      // Penalty karma for declining
      await updateKarma(user.id, -5);

      await notify(
        challenge.initiatorId,
        "system",
        "Challenge Declined",
        `Your challenge was declined`
      );

      await publishEvent("challenge:update", {
        challengeId,
        status: "declined",
      });

      return NextResponse.json({
        success: true,
        challenge: updated,
        karmaLost: -5,
      });
    }

    if (action === "complete") {
      if (!response) {
        return NextResponse.json({ error: "response required" }, { status: 400 });
      }

      if (challenge.receiverId !== user.id) {
        return NextResponse.json({ error: "Only receiver can complete" }, { status: 403 });
      }

      const updated = await prisma.challenge.update({
        where: { id: challengeId },
        data: {
          status: "completed",
          response,
          completedAt: new Date(),
        },
      });

      // Reward XP and update scores
      await prisma.user.update({
        where: { id: user.id },
        data: { xp: { increment: challenge.rewardXp } },
      });

      await updateUserScores(user.id);

      await notify(
        challenge.initiatorId,
        "system",
        "Challenge Completed!",
        `${challenge.receiver.email} completed your challenge!`
      );

      await publishEvent("challenge:update", {
        challengeId,
        status: "completed",
        xpGained: challenge.rewardXp,
      });

      return NextResponse.json({
        success: true,
        challenge: updated,
        xpGained: challenge.rewardXp,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[API] Error updating challenge:", error);
    return NextResponse.json(
      { error: "Failed to update challenge" },
      { status: 500 }
    );
  }
}











