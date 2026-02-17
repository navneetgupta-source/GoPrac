"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { SkillChart } from "./_components/skill-chart";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Search,
  Filter,
  Award,
  Download,
  MoveRight,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

import { CompetencyChart } from "./_components/competency-chart";
import MalpracticeBadges from "./_components/MalpracticeBadges";

function isStale(lastActivityAt: string): boolean {
  const lastTime = new Date(lastActivityAt).getTime();
  const now = Date.now();
  const diffMinutes = (now - lastTime) / (1000 * 60);
  return diffMinutes > 2;
}
function isViewAllowed(reviewStatus: string, lastActivityAt: string): boolean {
  return (
    reviewStatus === "2" || (reviewStatus === "-4" && isStale(lastActivityAt))
  );
}

export function MyCourse({
  chartData,
  practiceInterview,
  practiceInterviewChild,
  highlightId,
  recommendedPractice,
}: any) {
  // console.log("practiceInterview",practiceInterview)
  // console.log("practiceInterviewChild",practiceInterviewChild)

  const [practice, setPractice] = useState(null);

  useEffect(() => {
    if (!practiceInterview || !practiceInterviewChild) return;

    const combined = practiceInterview.map((interview) => {
      const childMatches = practiceInterviewChild.filter(
        (child) =>
          String(child.preInterviewId) === String(interview.preInterviewId)
      );

      const shouldExpand = childMatches.some(
        (child) => String(child.interviewSessionId) === String(highlightId)
      );

      return {
        ...interview,
        childs: childMatches,
        expand: shouldExpand,
      };
    });

    setPractice(combined);
  }, [practiceInterview, practiceInterviewChild, highlightId]);

  console.log("practice", practice);

  return (
    <>
      <div className="space-y-4 pt-4">
        {chartData?.length > 0 && (
          <>
            <div className="font-semibold">
              Track your Skill Growth against Industry Average
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {chartData.map((comp, i) => (
                <CompetencyChart key={i} competency={comp} />
              ))}
            </div>
          </>
        )}

        {practice && practice.length > 0 ? (
          practice.map((item: any) => (
            <CompetencyItem
              key={item.preInterviewId}
              title={item?.product}
              data={item}
              expanded={item.expand}
              highlightId={highlightId}
            />
          ))
        ) : (
          <div className="text-gray-500 italic flex justify-center">
            No course data available.
          </div>
        )}
        <RecomendedCompetencyItem data={recommendedPractice} expanded={true} />
      </div>
    </>
  );
}

function CompetencyItem({
  title,
  data,
  expanded,
  highlightId,
}: {
  title: string;
  data: object;
  expanded: boolean;
  highlightId: string | null;
}) {
  const [isExpanded, setIsExpanded] = useState(expanded);

  return (
    <Card
      className={`overflow-hidden border-none bg-white shadow-sm transition-all duration-200 hover:shadow-md pt-1 pb-0 ${
        isExpanded ? "pb-0" : "pb-1"
      }`}
    >
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex gap-2 just">
              <span className="font-medium text-slate-900">{title}</span>
              {data?.intScore && (
                <Badge className="bg-blue-50 border-blue-100 text-blue-600">
                  <Award />
                  <span>Your Highest Score: {data?.intScore}/10</span>
                </Badge>
              )}
            </div>
            <span className="text-xs text-slate-600">
              {data?.childs?.length} practice sessions
            </span>
          </div>
        </div>
        <Button
          onClick={() =>
            window.open("/job?p=" + data?.preInterviewId, "_blank")
          }
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 cursor-pointer"
        >
          Click here to Practice
        </Button>
      </div>
      {isExpanded && (
        <div className="border-t bg-slate-50 p-4">
          <div className="overflow-x-auto">
            {data.childs.length === 0 && (
              <div className="text-center text-sm text-slate-500">
                No data found
              </div>
            )}
            {data.childs.length != 0 && (
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Practice Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Practice Session Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Malpractice Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Your Performance
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Personalized Feedback
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data?.childs.map((child) => (
                    <tr
                      key={child.mergeId}
                      ref={(el) => {
                        if (highlightId === child?.interviewSessionId && el) {
                          el.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                        }
                      }}
                      className={`border-t hover:bg-gray-50 ${
                        highlightId &&
                        child?.interviewSessionId &&
                        highlightId === child?.interviewSessionId
                          ? "bg-yellow-50 hover:bg-yellow-100"
                          : ""
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div>
                          {isViewAllowed(
                            child.review_status,
                            child.last_activity_at
                          ) ? (
                            <Link
                              href={`/review?s=${child?.interviewSessionId}`}
                            >
                              <div className="font-medium text-blue-600 hover:underline cursor-pointer">
                                {child.interviewName}
                              </div>
                            </Link>
                          ) : (
                            <div className="font-medium text-gray-400 cursor-not-allowed">
                              {child.interviewName}
                            </div>
                          )}

                          <div className="text-sm text-gray-500">
                            {new Date(
                              Number(child.interviewSessionId)
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
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {/* {child.completion_status == "1" && (
                          <Badge
                            variant="outline"
                            className={
                              child.review_status == "2"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : child.review_status == "-4" &&
                                  isStale(child.last_activity_at)
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : "bg-blue-100 text-blue-800 border-blue-200"
                            }
                          >
                            {child.review_status == "2"
                              ? "Completed"
                              : child.review_status == "-4" &&
                                isStale(child.last_activity_at)
                              ? "Incomplete"
                              : "Interview In-Progress"}
                          </Badge>
                        )}

                        {child.completion_status != "1" && (
                          <Badge
                            variant="outline"
                            className={
                              child.review_status == "2"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : child.review_status == "-4" &&
                                  isStale(child.last_activity_at)
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : "bg-blue-100 text-blue-800 border-blue-200"
                            }
                          >
                            {child.review_status == "2"
                              ? "Completed"
                              : child.review_status == "-4" &&
                                isStale(child.last_activity_at)
                              ? "Incomplete"
                              : "Interview In-Progress"}
                          </Badge>
                        )} */}
                        <Badge
                          variant="outline"
                          className={
                            child.review_status == "2"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : child.review_status == "-4" &&
                                isStale(child.last_activity_at)
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : "bg-blue-100 text-blue-800 border-blue-200"
                          }
                        >
                          {child.review_status == "2"
                            ? "Completed"
                            : child.review_status == "-4" &&
                              isStale(child.last_activity_at)
                            ? "Incomplete"
                            : "Interview In-Progress"}
                        </Badge>
                      </td>
                      <td>
                       <MalpracticeBadges job={child} />
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={
                            child.suitability === "N/A"
                              ? "text-gray-500"
                              : "text-gray-900"
                          }
                        >
                          {child.suitability}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          {/* {child.completion_status == "1" &&
                            (isViewAllowed(
                              child.review_status,
                              child.last_activity_at
                            ) ? (
                              <Link
                                href={`/review?s=${child?.interviewSessionId}`}
                              >
                                <Button
                                  variant="outline"
                                  className="bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                                >
                                  View
                                </Button>
                              </Link>
                            ) : (
                              <Button
                                variant="outline"
                                disabled
                                className="bg-gray-300 text-gray-500 cursor-not-allowed"
                              >
                                View
                              </Button>
                            ))} */}

                          {isViewAllowed(
                            child.review_status,
                            child.last_activity_at
                          ) ? (
                            <Link
                              href={`/review?s=${child?.interviewSessionId}`}
                            >
                              <Button
                                variant="outline"
                                className="bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                              >
                                View
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              variant="outline"
                              disabled
                              className="bg-gray-300 text-gray-500 cursor-not-allowed"
                            >
                              View
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            className={`${
                              child.reportpdf1 &&
                              !isNaN(Number(child.reportpdf1))
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                            disabled={child.reportpdf1 === "0"}
                            onClick={() => {
                              if (
                                child.reportpdf1 &&
                                isNaN(Number(child.reportpdf1))
                              ) {
                                window.open(child.reportpdf1, "_blank");
                              }
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function RecomendedCompetencyItem({
  data,
  expanded,
}: {
  data: object;
  expanded: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(expanded);

  return (
    <Card
      className={`overflow-hidden border-none bg-white shadow-sm transition-all duration-200 hover:shadow-md pt-0 pb-0 ${
        isExpanded ? "pb-0" : "pb-0"
      }`}
    >
      <div className="bg-gradient-to-r from-blue-100 via-indigo-50 to-indigo-50">


      <div
        className="flex cursor-pointer items-center justify-between p-4  "
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex gap-2 justify-start items-center">
              <Star className="text-primary" />
              <span className="font-bold text-2xl text-slate-900">Other Courses</span>
            </div>
            <span className="text-xs text-slate-600">
              {/* {data?.length} recommended courses */}
            </span>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="border-t bg-slate-50 p-4">
          <div className="overflow-x-auto">
            {data.length === 0 && (
              <div className="text-center text-sm text-slate-500">
                No data found
              </div>
            )}

            {data.length != 0 &&
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4">
              {data?.map((item) => (
                <Card
                  className=" p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 justify-between"
                  key={item.preInterviewId}
                >
                  <CardTitle>
                    <div className=" text-lg font-extrabold text-slate-800">
                      {/* <Award className="inline-block text-primary h-5 w-5" /> */}
                      {item.name}
                    </div>
                  </CardTitle>
                  <CardContent className="flex flex-col gap-2 justify-between">
                    <Link
                      href={`/job?p=${item?.preInterviewId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2 w-fit flex items-center gap-1 text-white bg-primary rounded-lg font-extrabold shadow-md"
                    >
                      {/* <Button className="rounded-lg font-extrabold shadow-md"> */}
                      Show Details <MoveRight />
                      {/* </Button> */}
                    </Link>
                  </CardContent>
                </Card>
              ))}
              </div>
            }
 
          </div>
        </div>
      )}
            </div>
    </Card>
  );
}
