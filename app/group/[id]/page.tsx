import {prisma} from "@/lib/prisma-client";
import GroupScreen from "./group-screen";
import GameScreen from "@/components/game/question/game-screen";
import Image from "next/image";
import GroupSettings from "./settings/group-settings";
import GroupDrawer from "@/components/custom/drawer";
import QuestionPackages from "./question-packages";
import dynamic from 'next/dynamic';

// Dynamically import the client component to avoid SSR issues
const DailyQuestion = dynamic(
  () => import('./daily-question'),
  { ssr: true }
);

export default async function GroupPage({params}: {params: Promise<{id: string}>}) {
  const param = await params
  const group = await prisma.group.findUnique({
    where: {
      id: param.id,
    },
  });
  if(!group){
    throw new Error("Group not found");
  }

  let data = [];
  // GET Members of the group
  try {
    const members = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/members/${param.id}`,{
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
    <div className="flex flex-col gap-4">
        <div className="relative">
                <Image
                  src="/coffee.jpg"
                  alt="globe"
                  width={1000}
                  height={1500}
                  className="w-full h-[17rem] object-cover rounded-b-3xl relative"
                  priority
                  loading="eager"
                  placeholder="blur"
                  blurDataURL="/hero.jpg"
                />
                <div className="absolute bottom-2 z-20 right-2">
                <GroupDrawer
                title="Frage-Pakete"
                description="Frage-Pakete für deine Gruppe"
                triggerClass="size-[3rem] flex items-center justify-center p-2 bg-white rounded-full shadow-sm"
                form={<QuestionPackages groupId={group.id} />}
                />

                </div>
                <p className="absolute z-10 text-shadow-xs bottom-0 left-0 p-3 font-serif text-white text-center w-full text-3xl font-medium">
                   <span className="text-indigo-200 italic">{group.name}</span>
                  </p>
                  <div className="w-full z-0 h-40 bg-gradient-to-b from-transparent rounded-b-3xl to-gray-800 absolute bottom-0"></div>
              </div>
        <GroupScreen members={data} />
        <DailyQuestion groupId={group.id} members={data} />

    </div>
  );
}
