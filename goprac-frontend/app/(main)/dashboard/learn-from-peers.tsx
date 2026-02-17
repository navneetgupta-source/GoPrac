"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, ChartNoAxesCombined, MoveRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export function LearnFromPeers({
  competencySubject,
}: {
  competencySubject: any;
}) {
  console.log("competencySubject", competencySubject);

  return (
    <>
      <Card className="overflow-hidden border-none bg-white shadow-sm">
        <CardContent className="p-6 ">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4">
            {!competencySubject &&
              Array.from({ length: 4 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}

            {competencySubject &&
              competencySubject.map((subject: any) => (
                <Card
                  className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 justify-between"
                  key={subject.id}
                >
                  <CardHeader>
                    <CardTitle>
                      <div className=" text-lg font-extrabold text-slate-800">
                        <Award className="inline-block text-primary h-5 w-5" />
                        {subject.name}
                      </div>
                    </CardTitle>
                    <CardDescription className="text-slate-700 font-extrabold">
                      {subject.count} Responses
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 justify-between">
                    <Link href={`/peer/?s=${subject.id}`} className="px-6 py-2 w-fit flex items-center gap-1 text-white bg-primary rounded-lg font-extrabold shadow-md">
                      {/* <Button className="rounded-lg font-extrabold shadow-md"> */}
                        Show Details <MoveRight />
                      {/* </Button> */}
                    </Link>
                  </CardContent>
                  <CardFooter>
                    <Link
                      href={`/leaderboard/${subject.id}`}
                      className="text-blue-500 font-medium mx-auto"
                    >
                      <div className="flex gap-1">
                        <ChartNoAxesCombined className="h-4 w-4" />
                        <span>Current Leaderboard</span>
                      </div>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}
