import { Skeleton } from "@/components/ui/skeleton";

export default function GroupLoading() {
  return <div className="">
    <Skeleton className="h-[15rem] w-[calc(100vw-2rem)] max-w-[70rem] animate-pulse" />
    <div className="flex w-full justify-center items-center py-10 flex-row gap-2">
        <Skeleton className="h-20 w-20 rounded-full animate-pulse" />
        <Skeleton className="h-20 w-20 rounded-full animate-pulse" />
    </div>

    <Skeleton className="h-[calc(100vh-20rem)] w-[calc(100vw-2rem)] max-w-[70rem] animate-pulse" />
  </div>;
} 