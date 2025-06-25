"use server";
import { auth } from "@/lib/auth"
import {prisma} from "@/lib/prisma-client"
 
export const signIn = async (email: string, password: string) => {
    try {
        await auth.api.signInEmail({
            body: {
                email: email,
                password: password,
            }
        })
        return {
            success: true,
            error: null,
        }
    } catch (error) {
        console.error(error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unknown error occurred",
        }
    }
}

export const signUp = async (email: string, password: string, name: string) => {
    try {
        // Create the user
        const response = await auth.api.signUpEmail({
            body: {
                email: email,
                password: password,
                name: name
            }
        });

        if (!response.user?.id) {
            throw new Error("User creation failed");
        }

        // Create a basic profile for the user
        await prisma.profile.create({
            data: {
                userId: response.user.id,
                username: name.toLowerCase().replace(/\s+/g, ''), // Basic username from name
                bio: '',
                location: '',
                profilePicture: ''
            }
        });

        return {
            success: true,
            error: null,
            userId: response.user.id
        };
    } catch (error) {
        console.error("Signup error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unknown error occurred",
            userId: null
        };
    }
}