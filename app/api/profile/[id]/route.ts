import prisma from "@/lib/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    throw new Error("No id provided");
  }
  try {
    const profile = await prisma.profile.findFirst({
      where: {
        id: id,
      },
    });
    if (!profile) {
      throw new Error("No profile found");
    }
    return NextResponse.json(profile);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch profiles" },
      { status: 500 }
    );
  }
}
