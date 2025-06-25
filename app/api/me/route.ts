import { getAuthenticatedUser } from "@/lib/data/user";
import { NextResponse } from "next/server";

export async function GET() {
    const authenticatedUser = await getAuthenticatedUser();

    if (!authenticatedUser) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json(authenticatedUser);
}
