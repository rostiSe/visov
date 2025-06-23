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

export default function GroupDrawer({form}: {form?: React.ReactNode}) {
    return (
        <Drawer>
            <DrawerTrigger><Plus className="h-5 w-5 stroke-gray-400" /></DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className='text-right'>Erstelle eine Gruppe</DrawerTitle>
                    <DrawerDescription className='text-right'>Drawer Description</DrawerDescription>
                </DrawerHeader>
                {form}
                <CreateGroupForm />
            </DrawerContent>
        </Drawer>
    );
}