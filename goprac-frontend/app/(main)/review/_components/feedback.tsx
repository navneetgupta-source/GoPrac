"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Info } from "lucide-react";
import { FeedbackCard } from "./feedback-card";
import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/userStore";

import { markPDFAsPending } from "@/actions/update-reportpdf-status";
import { toast } from "sonner";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { reviewLog } from "@/actions/reviewLog";

export function Feedback({ reviewData, reviewInfo, isPaid }: any) {
  // console.log("reviewData",reviewData)
  // const [userType, setUserType] = useState('');
  const userId = useUserStore((state) => state.userId);
  const userType = useUserStore((state) => state.userType);

  const [showFeedback, setShowFeedback] = useState<boolean>(isPaid);
  const [isExport, setIsExport] = useState<boolean>(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    const link = reviewData?.linkPdf1;
    const isLinkReady = link?.startsWith("http");

    if (!isLinkReady) {
      toast.error("No PDF available to download.");
      return;
    }

    try {
      const response = await fetch(reviewData.linkPdf1);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${reviewData.firstName}_${reviewData.interviewName}_LearningNotes.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF.");
    }
  };

  const handleExport = async () => {
    console.log("export", reviewData?.linkPdf1);
    if (isPaid) {
      const link = reviewData?.linkPdf1;
      if (link === "0" || link === "1") {
        toast.success(
          "Your PDF is being generated and you’ll be notified on WhatsApp once it’s ready."
        );
        return;
      }
      const isLinkReady = link?.startsWith("http");
      if (isLinkReady) {
        handleDownloadPDF();
      } else {
        console.log("generate PDF");
        const res = await markPDFAsPending(reviewData.interviewSessionId);
        if (res.success) {
          toast.success(
            "Your PDF will be available soon and you’ll be notified on WhatsApp once it’s ready."
          );
        } else {
          toast.error("Failed to generate PDF.");
        }
      }
    } else {
      window.location.href = "/payment?i=" + reviewData.interviewId;
    }
  };

  useEffect(() => {
    if (!reviewData || !userId) return;

    console.log("xxx1", reviewData.candidateId);
    console.log("xxx2", reviewData.fbr_id);
    console.log("userId", userId);
    if (reviewData.candidateId == userId && reviewData.fbr_status == 2) {
      reviewLog({
        userId,
        candidateId: reviewData.candidateId,
        userType,
        url: window.location.href,
        interviewId: reviewData.interviewId,
        interviewSessionId: reviewData.interviewSessionId,
        viewedStatus: "download",
      });
    }
  }, [reviewData, userId]);

    const goToPaymentCallback = async () => {

      if (reviewData.candidateId == userId && reviewData.fbr_status == 2) {
        await reviewLog({
          userId,
          candidateId: reviewData.candidateId,
          userType,
          url: window.location.href,
          interviewId: reviewData.interviewId,
          interviewSessionId: reviewData.interviewSessionId,
          viewedStatus: "pay",
        });
    }
    // console.log("redirect")
    window.location.href = "/payment?i=" + reviewData.interviewId;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8 rounded-xl bg-gradient-to-r from-blue-100 via-indigo-50 to-indigo-50 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-primary p-3 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Learn from Personalized Feedback
            </h1>
            <p className="text-slate-500">
              Question responses and performance analysis
            </p>
          </div>
        </div>
          <Button onClick={handleExport} variant="outline" size="sm" className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="space-y-3" ref={exportRef}>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="gap-0">
            <CardHeader>
              <CardTitle className="font-medium text-slate-500">
                Candidate ID
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{reviewData.candidateId}</span>
                <Info className="h-4 w-4 text-slate-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="gap-0">
            <CardHeader>
              <CardTitle className="font-medium text-slate-500">
                {reviewData.interviewType == "Practice"
                  ? "Competency Name"
                  : "Interview Name"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="font-semibold">{reviewData.interviewName}</span>
            </CardContent>
          </Card>
          <Card className="gap-0">
            <CardHeader>
              <CardTitle className="font-medium text-slate-500">
                {reviewData.interviewType == "Practice"
                  ? "Read Time"
                  : "Read Time"}
                {/* Duration of Practice */}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="font-semibold">~10 min</span>
              {/* <span className="font-semibold">
              {reviewData.timeTakenByCandidate}
            </span> */}
            </CardContent>
          </Card>
        </div>
        {reviewInfo.map((item, index) => (
          <FeedbackCard
            index={index + 1}
            key={item.mergeId}
            data={item}
            totalQuestions={reviewInfo.length}
            showFeedback={index === 0 ? true : showFeedback}
            isExport={isExport}
            interviewType={reviewData?.interviewType || null}
            interviewId={reviewData.interviewId}
            goToPayment={goToPaymentCallback}
          />
        ))}
      </div>
    </div>
  );
}
