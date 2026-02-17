"use client";

import { Progress } from "@/components/ui/progress";


export function ReviewCard({ percentile }: any) {

  return (
    <>
      <div className="text-sm">Performance Percentile</div>
    <div className="flex items-center gap-2">
      <Progress value={percentile / 10} className="h-2 w-full" />
      <span className="text-sm font-medium text-slate-500">{percentile}%</span>
    </div>
    </>
  );

}
