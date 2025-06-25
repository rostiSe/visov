import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma-client";
import { NextRequest, NextResponse } from "next/server";

// Define the expected request body type
type ProfileData = {
  username: string;
  bio?: string;
  profilePicture?: string;
  location?: string;
};

export async function PATCH(request: NextRequest) {
  try {
    // Create headers object
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      headers.set(key, value);
    });
    
    // Get the current session
    const session = await auth.api.getSession({
      headers: headers as unknown as Headers
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Parse the request body
    const profileData: ProfileData = await request.json();
    
    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: "Profile not found. Please create a profile first." },
        { status: 404 }
      );
    }

    // Check if username is taken by another user
    if (profileData.username && profileData.username !== existingProfile.username) {
      const existingUsername = await prisma.profile.findFirst({
        where: { 
          username: profileData.username,
          userId: { not: session.user.id } // Exclude current user
        }
      });

      if (existingUsername) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 400 }
        );
      }
    }

    // Update the profile
    const updatedProfile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        username: profileData.username || existingProfile.username,
        bio: profileData.bio !== undefined ? profileData.bio : existingProfile.bio,
        location: profileData.location !== undefined ? profileData.location : existingProfile.location,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Create headers object
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      headers.set(key, value);
    });
    
    // Get the current session
    const session = await auth.api.getSession({
      headers: headers as unknown as Headers
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Parse the request body
    const profileData: ProfileData = await request.json();
    
    // Check if profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "Profile already exists" },
        { status: 400 }
      );
    }

    // Check if username is taken
    const existingUsername = await prisma.profile.findUnique({
      where: { username: profileData.username }
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    // Create the profile
    const profile = await prisma.profile.create({
      data: {
        username: profileData.username,
        bio: profileData.bio || null,
        profilePicture: profileData.profilePicture || null,
        location: profileData.location || null,
        user: {
          connect: { id: session.user.id }
        }
      },
      select: {
        id: true,
        username: true,
        bio: true,
        profilePicture: true,
        location: true,
        userId: true
      }
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Profile creation error:", error);
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    );
  }
}
