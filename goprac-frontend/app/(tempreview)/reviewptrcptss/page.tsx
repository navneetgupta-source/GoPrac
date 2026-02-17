"use client";
import Report from "@/app/(main)/review/_components/report";
import { Suspense, useEffect, useState } from "react";

import { useUserStore } from "@/stores/userStore";

import { usePathname, useSearchParams } from "next/navigation";
import { reviewLog } from "@/actions/reviewLog";

export default function ReviewPage() {
  const [tab, setTab] = useState<string>("report");
  const [reviewData, setReviewData] = useState(null);
  const [reviewIcs, setReviewIcs] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [genuineCount, setGenuineCount] = useState(0);
  const [suspiciousCount, setSuspiciousCount] = useState(0);
  const [malpracticeCount, setMalpracticeCount] = useState(0);

  const [candidateId, setCandidateId] = useState(null);
  const [interviewId, setInterviewId] = useState(null);

  const userId = useUserStore((state) => state.userId);
  const userType = useUserStore((state) => state.userType);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const interviewSessionId = searchParams.get("s");


  useEffect(() => {
    const getReviewIcs = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?review_ics`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            id: interviewSessionId,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch weather");
      }
      return response.json();
    };

    getReviewIcs()
      .then((data) => {
        setReviewIcs(data);
        setCandidateId(data?.candidateId);
        setInterviewId(data?.interviewId);
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewSessionId]);

  useEffect(() => {
    // if (!interviewId || !candidateId || !interviewSessionId || !userType)
    if (!interviewId || !candidateId || !interviewSessionId)
      return;
    const getReviewData = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?getReviewData`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            interviewId,
            candidateId,
            usertype: 'admin',
            interviewSessionId,
            url: pathname,
            userData: decodeURIComponent("LisO+QH+YNV5lzvvG+61arPV52uCAeyWHZLQZ6aDzJfYoVqy/zB3dhfM+6bCXOflwqAXRpghidl1Mepq3B+TTOaWlyFbqyDpqNQ8cVtO3iYmxSJAU8NJ/+LFUQ89cuklVXjpBHc9ialhmxl87nSgX4rBkBiFNYtGNdUJc9RVjr4SjCDjnzDY/YQBLUNF48aeSVVTLaCw15peQ+ACyyihOIr3OdcQzCHvFihkTwiaXhl1PVsZJfwJm4vmW9Of4GSD3I0V40k/Z+o8aZM43N31pIsjpfIX59ABt+WGcPLG9yP0/3JijuuYtBcASg0iFHixU/ytIItEv2ixBXNEA5v7npUe7Y0IusgUG8fupj1w0dW2oS5khu/yVBKdq5E8tWWNh0ABnBO/XzaIrXQLiv+ae7RV8yyItGAhilWrFd6iqrwbRd9IklYS1iyMloMxmK/DSqi3MTk90xvwa/pH3OHKapsHYfgrG6sQEksQVHejpQSdZ3Gwd/JJzrXmQkAte5KdMefI6PtdOMfOf/dY6Lxej5UdmTsoqYNF" ?? ""),
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch weather");
      }
      return response.json();
    };


    getReviewData()
      .then((data) => {
        setReviewData(data);
        if (data.candidateId == userId && data.fbr_status == 2) {
          // goVisitorsLog("Viewed");
          reviewLog({
            userId,
            candidateId,
            userType,
            url: window.location.href,
            interviewId,
            interviewSessionId,
            viewedStatus: "Viewed",
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load review data:", err);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId, candidateId, interviewSessionId, userType]);

  console.log("interviewId", interviewId);
  console.log("candidateId", candidateId);
  console.log("interviewSessionId", interviewSessionId);

  useEffect(() => {
    if (!interviewId || !candidateId) return;
    const getPaymentStatus = async () => {
      let subscriptionType: null | string = null;
      if (reviewData?.interviewType == "Practice") {
        subscriptionType = "practice";
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?getPaymentStatus`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            interviewId,
            candidateId,
            subscriptionType,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch weather");
      }
      return response.json();
    };

    getPaymentStatus().then(setPaymentStatus).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId, candidateId]);

  useEffect(() => {
    if (!interviewId || !candidateId || !interviewSessionId || !userType)
      return;

    const getMalpracticeSummary = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?getMalpracticeSummary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            sessionId: interviewSessionId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    };

    getMalpracticeSummary()
      .then((data) => {
        setGenuineCount(data.result.GENUINE || 0);
        setSuspiciousCount(data.result.SUSPICIOUS || 0);
        setMalpracticeCount(data.result.MALPRACTICE || 0);
      })
      .catch(console.error);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId, candidateId, interviewSessionId, userType]);




  const reportDiv = () => {
    if (!reviewData) {
      return (
        <div className="text-gray-500 italic flex justify-center">
          Loading...
        </div>
      );
    }
    return (
      <Report
        reviewData={reviewData}
        genuineCount={genuineCount}
        suspiciousCount={suspiciousCount}
        malpracticeCount={malpracticeCount}
        onSetTab={setTab}
      />
    );
  };

  return (
    <div className="container px-4 py-6 sm:px-6 lg:px-8 mx-auto">
      <Suspense fallback={<div>Loading search params...</div>}>
      {reportDiv()}
      </Suspense>
    </div>
  );
}

