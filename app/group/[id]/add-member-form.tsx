'use client'

import { Profile } from "@/lib/generated/prisma";
import { z } from "zod";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import MemberCard from "@/components/custom/home/member-card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
  
const formSchema = z.object({
  username: z.string().min(2, {
    message: "Group name must be at least 2 characters.",
  })});
type FormValues = z.infer<typeof formSchema>;

export default function AddMemberForm({friends}: {friends: Profile[]}){

const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        username: "Russ Rustermann"
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("username", data.username);
   

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/members/${params.id}`, {
        method: "POST",
        body: formData,
        next: {
            revalidate: 60
        }
      });
      if (!response.ok) {
        throw new Error("Failed to create group");
      }

      const result = await response.json();
    } catch (error) {
   
    } finally {
      setIsSubmitting(false);
      router.refresh();
    }
  };
    return(
        <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input placeholder="My Awesome Group" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name for the group.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
       
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Group"}
        </Button>
      </form>

            </Form>
    )
}

