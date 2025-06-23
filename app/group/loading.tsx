import { Skeleton } from "@/components/ui/skeleton";

export default function GroupLoading() {
  return <div className="pt-20">
        <div className="flex w-full justify-center items-center py-10 flex-row gap-2">
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-20 w-20 rounded-full" />
    </div>

    <Skeleton className="h-[calc(100vh-20rem)] w-[calc(100vw-2rem)] max-w-[70rem] " />
  </div>;
}