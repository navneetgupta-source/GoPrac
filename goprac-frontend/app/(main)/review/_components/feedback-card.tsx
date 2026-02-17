"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Flag, Play, Volume2 } from "lucide-react";
// import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import ReactPlayer from "react-player";
import { ReviewCard } from "./review-card";
import { useEffect, useRef, useState } from "react";
import AudioPlayer from "@/components/audio-player";
import { StyledMarkdown } from "@/components/styled-markdown";

function getAttemptLabel(status: string) {
  if (status === "Respond" || status === "Respond1" || status === "Respond2") {
    return "Responded";
  } else if (status === "skip") {
    return "Skipped";
  } else if (status === "Idk" || status === "Idk1" || status === "Idk2") {
    return "I don't know";
  } else {
    return status; // fallback to raw status if not matched
  }
}

export function FeedbackCard({
  index,
  data,
  totalQuestions,
  showFeedback,
  isExport,
  interviewType,
  goToPayment
}: any) {
  // console.log("malpracticeValue:", data?.peer?.malpracticeValue);
  // console.log("Full data object:", data);
  const [expanded, setExpanded] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState(false);

  const gridRef = useRef(null);

  useEffect(() => {
    // console.log("expadning");
    if (isExport == true) {
      setExpanded(true);
      setExpandedNotes(true);
    } else {
      setExpanded(false);
      setExpandedNotes(false);
    }
  }, [isExport]);

  const toggleExpanded = () => {
    setExpanded(!expanded);
    if (gridRef.current) {
      gridRef.current.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    }
  };

  const toggleExpandedNotes = () => {
    setExpandedNotes(!expandedNotes);
  };

  // console.log("showFeedback", showFeedback);

  // const goToPayment = () => {

  //   window.location.href = "/payment?i=" + interviewId;
  // };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-center justify-start md:justify-between gap-2">
          <CardTitle>
            Question {index} out of {totalQuestions}
          </CardTitle>
          <div className="flex flex-wrap">
            <Badge variant="outline">{data.favourite_subject}</Badge>

            {data?.topicName && (
              <>
                <ChevronRight className="text-gray-500" />
                <Badge variant="outline">{data.topicName}</Badge>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="rounded-lg bg-slate-50 p-4 text-sm leading-relaxed font-medium whitespace-pre-wrap break-words">
            <p>
              {["Respond1", "Idk1"].includes(data.attemptStatus) && (
                <>
                  <div className="mb-2">{data.originalQuestionText}</div>
                  <span className="font-semibold text-primary">
                    Simplified Qn L1:{" "}
                  </span>
                </>
              )}
              {["Respond2", "Idk2"].includes(data.attemptStatus) && (
                <>
                  <div className="mb-2">{data.originalQuestionText}</div>
                  <span className="font-semibold text-primary">
                    Simplified Qn L2:{" "}
                  </span>
                </>
              )}
              <span>{data.questionText}</span>
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-1">
            <div className="space-y-4 col-span-1">
              <div className="grid gap-6 lg:grid-cols-1">
                <div className="space-y-4 col-span-1">
                  <div className="flex items-center justify-between">

                    <div className="flex justify-start gap-2">

                      <Badge className="bg-green-100 text-green-800">
                        Your Response
                      </Badge>
                      {data?.malpracticeValue && (
                        <FlagPill flagLabel={interviewType == "Practice" ? "Plagiarism": "Malpractice"} flagValue={data?.malpracticeValue} />
                      )
                      }
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">
                      {data.review_data && (
                        <>
                          {/^\d+$/.test(
                            data.review_data?.observation_values?.toString() ??
                            ""
                          ) ? (
                            <div className="flex items-center justify-end gap-2 text-xs font-medium">
                              <span>Your Score:</span>
                              <span className="">
                                {data.review_data?.observation_values}/10
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2 text-xs text-gray-500 italic">
                              <span>
                                {data.review_data?.observation_values}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-black lg:w-1/2 mx-auto">
                    <ReactPlayer
                      width="100%"
                      height="100%"
                      url={`https://player.vimeo.com/video/${data.youtubeId}`}
                      controls
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="font-medium bg-white/60 text-black backdrop-blur-sm text-xs">
                        {getAttemptLabel(data.attemptStatus)}
                      </Badge>
                    </div>
                  </div>

                  <div className="col-span-1 ">
                    {data?.percentile &&
                      (data.attemptStatus === "Respond" ||
                        data.attemptStatus === "Respond1" ||
                        data.attemptStatus === "Respond2") && (
                        <ReviewCard percentile={data?.percentile} />
                      )}
                  </div>
                </div>

                {/* <div className="relative space-y-4 col-span-1 overflow-hidden rounded-lg">
                  {!showFeedback && (
                    <div className="absolute inset-0 z-10 backdrop-blur-sm bg-white/40 flex items-center justify-center"></div>
                  )}

                  <div className="space-y-4 col-span-1">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Best Peer Response (Current)
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-800">
                        {showFeedback && (
                          <>
                            {data.peer.review_data && (
                              <>
                                {/^\d+$/.test(
                                  data.peer.review_data?.observation_values?.toString() ??
                                  ""
                                ) ? (
                                  <div className="flex items-center justify-end gap-2 text-xs font-medium">
                                    <span>Peer Score:</span>
                                    <span className="">
                                      {
                                        data.peer.review_data
                                          ?.observation_values
                                      }
                                      /10
                                    </span>
                                  </div>
                                ) : (
                                  ""
                                )}
                              </>
                            )}
                          </>
                        )}
                      </Badge>
                    </div>
                    {data?.peer?.ansText && (
                      <div className="relative">
                        <AudioPlayer txt={data?.peer?.ansText} flagValue={data?.malpracticeValue || "NA"} />
                      </div>
                    )}

                    <div className="col-span-1 ">
                      {data?.peer?.percentile && (
                        <ReviewCard
                          percentile={data?.peer?.percentile}
                          peer={true}
                        />
                      )}
                    </div>
                    {/* <div className="col-span-1 ">
                      {data?.peer?.percentile && data?.peer?.review_data.map((item: any, index: number) => (
                        <ReviewCard
                          key={index}
                          item={item}
                          percentile={data?.peer?.percentile}
                        />
                      ))}
                    </div> //
                  </div>
                </div> */}
              </div>
              {data.feedback_data && (
                <div className="relative space-y-4 col-span-1 overflow-hidden rounded-lg">
                  {!showFeedback && (
                    <div className="absolute inset-0 z-10 backdrop-blur-sm bg-white/40 flex flex-col items-center justify-center">
                      <div className="font-semibold">
                        Access full interview feedback at just INR 49/.
                      </div>
                      <button
                        onClick={goToPayment}
                        className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md shadow cursor-pointer"
                      >
                        Pay to Unlock
                      </button>
                    </div>
                  )}

                  <div ref={gridRef} className="grid gap-6 lg:grid-cols-1">
                    {/* Your Feedback Summary */}
                    <div className="space-y-4 col-span-1">
                      <div className="rounded-lg border p-4 leading-relaxed w-full px-2 md:px-8">
                        <h4 className="mb-2 font-bold">
                          Your Feedback Summary
                        </h4>

                        <div
                          className={`
                        prose max-w-none text-sm break-words
                        transition-all duration-300
                        ${expanded
                              ? "max-h-none overflow-visible"
                              : "max-h-[300px] overflow-hidden"
                            }`}
                        >
                          <StyledMarkdown>
                            {data.feedback_data[0].feedbackSummary}
                          </StyledMarkdown>

                          {data.htt &&
                            data?.feedback_data[0]?.candidateThoughtProcess && (
                              <div className="pt-4">
                                <QuestionWithSteps
                                  htt={data.htt}
                                  ctp={
                                    data.feedback_data[0]
                                      ?.candidateThoughtProcess
                                  }
                                />
                              </div>
                            )}

                          {data?.feedback_data[0]?.actionableThinkingAdvice && (
                            <>
                              <h4 className="mb-1 font-bold mt-4">
                                Thinking Advice
                              </h4>
                              <StyledMarkdown>
                                {`\n${data.feedback_data[0].actionableThinkingAdvice
                                  .replace(/\\n/g, '\n')
                                  .split(/\r?\n/) // split on any newline
                                  .filter((line) => line.trim() !== "") // drop empty lines
                                  .map((line) => `- ${line}`) // prefix for Markdown list
                                  .join("\n")}\n`}
                              </StyledMarkdown>
                            </>
                          )}
                        </div>

                        {data.feedback_data[0].feedbackSummary.length > 300 && (
                          <button
                            onClick={toggleExpanded}
                            className="text-blue-500 ml-2 hover:underline inline"
                          >
                            {expanded ? "See less" : "See more"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Peer Feedback Summary */}
                    {/* <div className="space-y-4 col-span-1">
                      <div className="rounded-lg border border-green-100 bg-green-50 p-4 leading-relaxed">
                        <h4 className="mb-2 font-bold">
                          Peer Feedback Summary
                        </h4>

                        <div
                          className={`
                            prose max-w-none text-sm break-words
                            transition-all duration-300
                            ${expanded
                              ? "max-h-none overflow-visible"
                              : "max-h-[300px] overflow-hidden"
                            }
                            `}
                        >
                          {data?.peer?.feedback_data && data?.peer?.feedback_data[0]?.feedbackSummary && (
                            <StyledMarkdown>
                              {data?.peer.feedback_data[0]?.feedbackSummary}
                            </StyledMarkdown>
                          )

                          }

                          {data.htt && data?.peer?.feedback_dat &&
                            data?.peer?.feedback_data[0]
                              ?.candidateThoughtProcess && (
                              <div className="pt-4">
                                <QuestionWithSteps
                                  htt={data.htt}
                                  ctp={
                                    data.peer.feedback_data[0]
                                      ?.candidateThoughtProcess
                                  }
                                />
                              </div>
                            )}

                          {data?.peer?.feedback_data && data?.peer?.feedback_data[0]
                            ?.actionableThinkingAdvice && (
                              <>
                                <h4 className="mb-1 font-bold mt-4">
                                  Thinking Advice
                                </h4>
                                <StyledMarkdown>
                                  {`\n${data.peer.feedback_data[0].actionableThinkingAdvice
                                    .replace(/\\n/g, '\n')
                                    .split(/\r?\n/) // split on any newline
                                    .filter((line) => line.trim() !== "") // drop empty lines
                                    .map((line) => `- ${line}`) // prefix for Markdown list
                                    .join("\n")}\n`}
                                </StyledMarkdown>
                              </>
                            )}
                        </div>

                        {data.peer.feedback_data && data.peer.feedback_data[0].feedbackSummary.length >
                          300 && (
                            <button
                              onClick={toggleExpanded}
                              className="text-blue-500 ml-2 hover:underline inline"
                            >
                              {expanded ? "See less" : "See more"}
                            </button>
                          )}
                      </div>
                    </div> */}
                  </div>
                  <div className="rounded-lg border p-4">
                    <h4 className="mb-2 font-bold">Learning Notes</h4>
                    <div className="prose max-w-none text-sm break-words">
                      {expandedNotes ? (
                        <StyledMarkdown>
                          {data.feedback_data[0].keyTopicExploration}
                        </StyledMarkdown>
                      ) : (
                        <StyledMarkdown>
                          {data.feedback_data[0].keyTopicExploration.slice(
                            0,
                            300
                          ) + "..."}
                        </StyledMarkdown>
                      )}
                      {data.feedback_data[0].keyTopicExploration.length >
                        300 && (
                          <button
                            onClick={toggleExpandedNotes}
                            className="text-blue-500 ml-2 hover:underline inline"
                          >
                            {expandedNotes ? "See less" : "See more"}
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function parseJSONSafe(str) {
  try {
    return JSON.parse(str);
  } catch (err) {
    console.error("Parsing failed:", err.message);
    return null;
  }
}

export function QuestionWithSteps({ htt, ctp }: any) {
  // console.log("htt", htt.howToThink);
  // console.log("ctp",ctp)

  const httData = parseJSONSafe(htt.howToThink);
  const ctpData = parseJSONSafe(ctp);
  const httSteps = httData?.schema?.steps || [];
  const ctpSteps = ctpData || [];

  //   console.log("httData",httData)
  // console.log("ctpData",ctpData)

  // Only include steps present in both How to Think and Candidate Thought Process
  const commonSteps = httSteps.filter((step: any) =>
    ctpSteps.some((s: any) => s.step_number === step.step_number)
  );

  if (!commonSteps.length) return null;

  return (
    <div>
      <h4 className="font-bold text-md mb-2">How to Think</h4>
      <table className="w-full table-auto border-collapse text-xs rounded-xl">
        <thead>
          <tr className="bg-white">
            <th className="border px-2 py-1 text-left">Step</th>
            <th className="border px-2 py-1 text-left">How to Think</th>
            <th className="border px-2 py-1 text-left">Details</th>
            <th className="border px-2 py-1 text-left">Your Thought Process</th>
          </tr>
        </thead>
        <tbody>
          {commonSteps.map((step: any) => {
            const match = ctpSteps.find(
              (s: any) => s.step_number === step.step_number
            )!;
            return (
              <tr
                key={step.step_number}
                className="odd:bg-gray-50 even:bg-white"
              >
                <td className="border px-2 py-1 align-top">
                  {step.step_number}
                </td>
                <td className="border px-2 py-1 align-top">{step.step_name}</td>
                <td className="border px-2 py-1 align-top">{step.elongated}</td>
                <td className="border px-2 py-1 align-top">
                  {match.candidate_thought_process}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}



function FlagPill({flagLabel, flagValue }: { flagLabel: string, flagValue: string }) {
  if (!flagValue) {
    console.warn("Missing flagValue for FlagPill");
  }

  // console.log("flagValue",flagValue)

  const flagColorMap: { [key: string]: string } = {
    GENUINE: 'text-green-500',
    SUSPICIOUS: 'text-orange-500',
    MALPRACTICE: 'text-red-500',
  };

  const cleanedValue = flagValue?.trim();
  const flagColorClass = flagColorMap[cleanedValue] || 'text-gray-400';

  return (
    <Badge className="bg-blue-100  flex items-center gap-1">
      <span className="capitalize text-blue-600">{flagLabel}:</span>
      <Flag className={`w-5 h-5  ${flagColorClass}`} />
    </Badge>
  );
}
