import Image from "next/image";

export default function MemberCard({member}: {member: any}) {
    return (
        <div className="max-w-24">
            <Image
                src={member.profilePicture}
                alt="profile"
                width={100}
                height={100}
                className="rounded-full size-20 shadow-2xl border border-gray-500"
            />
            <p className=" line-clamp-1">{member.username}</p>
        </div>
    );
}