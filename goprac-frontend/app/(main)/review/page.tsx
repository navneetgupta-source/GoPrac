"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Report from "@/app/(main)/review/_components/report";
import { Feedback } from "@/app/(main)/review/_components/feedback";
import { useEffect, useState } from "react";

import { useUserStore } from "@/stores/userStore";

import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { reviewLog } from "@/actions/reviewLog";

export default function ReviewPage() {
  const [tab, setTab] = useState<string>("report");
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [reviewData, setReviewData] = useState(null);
  const [reviewInfo, setReviewInfo] = useState(null);
  const [reviewIcs, setReviewIcs] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [genuineCount, setGenuineCount] = useState(0);
  const [suspiciousCount, setSuspiciousCount] = useState(0);
  const [malpracticeCount, setMalpracticeCount] = useState(0);

  const [candidateId, setCandidateId] = useState(null);
  const [interviewId, setInterviewId] = useState(null);

  const userId = useUserStore((state) => state.userId);
  const userType = useUserStore((state) => state.userType);
  const pracIsLoggedin = useUserStore((state) => state.pracIsLoggedin);
  const userData = useUserStore((state) => state.jwtToken);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const interviewSessionId = searchParams.get("s");

  const router = useRouter();

  // if (pracIsLoggedin != "true") {
  //     window.location.href = "/";
  //   }

  //   if (!candidateId || !interviewId) {
  //     window.location.href = "/";
  //   }

  //   // console.log("getReviewIcsData",getReviewIcsData)

  //   if (userId != candidateId && userType != "admin") {
  //     window.location.href = "/";
  //   }

  useEffect(() => {
    if (!pracIsLoggedin) return;

    if (pracIsLoggedin != "true") {
      router.replace("/");
    }

    if (!candidateId || !interviewId || !userId) return;

    if (!candidateId || !interviewId) {
      router.replace("/");
    }

    // console.log("getReviewIcsData",getReviewIcsData)

    if (userId != candidateId && userType == "student") {
      router.replace("/");
    }
  }, [pracIsLoggedin, candidateId, interviewId, userType, userId, router]);

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
    if (!interviewId || !candidateId || !interviewSessionId || !userType)
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
            usertype: userType,
            interviewSessionId,
            url: pathname,
            userData: decodeURIComponent(userData ?? ""),
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch weather");
      }
      return response.json();
    };

    // getReviewData().then(setReviewData).catch(console.error);

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
    if (!interviewId || !candidateId || !userType) return;
    const getReviewInfo = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?getReviewInfo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            interviewId,
            candidateId,
            usertype: userType,
            interviewSessionId,
            url: pathname,
            userData: decodeURIComponent(userData ?? ""),
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch weather");
      }
      return response.json();
    };

    getReviewInfo().then(setReviewInfo).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId, candidateId, userType]);

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

  useEffect(() => {
    if (
      paymentStatus?.result == "PAID" ||
      reviewData?.interviewType == "Practice" ||
      userType == "admin"
    ) {
      setIsPaid(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [[reviewData, paymentStatus, userType]]);

  // console.log("interviewId:", interviewId);
  // console.log("candidateId:", candidateId);
  // console.log("interviewSessionId:", interviewSessionId);
  // console.log("userData:", userData);

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

  const feedbackDiv = () => {
    // console.log("Feedback tab condition", { reviewInfo, reviewData, paymentStatus });
    if (!reviewInfo || !reviewData || !paymentStatus) {
      return (
        <div className="text-gray-500 italic flex justify-center">
          Loading...
        </div>
      );
    }
    return (
      <Feedback
        reviewData={reviewData}
        reviewInfo={reviewInfo}
        isPaid={isPaid}
      />
    );
  };
  // console.log("Feedback tab condition", { reviewInfo, reviewData, paymentStatus });
  // console.log("reviewInfo response:", reviewInfo);

  return (
    <div className="container px-4 py-6 sm:px-6 lg:px-8 mx-auto">
      <Tabs className="w-full" value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 grid w-full grid-cols-2 md:w-[400px] px-4 bg-white border border-gray-200">
          <TabsTrigger
            value="report"
            className="data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Assessment Report
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-primary data-[state=active]:text-white"
            value="feedback"
          >
            Personalized Feedback
          </TabsTrigger>
        </TabsList>
        <TabsContent value="report">{reportDiv()}</TabsContent>
        <TabsContent value="feedback">{feedbackDiv()}</TabsContent>
      </Tabs>
    </div>
  );
}
// function setGenuineCount(arg0: any) {
//   throw new Error("Function not implemented.");
// }

// function setSuspiciousCount(arg0: any) {
//   throw new Error("Function not implemented.");
// }

// function setMalpracticeCount(arg0: any) {
//   throw new Error("Function not implemented.");
// }
