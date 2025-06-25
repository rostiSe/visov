import {
    Dialog,
    DialogDescription,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
  } from '../ui/dialog';
  
  export default function Modal({children}: {children: React.ReactNode}) {
    return (
      <Dialog>
        <DialogTrigger className='bg-zinc-950 px-4 py-2 text-sm text-white hover:bg-zinc-900 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100'>
          Join the waitlist
        </DialogTrigger>
        <DialogContent className='w-full max-w-md bg-white p-6 dark:bg-zinc-900'>
          <DialogHeader>
            <DialogTitle className='text-zinc-900 dark:text-white'>
              Join the waitlist
            </DialogTitle>
            <DialogDescription className='text-zinc-600 dark:text-zinc-400'>
              Enter your email address to receive updates when we launch.
            </DialogDescription>
          </DialogHeader>
          
          {children}
          <DialogClose />
        </DialogContent>
      </Dialog>
    );
  }
  