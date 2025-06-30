import { Suspense } from "react";
import HomeScreen from "./home-screen";
import GroupLoading from "./loading";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function Home() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if(!session) {
        redirect("/login");
    }
    
    try {
        const groupsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups?userId=${session.user.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: {
                revalidate: 3600,
                tags: ["groups"],
            }
        });
        
        if (!groupsResponse.ok) {
            throw new Error('Failed to fetch groups');
        }
        
        const groupsData = await groupsResponse.json();
      
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/${session.user.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: {
                revalidate: 3600,
                tags: ["profile"],
            }
        });
        
        if (!userResponse.ok) {
            throw new Error('Failed to fetch user profile');
        }
        
        const userData = await userResponse.json();
        
        return (
            <div>
                <Suspense fallback={<GroupLoading/>}>
                    <HomeScreen user={userData} groups={groupsData} />
                </Suspense>
            </div>
        );
    } catch (error) {
        console.error('Error in Home component:', error);
        return (
            <div className="p-4 text-red-600">
                Error loading data. Please try again later.
            </div>
        );
    }
}
