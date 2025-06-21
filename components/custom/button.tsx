"use client";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

type ThemeType = "primary" | "secondary" | "destructive" | "outline" | "ghost";

export default function CustomButton({children, onClick, loading = false, className = "", theme}: {children: React.ReactNode, onClick: () => void, loading?: boolean, className?: string, theme?: ThemeType}) {

    let themeClass = "";
    switch(theme) {
        case "primary":
            themeClass = "bg-primary text-primary-foreground";
            break;
        case "secondary":
            themeClass = "bg-secondary text-secondary-foreground";
            break;
        case "destructive":
            themeClass = "bg-destructive text-destructive-foreground";
            break;
        case "outline":
            themeClass = "bg-transparent border border-input text-input";
            break;
        case "ghost":
            themeClass = "bg-transparent hover:bg-accent hover:text-accent-foreground text-accent-foreground";
            break;
        default:
            themeClass = "bg-primary text-primary-foreground";
    }
    return (
        <Button className={cn("w-full", className, themeClass)} onClick={onClick} disabled={loading}>
            {loading ? "Loading..." : children}
        </Button>
    )
}