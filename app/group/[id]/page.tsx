import prisma from "@/lib/prisma-client";
import GroupScreen from "../group-screen";

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
    <div className="flex flex-col pt-16 gap-4">
        <h1 className="text-xl text-amber-800 w-full text-center pt-4">{group.name}</h1>
        <GroupScreen members={data} />
    </div>
  );
}
