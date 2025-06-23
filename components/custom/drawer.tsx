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
                    <DrawerTitle className='text-left'>Erstelle eine Gruppe</DrawerTitle>
                    <DrawerDescription className='text-left'>Drawer Description</DrawerDescription>
                </DrawerHeader>
                <div className='px-20 mx-auto'>
                {form}

                </div>
                <CreateGroupForm />
            </DrawerContent>
        </Drawer>
    );
}