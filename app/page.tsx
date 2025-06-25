import { Suspense } from "react";
import HomeScreen from "./home-screen";
import GroupLoading from "./loading";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function Home() {
    const groups = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups`,{
      next: {
        revalidate: 3600,
        tags: ["groups"],
      }
    })
    if (!groups.ok) {
      throw new Error("Failed to fetch groups");
    }
    const data = await groups.json()

    const session = await auth.api.getSession({
      headers: await headers()
  })

  if(!session) {
      redirect("/login")
  }
  console.log(session)
  
  const user = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/${session.user.id}`,{
    next: {
      revalidate: 3600,
      tags: ["profile"],
    }
  })
  if (!user.ok) {
    throw new Error("Failed to fetch user");
  }
  const userData = await user.json()
  
  return (
    <div>
      <Suspense fallback={<GroupLoading/>}>
      <HomeScreen user={userData} groups={data}/>
      </Suspense>
    </div>
  );
}
