import { Prisma, Profile } from "@/lib/generated/prisma";

const groupWithMembers = Prisma.validator<Prisma.GroupDefaultArgs>()({
  include: {
    members: true,
  },
});

export type GroupWithMembers = Prisma.GroupGetPayload<typeof groupWithMembers>;

export type Member = Profile;
