import { prisma } from "@/lib/prisma-client";
import GroupScreen from "./[id]/group-screen";
import GameScreen from "@/components/game/question/game-screen";
import QuestionPackages from "./[id]/question-packages";

export default async function Start() {
  const group = await prisma.group.findUnique({
    where: {
      id: "9d215f26-8e03-48c3-aabd-49d23e1570c6",
    },
  });
  if(!group){
    throw new Error("Group not found");
  }

  let data = [];
  // GET Members of the group
  try {
    const members = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/members/${group.id}`,{
      next: {
        revalidate: 3600,
      },
    })
    if (!members.ok) {
      throw new Error("Failed to fetch members");
    }
    data = await members.json()
    
  } catch (error) {
  console.error("Failed to fetch members", error)
  }

    return (
        <div className="flex flex-col gap-4 mt-20">
            <GroupScreen members={data}/>
            <GameScreen members={data}/>
            <QuestionPackages groupId={group.id} />
        </div>
    )
}