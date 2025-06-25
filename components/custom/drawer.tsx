'use client'

import { Plus } from 'lucide-react';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
  } from '../ui/drawer';
import { CreateGroupForm } from '@/app/forms/create-group';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export default function GroupDrawer({form, triggerClass, title, description}: {form?: ReactNode, triggerClass?: string, title?: string, description?: string}) {
    return (
        <Drawer>
            <DrawerTrigger className={triggerClass}><Plus className="h-5 w-5 stroke-gray-400" /></DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className='text-left'>{title || "Drawer Title"}</DrawerTitle>
                    <DrawerDescription className='text-left'>{description || "Drawer Description"}</DrawerDescription>
                </DrawerHeader>
                <div className='px-4'>
                {!form ? <CreateGroupForm /> : form}

                </div>
            </DrawerContent>
        </Drawer>
    );
}