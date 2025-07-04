import GroupDrawer from "@/components/custom/drawer";
import MemberCard from "@/components/custom/home/member-card";
import { Member } from "@/lib/types";
import AddMemberForm from "./add-member-form";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default async function GroupScreen({ members }: { members: Member[] }) {
  return (
    <div>
      <ScrollArea className="max-w-screen">
        <div className="flex w-screen justify-start space-x-4 p-4 items-center">
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
      </ScrollArea>
    </div>
  );
}
