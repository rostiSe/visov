import { revalidateGroups } from "@/lib/actions";
import {prisma} from "@/lib/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
    const groups = await prisma.group.findMany({
        include: {
            members: true,
          },
    });
    return NextResponse.json(groups);
}
export async function POST(request: Request) {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const userId = formData.get("userId") as string;

    if (!name) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    try {
        // First, create the group with the creator as both admin and member
        const group = await prisma.group.create({
            data: {
                name,
                description,
                members: {
                    connect: {
                        id: userId,
                    },
                },
                admin: {
                    connect: {
                        id: userId,
                    },
                },
            },
            include: {
                members: true,
                admin: true,
            },
        });
        
        revalidateGroups();
        return NextResponse.json(group);
    } catch (error) {
        console.error("Error creating group:", error);
        return NextResponse.json(
            { error: "Failed to create group" }, 
            { status: 500 }
        );
    }
}