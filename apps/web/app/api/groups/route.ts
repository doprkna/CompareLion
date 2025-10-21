import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { updateGroupStats, logGroupActivity } from "@/lib/groupStats";
import { publishEvent } from "@/lib/realtime";

/**
 * GET /api/groups
 * List all groups or get specific group details
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("id");

    // Get specific group
    if (groupId) {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
          groupMembers: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  level: true,
                  xp: true,
                  karmaScore: true,
                  prestigeScore: true,
                  image: true,
                },
              },
            },
            orderBy: { joinedAt: "asc" },
          },
          activities: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      });

      if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        group,
      });
    }

    // List all groups
    const groups = await prisma.group.findMany({
      orderBy: { totalXp: "desc" },
      include: {
        groupMembers: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // If logged in, include user's groups
    let myGroups: any[] = [];
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          groupMemberships: {
            include: {
              group: true,
            },
          },
        },
      });

      myGroups = user?.groupMemberships.map((m) => m.group) || [];
    }

    return NextResponse.json({
      success: true,
      groups,
      myGroups,
    });
  } catch (error) {
    console.error("[API] Error fetching groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups
 * Create a new group or join existing group
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { action, groupId, name, emblem, motto } = body;

    // Create new group
    if (action === "create") {
      if (!name) {
        return NextResponse.json(
          { error: "Group name required" },
          { status: 400 }
        );
      }

      // Check if name already exists
      const existing = await prisma.group.findUnique({ where: { name } });
      if (existing) {
        return NextResponse.json(
          { error: "Group name already taken" },
          { status: 400 }
        );
      }

      // Create group
      const group = await prisma.group.create({
        data: {
          name,
          emblem: emblem || "🔥",
          motto: motto || "Together we rise",
          ownerId: user.id,
        },
      });

      // Add creator as member
      await prisma.groupMember.create({
        data: {
          userId: user.id,
          groupId: group.id,
          role: "owner",
        },
      });

      // Log activity
      await logGroupActivity(
        group.id,
        "group_created",
        `${user.name || user.email} created the totem`,
        user.id
      );

      // Update stats
      await updateGroupStats(group.id);

      // Publish event
      await publishEvent("group:created", {
        groupId: group.id,
        name: group.name,
        creator: user.email,
      });

      return NextResponse.json({
        success: true,
        group,
        message: "Group created successfully",
      });
    }

    // Join existing group
    if (action === "join") {
      if (!groupId) {
        return NextResponse.json(
          { error: "groupId required" },
          { status: 400 }
        );
      }

      const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: { groupMembers: true },
      });

      if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
      }

      // Check if already a member
      const existing = await prisma.groupMember.findUnique({
        where: {
          userId_groupId: {
            userId: user.id,
            groupId: group.id,
          },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Already a member" },
          { status: 400 }
        );
      }

      // Check capacity
      if (group.groupMembers.length >= group.maxMembers) {
        return NextResponse.json(
          { error: "Group is full" },
          { status: 400 }
        );
      }

      // Add member
      await prisma.groupMember.create({
        data: {
          userId: user.id,
          groupId: group.id,
          role: "member",
        },
      });

      // Log activity
      await logGroupActivity(
        group.id,
        "member_join",
        `${user.name || user.email} joined the totem`,
        user.id
      );

      // Update stats
      await updateGroupStats(group.id);

      // Publish event
      await publishEvent("group:member_joined", {
        groupId: group.id,
        userId: user.id,
        userName: user.name || user.email,
      });

      return NextResponse.json({
        success: true,
        message: "Joined group successfully",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[API] Error creating/joining group:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups
 * Leave a group
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("id");

    if (!groupId) {
      return NextResponse.json(
        { error: "groupId required" },
        { status: 400 }
      );
    }

    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: user.id,
          groupId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this group" },
        { status: 400 }
      );
    }

    // If owner, check if there are other members
    if (membership.role === "owner") {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: { groupMembers: true },
      });

      if (group && group.groupMembers.length > 1) {
        return NextResponse.json(
          { error: "Transfer ownership before leaving" },
          { status: 400 }
        );
      }

      // If last member, delete group
      if (group && group.groupMembers.length === 1) {
        await prisma.group.delete({ where: { id: groupId } });

        return NextResponse.json({
          success: true,
          message: "Group disbanded",
        });
      }
    }

    // Remove member
    await prisma.groupMember.delete({
      where: {
        userId_groupId: {
          userId: user.id,
          groupId,
        },
      },
    });

    // Log activity
    await logGroupActivity(
      groupId,
      "member_leave",
      `${user.name || user.email} left the totem`,
      user.id
    );

    // Update stats
    await updateGroupStats(groupId);

    // Publish event
    await publishEvent("group:member_left", {
      groupId,
      userId: user.id,
      userName: user.name || user.email,
    });

    return NextResponse.json({
      success: true,
      message: "Left group successfully",
    });
  } catch (error) {
    console.error("[API] Error leaving group:", error);
    return NextResponse.json(
      { error: "Failed to leave group" },
      { status: 500 }
    );
  }
}










