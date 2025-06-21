import prisma from "@/lib/prisma-client";

async function main() {
  console.log("Starting script...");

  // 1. Create two new profiles to act as members
  console.log("Creating new profiles...");
  const member1 = await prisma.profile.create({
    data: {
      userId: `user_${Date.now()}`,
      username: `member_${Date.now()}`,
      email: `member_${Date.now()}@example.com`,
      password: 'password123',
    },
  });

  const member2 = await prisma.profile.create({
    data: {
      userId: `user_${Date.now() + 1}`,
      username: `member_${Date.now() + 1}`,
      email: `member_${Date.now() + 1}@example.com`,
      password: 'password123',
    },
  });
  console.log(`Created profiles: ${member1.username}, ${member2.username}`);

  // 2. Create a new group and connect the members
  console.log("Creating new group...");
  const newGroup = await prisma.group.create({
    data: {
      name: "Cool Coders Club",
      description: "A club for cool coders to hang out.",
      image: "/hero.jpg",
      members: {
        connect: [
          { id: member1.id },
          { id: member2.id },
        ],
      },
    },
    include: {
        members: true, // Include the members in the returned object
    }
  });

  console.log("\n--- Group Created Successfully! ---");
  console.log("Group Details:", {
    id: newGroup.id,
    name: newGroup.name,
    description: newGroup.description,
  });
  console.log("Group Members:", newGroup.members.map(m => ({ id: m.id, username: m.username })));
  console.log("-----------------------------------");

}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
