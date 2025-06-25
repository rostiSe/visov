import { SignupForm } from "@/components/auth/signup-form";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-semibold">Sign Up</h1>
        <SignupForm />
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
