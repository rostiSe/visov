import GroupCard from "@/components/custom/home/group-card";
import { GroupWithMembers } from "@/lib/types";
import Image from "next/image";

export default function HomeScreen({groups}: {groups: GroupWithMembers[]}) {


  return (
    <div>
      <div className="relative">
        <Image
          src="/hero.jpg"
          alt="globe"
          width={1000}
          height={1500}
          className="w-full h-[22rem] object-cover rounded-b-3xl relative"
        />
        <p className="absolute z-10 text-shadow-xs bottom-0 left-0 p-3 font-serif text-white text-3xl font-medium">
            Willkommen bei <br/> Visov
          </p>
          <div className="w-full z-0 h-40 bg-gradient-to-b from-transparent rounded-b-3xl to-gray-800 absolute bottom-0"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pt-5 px-1">
                {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}
