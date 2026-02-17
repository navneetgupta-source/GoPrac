"use client";

import { useEffect, useState } from "react";
import { Button } from "components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ChartBar } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";


import MalpracticeBadges from "./_components/MalpracticeBadges";

export function AppliedJobs({
  jobInterview,
  applyInterview,
  highlightId,
  recommendedJobs,
  placementSupport,
}: any) {
  // const [searchTerm, setSearchTerm] = useState("");
  // const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const [jobApplications, setJobApplications] = useState(null);
  const [hoveredAnalytics, setHoveredAnalytics] = useState({});
  // const [recommendedJobs, setRecommendedJobs] = useState(null);

  useEffect(() => {
    if (!jobInterview && !applyInterview) return;
    const interviews = [...applyInterview, ...jobInterview];

    interviews.forEach(function (row) {
      const candidateStatus = row.newcandidStatus;

      if (candidateStatus == "Assessment Completed") {
        row.nextStep =
          "Your  meeting confirmation with the Hiring Manager will be attained in the next 72 Hrs based on the interview performance of other candidates already in the pipeline.";
      } else if (candidateStatus == "Assessment Awaited") {
        row.nextStep =
          "Please revisit this page within the next 45 minutes to check your results.";
      } else if (candidateStatus == "Assessment Rejected") {
        row.nextStep =
          "We encourage you to retake the interview promptly. Your commitment to this process is appreciated, and we look forward to receiving your updated assessment.";
      } else if (candidateStatus == "Future Scheduled") {
        row.nextStep =
          "We will notify you to take Interview ONLY if selected based on your profile.";
      } else if (candidateStatus == "Re-Scheduled") {
        row.nextStep =
          "We will notify you to take Interview ONLY if selected based on your profile.";
      } else if (candidateStatus == "Applied") {
        row.nextStep =
          "We will notify you to take Interview ONLY if selected based on your profile.";
      } else if (candidateStatus == "Profile Mismatch") {
        row.nextStep =
          "Sorry ! We can not  process your application due to low Profile Match with the Job Description. We will notify you as soon as a new job relevant to your profile is posted on the platform.";
      } else if (candidateStatus == "Profile Match") {
        row.nextStep =
          "The corporate team is shortlisting candidates for further rounds of interviews and If you are shortlisted we will notify you within the next 72 hours";
      } else if (candidateStatus == "Profile Shared") {
        row.nextStep =
          "Confirmation or rejection of your meeting with the Hiring Manager will be provided within the next 15 working days. Please note that delays in process can happen due to non availability of the Hiring Managers time";
      } else if (candidateStatus == "Client Shortlisted") {
        row.nextStep =
          "You can expect to receive communication shortly to schedule a face-to-face interview from the Company. Please note that delays in communication can happen due to non availability of the Hiring Managers time.";
      } else if (candidateStatus == "Recruiter Reject") {
        row.nextStep =
          "We encourage you to explore Other JOB Opportunities on the platform. We wish you continued success.";
      } else if (candidateStatus == "Client Screen Reject") {
        row.nextStep = "";
      } else if (candidateStatus == "Client Interview Reject") {
        row.nextStep = "";
      } else if (candidateStatus == "Client Duplicate Reject") {
        row.nextStep = "";
      } else if (candidateStatus == "Candidate Withdrawal") {
        row.nextStep = "";
      } else if (candidateStatus == "Offer Drop") {
        row.nextStep = "";
      } else if (candidateStatus == "Offered") {
        row.nextStep =
          "Contact the company for further steps.We wish you continued success.";
      } else if (candidateStatus == "Joined") {
        row.nextStep = "For further process, please contact the company. ";
      } else {
        row.nextStep = "";
      }
    });

    const sortedData = interviews.sort((a, b) => {
      const iscIdA = a.iscId ?? 0;
      const iscIdB = b.iscId ?? 0;

      return iscIdB - iscIdA;
    });

    setJobApplications(sortedData);
  }, [jobInterview, applyInterview]);

  //   useEffect(() => {
  //   if (!recommendedJobs) return;
  //   setRecommendedJobs(recommendedJobs);
  // }, [recommendedJobs]);

  const fetchAnalytics = async (preInterviewId) => {
    if (hoveredAnalytics[preInterviewId]) return; // already fetched

    const res = await fetch(
      `/api/dashboard/getPreInterviewAnalytics?preInterviewId=${preInterviewId}`
    );
    const data = await res.json();
    setHoveredAnalytics((prev) => ({ ...prev, [preInterviewId]: data }));
  };

  const handleGoToPayment = (interviewId) => {
    if (!interviewId) {
      return;
    }
    if (interviewId == "practice") {
      window.location.href = "/payment?i=practice&plan=1m";
    } else {
      window.location.href = "/payment?i=" + interviewId;
    }
  };

  console.log("jobApplications", jobApplications);

  return (
    <>
      {jobApplications && jobApplications.length > 0 && (
        <div className="text-sm">
          <div className="bg-white p-4 sticky top-0 z-10 border-b">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Applied Jobs
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

          <div className="overflow-auto max-h-[500px]">
            <table className="w-full border-collapse">
              <thead className="sticky top-0">
                <tr className="bg-slate-50 text-left text-xs font-medium text-slate-500">
                  <th className="whitespace-nowrap px-4 py-3">Job Details</th>
                  <th className="whitespace-nowrap px-4 py-3">Job Status</th>
                  <th className="whitespace-nowrap px-4 py-3">
                    Hiring Company
                  </th>
                  <th className="whitespace-nowrap px-4 py-3">
                    AI Screening Status
                  </th>
                  <th className="whitespace-nowrap px-4 py-3">
                    Malpractice Status
                  </th>
                  <th className="whitespace-nowrap px-4 py-3">
                    Recruitment Status
                  </th>
                  <th className="whitespace-nowrap px-4 py-3">Next Step</th>
                  <th className="whitespace-nowrap px-4 py-3">
                    Personalized Feedback
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {jobApplications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      No job applications found matching your search.
                    </td>
                  </tr>
                ) : (
                  jobApplications.map((job) => (
                    <tr
                      key={job.iscId}
                      className={`group transition-colors hover:bg-slate-50 ${
                        highlightId &&
                        job.interviewSessionId &&
                        highlightId === job.interviewSessionId
                          ? "bg-yellow-50 hover:bg-yellow-100"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-2">
                          <div>
                            <div
                              className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                              onClick={() =>
                                window.open(
                                  "/job?p=" + job.preInterviewId,
                                  "_blank"
                                )
                              }
                            >
                              {job.interviewName}
                            </div>
                            {job.interviewSessionId && (
                              <div className="mt-1 text-xs text-slate-500">
                                {new Date(
                                  Number(job.interviewSessionId)
                                ).toLocaleString("en-IN", {
                                  timeZone: "Asia/Kolkata",
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500 flex gap-1">
                        <Badge
                          variant="outline"
                          className={`${
                            job.jobStatus === "Open"
                              ? "border-green-200 bg-green-50 text-green-700"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                          }`}
                        >
                          {job.jobStatus}
                        </Badge>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onMouseEnter={() =>
                                fetchAnalytics(job.preInterviewId)
                              }
                            >
                              <ChartBar />
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-64 space-y-1">
                            {hoveredAnalytics[job.preInterviewId] ? (
                              <div className="text-xs">
                                <div>
                                  <span className="font-semibold">
                                    Current Status
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-xs">
                                    Total Applicants
                                  </span>{" "}
                                  {
                                    hoveredAnalytics[job.preInterviewId]
                                      .total_applicants
                                  }
                                </div>
                                <div>
                                  <span className="font-medium text-xs">
                                    Screened via AI Interview
                                  </span>{" "}
                                  {
                                    hoveredAnalytics[job.preInterviewId]
                                      .screened_via_ai
                                  }
                                </div>
                                <div>
                                  <span className="font-medium text-xs">
                                    Shortlisted Candidates (AI interview Score):
                                  </span>{" "}
                                  {hoveredAnalytics[job.preInterviewId]
                                    .top_shortlisted || (
                                    <span className="italic text-slate-400 text-xs">
                                      No data
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="italic text-slate-400">
                                Loading...
                              </div>
                            )}
                          </HoverCardContent>
                        </HoverCard>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {job.hiring_company}
                      </td>
                      <td className="px-4 py-4">
                        {job.interviewStatus == "Assessment Completed" && (
                          <Badge
                            onClick={() => window.open(job.url, "_blank")}
                            variant="outline"
                            className={`cursor-pointer ${
                              job.interviewStatus === "NA"
                                ? "border-slate-200 bg-slate-50 text-slate-700"
                                : job.interviewStatus === "Assessment Completed"
                                ? "border-blue-200 bg-blue-50 text-blue-700"
                                : "border-red-200 bg-red-50 text-red-700"
                            }`}
                          >
                            {job.interviewStatus === "NA"
                              ? "Not Applicable"
                              : job.interviewStatus}
                          </Badge>
                        )}
                        {job.interviewStatus != "Assessment Completed" && (
                          <Badge
                            onClick={() =>
                              window.open(
                                "/job?p=" + job.preInterviewId,
                                "_blank"
                              )
                            }
                            variant="outline"
                            className={`cursor-pointer ${
                              job.interviewStatus === "NA"
                                ? "border-slate-200 bg-slate-50 text-slate-700"
                                : job.interviewStatus === "Assessment Completed"
                                ? "border-blue-200 bg-blue-50 text-blue-700"
                                : "border-red-200 bg-red-50 text-red-700"
                            }`}
                          >
                            {job.interviewStatus === "NA"
                              ? "Not Applicable"
                              : job.interviewStatus}
                          </Badge>
                        )}
                      </td>
                      <td>
                        <MalpracticeBadges job={job} />
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant="outline"
                          className={`${
                            job.newcandidStatus === "Profile Match"
                              ? "border-green-200 bg-green-50 text-green-700"
                              : "border-gray-200 bg-gray-50 text-gray-700"
                          }`}
                        >
                          {job.newcandidStatus}
                        </Badge>
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-4 text-xs text-slate-500">
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <span>{job.nextStep}</span>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="flex justify-between space-x-4">
                              <div className="space-y-1">
                                <p className="text-sm">{job.nextStep}</p>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </td>
                      <td className="px-4 py-4">
                        {job.interviewStatus == "Assessment Completed" && (
                          <>
                            {job.payment_status != "PAID" && (
                              <Button
                                onClick={() =>
                                  handleGoToPayment(job.interviewId)
                                }
                                size="sm"
                                className="cursor-pointer bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                              >
                                Pay to Unlock
                              </Button>
                            )}

                            {job.payment_status == "PAID" && (
                              <Button
                                onClick={() =>
                                  window.open(
                                    "/review?s=" + job.interviewSessionId,
                                    "_blank"
                                  )
                                }
                                size="sm"
                                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                              >
                                View
                              </Button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="my-8 border-t-[3px] border-gray-400 shadow-sm"></div>
      {placementSupport &&
        placementSupport !== "n" &&
        recommendedJobs &&
        recommendedJobs.length > 0 && (
        <div className="text-sm mt-6">
          <div className="bg-white p-4 sticky top-0 z-10 border-b">
            <h2 className="text-lg font-semibold text-slate-900">
              Recommended Jobs
            </h2>
          </div>

          <div className="overflow-auto max-h-[500px]">
            <table className="w-full border-collapse table-fixed max-w-5xl">
              <thead className="sticky top-0">
                <tr className="bg-slate-50 text-left text-xs font-medium text-slate-500">
                  <th className="whitespace-nowrap px-4 py-3 w-2/5">Job Details</th>
                  <th className="whitespace-nowrap px-4 py-3 w-1/5">Job Status</th>
                  <th className="whitespace-nowrap px-4 py-3 w-2/5">Hiring Company</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recommendedJobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      No Recommended Jobs Found.
                    </td>
                  </tr>
                ) : (
                  recommendedJobs.map((job) => (
                    <tr
                      key={job.preInterviewId}
                      className={`group transition-colors hover:bg-slate-50`}
                    >
                      {/* <td className="px-4 py-4">{job.preInterviewId}</td> */}
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-2">
                          <div
                            className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                            onClick={() =>
                              window.open(
                                "/job?p=" + job.preInterviewId,
                                "_blank"
                              )
                            }
                          >
                            {job.name}
                          </div>
                        </div>
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
                      <td className="px-4 py-4 text-sm text-slate-700">{job.company}</td>

                      {/* <td className="px-4 py-4">
                        {job.jobWorkExperience}
                      </td> */}
                      {/* <td className="px-4 py-4 text-sm text-slate-700">
                        {job.jobLocationName}
                      </td> */}

                      {/* <td className="px-4 py-4">
                        <Button
                          onClick={() =>
                            window.open(
                              "/job?p=" + job.preInterviewId,
                              "_blank"
                            )
                          }
                          size="sm"
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        >
                          More Details
                        </Button>
                      </td> */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

