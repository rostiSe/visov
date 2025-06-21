'use client';

import CustomButton from "@/components/custom/button";
import MemberCard from "@/components/custom/home/member-card";

export default function GroupScreen({members}: {members: any}) {
    
    return (
        <div>
            <div className="flex flex-row gap-2">
                {members.map((member: any) => (
                    <MemberCard key={member.id} member={member} />
                ))}
            </div>            
            <CustomButton theme="ghost" onClick={() => {console.log("clicked")}}>Click me</CustomButton>

        </div>
    );
}