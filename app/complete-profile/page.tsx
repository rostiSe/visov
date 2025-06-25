import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileCreationForm from "@/components/profile-creation-form";
import prisma from "@/lib/prisma-client";

export default async function CompleteProfilePage() {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      // Create a Headers object to satisfy the type requirements
      headers: new Headers()
    });

    // If no session, redirect to login
    if (!session?.user?.id) {
      redirect("/login?redirect=/complete-profile");
    }

    // Check if user already has a profile
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    });

    // If profile already exists with some data, redirect to home
    if (profile?.username) {
      redirect("/");
    }

    // If we have a basic profile (created during signup), allow editing
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Complete Your Profile</h1>
            <p className="text-muted-foreground">
              Tell us a bit more about yourself to get started.
            </p>
          </div>
          <ProfileCreationForm />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in CompleteProfilePage:", error);
    redirect("/");
  }
}
