import prisma from "@/lib/prisma-client";
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