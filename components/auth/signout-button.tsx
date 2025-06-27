
'use client'
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { LogOut } from "lucide-react"
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
        <Button className="bg-amber-50 hover:bg-amber-100 flex items-center  justify-center" onClick={() => signOut()}><LogOut className="mr-2 h-4 w-4 stroke-amber-700" /></Button>
    )
}



