import { revalidateGroups } from "@/lib/actions";
import prisma from "@/lib/prisma-client";
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

    if (!name) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    try {
    const group = await prisma.group.create({
        data: {
            name,
            description,
        },
    });
    revalidateGroups();
    return NextResponse.json(group);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
    }
}