"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LucideSparkles,
  LucideCode2,
  LucideBriefcase,
  LucideTrophy,
  LucideBookOpen,
  LucideUser,
  LucideLightbulb,
  LucideClock,
  LucideInfo,
  LucideClipboardList,
  LucidePhone,
  LucideVideo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logActivity } from "@/lib/activityLogger";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// ✅ Check if user is logged in using PracIsLoggedin cookie
const isUserLoggedIn = () => {
  if (typeof document !== "undefined") {
    const cookies = document.cookie.split(";");
    const loginCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("PracIsLoggedin=")
    );
    return loginCookie?.split("=")[1] === "true";
  }
  return false;
};

const getUserId = () => {
  if (typeof document !== "undefined") {
    const cookies = document.cookie.split(";");
    const userCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("pracUser=")
    );
    if (userCookie) {
      const value = userCookie.substring(userCookie.indexOf("=") + 1);
      return value.trim();
    }
  }
  return ""; // ✅ Return empty string when not logged in
};

const getUserName = () => {
  if (typeof document !== "undefined") {
    const cookies = document.cookie.split(";");
    const userNameCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("userName=")
    );
    return userNameCookie
      ? decodeURIComponent(userNameCookie.split("=")[1])
      : "Admin";
  }
  return "Admin";
};
const parseCleanJSON = (responseText: string) => {
  try {
    return JSON.parse(responseText);
  } catch {
    try {
      const jsonStartIndex = Math.max(
        responseText.indexOf("["),
        responseText.indexOf("{")
      );
      if (jsonStartIndex > 0)
        return JSON.parse(responseText.substring(jsonStartIndex));
      throw new Error("No JSON found in response");
    } catch (cleanError) {
      // In parseCleanJSON, change:
      const errorMsg =
        cleanError instanceof Error ? cleanError.message : String(cleanError);
      throw new Error(`Invalid JSON response: ${errorMsg}`);
    }
  }
};

// Add this helper function near the top of your component (after the imports)
const calculatePracticeDuration = (
  prbCount: number | null | undefined
): string => {
  if (!prbCount || prbCount === 0) return "2.1 Hours";

  const totalMinutes = (prbCount / 6) * 15;
  const hours = totalMinutes / 60;

  // If it's a whole number of hours, display without decimals
  if (hours % 1 === 0) {
    return `${hours} Hours`;
  }

  // Otherwise, display with one decimal place
  return `${hours.toFixed(1)} Hours`;
};

const makeAjaxRequest = async (url: string, data: any): Promise<any> => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      mode: "cors",
      body: JSON.stringify(data),
    });

    const responseText = await response.text();
    return parseCleanJSON(responseText);
  } catch (error) {
    throw new Error("AJAX Error");
  }
};

async function getInterviewDetails(preInterviewId: string) {
  return makeAjaxRequest(`${API_BASE}/index.php?getInterviewDetails`, {
    preInterviewId,
  });
}
async function getJobTopics(preInterviewId: string, userId: string) {
  return makeAjaxRequest(`${API_BASE}/index.php?getJobTopics`, {
    preInterviewId,
    userId,
  });
}
async function getCompanyInterviewSubject(
  sectorId: string,
  companyId: string,
  role: string,
  preInterviewId: string
) {
  return makeAjaxRequest(`${API_BASE}/index.php?getCompanyInterviewSubject`, {
    sectorId,
    companyId: parseInt(companyId) || 0,
    role: parseInt(role) || 0,
    preInterviewId,
  });
}
async function getCompanyInterviewInfo(
  sectorId: string,
  companyId: string,
  userId: string,
  preInterviewId: string
) {
  return makeAjaxRequest(`${API_BASE}/index.php?getCompanyInterviewInfo`, {
    sectorId,
    companyId: parseInt(companyId) || 0,
    userId,
    preInterviewId,
  });
}
async function getIncompleteInterview(preInterviewId: string, userId: string) {
  return makeAjaxRequest(`${API_BASE}/index.php?getIncompleteInterview`, {
    preInterviewId,
    userId,
  });
}

function redirectPost(url: string, data: Record<string, string>) {
  const queryParams = Object.entries(data)
    .map(([key, value]) => {
      if (key === "subjectList" || key === "topicList") {
        return `${key}=${value.replace(/"/g, "%22")}`;
      } else {
        return `${key}=${encodeURIComponent(value)}`;
      }
    })
    .join("&");

  const form = document.createElement("form");
  form.method = "POST";
  form.action = `${url}?${queryParams}`;

  document.body.appendChild(form);
  form.submit();
}

interface Topic {
  id: string;
  name: string;
  subject: string;
  attempted?: boolean;
}
interface AttemptedTopic {
  id: string;
  interviewId: string;
  questionId: string;
  topic_id: string;
  attemptStatus: string;
}
interface Subject {
  id: string;
  dropdown: string;
  favourite_subject: string;
  noOfAnswer: string;
  noOfSkip: string;
  numberOfQues: string;
}
interface InterviewData {
  id: string;
  company_id: string | null;
  sectorId: string;
  productId: string;
  interviewType: "Practice" | "job";
  serviceType: string;
  practiceType: string;
}
interface CompanyInfo {
  name: string;
  duration: string;
  role: Array<{ position: string; name: string }>;
  commaSepSubjects: string;
  logoText?: string;
  domain?: { id: string; name: string };
  YOE?: string;
  prbCount?: number | null;
}
interface BestScoreInfo {
  subject?: string;
  bestScore?: number | string;
}

export default function JobPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preInterviewId = searchParams.get("p") || "";
  const userId = getUserId();
  const userName = getUserName();
  const [interviewData, setInterviewData] = useState<InterviewData | null>(
    null
  );
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [validationState, setValidationState] = useState("1");
  const [progress, setProgress] = useState({
    percentage: 0,
    completedTopics: 0,
    totalTopics: 50,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [bestScoreInfo, setBestScoreInfo] = useState<BestScoreInfo | null>(
    null
  );
  const [incompleteInterviewId, setIncompleteInterviewId] = useState(null);
  const [incompleteInterviewExists, setIncompleteInterviewExists] =
    useState(false);
  const [probAttempted, setProbAttempted] = useState(0);


  useEffect(() => {
    setLoading(true);
    setError(null);
    setRedirecting(false);
    setInterviewData(null);
    setCompanyInfo(null);
    setSubjects([]);
    setTopics([]);
    setSelectedSubject("");
    setSelectedTopics([]);
    setBestScoreInfo(null);
    if (preInterviewId) {
      // console.log('ℹ️ Loading page data, preInterviewId:', preInterviewId)
      loadPageData();
    }
  }, [preInterviewId, userId]);

  useEffect(() => {
    if (companyInfo?.name) {
      document.title = `${companyInfo.name} | GoPrac`;
    }
  }, [companyInfo?.name]);

  useEffect(() => {
    const shouldPollLogin = sessionStorage.getItem("waitingForLogin");

    if (shouldPollLogin !== "true") return;

    console.log("⏳ Polling for login...");

    const checkLogin = setInterval(() => {
      const isLoggedIn = isUserLoggedIn();

      if (isLoggedIn) {
        console.log("✅ Login detected! Cleaning URL and reloading...");
        sessionStorage.removeItem("waitingForLogin");
        clearInterval(checkLogin);

        // Redirect to clean URL (removes &login=1)
        window.location.href = `/job?p=${preInterviewId}`;
      }
    }, 1000);

    return () => {
      clearInterval(checkLogin);
    };
  }, [preInterviewId]);

  useEffect(() => {
    const getIncompleteInterviewFn = async () => {
      const isLoggedIn = isUserLoggedIn();

      if (isLoggedIn) {
        try {
          const incomplete = await getIncompleteInterview(
            preInterviewId,
            userId
          );

          if (incomplete.status == 1) {
            if (
              incomplete.data !== null &&
              incomplete.data.incompleteInterviewId !== null
            ) {
              setIncompleteInterviewId(incomplete.data.incompleteInterviewId);
              setIncompleteInterviewExists(true);
            } else {
              setIncompleteInterviewExists(false);
            }
          } else if (incomplete.status == -1) {
          } else if (incomplete.status == 0) {
          }
        } catch (error) {
          console.error("Error fetching topics:", error);
        }
      }
    };

    getIncompleteInterviewFn();
  }, [userId, preInterviewId]);

  // Percentage Calculation
  useEffect(() => {
    
    if (companyInfo) {
      const totalProblems =
        companyInfo.prbCount && companyInfo.prbCount > 0
          ? companyInfo.prbCount
          : 50;

      const percentage = Math.min(
        100,
        Math.round((probAttempted / totalProblems) * 100)
      );

      setProgress({
        percentage,
        completedTopics: probAttempted,
        totalTopics: totalProblems,
      });

      console.log("✅ Updated Progress:", {
        probAttempted,
        totalProblems,
        percentage,
        companyInfo,
      });
    }
  }, [companyInfo, probAttempted]);

  // 1st subject auto select
  useEffect(() => {
    if (!selectedSubject && subjects.length > 0) {
      setSelectedSubject(subjects[0].id);
      setSelectedTopics([]);
    }
  }, [subjects, selectedSubject]);

  function getSubjectNameFromId(subjectId: string | undefined): string {
    if (!subjectId || !Array.isArray(subjects)) return "";
    const found = subjects.find((s: Subject) => s.id === subjectId);
    return found ? found.favourite_subject : "";
  }

  const loadPageData = async () => {
    try {
      setLoading(true);
      setError(null);
      // console.log('🔄 Calling getInterviewDetails')
      const interviewDetails = await getInterviewDetails(preInterviewId);
      // console.log('✅ getInterviewDetails result:', interviewDetails)
      if (
        interviewDetails.status === 1 &&
        interviewDetails.data &&
        interviewDetails.data[0]
      ) {
        const data = interviewDetails.data[0];
        if (data.interviewType !== "Practice") {
          // console.log('⚠️ Redirecting to Job Page. Interview type:', data.interviewType)
          setRedirecting(true); // Prevent error dialog
          window.location.href = `/job1?p=${preInterviewId}`;
          return;
        }
        setInterviewData(data);

        // ✅ Call registerUpskill to create CIM entry
        try {
          console.log("🔄 Calling registerUpskill...");

          // Initialize default values
          let code: string | null = null;
          let entityType: string | null = null;
          let source = "goprac";
          const action = "default";

          // Check localStorage for invite code tracking
          const cStored = localStorage.getItem("invitec");
          const pStored = localStorage.getItem("invitep");

          if (cStored && pStored) {
            // Verify stored preInterviewId matches current one
            if (parseInt(pStored, 10) === parseInt(preInterviewId, 10)) {
              source = "invite_code";

              const lowerCode = cStored.toLowerCase();

              // Determine entity type from code prefix
              if (lowerCode.startsWith("cc")) {
                entityType = "corporate";
              } else if (lowerCode.startsWith("ic")) {
                entityType = "institute";
              }

              code = cStored;

              // Clean up localStorage after use
              localStorage.removeItem("invitec");
              localStorage.removeItem("invitep");
            }
          }

          // Build payload matching Knockout format
          const registerPayload = {
            userId: userId,
            preInterviewId: preInterviewId,
            action: action,
            source: source,
            code: code,
            entityType: entityType,
          };

          console.log("📤 registerUpskill payload:", registerPayload);

          // Make API call
          const response = await fetch(
            `${API_BASE}/index.php?registerUpskill`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              mode: "cors",
              body: JSON.stringify(registerPayload),
            }
          );

          const responseText = await response.text();
          const registerData = parseCleanJSON(responseText);

          // Log result
          if (registerData && registerData.status != 0) {
            console.log("✅ registered");
          } else if (registerData.status == 0) {
            console.log("⚠️ data not create upskill");
          }
        } catch (registerError) {
          console.error("❌ registerUpskill error:", registerError);
          // Continue - CIM entry might already exist
        }

        // console.log('🔄 Calling getCompanyInterviewInfo')
        const companyInfoResult = await getCompanyInterviewInfo(
          data.sectorId,
          data.company_id || "0",
          userId,
          preInterviewId
        );
        // console.log('✅ getCompanyInterviewInfo result:', companyInfoResult)
        if (companyInfoResult[0]) {
          setCompanyInfo(companyInfoResult[0]);
          const role = companyInfoResult[0].role?.[0]?.position || "0";

          // console.log('🔄 Calling getCompanyInterviewSubject with role:', role)
          const subjectsResult = await getCompanyInterviewSubject(
            data.sectorId,
            data.company_id || "0",
            role,
            preInterviewId
          );
          if (subjectsResult.status === 1 && subjectsResult.list) {
            setSubjects(subjectsResult.list);
            setValidationState(subjectsResult.validationState || "1");
          }
          // console.log('✅ getCompanyInterviewSubject result:', subjectsResult)
        }

        // console.log('🔄 Calling getJobTopics')
        const topicsResult = await getJobTopics(preInterviewId, userId);
        // console.log('✅ getJobTopics result:', topicsResult)
        if (topicsResult.status === 1 && topicsResult.data) {
          const topicsData = topicsResult.data;
          const attemptedTopics = topicsResult.result || [];
          const attemptedTopicIds = new Set(
            attemptedTopics.map((attempt: AttemptedTopic) => attempt.topic_id)
          );
          const topicsWithAttemptStatus = topicsData.map((topic: Topic) => ({
            ...topic,
            attempted: attemptedTopicIds.has(topic.id),
          }));
          setTopics(topicsWithAttemptStatus);

          const totalTopics = topicsData.length
          const completedTopics = attemptedTopicIds.size

          const ProbAttempted = topicsResult.ProbAttempted ?? 0;
          setProbAttempted(ProbAttempted);
        }

        if ("bestScoreInfo" in topicsResult) {
          setBestScoreInfo(topicsResult.bestScoreInfo as BestScoreInfo);
        }


      } else {
        setError("Interview not found");
        console.error("❌ Interview data not found for:", preInterviewId);
      }
    } catch (err: any) {
      if (!redirecting) {
        // Only set error if NOT redirecting
        setError(`Failed to load page data: ${err.message}`);
      }
    } finally {
      if (!redirecting) {
        // Only stop loading if NOT redirecting
        setLoading(false);
      }
    }
  };

  const getRequiredTopicCount = () => {
    const filteredTopics = topics.filter((t) => t.subject === selectedSubject);
    if (filteredTopics.length > 2) return 3;
    if (filteredTopics.length > 1) return 2;
    if (filteredTopics.length === 1) return 1;
    return 0;
  };

  const isButtonEnabled = () => {
    if (!selectedSubject || isSubmitting) return false;
    const requiredCount = getRequiredTopicCount();
    return selectedTopics.length >= requiredCount && requiredCount > 0;
  };

  const handleContinue = async () => {
    // FIRST CHECK: Is user logged in?
    if (!isUserLoggedIn()) {
      sessionStorage.setItem("waitingForLogin", "true");
      window.location.href = `/job?p=${preInterviewId}&login=1`;
      return;
    }
    if (!selectedSubject) {
      alert("Select any One Subject.");
      return;
    }

    const requiredCount = getRequiredTopicCount();

    if (selectedTopics.length < requiredCount) {
      alert(`Select ${requiredCount} topic${requiredCount > 1 ? "s" : ""}.`);
      return;
    }

    if (!interviewData) {
      alert("Interview data not loaded. Please refresh the page.");
      return;
    }

    setIsSubmitting(true);

    try {
      const companyRole = companyInfo?.role?.[0]?.position || "0";
      const companyId = interviewData.company_id || "0";
      const sectorId = interviewData.sectorId;
      const productId = interviewData.productId;

      // Build arrays in correct format
      const subjectArray = [{ CoreSubjectOne: selectedSubject }];
      const topicsArray = [
        { [selectedSubject]: selectedTopics.join(",") },
        { "": "" },
        { "": "" },
      ];

      // Prepare URL params (JSON stringified)
      const params = {
        c: companyId,
        p: productId,
        s: sectorId,
        r: companyRole,
        a: "goprac",
        preId: preInterviewId,
        subjectList: JSON.stringify(subjectArray),
        topicList: JSON.stringify(topicsArray),
      };

      // console.log('🔄 Redirecting with params:', params);

      // Set navigation cookie
      document.cookie = "navigatedFromHomePage=1; path=/; max-age=60";
      localStorage.removeItem("preInterviewId");

      logActivity(
        "START_PRACTICE_CLICK",
        `User Started an Interview. PreInterviewId: ${preInterviewId}`
      );

      // Redirect with query parameters in URL
      redirectPost("/adaptiveInterview", params);
    } catch (error: any) {
      console.error("❌ handleContinue error:", error);
      alert(
        `Error: ${error.message}. Please check browser console for details.`
      );
      setIsSubmitting(false);
      logActivity(
        "ERROR_START_PRACTICE",
        `Error while Starting Practice. PreInterviewId: ${preInterviewId}`
      );
    }
  };

  const handleContinuePrev = async () => {

    if (!interviewData) {
      alert("Interview data not loaded. Please refresh the page.");
      return;
    }

    // setIsSubmitting(true);

    try {
      const companyRole = companyInfo?.role?.[0]?.position || "0";
      const companyId = interviewData.company_id || "0";
      const sectorId = interviewData.sectorId;
      const productId = interviewData.productId;

      // Build arrays in correct format
      const subjectArray = [{ CoreSubjectOne: selectedSubject }];
      const topicsArray = [
        { [selectedSubject]: selectedTopics.join(",") },
        { "": "" },
        { "": "" },
      ];

      // Prepare URL params (JSON stringified)
      const params = {
        c: companyId,
        p: productId,
        s: sectorId,
        r: companyRole,
        i: incompleteInterviewId,
        a: "goprac",
        preId: preInterviewId,
        subjectList: JSON.stringify(subjectArray),
        topicList: JSON.stringify(topicsArray),
      };

      // console.log('🔄 Redirecting with params:', params);

      // Set navigation cookie
      document.cookie = "navigatedFromHomePage=1; path=/; max-age=60";
      localStorage.removeItem("preInterviewId");

      logActivity(
        "CONTINUED_PRACTICE",
        `User Continued a Practice In Progress. PreInterviewId: ${preInterviewId}`
      );

      // Redirect with query parameters in URL
      redirectPost("/adaptiveInterview", params);
    } catch (error: any) {
      console.error("❌ handleContinue error:", error);
      alert(
        `Error: ${error.message}. Please check browser console for details.`
      );
      setIsSubmitting(false);
      logActivity(
        "ERROR_CONTINUE_PRACTICE",
        `Error while Continuing Practice. PreInterviewId: ${preInterviewId}`
      );
    }
  };

  const filteredTopics = topics.filter((t) => t.subject === selectedSubject);
  const requiredTopicCount = getRequiredTopicCount();

  const logoURL = companyInfo?.logoText
    ? `${process.env.NEXT_PUBLIC_AWS_S3_URL}/${companyInfo.logoText.trim()}`
    : undefined;

  // LOADING STATE
  if (loading || redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">
            Loading practice session...
          </p>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error || !interviewData || !companyInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent mb-3">
            Unable to Load Practice Session
          </h2>
          <p className="text-gray-600 mb-4">
            {error || `Practice session with ID ${preInterviewId} not found.`}
          </p>
          <button
            onClick={() => loadPageData()}
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-purple-200 transition-all duration-300 font-medium transform hover:-translate-y-1"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // let bestScore: number | null = null;
  // let bestScoreText = "--";
  // let bestScoreSubject = "";

  // if (
  //   bestScoreInfo &&
  //   typeof bestScoreInfo.bestScore !== "undefined" &&
  //   bestScoreInfo.bestScore !== null &&
  //   !isNaN(Number(bestScoreInfo.bestScore)) &&
  //   Number(bestScoreInfo.bestScore) > 0
  // ) {
  //   bestScore = Math.round((Number(bestScoreInfo.bestScore) / 10) * 100);
  //   bestScoreText = `${bestScore}%`;
  //   bestScoreSubject =
  //     getSubjectNameFromId(bestScoreInfo.subject) || "Competency";
  // }

  // MAIN PAGE DESIGN
  return (
    <div className="min-h-screen bg-white">
      {/* Hero & Practice Overview */}
      <section className="py-14 flex flex-col bg-[#EAE6FA] md:flex-row md:items-center md:justify-between gap-12 px-6 md:px-30 mx-auto">
        <div className="flex-1 space-y-4">
          {/* Logo Display */}
          {logoURL && (
            <div className="mb-4">
              <img
                src={logoURL}
                alt={`${companyInfo?.name || 'Company'} Logo`}
                className="h-16 md:h-20 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          {/* <div className="inline-flex items-center text-base font-medium px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 mb-2 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <LucideSparkles className="w-5 h-5 mr-2 text-blue-600" />
            AI-Powered Practice
          </div> */}
          <h1 className="font-extrabold font-sans text-4xl md:text-5xl leading-tight tracking-tight mb-3">
            {companyInfo?.name ? (
              <>
                {companyInfo.name} <br />
                {/* <span
                    className="
                      font-sans
                      relative inline-block
                      bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500
                      bg-[length:200%_200%]
                      animate-gradient
                      bg-clip-text text-transparent drop-shadow-sm
                    "
                  >
                    {subjects[0]?.favourite_subject || "Core Competency"}
                  </span> */}
              </>
            ) : (
              "Thinking Skill Practice"
            )}
          </h1>
          <div className="flex flex-wrap items-center gap-8 text-gray-700 text-lg font-medium my-2">
            {companyInfo?.domain?.id !== "0" && companyInfo?.domain?.name && (
              <span className="inline-flex items-center gap-2 hover:text-blue-600 transition-colors duration-200">
                <LucideCode2 className="w-5 h-5 text-blue-600" />
                {companyInfo.domain.name}
              </span>
            )}
            {companyInfo?.YOE && (
              <span className="inline-flex items-center gap-2 hover:text-green-600 transition-colors duration-200">
                <LucideBriefcase className="w-5 h-5 text-green-600" />
                {companyInfo.YOE} years
              </span>
            )}
          </div>
        </div>

        {/* Practice Overview Card - Enhanced with hover effects */}
        {!(interviewData?.interviewType === "Practice" && interviewData?.practiceType === "freetrial") && (
          <div className="flex-shrink-0 w-full max-w-sm bg-white rounded-2xl shadow-lg hover:shadow-2xl py-6 px-10 flex flex-col items-center transition-all duration-300 hover:-translate-y-1 border border-gray-100">
            <h2 className="font-semibold text-xl text-center mb-6 text-gray-900">
              Your Practice Status
            </h2>
            <div className="flex gap-8 items-center">
              {/* Progress Circle */}
              <div className="flex flex-col items-center">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="4"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#7c3aed"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 16}`}
                      strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress.percentage / 100)}`}
                      style={{
                        transition: "stroke-dashoffset 1.2s ease-in-out",
                      }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-2xl font-semibold text-purple-600">
                    {progress.percentage}%
                  </span>
                </div>
                <span className="text-sm text-gray-600 mt-2">Problems practiced</span>
              </div>
              {/* Best Score - Enhanced with hover */}
              {/* <div className="flex flex-col items-center bg-green-50 px-6 py-4 rounded-xl min-w-[120px] max-w-[150px] shadow-md hover:shadow-lg hover:bg-green-100 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <LucideTrophy className="w-7 h-7" />
                <span className="text-3xl font-extrabold">
                  {bestScore !== null ? bestScoreText : '--'}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700 text-center">Best Score</p>
              <p className="text-xs text-green-800 italic text-center mt-1">
                {bestScore !== null
                  ? `in ${bestScoreSubject}`
                  : userId
                    ? 'No attempts yet'
                    : 'Sign in to track your best'}
              </p>
            </div> */}
            </div>
          </div>
        )}
      </section>

      {/* Main Info Sections */}
      <div className="w-full py-8">

        <div className="max-w-7xl mx-auto px-2 md:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* How to Practice */}
            <section className="bg-white rounded-xl shadow-lg hover:shadow-2xl p-8 flex flex-col justify-center min-h-[204px] transition-all duration-300 hover:-translate-y-1 border border-gray-100">
              <h3 className="font-bold text-2xl text-[#12253A] mb-3">
                How to Practice
              </h3>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center">
                  <LucideClipboardList className="w-5 h-5" />
                </div>
                <span className="text-gray-700 text-base">
                  Select three topics, answer 6 questions per session (15 minutes: 5 mins practice + 10 mins feedback), and receive feedback in a PDF.
                </span>
              </div>
            </section>

            {/* Pre-requisite */}
            <section className="bg-white rounded-xl shadow-lg hover:shadow-2xl p-8 flex flex-col justify-center min-h-[204px] transition-all duration-300 hover:-translate-y-1 border border-gray-100">
              <h3 className="font-bold text-2xl text-[#12253A] mb-3">
                Pre-requisite
              </h3>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center">
                  <LucideInfo className="w-5 h-5" />
                </div>
                <span className="text-gray-700 text-base">
                  You should have basic knowledge of{" "}
                  {subjects.length > 0
                    ? subjects.map((s) => s.favourite_subject).join(", ")
                    : companyInfo?.commaSepSubjects ||
                      "Backend, Frontend, or Programming"}.
                </span>
              </div>
            </section>
          </div>

          {/* What to Expect After Session */}
          <div className="max-w-7xl mx-auto px-2 md:px-8 mt-8">
            <section className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg hover:shadow-2xl p-8 transition-all duration-300 hover:-translate-y-1 border border-purple-100">
              <h3 className="font-bold text-2xl text-[#12253A] mb-4">
                What to Expect After the Session
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                    <LucideClipboardList className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-gray-800 text-sm">Assessment scorecards</span>
                </div>
                <div className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <LucideTrophy className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-gray-800 text-sm">Industry benchmarking</span>
                </div>
                <div className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <LucideBookOpen className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-gray-800 text-sm">Detailed Personalized feedback PDF</span>
                </div>
                <div className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-800 text-sm">Malpractice Check</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Get Started + Topic Selection */}
      <section className="max-w-5xl mx-auto mt-12 mb-10 px-4">
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 md:p-10 transition-all duration-300 border border-gray-100">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2 shadow-md hover:shadow-lg hover:bg-purple-200 transition-all duration-300">
              <LucideVideo className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="font-bold text-lg">Get Started</h3>
            <p className="text-sm text-gray-500 mt-1">10-15 minutes</p>
          </div>
          {isUserLoggedIn() && incompleteInterviewExists && incompleteInterviewId && (
            <>
              <div className="mt-6">
                <div className="flex justify-center items-center mb-2 w-full mx-auto">
                  <button
                    className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2.5 px-6 rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-purple-300 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center`}
                    onClick={handleContinuePrev}
                  >
                    Continue previous session
                  </button>
                </div>
              </div>
            </>
          )}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">
              Choose Subject (Any One):
            </label>
            <select
              className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white text-sm hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedTopics([]);
              }}
            >
              <option value="">Select Core Subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.favourite_subject}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Topic Grid - Enhanced with hover effects */}
          {selectedSubject && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">
                  Choose Topics (Any {requiredTopicCount}):
                </label>
                <span className="text-sm font-semibold text-gray-500">
                  Selected: {selectedTopics.length}/{requiredTopicCount}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filteredTopics.map((topic) => (
                  <label
                    key={topic.id}
                    className={`p-2 border rounded-md cursor-pointer flex justify-between items-center text-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
                      ${
                        selectedTopics.includes(topic.id)
                          ? "bg-indigo-50 border-indigo-400 shadow-md"
                          : topic.attempted
                          ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-300 hover:border-emerald-400"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }
                      ${
                        selectedTopics.length >= requiredTopicCount &&
                        !selectedTopics.includes(topic.id)
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }
                      ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
                  >
                    <span className="font-medium text-gray-700">
                      {topic.name}
                    </span>
                    {selectedTopics.includes(topic.id) && (
                      <span className="ml-2 flex-shrink-0 text-blue-500">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </span>
                    )}
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedTopics.includes(topic.id)}
                      onChange={(e) => {
                        if (isSubmitting) return;
                        if (
                          e.target.checked &&
                          selectedTopics.length < requiredTopicCount
                        ) {
                          setSelectedTopics([...selectedTopics, topic.id]);
                        } else if (!e.target.checked) {
                          setSelectedTopics(
                            selectedTopics.filter((t) => t !== topic.id)
                          );
                        }
                      }}
                      disabled={
                        isSubmitting ||
                        (selectedTopics.length >= requiredTopicCount &&
                          !selectedTopics.includes(topic.id))
                      }
                    />
                  </label>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gradient-to-r from-emerald-200 to-green-200 border border-emerald-300 rounded mr-1"></div>
                    <span>Attempted</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-white border border-gray-300 rounded mr-1"></div>
                    <span>New</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <button
                  onClick={handleContinue}
                  className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2.5 px-6 rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-purple-300 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center
                  ${
                    isButtonEnabled()
                      ? "cursor-pointer"
                      : "opacity-30 cursor-not-allowed hover:transform-none hover:shadow-lg"
                  }`}
                  disabled={!isButtonEnabled()}
                >
                  {isSubmitting ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Preparing Interview...
                    </>
                  ) : selectedTopics.length < requiredTopicCount ? (
                    "Continue"
                  ) : (
                    "Start Practice Session"
                  )}
                  {!isSubmitting && isButtonEnabled() && (
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* What You'll Gain */}

      {/* <section className="max-w-5xl mx-auto mt-20 mb-8 px-4">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          What You'll Gain
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-2xl text-center transition-all duration-300 hover:-translate-y-2 border border-gray-100 group">
            <div className="mx-auto bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors duration-300 shadow-md">
              <LucideLightbulb className="text-green-600 w-7 h-7" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Improve Prompting
            </h3>
            <p className="text-xs text-gray-500">
              Frame the right prompts to approach technical problems better
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-2xl text-center transition-all duration-300 hover:-translate-y-2 border border-gray-100 group">
            <div className="mx-auto bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:bg-red-200 transition-colors duration-300 shadow-md">
              <LucideClipboardList className="text-red-600 w-7 h-7" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Quick Troubleshooting
            </h3>
            <p className="text-xs text-gray-500">
              Identify and resolve issues with speed and accuracy
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-2xl text-center transition-all duration-300 hover:-translate-y-2 border border-gray-100 group">
            <div className="mx-auto bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:bg-yellow-200 transition-colors duration-300 shadow-md">
              <LucideClipboardList className="text-yellow-600 w-7 h-7" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Design & Testing
            </h3>
            <p className="text-xs text-gray-500">
              Build and validate solutions for optimized outcomes
            </p>
          </div>
        </div>
      </section> */}

      {/* Connect with us */}
      <div className="py-12">
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-lg hover:shadow-2xl text-center max-w-xl mx-auto transition-all duration-300 hover:-translate-y-1 border border-blue-100">
          <h3 className="font-bold text-lg text-gray-900 mb-2">
            Connect with us
          </h3>
          <p className="text-sm text-gray-600">
            For any technical assistance, feel free to reach out.
          </p>
          <div className="mt-4 inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-2xl gap-2 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:scale-105">
            <LucidePhone className="w-5 h-5 mr-2" />
            <span>63000060022</span>
          </div>
        </section>
      </div>
    </div>
  );
}
