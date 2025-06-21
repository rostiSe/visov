import prisma from "@/lib/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const groups = await prisma.group.findMany({
        take: 10,
    });
    return NextResponse.json(groups);
}