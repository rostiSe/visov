import HomeScreen from "./home-screen";
import prisma from "@/lib/prisma-client";

export default async function Home() {
    const groups = await prisma.group.findMany({
      include: {
        members: true,
      },
    });
  
  return (
    <div>
      <HomeScreen groups={groups}/>
    </div>
  );
}
