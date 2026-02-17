// not used - merged to applied jobs 
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export function RecommendedJobs({ recommendedJobs }: any) {
  const [jobs, setjobs] = useState(null);

  useEffect(() => {
    if (!recommendedJobs) return;
    setjobs(recommendedJobs);
  }, [recommendedJobs]);

  console.log("jobs", jobs);

  return (
    <>
      {jobs && jobs.length > 0 && (
        <div className="text-sm">
          <div className="bg-white p-4 sticky top-0 z-10 border-b">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Recomended Jobs
              </h2>
              {/* <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Search jobs..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div> */}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-medium text-slate-500">
                  <th className="whitespace-nowrap px-4 py-3">Job Id</th>
                  <th className="whitespace-nowrap px-4 py-3">Name</th>
                  <th className="whitespace-nowrap px-4 py-3">
                    Experience Required
                  </th>
                  <th className="whitespace-nowrap px-4 py-3">Job Location</th>
                  <th className="whitespace-nowrap px-4 py-3">Job Status</th>
                  <th className="whitespace-nowrap px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {jobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      No Recommended Jobs Found.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr
                      key={job.preInterviewId}
                      className={`group transition-colors hover:bg-slate-50`}
                    >
                      <td className="px-4 py-4">{job.preInterviewId}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-2">
                          <div>
                            <div className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
                              {job.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">{job.jobWorkExperience}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {job.jobLocationName}
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant="outline"
                          className={`cursor-pointer ${
                            job.status === "Active"
                              ? "border-slate-200 bg-green-50 text-green-700"
                              : "border-red-200 bg-red-50 text-red-700"
                          }`}
                        >
                          {job.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-4">
                        <Link 
                          href={`/job?p=${job.preInterviewId}`} 
                          target="_blank"
                          rel="noopener noreferrer"  // Security best practice
                        >
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                          >
                            More Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <Card className="overflow-hidden border-none bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="mb-4 rounded-full bg-blue-100 p-3">
                    <Search className="h-6 w-6 text-blue-600" />
                  </div>
                  <Link href="/homepage" target="_blank" rel="noopener noreferrer">
                    <Button
                      className="mt-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      Other Live jobs
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
