// app/forms/create-package-form.tsx
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

// Define form schema
const questionSchema = z.object({
  text: z.string().min(5, "Frage muss mindestens 5 Zeichen lang sein"),
})

const formSchema = z.object({
  title: z.string().min(3, "Titel muss mindestens 3 Zeichen lang sein"),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1, "Mindestens eine Frage ist erforderlich"),
  groupId: z.string().min(1, "Gruppen-ID ist erforderlich")
})

type FormValues = z.infer<typeof formSchema>

export function CreatePackageForm({ 
  groupId,
  onSubmit 
}: { 
  groupId: string
  onSubmit: (data: Omit<FormValues, 'groupId'>) => Promise<void> 
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      questions: [{ text: "" }],
      groupId: groupId
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  })

  async function handleSubmit(data: FormValues) {
    try {
      await onSubmit(data)
      toast("Paket erfolgreich erstellt")
      form.reset({
        title: "",
        description: "",
        questions: [{ text: "" }],
        groupId: groupId
      })
    } catch (error) {
      toast("Fehler beim Erstellen des Pakets. Bitte versuche es erneut.")
    }
  }

  return (
    <div className="w-full space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <input type="hidden" {...form.register('groupId')} />
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paketname</FormLabel>
                <FormControl>
                  <Input placeholder="Gib einen Namen für das Paket ein" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beschreibung (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Beschreibe das Paket"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Fragen</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ text: "" })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Frage hinzufügen
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start space-x-2">
                  <FormField
                    control={form.control}
                    name={`questions.${index}.text`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground">{index + 1}.</span>
                            <Input
                              placeholder={`Frage ${index + 1}`}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset({
                title: "",
                description: "",
                questions: [{ text: "" }],
                groupId: groupId
              })}
            >
              Zurücksetzen
            </Button>
            <Button type="submit">Paket erstellen</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}