"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  User,
  Star,
  MessageSquare,
  Book,
  ChevronRight,
  TrendingUp,
  Goal,
  BookText,
  ListOrdered,
  Flag,
} from "lucide-react";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import SkillsAssessmentChart from "./skills-assessment-chart";
const GaugeComponent = dynamic(() => import("react-gauge-component"), {
  ssr: false,
});

import { useRef } from "react";
import { markPDFAsPending } from "@/actions/update-reportpdf-status";
import { toast } from "sonner";

interface ReportProps {
  reviewData: any;
  onSetTab: (tab: string) => void;
  genuineCount: number;
  suspiciousCount: number;
  malpracticeCount: number;
  // candidateId: string | null;
  // interviewId: string | null;
  // interviewSessionId: string | null;
  // userType: string | null;
}

function topicsAssessed(topics: any) {
  // Initialize an empty array to store the result
  const resultArray = [];

  // Count frequency of topicId for each subjectId
  topics &&
    topics.forEach((curr) => {
      // Find the index of the current subject in the result array
      const subjectIndex = resultArray.findIndex(
        (item) => item.subjectId === curr.subjectId
      );

      // If subject not found, add it to the result array
      if (subjectIndex === -1) {
        resultArray.push({
          subjectId: curr.subjectId,
          favourite_subject: curr.favourite_subject,
          topics: [
            {
              topicId: curr.topicId,
              count: 1,
              name: curr.name,
              favourite_subject: curr.favourite_subject,
            },
          ],
        });
      } else {
        // If subject found, find the index of the current topic in the topics array
        const topicIndex = resultArray[subjectIndex].topics.findIndex(
          (topic) => topic.topicId === curr.topicId
        );

        // If topic not found, add it to the topics array
        if (topicIndex === -1) {
          resultArray[subjectIndex].topics.push({
            topicId: curr.topicId,
            count: 1,
            name: curr.name,
            favourite_subject: curr.favourite_subject,
          });
        } else {
          // If topic found, increment its count
          resultArray[subjectIndex].topics[topicIndex].count++;
        }
      }
    });

  return resultArray;
}

export default function Report({
  reviewData,
  onSetTab,
  genuineCount,
  suspiciousCount,
  malpracticeCount,
}: ReportProps) {
  if (!reviewData) {
    return <div>Loading report...</div>;
  }
  const topicsResult = topicsAssessed(reviewData.topics_assessed);
  const [pracNextStep1, setPracNextStep1] = useState<any>();
  const [pracNextStep2, setPracNextStep2] = useState<any>();
  const [isPositiveStatus, setIsPositiveStatus] = useState<any>(true);
  const captureRef = useRef(null);

  useEffect(() => {
    if (reviewData.interviewType == "Practice") {
      if (
        reviewData.fbr_status == 2 &&
        reviewData.applicantSuitability == "Do not meet"
      ) {
        setPracNextStep1("");
        // setPracNextStep1(
        //   `Your skills have been assessed as "Below Industry Standards".`
        // );
        setPracNextStep2(
          "We recommend taking additional practice sessions to enhance your competencies. "
        );
      } else if (
        reviewData.fbr_status == 2 &&
        reviewData.applicantSuitability == "Recommended to meet"
      ) {
        setPracNextStep1("");
        // setPracNextStep1(
        //   `Your skills have been assessed as "Close to Industry Standards".`
        // );
        setPracNextStep2(
          "We recommend taking additional practice sessions to enhance your competencies. "
        );
      } else if (
        reviewData.fbr_status == 2 &&
        reviewData.applicantSuitability == "Must meet"
      ) {
        setPracNextStep1("");
        // setPracNextStep1(
        //   `Congratulations! Your skills have been assessed as "At Par with Industry Standards".`
        // );
        // Our recruitment team will contact you shortly.
        setPracNextStep2(
          `Congratulations! Your skills have been assessed as "At Par with Industry Standards`
        );
      } else {
        setPracNextStep1("Incomplete");
        setPracNextStep2("Your Practice Interview is incomplete.");
      }
    } else {
      const candidateStatus = reviewData.candidateStatus;
      const isPositiveStatus = [
        "Offered",
        "Profile Shared",
        "Joined",
        "Client Shortlisted",
        "Offer Accepted",
      ].includes(candidateStatus);

      setIsPositiveStatus(isPositiveStatus);
    }

    // ✅ Fetch flag counts using interviewSessionId
    // if (reviewData?.interviewSessionId) {
    //   fetchFlagCounts(reviewData.interviewSessionId);
    // }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewFeedback = () => {
    onSetTab("feedback");
  };

  // const handleDownloadPDF = async () => {
  //   await new Promise((res) => setTimeout(res, 600));

  //   if (!captureRef.current) return;

  //   const canvas = await html2canvas(captureRef.current, {
  //     width: captureRef.current.offsetWidth,
  //     height: captureRef.current.offsetHeight,
  //     scale: 2,
  //     useCORS: true,
  //   });

  //   const imgData = canvas.toDataURL("image/jpeg");

  //   const pdf = new jsPDF({
  //     orientation: "portrait",
  //     unit: "mm",
  //     format: "a4",
  //   });

  //   const pageWidth = pdf.internal.pageSize.getWidth();
  //   const pageHeight = pdf.internal.pageSize.getHeight();

  //   const imgProps = pdf.getImageProperties(imgData);
  //   const pdfWidth = pageWidth;
  //   const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  //   // If height is too long, split into multiple pages
  //   let position = 0;

  //   if (pdfHeight <= pageHeight) {
  //     pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
  //   } else {
  //     while (position < pdfHeight) {
  //       pdf.addImage(imgData, "JPEG", 0, -position, pdfWidth, pdfHeight);
  //       position += pageHeight;
  //       if (position < pdfHeight) pdf.addPage();
  //     }
  //   }

  //   pdf.save(
  //     `${reviewData.candidateId}_${reviewData.interviewName}_report.pdf`
  //   );
  // };

  // useEffect(() => {
  //   console.log("flagcounts", flagCounts);

  // }, [flagCounts]);

  const handleDownloadPDF = async () => {
    console.log("Export", reviewData?.linkPdf2);
    const link = reviewData?.linkPdf2;

    if (link === "0" || link === "1") {
      toast.success(
        "Your PDF is being generated and you’ll be notified on WhatsApp once it’s ready."
      );
      return;
    }

    const isLinkReady = link?.startsWith("http");

    if (!isLinkReady) {
      const res = await markPDFAsPending(reviewData.interviewSessionId);
      if (res.success) {
        toast.success(
          "Your PDF will be available soon and you’ll be notified on WhatsApp once it’s ready."
        );
      } else {
        toast.error("Failed to generate PDF.");
      }
      return;
    }

    try {
      const response = await fetch(reviewData.linkPdf2);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${reviewData.firstName}_${reviewData.interviewName}_report.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF.");
    }
  };

  return (
    <div className="space-y-6 mx-auto ">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 rounded-xl bg-gradient-to-r from-blue-100 via-indigo-50 to-indigo-50 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-primary p-3 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Your Interview Assessment Report
            </h1>
            <p className="text-slate-500">
              Personalized insights to elevate your career journey
            </p>
          </div>
        </div>
        <Button onClick={handleDownloadPDF} variant="outline" size="sm" className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
      <div ref={captureRef} id="captureRef">
        {/* Candidate Overview */}
        <Card className="mb-6 gap-3">
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 justify-center">
              {/* Profile Information */}
              <Card className="w-auto pt-0">
                <CardHeader className="pb-2 bg-gradient-to-r from-blue-100 via-blue-50 to-slate-50 px-4 py-2 overflow-hidden rounded-t-lg">
                  <CardTitle className="text-base text-slate-700 flex gap-2 items-center">
                    <div className="bg-primary p-2 rounded text-accent">
                      <BookText />
                    </div>
                    <div>Session Details</div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback>
                        {reviewData.firstName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-semibold">
                      {reviewData.firstName}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4">
                    <div>
                      <p className="text-sm text-slate-500">Candidate ID</p>
                      <p className="font-medium">{reviewData.candidateId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Interview/Name</p>
                      <p className="font-medium">{reviewData.interviewName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Date</p>
                      <p className="font-medium">
                        {new Date(
                          Number(reviewData.interviewSessionId)
                        ).toLocaleDateString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          dateStyle: "medium",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Time</p>
                      <p className="font-medium">
                        {new Date(
                          Number(reviewData.interviewSessionId)
                        ).toLocaleTimeString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    {(genuineCount > 0 ||
                      suspiciousCount > 0 ||
                      malpracticeCount > 0) && (
                      <div>
                        <p className="text-sm text-slate-500">
                          {reviewData.interviewType === "Practice"
                            ? "Plagiarism"
                            : "Malpractice"}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {genuineCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded text-xs">
                              <Flag className="text-green-600 w-4 h-4" />
                              {genuineCount}
                            </span>
                          )}

                          {suspiciousCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-orange-700 bg-orange-100 px-2 py-1 rounded text-xs">
                              <Flag className="text-orange-600 w-4 h-4" />
                              {suspiciousCount}
                            </span>
                          )}

                          {malpracticeCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded text-xs">
                              <Flag className="text-red-600 w-4 h-4" />
                              {malpracticeCount}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Interview Result */}
              <Card className="w-auto pt-0 py-0 pb-4 gap-0">
                <CardHeader className="pb-0 bg-gradient-to-r from-blue-100 via-blue-50 to-slate-50 px-4 py-2 overflow-hidden rounded-t-lg">
                  <CardTitle className="text-base text-slate-700 flex gap-2 items-center">
                    <div className="bg-primary p-2 rounded text-accent">
                      <Goal />
                    </div>
                    <div>Result</div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between gap-2">
                    <div className="flex flex-col justify-start gap-2 mt-4">
                      <div className="flex justify-start mb-1 text-sm">
                        <span className="font-semibold">Score:</span>
                        <span className="font-bold">
                          {reviewData.intScore
                            ? `${reviewData.intScore}/10`
                            : "-"}
                        </span>
                      </div>

                      <div className="flex justify-start mb-1 text-sm">
                        <span className="font-semibold">
                          Performance Percentile:
                        </span>
                        <span className="font-bold">
                          {reviewData.applicantPercentile}
                          {reviewData.applicantPercentile !== "N/A" && "%"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-end">
                      <div className="w-full max-w-[240px] h-[200px] mx-auto">
                        <GaugeComponent
                          value={
                            reviewData.applicantPercentile === "N/A"
                              ? 0
                              : reviewData.applicantPercentile
                          }
                          type="radial"
                          arc={{
                            colorArray: ["#EA4228", "#5BE12C"],
                            subArcs: [
                              { limit: 30 },
                              { limit: 70 },
                              { limit: 100 },
                            ],
                            padding: 0.02,
                            width: 0.3,
                          }}
                          pointer={{
                            elastic: true,
                            animationDelay: 5,
                          }}
                          labels={{
                            valueLabel: {
                              style: { fontSize: "35px", fill: "#000" },
                            },
                          }}
                        />
                      </div>
                      <div className="mx-auto">
                        {reviewData.interviewType == "Practice" &&
                          reviewData.fbr_status === "2" &&
                          reviewData.applicantSuitability !== "N/A" && (
                            <>
                              {reviewData.applicantSuitability ===
                                "Do not meet" && (
                                <Button className="rounded-2xl">Below Industry Standards</Button>
                              )}

                              {reviewData.applicantSuitability ===
                                "Recommended to meet" && (
                                <Button className="rounded-2xl">Close to Industry Standards</Button>
                              )}

                              {reviewData.applicantSuitability ===
                                "Must meet" && (
                                <Button className="rounded-2xl">At Par with Industry Standards</Button>
                              )}
                            </>
                          )}
                        {reviewData.interviewType != "Practice" &&
                          reviewData.fbr_status === "2" &&
                          reviewData.applicantSuitability !== "N/A" && (
                            <>
                              {reviewData.applicantSuitability ===
                                "Do not meet" && (
                                <Button className="rounded-2xl">
                                  {reviewData.applicantSuitability}
                                </Button>
                              )}

                              {reviewData.applicantSuitability ===
                                "Recommended to meet" && (
                                <Button className="rounded-2xl">
                                  {reviewData.applicantSuitability}
                                </Button>
                              )}

                              {reviewData.applicantSuitability ===
                                "Must meet" && (
                                <Button className="rounded-2xl">
                                  {reviewData.applicantSuitability}
                                </Button>
                              )}
                            </>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Separator className="mt-3" />

                    {reviewData.interviewType == "Practice" && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <ChevronRight className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-sm">Next Steps</CardTitle>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg ">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{pracNextStep1}</h4>
                            <p className="text-sm text-slate-500">
                              {pracNextStep2}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {reviewData.interviewType != "Practice" && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <ChevronRight className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-lg">Next Steps</CardTitle>
                        </div>

                        {reviewData.fbr_status === "-4" && (
                          <div className="flex-1">
                            <div className="text-lg font-semibold text-red-600">
                              Incomplete
                            </div>
                            <p className="text-sm font-medium text-gray-500">
                              Unfortunately, your profile cannot be processed
                              for further rounds.
                            </p>
                            {reviewData.candidateStatusNextStep && (
                              <>
                                <b className="text-gray-500 mr-4 font-bold">
                                  Next Steps :
                                </b>
                                <span className="text-sm font-medium text-gray-500">
                                  {reviewData.candidateStatusNextStep}
                                </span>
                              </>
                            )}
                          </div>
                        )}

                        {reviewData.fbr_status != "-4" &&
                          reviewData.candidateStatus && (
                            <div
                              className={`flex items-center gap-4 rounded-lg p-4 ${
                                isPositiveStatus ? "bg-green-50" : "bg-red-50"
                              }`}
                            >
                              <div className="flex-1">
                                <div
                                  className={`font-semibold text-gray-500 ${
                                    isPositiveStatus
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {reviewData.candidateStatus}
                                </div>
                                <p className="text-sm font-medium text-gray-500">
                                  {reviewData.candidateStatusDescription}
                                </p>
                                {reviewData.candidateStatusNextStep && (
                                  <>
                                    <b className="text-gray-500 mr-4 font-bold">
                                      Next Steps :
                                    </b>
                                    <span
                                      className="text-sm font-medium text-gray-500"
                                      style={{ marginLeft: "-15px" }}
                                    >
                                      {reviewData.candidateStatusNextStep}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                        {reviewData.candidateStatus === "" &&
                          reviewData.fbr_status === "2" && (
                            <div className="flex items-center gap-4 rounded-lg bg-green-50 p-4">
                              <div className="flex-1">
                                <div className="font-semibold text-green-600">
                                  Assessment Completed
                                </div>
                                <p className="text-sm font-medium text-gray-500">
                                  Great! We have assessed your interview.
                                </p>
                                {reviewData.candidateStatusNextStep ? (
                                  <>
                                    <b className="text-gray-500 mr-4 font-bold">
                                      Next Steps :
                                    </b>
                                    <span className="text-sm font-medium text-gray-500">
                                      {reviewData.candidateStatusNextStep}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <b className="text-gray-500 mr-4 font-bold">
                                      Next Steps :
                                    </b>
                                    <span
                                      className="text-sm font-medium text-gray-500"
                                      style={{ marginLeft: "-15px" }}
                                    >
                                      Your meeting confirmation with the Hiring
                                      Manager will be attained in the next 72
                                      Hrs based on the interview performance of
                                      other candidates already in the pipeline.
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
        {/* Soft Skills and Feedback */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardContent className="space-y-4">
              <CardHeader className="px-0">
                <div className="flex items-center gap-2">
                  <ListOrdered className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">
                    Thinking Skill Analysis
                  </CardTitle>
                </div>
              </CardHeader>

              {/* Soft Skills Assessment */}
              <Card className="pt-0">
                <CardHeader className="pb-2 bg-gradient-to-r from-blue-100 via-blue-50 to-slate-50 px-4 py-2 overflow-hidden rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary p-2 rounded text-accent">
                      <Star />
                    </div>
                    <CardTitle className="text-lg">Skills Breakdown</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <SkillsAssessmentChart
                      candidateSpecificRatings={
                        reviewData.candidateSpecificRatings
                      }
                      candidateSpecificDS={reviewData.candidateSpecificDS}
                      industryExpectationRating={
                        reviewData.IndustryExpectationRating
                      }
                      industryExpectationDS={reviewData.industryExpectationDS}
                    />
                  </div>
                </CardContent>
              </Card>
              {/* Topics Covered */}
              <Card className=" pt-0">
                <CardHeader className="pb-2 bg-gradient-to-r from-blue-100 via-blue-50 to-slate-50 px-4 py-2 overflow-hidden rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary p-2 rounded text-accent">
                      <Book />
                    </div>
                    <CardTitle className="text-lg">Topics Covered</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {topicsResult.map((item: any, index: number) => (
                    <div key={index}>
                      <div className="">
                        <span className="font-medium text-xs">
                          {item.favourite_subject}
                        </span>
                        <div className="space-x-2">
                          {item.topics.map((topic: any, index: number) => (
                            <span
                              className="bg-blue-100 text-blue-500 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm "
                              key={index}
                            >
                              {topic.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Personalized Feedback */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Personalized Feedback</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-3">
                <CardContent className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  <span className="font-medium">What you will learn </span>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                      <h4 className="font-medium">Problem-Solving Approach</h4>
                    </div>
                    <p className="text-sm text-slate-600 ml-4">
                      Develop smarter strategies to tackle challenges.
                    </p>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                      <h4 className="font-medium">Areas for Improvement</h4>
                    </div>
                    <p className="text-sm text-slate-600 ml-4">
                      Identify specific skills or behaviors to enhance.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <h4 className="font-medium">Key Concepts to Master</h4>
                    </div>
                    <p className="text-sm text-slate-600 ml-4">
                      Focus on essential topics to reinforce your knowledge.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleViewFeedback}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 p-4 rounded-2xl cursor-pointer"
              >
                View Detailed Feedback
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


