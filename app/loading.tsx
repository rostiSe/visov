import { Skeleton } from "@/components/ui/skeleton";

export default function GroupLoading() {
  return <div className="pt-20">

    <Skeleton className="h-[calc(100vh-20rem)] w-[calc(100vw-2rem)] max-w-[70rem] " />
  </div>;
}