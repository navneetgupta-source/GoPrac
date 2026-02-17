"use client";

import { Progress } from "@/components/ui/progress";

export function ReviewCard({ percentile, peer }: any) {
  // console.log("percentile", percentile);

  return (
    <>
      {percentile != "NA" && (
        <>
        {peer ? (
          <div className="text-sm">Peer Performance Percentile</div>
        ):(
          <div className="text-sm">Performance Percentile</div>
        )}
          <div className="flex items-center gap-2">
            <Progress value={percentile} className="h-2 w-full" />
            <span className="text-sm font-medium text-slate-500">
              {percentile}%
            </span>
          </div>
        </>
      )}
    </>
  );
}
