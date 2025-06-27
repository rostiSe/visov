'use client'

import Image from "next/image"
import Link from "next/link"
import CustomButton from "../button"
import { useRouter, usePathname } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import SignOutButton from "@/components/auth/signout-button"
import { Button } from "@/components/ui/button"

export default function Navbar() {
    const router = useRouter()
    const pathname = usePathname()
    const handleBack = () => {
        // history.length gibt Anzahl der Einträge in der Session-History
        if (typeof window !== 'undefined' && !document.referrer.includes("vercel")) {
          router.back();
        } else {
          // Hier gehst Du auf eine definierte "Startseite" oder eine andere Fallback-Route
          router.replace('/');
        }
      };

    return (
        <div className="p-2 z-40 md:px-40 fixed w-full">
            
        <div className="flex justify-between items-center p-4 bg-gray-100 h-[3.5rem] rounded-xl w-full ">
                        <div className={`${pathname.includes("/group") ? "" : "hidden"}`}>
                <Button className="" variant="ghost" onClick={() => handleBack()}>
                    <ArrowLeft className="fill-transparent stroke-amber-700"/>
                </Button>
            </div>
           
            <div>
                <SignOutButton/>
            </div>
        </div>
        
        </div>
    )
}