import GroupDrawer from "@/components/custom/drawer";
import MemberCard from "@/components/custom/home/member-card";
import { Member } from "@/lib/types";
import AddMemberForm from "./add-member-form";
import prisma from "@/lib/prisma-client";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function GroupScreen({members}: {members: Member[]}) {
    const friends = await prisma.profile.findMany()
    console.log(Array(friends))
    return (
        <div>
            <div className="flex flex-row gap-2">
                {members.map((member) => (
                    <MemberCard key={member.id} member={member} />
                ))}
                            <GroupDrawer triggerClass=" p-2 bg-white rounded-full shadow-sm" form={<AddMemberForm friends={friends}/>} />
            </div>            
        </div>
    );
}