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
    const body = await request.json();
    console.log(body);
    try {
    const group = await prisma.group.create({
        data: body,
    });
    return NextResponse.json(group);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
    }
}