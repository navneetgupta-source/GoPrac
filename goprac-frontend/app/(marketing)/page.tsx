'use client';
import { useState, useEffect, useRef } from "react";
import {
  Target,
  BookOpen,
  Users,
  Puzzle,
  LineChart,
  Star,
  Sparkle,
  StarIcon,
  Server,
  Code,
  GitBranch,
  Zap,
  Cloud,
  Database,
  Award,
  TrendingUp,
  CheckCircle2,
  NotebookPen,
} from "lucide-react";
import Analytics from "./_components/analytics";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "@/stores/userStore";
import Link from "next/link";
import { logActivity } from "@/lib/activityLogger";
import TrialSelectionForm from "./_components/TrialSelectionForm";
import ConversionChart from "./companypage/_components/ConversionChart";
import FloatDemo from "@/components/FloatDemo";

interface ProductItem {
  YOE: string;
  Domain: string;
  price: number | null;
  preInterviewId: string;
  gradient: string;
  icon: any;
  firstSubject: string;
  commaSepSubjects: string;
}

const companyLogos = [
  "/images/company/purview-logo-blue.png",
  "/images/company/phicomerceLOgo.png",
  "/images/company/thertroLabs_32.png",
  "/images/company/RightData_Logo.jpg",
  "/images/company/exrinctFire.jfif",
  "/images/company/pageSuite.jfif",
  "/images/company/genzeon-logo.png",
  "/images/company/allsec.png",
  "/images/company/axeno_logo.jfif",
  "/images/company/exa_ag.jfif",
  "/images/company/archon_logo.jfif",
  "/images/company/TIM.png",
  "/images/company/MBM_Newtech.png",
  "/images/company/Intelizen.jfif",
  "/images/company/morph.jfif",
  "/images/company/sartorious_logo_2.png",
  "/images/company/pxil_india_logo.jfif",
  "/images/company/nippon.png",
  "/images/company/boot.jfif",
  "/images/company/veenaworld.png",
  "/images/company/digitinsurance.png",
  "/images/company/GigaforceLogo.jpg",
];

const testimonials = [
  {
    id: 1,
    name: "Subhash Baghelker",
    dp: "testimonial-subhas.jpg",
    linkedin: "https://www.linkedin.com/in/subhash-baghelkar-0a64a720/",
    initials: "SB",
    rating: 5,
    text: "GoPrac is great platform to develop thinking skills in short period of time effortlessly",
  },
  {
    id: 2,
    name: "Ujala Kumari",
    dp: "testimonial-ujala.jpeg",
    linkedin: "https://www.linkedin.com/in/ujala-kumari0704/",
    initials: "UK",
    rating: 5,
    text: "GoPrac's 1-on-1 practice sessions in C#, Dot Net, and MVC was invaluable, helping me clear the face-to-face round. Thanks to GoPrac, I secured the job offer!",
  },
  {
    id: 3,
    name: "Saurabh Bhatteja",
    dp: "testimonial-saurabh.jpg",
    linkedin: "https://www.linkedin.com/in/saurabhbhatteja/",
    initials: "SB",
    rating: 5,
    text: "Exceptional first experience with GoPrac. Practice sessions with AI BOT greatly helped me prepare for the job offer within a week. Highly recommended!",
  },
  {
    id: 4,
    name: "SHRAVANI GN",
    dp: "testimonial-shravani.jpg",
    linkedin: "https://www.linkedin.com/in/shravani-gn/",
    initials: "SG",
    rating: 5,
    text: `GoPrac is an excellent platform! Through multiple 1-on-1 practice sessions, I've gained confidence through valuable insights on problem-solving skills. The feedback has significantly improved my weaker areas for solving Technical problems.`,
  },
  {
    id: 5,
    name: "PRATHAP HM",
    dp: "testimonial-prathap.png",
    linkedin: "https://www.linkedin.com/in/prathap-hoodi-muniraj-8b8270184/",
    initials: "PH",
    rating: 5,
    text: "GoPrac was pivotal in my placement journey. The 1-on-1 practice sessions and insightful personalized feedback addressed my weak areas, greatly enhancing my preparation for Design roles",
  },
  {
    id: 6,
    name: "KARUMURI SAI HARINI",
    dp: "testimonial-harini.png",
    linkedin: "https://www.linkedin.com/in/sai-harini-b302a41a2/",
    initials: "KS",
    rating: 5,
    text: "GoPrac is truly one-of-a-kind. It helped me master my Java problem-solving skills, offering invaluable insights for improvement.",
  },
];

const Homepage = () => {
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [productData, setProductData] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = useUserStore((state) => state.userId);
  const userType = useUserStore((state) => state.userType);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const trialFormRef = useRef<HTMLDivElement>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const getCardsPerPage = () => {
    if (typeof window === "undefined") return 1;
    const width = window.innerWidth;
    if (width >= 1280) return 4;
    if (width >= 1024) return 3;
    if (width >= 640) return 2;
    return 1;
  };

  const getTotalPages = () => {
    const cardsPerPage = getCardsPerPage();
    return Math.ceil(productData.length / cardsPerPage);
  };

  const updateArrowVisibility = () => {
    if (!scrollContainerRef.current) return;
    const scrollContainer = scrollContainerRef.current;
    const scrollLeft = scrollContainer.scrollLeft;
    const maxScrollLeft =
      scrollContainer.scrollWidth - scrollContainer.clientWidth;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < maxScrollLeft - 10);
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || productData.length === 0) return;

    const handleScrollEvent = () => {
      if (!scrollContainer) return;
      const scrollLeft = scrollContainer.scrollLeft;
      const containerWidth = scrollContainer.clientWidth;
      const maxScrollLeft = scrollContainer.scrollWidth - containerWidth;
      updateArrowVisibility();
      const scrollPercentage =
        maxScrollLeft > 0 ? scrollLeft / maxScrollLeft : 0;
      const totalPages = getTotalPages();
      const currentPage = Math.min(
        Math.round(scrollPercentage * (totalPages - 1)),
        totalPages - 1
      );
      if (currentPage !== currentCardIndex && currentPage >= 0) {
        setCurrentCardIndex(currentPage);
      }
    };

    let scrollTimeout: NodeJS.Timeout;
    const debouncedScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScrollEvent, 100);
    };

    scrollContainer.addEventListener("scroll", debouncedScroll, {
      passive: true,
    });
    updateArrowVisibility();

    return () => {
      clearTimeout(scrollTimeout);
      scrollContainer.removeEventListener("scroll", debouncedScroll);
    };
  }, [productData.length, currentCardIndex]);

  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => updateArrowVisibility(), 100);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollToPage = (pageIndex: number) => {
    if (!scrollContainerRef.current) return;
    const scrollContainer = scrollContainerRef.current;
    const totalPages = getTotalPages();
    const maxScrollLeft =
      scrollContainer.scrollWidth - scrollContainer.clientWidth;
    const scrollPosition =
      totalPages > 1 ? (pageIndex / (totalPages - 1)) * maxScrollLeft : 0;
    scrollContainer.scrollTo({
      left: Math.max(0, scrollPosition),
      behavior: "smooth",
    });
    setCurrentCardIndex(pageIndex);
  };

  const nextCard = () => {
    const totalPages = getTotalPages();
    if (currentCardIndex < totalPages - 1) {
      scrollToPage(currentCardIndex + 1);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      scrollToPage(currentCardIndex - 1);
    }
  };

  const getGradientForIndex = (index: number) => {
    const gradients = [
      "from-purple-300/70 via-blue-300/60 to-pink-200/50",
      "from-blue-200/70 via-indigo-200/60 to-sky-200/60",
      "from-slate-200/80 via-blue-200/70 to-purple-200/60",
      "from-indigo-200/70 via-sky-200/60 to-purple-200/70",
    ];
    return gradients[index % gradients.length];
  };

  const icons = [
    Server,
    Code,
    GitBranch,
    Zap,
    Cloud,
    Database,
    StarIcon,
    Puzzle,
    LineChart,
  ];
  const getRandomIcon = () => {
    return icons[Math.floor(Math.random() * icons.length)];
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/index.php?getHomepageProducts`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );
        const data = await response.json();
        if (data.status === 1 && data.data) {
          const mappedProducts = data.data.map((item: any, index: number) => {
            const firstSubject = item.commaSepSubjects
              ? item.commaSepSubjects.split(",")[0].trim()
              : item.Domain || "Practice";
            return {
              YOE: item.YOE || "N/A",
              Domain: item.Domain || "N/A",
              price: item.price,
              preInterviewId: item.preInterviewId,
              gradient: getGradientForIndex(index),
              icon: getRandomIcon(),
              firstSubject,
              commaSepSubjects: item.commaSepSubjects || "",
            };
          });
          setProductData(mappedProducts);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const testimonialsPerPage = 3;
  const maxIndex = testimonials.length - testimonialsPerPage;
  const visibleTestimonials = testimonials.slice(
    testimonialIndex,
    testimonialIndex + testimonialsPerPage
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "fill-blue-400 text-blue-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const emailSchema = z
    .string()
    .email({ message: "Please enter a valid email address." });

  const phoneNumberSchema = z
    .string()
    .transform((val) => val.trim().replace(/\s+/g, ""))
    .refine((val) => /^(\+?\d{1,3})?\d{10}$/.test(val), {
      message:
        "Please enter a valid phone number (e.g., 6360060622, +916360060622).",
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      alert(emailResult.error.errors[0].message);
      return;
    }
    const phoneResult = phoneNumberSchema.safeParse(mobileNumber);
    if (!phoneResult.success) {
      alert(phoneResult.error.errors[0].message);
      return;
    }

    const mobileNumberValidate = phoneResult.data;
    const emailValidate = emailResult.data;

    setMobileNumber("");
    setEmail("");
    alert("Your request has been submitted. We will get back ASAP.");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?subscriptionPlanEnquiry`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mobileNumber: mobileNumberValidate,
            emailId: emailValidate,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error submitting phone number and email:", error);
      alert(
        "There was an error submitting your request. Please try again later."
      );
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="relative w-full bg-linear-to-r from-[#f7f8f8] to-[#e5ebf5] py-16 overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-linear-to-br from-indigo-200/40 via-purple-200/30 to-sky-200/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-linear-to-tr from-sky-200/35 via-blue-200/25 to-violet-200/15 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-[1.3fr_minmax(0,1fr)] items-start">
          <div className="flex flex-col gap-8">
            <div className="space-y-4 text-left">
              {/* <button className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/70 backdrop-blur-md px-4 py-2 text-xs font-semibold text-indigo-700 shadow-sm">
                <Sparkle size={14} className="text-indigo-500" />
                AI-Coach trained by FAANG & top-company professionals
              </button> */}

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
                Think like a high-performing {" "}
                <span className="bg-linear-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  Software Developer.
                </span>
              </h1><br />
              <span className="text-base sm:text-lg lg:text-xl tracking-normal text-gray-700">
                Strengthen your critical thinking & problem-solving abilities with an AI-Coach trained by industry experts. 
                {/* {" "}<span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                </span> */}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xl">
              <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-lg px-2 py-4 sm:px-4 sm:py-3 text-center shadow-lg shadow-indigo-100/50">
                <div className="text-lg sm:text-2xl font-bold bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent leading-tight">
                  300+
                </div>
                <div className="text-sm sm:text-base text-gray-600 mt-1 leading-tight">Experts Insights</div>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-lg px-2 py-4 sm:px-4 sm:py-3 text-center shadow-lg shadow-indigo-100/50">
                <div className="text-lg sm:text-2xl font-bold bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent leading-tight">
                  5,000+
                </div>
                <div className="text-sm sm:text-base text-gray-600 mt-1 leading-tight">Learners</div>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-lg px-2 py-4 sm:px-4 sm:py-3 text-center shadow-lg shadow-indigo-100/50">
                <div className="text-lg sm:text-2xl font-bold bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent leading-tight">
                  50,500+
                </div>
                <div className="text-sm sm:text-base text-gray-600 mt-1 leading-tight">Training Hours</div>
              </div>
            </div>
          </div>

          <div
            ref={trialFormRef}
            id="trialSelection"
            className="w-full max-w-md scroll-mt-24 lg:ml-auto mx-auto lg:mx-0 lg:justify-self-end"
          >
            <TrialSelectionForm />
          </div>
        </div>
      </section>

      {/* Why Thinking Skills Matter */}
      <section className="bg-[#F8FAFC] py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-linear-to-br from-indigo-50 via-white to-sky-50 border border-indigo-100 p-6 rounded-3xl shadow-sm">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
              Why Thinking Skills Matter
            </h2>
            <p className="text-gray-700 text-[15px] leading-relaxed mb-3 text-justify">
              In the AI-driven workplace, success depends less on the tools you know and more on how you think while solving real problems. Strong thinking skills directly impact your job performance and career growth. It helps:
            </p>
            <ul className="space-y-2 text-[15px] text-gray-700 mb-6 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Solve complex problems quickly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Reduce rework and debugging effort</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Make better technical and design decisions</span>
              </li>
            </ul>
            <div className="mt-6">
              <p className="text-base font-semibold text-indigo-800 mb-3">
                What research shows:
              </p>
              <ul className="space-y-2 text-[15px] text-gray-700 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    <a
                      onClick={() => {
                      logActivity(
                          "NTUC_REPORT_VIEWED",
                          "User viewed the NTUC LearningHub Report"
                        );
                      }}
                      href="https://tempgoprac.s3.ap-south-1.amazonaws.com/images/Special_Report_2024__Thinking_Skills.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-600"
                    >
                      NTUC - LearningHub Report
                    </a>{" "}
                    : Thinking Skills strongly influence workplace productivity
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    <a
                      onClick={() => {
                      logActivity(
                          "LINKEDIN_REPORT_VIEWED",
                          "User viewed the LinkedIn Report"
                        );
                      }}
                      href="https://learning.linkedin.com/resources/workplace-learning-report"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-600"
                    >
                      LinkedIn - Workplace Learning Report
                    </a>{" "}
                    : Analytical and problem-solving skills are the most essential globally
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    <a
                      onClick={() => {
                      logActivity(
                          "MCKINSEY_REPORT_VIEWED",
                          "User viewed the McKinsey Report"
                        );
                      }}
                      href="https://www.mckinsey.com/featured-insights/future-of-work/skill-shift-automation-and-the-future-of-the-workforce"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-600"
                    >
                      McKinsey - Skill Shift Report
                    </a>{" "}
                    : Demand for advanced cognitive skills will rise significantly by 2030
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The Gap in Traditional Skill Training */}
      <section className="bg-linear-to-br from-[#f7f8f8] to-[#e5ebf5] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            The Gap in Traditional Skill Training
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Card 1: Knowledge Over Thinking */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-indigo-100 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
                Knowledge Over Thinking
              </h3>
              <p className="text-[15px] text-gray-700 text-center leading-relaxed">
                Workshops, classes, and videos focus on transferring knowledge rather than building thinking capability.
              </p>
            </div>

            {/* Card 2: Shallow Assessment */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-indigo-100 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-linear-to-br from-sky-50 to-blue-50 p-4 rounded-2xl">
                  <NotebookPen className="w-8 h-8 text-sky-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
                Shallow Assessment Tools
              </h3>
              <p className="text-[15px] text-gray-700 text-center leading-relaxed">
                Objective tests and coding platforms evaluate outcomes—not how candidates reason and make decisions while solving problems.
              </p>
            </div>

            {/* Card 3: Lack of Role Models */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-indigo-100 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-linear-to-br from-indigo-50 to-purple-50 p-4 rounded-2xl">
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
                Lack of Role Models
              </h3>
              <p className="text-[15px] text-gray-700 text-center leading-relaxed">
                Most organizations and colleges lack visible experts with strong thinking skills, making it hard for teams to learn by example.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 bg-white/70 rounded-full px-5 py-2.5 w-fit mx-auto border border-indigo-200 shadow-sm">
            <span className="text-[15px] font-semibold text-gray-800">GoPrac's AI Coach is built to solve this gap—at scale.</span>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-linear-to-br from-indigo-50 via-white to-sky-50 border border-indigo-100 p-6 rounded-3xl shadow-sm">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">How Our AI-Coach Helps</h2>
            
            <p className="text-gray-800 text-[15px] leading-relaxed mb-5 text-left max-w-4xl mx-auto">
              Learners discuss and solve real-world problems dynamically generated based on their role and productivity metrics with our AI Coach, trained by 300+ FAANG and top industry experts. <br />
              The AI Coach evaluates how they think—not just what they answer and delivers personalized feedback to build core thinking skills, including:
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5 max-w-4xl mx-auto">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">Problem-Solving</span> — identify true root causes
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">Critical Thinking</span> — question assumptions and trade-offs
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">Analytical Thinking</span> — compare options and spot patterns
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">Logical Thinking</span> — structure reasoning step-by-step
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">Systems Thinking</span> — understand component interactions
                </div>
              </div>
            </div>

            <div className="text-center mb-5">
              <a
                href="https://tempgoprac.s3.ap-south-1.amazonaws.com/images/SamplePersonlizedFeedback.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button 
                  onClick={() => {
                    logActivity(
                      "FEEDBACK_REPORT_VIEWED",
                      "User clicked the sample personalized feedback button"
                    );
                  }}
                  className="group inline-flex items-center gap-2 rounded-full bg-linear-to-r from-sky-400 via-blue-500 to-indigo-600 px-5 py-2 text-xs font-semibold cursor-pointer text-white shadow-sm hover:from-sky-500 hover:via-blue-600 hover:to-indigo-700 hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
                  View Sample Personalized Feedback
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </button>
              </a>
            </div>

            <div className="max-w-4xl mx-auto">
              <h4 className="text-lg font-bold text-indigo-800 mb-4 text-center">
                Learner Outcomes
              </h4>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200">
                  <div className="flex items-center justify-center mb-2">
                    <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-2 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-700 leading-tight font-medium">30–40% reduction in rework</p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-sky-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all duration-200">
                  <div className="flex items-center justify-center mb-2">
                    <div className="bg-linear-to-br from-sky-50 to-blue-50 p-2 rounded-lg">
                      <Zap className="w-5 h-5 text-sky-600" />
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-700 leading-tight font-medium">2× faster problem-solving</p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200">
                  <div className="flex items-center justify-center mb-2">
                    <div className="bg-linear-to-br from-indigo-50 to-purple-50 p-2 rounded-lg">
                      <Target className="w-5 h-5 text-indigo-600" />
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-700 leading-tight font-medium">Earlier independent contribution at work</p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200">
                  <div className="flex items-center justify-center mb-2">
                    <div className="bg-linear-to-br from-purple-50 to-indigo-50 p-2 rounded-lg">
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-700 leading-tight font-medium">Stronger manager & peer feedback</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 bg-white/70 rounded-full px-5 py-2.5 w-fit mx-auto border border-indigo-200 shadow-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-indigo-500 text-indigo-500" />
                  <Star className="w-4 h-4 fill-indigo-500 text-indigo-500" />
                  <Star className="w-4 h-4 fill-indigo-500 text-indigo-500" />
                  <Star className="w-4 h-4 fill-indigo-500 text-indigo-500" />
                  <div className="relative w-4 h-4">
                    <Star className="w-4 h-4 text-gray-300 absolute top-0 left-0" />
                    <div className="overflow-hidden absolute top-0 left-0" style={{ width: '70%' }}>
                      <Star className="w-4 h-4 fill-indigo-500 text-indigo-500" />
                    </div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-800">Rated 4.7 / 5 by learners</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Programs */}
      <section className="bg-[#F8FAFC] py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Our Programs</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Program 1: Internship Performance Accelerator */}
            <div className="bg-linear-to-br from-indigo-50 via-white to-sky-50 border border-indigo-100 p-6 rounded-3xl shadow-sm">
              <h3 className="text-xl font-bold text-indigo-900 mb-1">
                Program 1: Internship Performance Accelerator
              </h3>
              <p className="text-xs text-gray-600 mb-4 italic">
                For students & software interns (0–1 year experience)
              </p>
              <p className="text-gray-800 text-sm leading-relaxed mb-4">
                A customized program to practice thinking skills on real internship job descriptions to improve on-the-job performance and increase chances of internship-to-offer conversion. It includes:
              </p>

              <ul className="space-y-1.5 text-sm text-gray-700 mb-5">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>24 industry-aligned business case studies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>4 hours of AI-led problem discussions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>6 hours of personalized feedback</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Industry benchmarking report</span>
                </li>
              </ul>

              <div className="bg-white/60 rounded-2xl p-4">
                <h4 className="text-lg font-bold text-indigo-800 mb-2">Program Details</h4>
                <div className="space-y-1 text-sm text-gray-700 text-left">
                  <p><span className="font-extrabold">Price:</span> <span className="font-extrabold text-base">₹4,350</span></p>
                  <p><span className="font-semibold">Skills Developed:</span> Thinking skills & Confidence</p>
                </div>
              </div>
            </div>

            {/* Program 2: Career Performance Accelerator */}
            <div className="bg-linear-to-br from-indigo-50 via-white to-sky-50 border border-indigo-100 p-6 rounded-3xl shadow-sm">
              <h3 className="text-xl font-bold text-indigo-900 mb-1">
                Program 2: Career Performance Accelerator
              </h3>
              <p className="text-xs text-gray-600 mb-4 italic">
                For experienced software developers (1-5 years)
              </p>
              <p className="text-gray-800 text-sm leading-relaxed mb-4">
                A customized program to practice thinking skills aligned to your current and next-level role, helping you improve job performance and accelerate career growth. It includes:
              </p>

              <ul className="space-y-1.5 text-sm text-gray-700 mb-5">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>35 advanced industry business case studies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>6 hours of AI-led problem discussions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>8 hours of personalized feedback PDF</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Industry benchmarking report</span>
                </li>
              </ul>

              <div className="bg-white/60 rounded-2xl p-4">
                <h4 className="text-lg font-bold text-indigo-800 mb-2">Program Details</h4>
                <div className="space-y-1 text-sm text-gray-700 text-left">
                  <p><span className="font-extrabold">Price:</span> <span className="font-extrabold text-base">₹6,300</span></p>
                  <p><span className="font-semibold">Skills Developed:</span> Thinking skills, Confidence</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <button
              onClick={() => {
                        logActivity(
                          "FREE_TRIAL",
                          "User clicked the Start with a Free Thinking-Skills Test button"
                        );

                        const el = document.getElementById("trialSelection");
                        if (!el) return;

                        const rect = el.getBoundingClientRect();
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                        const offset = 96; 

                        window.scrollTo({
                          top: rect.top + scrollTop - offset,
                          behavior: "smooth",
                        });
                      }}
              className="group inline-flex items-center gap-2 rounded-full bg-linear-to-r from-blue-600 via-indigo-500 to-purple-500 px-7 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <span>Start with a free thinking skills test</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Compact Proven Success */}
      {/* <section className="bg-gradient-to-br from-[#edf2ff] via-[#f5f7ff] to-[#f7f8f8] py-10 px-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Proven Success</h3>
            <p className="text-gray-600 text-lg leading-relaxed max-w-4xl mx-auto">
              8–10 hours of practice doubles Thinking Skill scores
            </p>
          </div>
        
          <div className="mt-8">
            <Analytics />
          </div>
        </div>
      </section> */}

      {/* Why GoPrac Works */}
      {/* <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why GoPrac Works
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12 w-full max-w-6xl mx-auto">
            <div className="group w-full max-w-[320px] mx-auto bg-white rounded-2xl shadow-md p-6 text-left hover:shadow-xl transition-shadow duration-300 flex flex-col min-h-[220px]">
              <button className="bg-gradient-to-r from-[#357cee] to-[#5A8DEE] p-2 rounded-md inline-block mb-4 group-hover:scale-110 transition-transform duration-300 w-fit">
                <Target color="#ffffff" size={20} />
              </button>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Customized Practice
              </h3>
              <p className="text-sm text-gray-600">
                Practice tailored to your role and real industry scenarios.
              </p>
            </div>

            <div className="group w-full max-w-[320px] mx-auto bg-white rounded-2xl shadow-md p-6 text-left hover:shadow-xl transition-shadow duration-300 flex flex-col min-h-[220px]">
              <button className="bg-gradient-to-r from-[#70E0B7] to-[#38B2A5] p-2 rounded-md inline-block mb-4 group-hover:scale-110 transition-transform duration-300 w-fit">
                <Sparkle color="#ffffff" size={20} />
              </button>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Thinking-Focused Pedagogy
              </h3>
              <p className="text-sm text-gray-600">
                Improves how you think, with feedback on your reasoning—not just your answers.
              </p>
            </div>

            <div className="group w-full max-w-[320px] mx-auto bg-white rounded-2xl shadow-md p-6 text-left hover:shadow-xl transition-shadow duration-300 flex flex-col min-h-[220px]">
              <button className="bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] p-2 rounded-md inline-block mb-4 group-hover:scale-110 transition-transform duration-300 w-fit">
                <Award color="#ffffff" size={20} />
              </button>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Credible Feedback
              </h3>
              <p className="text-sm text-gray-600">
                Built on insights from 300+ FAANG and top industry professionals.
              </p>
            </div>
          </div>
        </div>
      </section> */}



      {/* Testimonials */}
      <section className="bg-linear-to-br from-[#f7f8f8] to-[#e5ebf5] py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Testimonials
            </h2>
          </div>
          <div className="flex items-center justify-between gap-4">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-sm text-gray-700 shadow-sm disabled:opacity-40"
              onClick={() => setTestimonialIndex((i) => Math.max(0, i - 1))}
              disabled={testimonialIndex === 0}
            >
              ←
            </button>
            <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
              {visibleTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="flex flex-col justify-between rounded-3xl border border-white/80 bg-white/80 backdrop-blur-lg p-6 shadow-xl shadow-slate-200/60"
                >
                  <div>
                    <div className="mb-3 flex space-x-1">
                      {renderStars(testimonial.rating)}
                    </div>
                    <blockquote className="text-sm text-gray-700 italic leading-relaxed mb-4">
                      "{testimonial.text}"
                    </blockquote>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 rounded-full">
                      <AvatarImage
                        src={`/images/testimonials/${testimonial.dp}`}
                      />
                      <AvatarFallback>{testimonial.initials}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <a
                        href={testimonial.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-[#0A66C2] hover:underline"
                      >
                        {testimonial.name}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-sm text-gray-700 shadow-sm disabled:opacity-40"
              onClick={() =>
                setTestimonialIndex((i) => Math.min(maxIndex, i + 1))
              }
              disabled={testimonialIndex >= maxIndex}
            >
              →
            </button>
          </div>
        </div>
      </section>

      <FloatDemo 
        targetRef={trialFormRef}
        icon={<Sparkle size={24} />}
        label="Start Free Test"
        bgColor="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600"
      />
    </>
  );
};

export default Homepage;
