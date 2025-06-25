"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }).regex(/^[a-zA-Z0-9_]+$/, {
    message: "Username can only contain letters, numbers, and underscores.",
  }),
  bio: z.string().max(200, {
    message: "Bio must be less than 200 characters."
  }).optional(),
  location: z.string().max(100, {
    message: "Location must be less than 100 characters."
  }).optional(),
});

export default function ProfileCompletionForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      bio: "",
      location: "",
    },
  });

  const handleModalClose = () => {
    setShowForm(!showForm);
    router.replace("/")
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      handleModalClose();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const queryParams = useSearchParams()

  useEffect(() => {
    if (queryParams.get("signup") === "true") {
      handleModalClose()
    }
  }, [queryParams])

  return (
    <div className={cn("absolute top-0 left-0 z-50 h-screen w-screen flex items-center justify-center bg-black/60", showForm ? "block" : "hidden")}>
      <div className="bg-white p-8 mt-10 rounded-lg shadow-lg w-full max-w-md">
        <div className="space-y-2 mb-6 text-center">
          <h1 className="text-2xl font-serif font-medium text-amber-900">Vervollständige dein Profil</h1>
          <p className="text-muted-foreground text-sm">
            Erzähl anderen ein bisschen über dich
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-muted-foreground">@</span>
                      </div>
                      <Input
                        className="pl-8"
                        placeholder="username"
                        {...field}
                        onChange={(e) => {
                          // Convert to lowercase and remove spaces
                          const value = e.target.value.toLowerCase().replace(/\s+/g, '');
                          field.onChange(value);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a bit about yourself..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Where are you from?" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col space-y-2 mt-6">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={handleModalClose}
                disabled={isLoading}
              >
                Skip for now
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}