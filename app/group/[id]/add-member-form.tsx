'use client'

import { z } from "zod";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { revalidateGroup } from "@/lib/actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
  
const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  })});
type FormValues = z.infer<typeof formSchema>;

export default function AddMemberForm(){

const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams()


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        username: ""
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("username", data.username);
   

    try {
      const response = await fetch(`/api/groups/members/${params.id}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to add member");
      }
      // Revalidate the group data
      await revalidateGroup(params.id as string);
      router.replace(`/group/${params.id}`);
      router.refresh();
    } catch (error) {
      console.error("Failed to add member", error)
    } finally {
      setIsSubmitting(false);
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
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Username" {...field} />
              </FormControl>
              <FormDescription>
                Das ist der Username des Members, den du hinzufügen möchtest.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
       
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Hinzufügen..." : "Hinzufügen"}
        </Button>
      </form>

            </Form>
    )
}

