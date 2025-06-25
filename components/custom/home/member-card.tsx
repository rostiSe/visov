import Image from "next/image";
import { Member } from "@/lib/types";

export default function MemberCard({member}: {member: Member}) {
    return (
        <div className=" rounded-2xl py-5 w-[7rem]  flex flex-col items-center justify-items-center bg-white shadow-lg">
            <Image
                src={"/hero.jpg"}
                alt="profile"
                width={100}
                height={100}
                className="rounded-full w-[5rem] h-[5rem] shadow-2xl object-cover"
            />
            <p className="max-w-24 line-clamp-1">{member.username}</p>
        </div>
    );
}