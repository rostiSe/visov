"use server";
import { auth } from "@/lib/auth"
 
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
        await auth.api.signUpEmail({
            body: {
                email: email,
                password: password,
                name: name
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