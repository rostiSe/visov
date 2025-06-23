"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Group name must be at least 2 characters.",
  }),
  description: z.string().max(160).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateGroupForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
   

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to create group");
      }

      const result = await response.json();
     
      router.push(`/group/${result.id}`);
    } catch (error) {
   
    } finally {
      setIsSubmitting(false);
    }
  };
  


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
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
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about your group"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A brief description of what this group is about.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {preview && (
            <div className="mt-4">
                <img src={preview} alt="Image preview" className="w-32 h-32 object-cover rounded-md" />
            </div>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Group"}
        </Button>
      </form>
    </Form>
  );
}
