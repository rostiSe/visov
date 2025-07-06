// components/package/create-package-dialog.tsx
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreatePackageForm } from "@/app/forms/create-package-form"
import { Package, Plus } from "lucide-react"

export function CreatePackageDialog({ groupId }: { groupId: string }) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          groupId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create package')
      }

      setOpen(false)
    } catch (error) {
      console.error('Error creating package:', error)
      throw error
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="text-amber-800 relative"> <Plus className="absolute left-1 top-1 size-3" /> <Package className="size-5" /></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Erstelle ein Paket</DialogTitle>
          <DialogDescription>
            Erstelle ein Paket mit Fragen für deine Gruppe.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <CreatePackageForm groupId={groupId} onSubmit={handleSubmit} />
        </div>
      </DialogContent>
    </Dialog>
  )
}