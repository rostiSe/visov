import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function GroupLoading() {
  return <div className="pt-20 h-screen flex items-center justify-center">

    <Loader2 className="h-12 w-12 animate-spin" />
  </div>;
}