import Image from "next/image";
import { Member } from "@/lib/types";

export default function MemberCard({member}: {member: Member}) {
    return (
        <div className="flex flex-col items-center justify-center">
            <Image
                src={"/hero.jpg"}
                alt="profile"
                width={100}
                height={100}
                className="rounded-full w-[4rem] h-[4rem] object-cover"
            />
            <p className="max-w-24 line-clamp-1 text-xs text-lime-700">@{member.username}</p>
        </div>
    );
}