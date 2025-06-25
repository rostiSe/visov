
'use client'
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"

export default function SignOutButton() {
    const router = useRouter()
    const pathname = usePathname()
    
        const signOut = async () => {
            await authClient.signOut();
            router.push("/login");
        }

        if(pathname === "/login" || pathname === "/registrieren") {
            return null
        }
    
    return (
        <Button onClick={() => signOut()}>Sign out</Button>
    )
}



