import prisma from "@/lib/prisma-client";

async function main() {
  console.log("--- Starting Debug Script ---");

  // 1. Create a new group without members
  console.log("\nStep 1: Creating a new group...");
  const group = await prisma.group.create({
    data: {
      name: `Debug Group ${Date.now()}`,
      description: "A group for debugging the connect issue.",
    },
  });
  console.log(` -> Created group with ID: ${group.id}`);

  // 2. Create a new profile to act as a member
  console.log("\nStep 2: Creating a new profile...");
  const profile = await prisma.profile.create({
    data: {
      userId: `debug_user_${Date.now()}`,
      username: `debug_member_${Date.now()}`,
      email: `debug_${Date.now()}@example.com`,
      password: 'password123',
    },
  });
  console.log(` -> Created profile with ID: ${profile.id}`);

  // 3. Update the group to connect the new profile
  console.log("\nStep 3: Updating the group to connect the profile...");
  const updatedGroup = await prisma.group.update({
    where: { id: group.id },
    data: {
      members: {
        connect: { id: profile.id },
      },
    },
    include: {
        members: true, // Immediately check if the connect worked
    }
  });
  console.log(" -> Update operation complete.");
  console.log(" -> Group members after update:", JSON.stringify(updatedGroup.members, null, 2));

  // 4. Final verification query
  console.log("\nStep 4: Running final verification query...");
  const finalGroup = await prisma.group.findUnique({
    where: { id: group.id },
    include: { members: true },
  });
  console.log(" -> Final group members array:", JSON.stringify(finalGroup?.members, null, 2));
  console.log(` -> Final member count: ${finalGroup?.members?.length}`);

  console.log("\n--- Debug Script Finished ---");
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
