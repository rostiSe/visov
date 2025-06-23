import { Member } from "@/lib/types";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { Profile } from "@/lib/generated/prisma";
  

export default function AddMemberForm({friends}: {friends: Profile[]}){


    return(
        <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Freund hinzufügen" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Friends</SelectLabel>
          {friends.map((friend)=>(
                      <SelectItem key={friend.id} value={friend.username}>{friend.username}</SelectItem>

          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
    )
}

