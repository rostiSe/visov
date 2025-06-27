import { revalidateGroups } from "@/lib/actions";
import { prisma } from "@/lib/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');
        
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' }, 
                { status: 400 }
            );
        }

        console.log('Fetching groups for user:', userId);
        
        console.log('1. Starting groups fetch for user ID:', userId);
        
        console.log('1. Looking for groups where user is a member with userId:', userId);
        
        // Find groups where the user is a member by directly querying the relation
        const groups = await prisma.group.findMany({
            where: {
                OR: [
                    {
                        // User is a member
                        members: {
                            some: {
                                userId: userId
                            }
                        }
                    },
                    {
                        // Or user is an admin
                        admin: {
                            some: {
                                userId: userId
                            }
                        }
                    }
                ]
            },
            include: {
                members: {
                    select: {
                        id: true,
                        username: true,
                        userId: true
                    }
                },
                admin: {
                    select: {
                        id: true,
                        username: true,
                        userId: true
                    }
                },
            },
        });
        
        console.log('4. Found groups:', JSON.stringify(groups, null, 2));
        console.log('5. Total groups found:', groups.length);
        return NextResponse.json(groups);
        
    } catch (error) {
        console.error('Error in GET /api/groups:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
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