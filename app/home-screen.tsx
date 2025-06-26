'use client'

import GroupCard from "@/components/custom/home/group-card";
import ToolButton from "@/components/custom/home/tool-button";
import { GroupWithMembers } from "@/lib/types";
import Image from "next/image";
import useFilterStore from "./store/filter-store";
import ProfileCreationForm from "@/components/profile-creation-form";
import { Profile } from "@/lib/generated/client";

export default function HomeScreen({groups, user}: {groups: GroupWithMembers[], user: Profile}) {

  const search = useFilterStore((state: any) => state.search);
  return (
    <div>
      <div className="relative w-full">
        <Image
          src="/hero.jpg"
          alt="globe"
          width={1000}
          height={1500}
          className="w-full h-[22rem] object-cover rounded-b-3xl relative"
          priority
          loading="eager"
        />
        <p className="absolute z-10 text-shadow-xs bottom-0 left-0 p-3 font-serif text-white text-3xl font-medium">
            Willkommen bei <br/> Visov, <span className="text-amber-500 italic">{user.username}</span>
          </p>
          <div className="w-full z-0 h-40 bg-gradient-to-b from-transparent rounded-b-3xl to-gray-800 absolute bottom-0"></div>

      </div>
      <div className="relative pt-6 mb-5">
        <ToolButton user={user} />
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 py-5 px-1">
                {(groups || [])
                  .filter((group) =>
                    search
                      ? group.name.toLowerCase().includes(search.toLowerCase())
                      : true
                  )
                  .map((group) => (
                    <GroupCard key={group.id} group={group} />
                  ))}
      </div>
      <ProfileCreationForm />
    </div>
  );
}
