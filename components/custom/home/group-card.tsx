'use client'

import { Card } from "@/components/ui/card";
import { GroupWithMembers } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

export default function GroupCard({group}: {group: GroupWithMembers}) {
  return (
    <Link href={`/group/${group.id}`}>
    <Card className="rounded-xl shadow-md border-none px-2 mt-2 overflow-hidden flex flex-row justify-start items-center gap-4">
        <div className="rounded-full z-0 h-full">
            <Image src={group.image || "/hero.jpg"} className="object-cover h-12 w-12 grayscale-50 overflow-hidden rounded-full" alt={group.name} width={100} height={100} />
        </div>
        <div>
        <p className="text-base font-medium text-amber-700 ">{group.name}</p>
            <p className="text-sm text-gray-500 ">{(group.members || []).length} members</p>

        </div>
  </Card>
  </Link>
  );
}