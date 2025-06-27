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

interface GroupDrawerProps {
    form?: React.ReactNode;
    triggerClass?: string;
    triggerText?: string;
    title?: string;
    description?: string;
    open?: boolean;
    children?: React.ReactNode;
}

export default function GroupDrawer({
    form,
    triggerClass = '',
    triggerText,
    title,
    description,
    open,
    children
}: GroupDrawerProps) {
    return (
        <Drawer open={open}>
            <DrawerTrigger className={triggerClass}>
                {children || (
                    triggerText ? (
                        <span className="flex items-center gap-2">
                            <Plus className="h-4 w-4 stroke-gray-400" />
                            {triggerText}
                        </span>
                    ) : (
                        <Plus className="h-5 w-5 stroke-gray-400" />
                    )
                )}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className='text-left'>{title || "Drawer Title"}</DrawerTitle>
                    {description && (
                        <DrawerDescription className='text-left'>{description}</DrawerDescription>
                    )}
                </DrawerHeader>
                <div className='px-4 pb-6'>
                    {form}
                </div>
            </DrawerContent>
        </Drawer>
    );
}