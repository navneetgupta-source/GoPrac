'use client'
import Hero from './_components/Hero'
import Customers from './_components/Customers'
import ConversionChart from './_components/ConversionChart'
import FloatDemo from '@/components/FloatDemo'
import { logActivity } from '@/lib/activityLogger'

import { Search, Filter, Zap, Globe, TrendingUp, Shield, Sparkle, Target, Award, Send, Puzzle, LineChart, Star, Users, NotebookPen, BookOpen, CheckCircle2 } from 'lucide-react';
import { useRef } from 'react';

const FEATURES = [
  {
    icon: Filter,
    title: 'Upload JD & Applicant List',
    description: 'AI automatically generates tailored interview questions, sends invites, and manages follow-ups end-to-end.',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    icon: Zap ,
    title: 'Automated Interviews',
    description: 'AI-Coach conducts personalized video interviews for every applicant to evaluate Thinking Skills objectively.',
    color: 'from-indigo-500 to-blue-600'
  },
  {
    icon: TrendingUp,
    title: 'Get shortlisted Talent',
    description: 'Receive a ranked list of top candidates with individual scorecards and performance insights',
    color: 'from-orange-500 to-red-600'
  }
];

const KEY_HIGHLIGHTS = [
  {
    icon: Globe,
    title: 'Massive Reach',
    description: 'Access a large, relevant talent pool with a high number of interested candidates across India',
    stat: '6 Lac+',
    label: 'Job Seekers'
  },
  {
    icon: TrendingUp,
    title: 'Saves Time',
    description: 'AI-driven screening, focused on thinking skills assessment, delivers a higher shortlist-to-hire ratio.',
    stat: '80%',
    label: 'Conversion Rate'
  },
  {
    icon: Shield,
    title: 'No Fake Candidates',
    description: 'Proctored AI video interviews ensure only genuine and verified applicants.',
    stat: '100%',
    label: 'Verified Profiles'
  }
];

const HIRING_PARTNERS = [
  'Google Operations Center', 'Digit Insurance', 'Sartorius', 
  'Phicommerce', 'Hyreo', 'Standard Chartered'
];

export default function Home() {
  const contactRef = useRef<HTMLDivElement>(null);

  return (
    <div className='bg-white'>
      <Hero contactRef={contactRef} />
      
      <section className="bg-[#F8FAFC] py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-linear-to-br from-indigo-50 via-white to-sky-50 border border-indigo-100 p-6 rounded-3xl shadow-sm">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
              Why Thinking Skills Matter
            </h2>
            <p className="text-gray-700 text-[15px] leading-relaxed mb-3 text-justify">
              In the AI-driven workplace, team success depends less on the tools people know and more on how they think while solving real problems. Strong thinking skills directly impact productivity and delivery outcomes. They help teams:
            </p>
            <ul className="space-y-2 text-[15px] text-gray-700 mb-6 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Solve complex problems faster</span>
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
                    : Analytical and problem-solving skills are the most essential skills globally
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

      {/* How GoPrac Works */}
      <section className="bg-linear-to-br from-[#f7f8f8] to-[#e5ebf5] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 sm:mb-10 text-center">
            How GoPrac Works
          </h2>

          <div className="relative">
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-linear-to-b from-blue-300 via-indigo-300 to-purple-300 transform -translate-x-1/2"></div>

            <div className="space-y-8">
              <div className="relative">
                <div className="lg:flex lg:items-center">
                  <div className="lg:w-1/2 lg:pr-12 mb-4 lg:mb-0 lg:text-right">
                    <div className="bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                      <h3 className="text-base sm:text-lg font-bold text-indigo-900 mb-3">
                        Practice Role-Specific problems
                      </h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Learners discuss and solve real-world problems dynamically generated based on their role and productivity metrics with our AI Coach, trained by 300+ FAANG and top industry experts.
                      </p>
                    </div>
                  </div>
                  
                  <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:block">
                    <div className="bg-linear-to-br from-blue-500 to-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg border-4 border-white">
                      1
                    </div>
                  </div>
                  
                  <div className="lg:w-1/2 lg:pl-12"></div>
                </div>
              </div>

              <div className="relative">
                <div className="lg:flex lg:items-start">
                  <div className="lg:w-1/2 lg:pr-12"></div>
                  
                  <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:block">
                    <div className="bg-linear-to-br from-sky-500 to-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg border-4 border-white">
                      2
                    </div>
                  </div>
                  
                  <div className="lg:w-1/2 lg:pl-12">
                    <div className="bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                      <h3 className="text-base sm:text-lg font-bold text-indigo-900 mb-3">
                        Thinking-Focused AI coaching
                      </h3>
                      <p className="text-sm text-gray-700 leading-relaxed mb-4">
                        The AI Coach evaluates how they think—not just what they answer—and delivers personalized feedback to build core thinking skills, including:
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                          <div className="text-xs text-gray-700">
                            <span className="font-semibold">Problem-Solving</span> — identify true root causes
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                          <div className="text-xs text-gray-700">
                            <span className="font-semibold">Critical Thinking</span> — question assumptions and evaluate trade-offs
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                          <div className="text-xs text-gray-700">
                            <span className="font-semibold">Analytical Thinking</span> — compare options and spot patterns
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                          <div className="text-xs text-gray-700">
                            <span className="font-semibold">Logical Thinking</span> — structure reasoning step by step
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                          <div className="text-xs text-gray-700">
                            <span className="font-semibold">Systems Thinking</span> — understand interactions across components
                          </div>
                        </div>
                      </div>

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
                          <span>View sample personalized feedback</span>
                          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                        </button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="lg:flex lg:items-center">
                  <div className="lg:w-1/2 lg:pr-12 mb-4 lg:mb-0">
                    <div className="bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                      <h3 className="text-base sm:text-lg font-bold text-indigo-900 mb-3 lg:text-right">
                        Seamless Integration & Scalable delivery
                      </h3>
                      <p className="text-sm text-gray-700 leading-relaxed mb-3 lg:text-right">
                        GoPrac fits effortlessly into existing L&D programs:
                      </p>
                      
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold mt-0.5 shrink-0 lg:order-2">•</span>
                          <span className="lg:text-right lg:flex-1 lg:order-1">Quick pilot setup for teams</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold mt-0.5 shrink-0 lg:order-2">•</span>
                          <span className="lg:text-right lg:flex-1 lg:order-1">Learner-driven practice with minimal manager involvement</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold mt-0.5 shrink-0 lg:order-2">•</span>
                          <span className="lg:text-right lg:flex-1 lg:order-1">Scales across roles, teams, and experience levels</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:block">
                    <div className="bg-linear-to-br from-indigo-500 to-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg border-4 border-white">
                      3
                    </div>
                  </div>
                  
                  <div className="lg:w-1/2 lg:pl-12"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Impact */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-linear-to-br from-indigo-50 via-white to-sky-50 border border-indigo-100 p-6 rounded-3xl shadow-sm">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Business Impact</h2>
            
            <p className="text-gray-800 text-[15px] leading-relaxed mb-5 text-center">
              Organizations using GoPrac see:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-2 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-center text-sm text-gray-700 leading-tight font-medium">30–40% reduction in rework and defects</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-sky-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all duration-200">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-linear-to-br from-sky-50 to-blue-50 p-2 rounded-lg">
                    <Zap className="w-5 h-5 text-sky-600" />
                  </div>
                </div>
                <p className="text-center text-sm text-gray-700 leading-tight font-medium">2× faster problem resolution</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-linear-to-br from-indigo-50 to-purple-50 p-2 rounded-lg">
                    <Target className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                <p className="text-center text-sm text-gray-700 leading-tight font-medium">Improved code review and design discussions</p>
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
      </section>

      {/* How organizations use GoPrac */}
      <section className="bg-[#F8FAFC] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 sm:mb-10 text-center">
            How organizations use GoPrac
          </h2>

          <div className="mb-10">
            <h3 className="text-2xl sm:text-[26px] font-bold text-indigo-900 mb-5 text-center">
              Corporate use cases
            </h3>
            <div className="flex flex-col items-center md:grid md:grid-cols-3 gap-4 sm:gap-6">
              <div className="w-full max-w-xs md:max-w-none bg-linear-to-br from-indigo-50 via-white to-sky-50 border border-indigo-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-3 rounded-2xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-[15px] text-gray-700 text-center leading-relaxed font-medium grow">
                  New-hire readiness and faster early productivity
                </p>
              </div>

              <div className="w-full max-w-xs md:max-w-none bg-linear-to-br from-indigo-50 via-white to-sky-50 border border-indigo-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-linear-to-br from-sky-50 to-blue-50 p-3 rounded-2xl">
                    <TrendingUp className="w-6 h-6 text-sky-600" />
                  </div>
                </div>
                <p className="text-[15px] text-gray-700 text-center leading-relaxed font-medium grow">
                  Improving productivity in underperforming teams
                </p>
              </div>

              <div className="w-full max-w-xs md:max-w-none bg-linear-to-br from-indigo-50 via-white to-sky-50 border border-indigo-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-linear-to-br from-indigo-50 to-purple-50 p-3 rounded-2xl">
                    <Target className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <p className="text-[15px] text-gray-700 text-center leading-relaxed font-medium grow">
                  Evaluating thinking skills during hiring (for better role-fit)
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl sm:text-[26px] font-bold text-indigo-900 mb-5 text-center">
              Our Upskilling Programs
            </h3>
            <div className="flex flex-col items-center md:grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              
              <div className="w-full max-w-md md:max-w-none bg-linear-to-br from-indigo-50 via-white to-sky-50 border border-indigo-100 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col h-full">
                <h4 className="text-xl font-bold text-indigo-900 mb-4">
                1. Internship Performance Accelerator
                </h4>
                <p className="text-[15px] text-gray-700 leading-relaxed grow">
                  Helps interns and early-career software developers <b>(0–1 years experience)</b> become productive faster and reduce onboarding time.
                </p>
              </div>

              <div className="w-full max-w-md md:max-w-none bg-linear-to-br from-indigo-50 via-white to-sky-50 border border-indigo-100 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col h-full">
                <h4 className="text-xl font-bold text-indigo-900 mb-4">
                2. Career Performance Accelerator
                </h4>
                <p className="text-[15px] text-gray-700 leading-relaxed grow">
                  Strengthens thinking skills of experienced software developers <b>(1–5 years)</b> to improve delivery quality and readiness for next-level roles.
                </p>
              </div>
            </div>

            <div className="max-w-5xl mx-auto mt-6 py-4 pl-8 border-l-4 border-indigo-200">
              <p className="text-[15px] text-gray-700 leading-relaxed text-left">
                <span className="text-base font-bold text-indigo-800">Beyond Learning: Hiring for Thinking Skills</span> — Strong thinking skills matter not only for performance—but also for identifying the right talent early. Alongside learning and development, GoPrac offers AI Interview as a Service to help teams evaluate how candidates think, not just what they know. Used by 50+ organizations, it complements GoPrac's learning program by enabling teams to hire for thinking and then continuously develop it on the job.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started */}
      <section className="bg-white py-12 sm:py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-linear-to-br from-indigo-50 via-white to-sky-50 border border-indigo-100 p-6 sm:p-8 rounded-3xl shadow-sm">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
                Get Started
              </h2>
              <p className="text-[15px] sm:text-base text-gray-700 leading-relaxed">
                We work with your L&D or engineering team to:
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-start justify-center gap-4 md:gap-6 mb-8 max-w-4xl mx-auto">
              <div className="flex items-start gap-3 flex-1">
                <div className="shrink-0">
                  <div className="bg-linear-to-br from-blue-500 to-indigo-600 w-3 h-3 rounded-full mt-1.5"></div>
                </div>
                <p className="text-[15px] text-gray-700 leading-relaxed">
                  Understand your roles, experience levels, and learning goals
                </p>
              </div>
              
              <div className="hidden md:flex items-start text-indigo-300 text-xl shrink-0 pt-1">→</div>
              
              <div className="flex items-start gap-3 flex-1">
                <div className="shrink-0">
                  <div className="bg-linear-to-br from-sky-500 to-blue-600 w-3 h-3 rounded-full mt-1.5"></div>
                </div>
                <p className="text-[15px] text-gray-700 leading-relaxed">
                  Recommend a pilot rollout on small group of team
                </p>
              </div>
              
              <div className="hidden md:flex items-start text-indigo-300 text-xl shrink-0 pt-1">→</div>
              
              <div className="flex items-start gap-3 flex-1">
                <div className="shrink-0">
                  <div className="bg-linear-to-br from-indigo-500 to-purple-600 w-3 h-3 rounded-full mt-1.5"></div>
                </div>
                <p className="text-[15px] text-gray-700 leading-relaxed">
                  Align outcomes with productivity metrics
                </p>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  logActivity(
                    "REQUEST_DEMO_CLICKED",
                    "User clicked the Request a Demo button"
                  );

                  if (contactRef.current) {
                    const rect = contactRef.current.getBoundingClientRect();
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const offset = 96;
                    window.scrollTo({
                      top: rect.top + scrollTop - offset,
                      behavior: "smooth",
                    });
                  }
                }}
                className="group inline-flex items-center gap-2 rounded-full bg-linear-to-r from-blue-600 via-indigo-500 to-purple-500 px-8 py-3 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:scale-105 transition-all duration-200 cursor-pointer"
              >
                <span>Request a Demo</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* <Customers /> */}
      
      {/* CTA Button */}
      {/* <section className="bg-gradient-to-r from-[#f7f8f8] to-[#e5ebf5] py-8">
        <div className="text-center px-4">
          <button
            className="group relative inline-flex items-center gap-2 cursor-pointer rounded-full px-7 py-2.5 text-white font-semibold text-sm bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 shadow-lg hover:shadow-xl ring-1 ring-white/10 transform hover:-translate-y-0.5 hover:scale-105 transition-all duration-200"
            onClick={() => {
              if (contactRef.current) {
                const rect = contactRef.current.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const offset = 96;
                window.scrollTo({
                  top: rect.top + scrollTop - offset,
                  behavior: "smooth",
                });
              }
            }}
          >
            <span className="relative z-10">
              Request a Demo
            </span>
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              →
            </span>
          </button>
        </div>
      </section> */}

      <FloatDemo 
        targetRef={contactRef}
        icon={<Send size={24} />}
        label="Book Demo"
        bgColor="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600"
      />
    </div>
  )
}
