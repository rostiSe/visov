import GroupDrawer from "@/components/custom/drawer";
import MemberCard from "@/components/custom/home/member-card";
import { Member } from "@/lib/types";
import AddMemberForm from "./add-member-form";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default async function GroupScreen({ members }: { members: Member[] }) {
  return (
    <div>
      <ScrollArea className="max-w-screen">
        <div className="flex relative w-screen justify-start space-x-4 p-4 items-center">
          <GroupDrawer
            title="Hinzufügen"
            description="Füge ein neues Mitglied zu deiner Gruppe hinzu"
            triggerClass="size-[3rem] flex items-center justify-center p-2 bg-white rounded-full shadow-sm"
            form={<AddMemberForm />}
          />
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
        <div className="w-[2rem] absolute right-0 h-full top-0 bg-gradient-to-r to-amber-50 from-transparent"></div>
        <div className="w-[2rem] absolute left-0 h-full top-0 bg-gradient-to-l to-amber-50 from-transparent"></div>
      </ScrollArea>
    </div>
  );
}
