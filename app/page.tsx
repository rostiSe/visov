import HomeScreen from "./home-screen";
import prisma from "@/lib/prisma-client";

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
  
  return (
    <div>
      <HomeScreen groups={data}/>
    </div>
  );
}
