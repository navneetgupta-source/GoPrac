"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkillChart } from "./_components/skill-chart";
import { JobApplicationsTable } from "./_components/job-applications-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useUserStore } from "@/stores/userStore";
import { AppliedJobs } from "./applied-jobs";
import { MyCourse } from "./my-course";
import { LearnFromPeers } from "./learn-from-peers";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { RecommendedJobs } from "./recommended-jobs";

// Async function to fetch weather data

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>("my-course");

  const [data, setData] = useState(null);
  const [practiceData, setPracticeData] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [peersData, setPeersData] = useState(null);

  const userId = useUserStore((state) => state.userId);
  const userType = useUserStore((state) => state.userType);

  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const page = searchParams.get("page");
    if (page === "my-course" || page === "applied-jobs") {
      setActiveTab(page);
    }

    const highlight = searchParams.get("highlightId");
    if (highlight) {
      setHighlightId(highlight);
    }

    // Remove query params after applying them
    if (page || highlight) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("page");
      newUrl.searchParams.delete("highlightId");
      window.history.replaceState({}, "", newUrl.toString());
    }

    const cid = searchParams.get("cid");
    if (cid) {
      setCandidateId(cid);
    } else {
      setCandidateId(userId);
    }
  }, [searchParams, userId]);


  // fetch dashbord data
  useEffect(() => {
    if(!candidateId) return;
    if (!userId) return;
    const fetchFilters = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?getDashboardData`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            candidateId,
            userId,
            userType,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch weather");
      }
      return response.json();
    };
    fetchFilters()
      .then((res) => setData(res.data))
      .catch(console.error);
  }, [userId, userType, candidateId]);

  // fetch practice data
  useEffect(() => {
    if(!candidateId) return;
    if (!userId) return;
    const fetchFilters = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?getDashboardPracticeData`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            candidateId,
            userId,
            userType,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch weather");
      }
      return response.json();
    };
    fetchFilters()
      .then((res) => setPracticeData(res.data))
      .catch(console.error);
  }, [userId, userType, candidateId]);

  // fetch job data
  useEffect(() => {
    if(!candidateId) return;
    if (!userId) return;
    const fetchFilters = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?getDashboardJobData`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            candidateId,
            userId,
            userType,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch weather");
      }
      return response.json();
    };
    fetchFilters()
      .then((res) => setJobData(res.data))
      .catch(console.error);
  }, [userId, userType, candidateId]);

  // fetch Peers data
  useEffect(() => {
    if (!userId) return;
    const fetchFilters = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?getDashboardFilters`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            userId: userId,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch weather");
      }
      return response.json();
    };

    fetchFilters().then(setPeersData).catch(console.error);
  }, [userId]);

  return (
    <div className="container px-4 py-6 sm:px-6 lg:px-8 mx-auto">
      <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-100 via-indigo-50 to-indigo-50 p-6 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome Back, {data?.candidate?.firstName}
        </h1>
        <p className="text-slate-600">
          Your Profile Is Complete –{" "}
          <a
            href="/profile"
            className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Click to Make Updates!
          </a>
        </p>
      </div>

      <Tabs
        className="mb-8 w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-6 w-full h-10 justify-start gap-2 rounded-lg bg-white p-1">
          <TabsTrigger
            value="my-course"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-indigo-500 data-[state=active]:text-white cursor-pointer"
          >
            My Course ({practiceData?.pracount || 0})
          </TabsTrigger>
          {data?.placementSupport && data.placementSupport !== "n" && (
            <TabsTrigger
              value="applied-jobs"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-indigo-500 data-[state=active]:text-white cursor-pointer"
            >
              Applied Jobs (
              {(jobData?.jobInterview?.length || 0) +
                (jobData?.applyInterview?.length || 0)}
              )
            </TabsTrigger>
          )}

          {/* {data?.placementSupport && data.placementSupport !== "n" && <></>} */}
          <TabsTrigger
            value="learn-from-peers"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-indigo-500 data-[state=active]:text-white cursor-pointer"
          >
            Learn From Peers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-course" className="space-y-6">
          <CardContent className="p-0">
            {practiceData && (
              <MyCourse
                chartData={practiceData?.barChartData}
                practiceInterview={practiceData?.practiceInterview}
                practiceInterviewChild={practiceData?.practiceInterviewchild}
                highlightId={highlightId}
                recommendedPractice={practiceData?.recommendedPractice}
              />
            )}
            {!practiceData && (
              <div className="flex flex-row space-y-3">
                <Skeleton className="h-[300px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            )}
          </CardContent>
        </TabsContent>

        <TabsContent value="applied-jobs">
          <Card className="overflow-hidden border-none bg-white shadow-sm">
            <CardContent className="p-0">
              {jobData && (
                <>
                  <AppliedJobs
                    jobInterview={jobData?.jobInterview}
                    applyInterview={jobData?.applyInterview}
                    highlightId={highlightId}
                    recommendedJobs={jobData?.recommendedJobs}
                    placementSupport={jobData?.placementSupport}
                  />
                </>
              )}
              {!jobData && (
                <div className="flex flex-row space-y-3">
                  <Skeleton className="h-[300px] w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learn-from-peers">
          <LearnFromPeers competencySubject={peersData?.competencySubject} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
