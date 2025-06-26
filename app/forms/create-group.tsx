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
import { useEffect, useState } from "react";
import { revalidateGroups } from "@/lib/actions";
import { Profile } from "@/lib/generated/client";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Group name must be at least 2 characters.",
  }),
  description: z.string().max(160).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateGroupFormProps {
  user: Profile;
}

export function CreateGroupForm({ user }: CreateGroupFormProps) {
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
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("userId", user.id);

    try {
      const response = await fetch(`/api/groups`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create group");
      }

      const result = await response.json();
      await revalidateGroups();
      router.push(`/group/${result.id}`);
      router.refresh(); // Refresh to update the UI
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
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
              <FormLabel>Gruppen Name</FormLabel>
              <FormControl>
                <Input placeholder="Meine Gruppe" {...field} />
              </FormControl>
              <FormDescription>
                Dein öffentlicher Anzeigename für die Gruppe.
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
              <FormLabel>Gruppen Beschreibung</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Erzähle uns ein bisschen über deine Gruppe"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Eine kurze Beschreibung der Gruppe.
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
          {isSubmitting ? "Erstellen..." : "Erstellen"}
        </Button>
      </form>
    </Form>
  );
}
