import prisma from "@/lib/prisma-client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const groupId = (await params).id;
        console.log(`[API] Fetching members for group ID: ${groupId}`);

        // First, check if the group exists to handle 404 cases correctly
        const groupExists = await prisma.group.findUnique({
            where: {
                id: groupId,
            },
            select: {
                id: true // We only need to know if it exists
            }
        });

        // If the group doesn't exist, return a 404 error
        if (!groupExists) {
            console.log(`[API] Group with ID ${groupId} not found.`);
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        // If the group exists, fetch its members directly
        const members = await prisma.profile.findMany({
            where: {
                groups: {
                    some: {
                        id: groupId,
                    },
                },
            },
            select: {
                id: true,
                username: true,
                profilePicture: true,
                bio: true,
            },
        });

        console.log("[API] Returning members:", JSON.stringify(members, null, 2));
        // Return the array of members
        return NextResponse.json(members);

    } catch (error) {
        console.error("[API] Error fetching group members:", error);
        return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }){
    const body = await request.json();
    const username = body.username;

    if (!username || typeof username !== 'string') {
        return NextResponse.json({ error: "username is required" }, { status: 400 });
    }

    try {
        const groupId = (await params).id;

        // Find the user to add by their username
        const userToAdd = await prisma.profile.findUnique({
            where: {
                username: username,
            },
        });

        if (!userToAdd) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Add the user to the group's members
        const updatedGroup = await prisma.group.update({
            where: {
                id: groupId,
            },
            data: {
                members: {
                    connect: {
                        id: userToAdd.id,
                    },
                },
            },
            include: {
                members: true,
            },
        });
        revalidatePath(`/group/${groupId}`);

        return NextResponse.json(updatedGroup);
    } catch (error) {
        console.error("Failed to add member to group:", error);
        return NextResponse.json({ error: "Failed to add member to group" }, { status: 500 });
    }
}    