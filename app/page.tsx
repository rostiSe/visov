import { Suspense } from "react";
import HomeScreen from "./home-screen";
import GroupLoading from "./loading";

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
  
  return (
    <div>
      <Suspense fallback={<GroupLoading/>}>
      <HomeScreen groups={data}/>

      </Suspense>
    </div>
  );
}
