"use client"

import { useState } from "react"
import { Button } from "components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"

interface JobApplication {
  id: string
  title: string
  company: string
  status: "Open" | "Closed"
  aiStatus: string
  recruitmentStatus: string
  feedback: string
  canUnlock: boolean
  date?: string
}

export function JobApplicationsTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const jobApplications: JobApplication[] = [
    {
      id: "1",
      title: "Full Stack Developer – Internship",
      company: "Pixel Techno Marketing",
      status: "Open",
      aiStatus: "Missed Scheduled",
      recruitmentStatus: "Profile Match",
      feedback:
        "The corporate team is shortlisting candidates for further rounds of interviews and if you are shortlisted we will notify you within the next 72 hours",
      canUnlock: false,
    },
    {
      id: "2",
      title: "Product Specialist - IT Security",
      company: "Archon Consulting Systems Pvt Ltd.",
      status: "Open",
      aiStatus: "Assessment Completed",
      recruitmentStatus: "Profile Match",
      feedback:
        "The corporate team is shortlisting candidates for further rounds of interviews and if you are shortlisted we will notify you within the next 72 hours",
      canUnlock: true,
      date: "27 Feb 2025 09:09:36 PM",
    },
    {
      id: "3",
      title: "Java Full Stack Developer - Fidelis Technology Services Pvt. Ltd",
      company: "Fidelis Technology Services Pvt Ltd",
      status: "Closed",
      aiStatus: "Not Applicable",
      recruitmentStatus: "Profile Mismatch",
      feedback:
        "Sorry ! We can not process your application due to low Profile Match with the Job Description. We will notify you as soon as a new job relevant to your profile is posted on the platform.",
      canUnlock: false,
    },
    {
      id: "4",
      title: "Senior Software Engineer - GyanSys",
      company: "GyanSys",
      status: "Closed",
      aiStatus: "Not Applicable",
      recruitmentStatus: "Profile Mismatch",
      feedback:
        "Sorry ! We can not process your application due to low Profile Match with the Job Description. We will notify you as soon as a new job relevant to your profile is posted on the platform.",
      canUnlock: false,
    },
    {
      id: "5",
      title: "Fullstack Developer Java/Kafka-HP - Ascendion",
      company: "Ascendion",
      status: "Closed",
      aiStatus: "Not Applicable",
      recruitmentStatus: "Profile Mismatch",
      feedback:
        "Sorry ! We can not process your application due to low Profile Match with the Job Description. We will notify you as soon as a new job relevant to your profile is posted on the platform.",
      canUnlock: false,
    },
    {
      id: "6",
      title: "SAP BODS Developer - EY India",
      company: "EY India",
      status: "Closed",
      aiStatus: "Not Applicable",
      recruitmentStatus: "Profile Mismatch",
      feedback:
        "Sorry ! We can not process your application due to low Profile Match with the Job Description. We will notify you as soon as a new job relevant to your profile is posted on the platform.",
      canUnlock: false,
    },
    {
      id: "7",
      title: "Data Modeler - Ascendion",
      company: "Ascendion",
      status: "Closed",
      aiStatus: "Not Applicable",
      recruitmentStatus: "Profile Mismatch",
      feedback:
        "Sorry ! We can not process your application due to low Profile Match with the Job Description. We will notify you as soon as a new job relevant to your profile is posted on the platform.",
      canUnlock: false,
    },
    {
      id: "8",
      title: "HOD Pharmacy Business Head - myMD Healthcare Private Limited",
      company: "myMD Healthcare",
      status: "Closed",
      aiStatus: "Assessment Completed",
      recruitmentStatus: "Profile Mismatch",
      feedback:
        "Sorry ! We can not process your application due to low Profile Match with the Job Description. We will notify you as soon as a new job relevant to your profile is posted on the platform.",
      canUnlock: true,
    },
  ]

  const filteredJobs = jobApplications.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div>
      <div className="bg-white p-4 sticky top-0 z-10 border-b">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Applied Jobs</h2>
          <div className="flex gap-2">
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
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-medium text-slate-500">
              <th className="whitespace-nowrap px-4 py-3">Job Details</th>
              <th className="whitespace-nowrap px-4 py-3">Job Status</th>
              <th className="whitespace-nowrap px-4 py-3">Hiring Company</th>
              <th className="whitespace-nowrap px-4 py-3">AI Screening Status</th>
              <th className="whitespace-nowrap px-4 py-3">Recruitment Status</th>
              <th className="whitespace-nowrap px-4 py-3">Next Step</th>
              <th className="whitespace-nowrap px-4 py-3">Personalized Feedback</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                  No job applications found matching your search.
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => (
                <tr
                  key={job.id}
                  className={`group transition-colors hover:bg-slate-50 ${expandedRows[job.id] ? "bg-slate-50" : ""}`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => toggleRow(job.id)}
                        className="mt-1 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                      >
                        {expandedRows[job.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      <div>
                        <div className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
                          {job.title}
                        </div>
                        {job.date && <div className="mt-1 text-xs text-slate-500">{job.date}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      variant="outline"
                      className={`${
                        job.status === "Open"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                    >
                      {job.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700">{job.company}</td>
                  <td className="px-4 py-4">
                    <Badge
                      variant="outline"
                      className={`${
                        job.aiStatus === "Not Applicable"
                          ? "border-slate-200 bg-slate-50 text-slate-700"
                          : job.aiStatus === "Assessment Completed"
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      {job.aiStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      variant="outline"
                      className={`${
                        job.recruitmentStatus === "Profile Match"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      {job.recruitmentStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    {job.canUnlock && (
                      <Button
                        size="sm"
                        className="cursor-pointer bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      >
                        Pay to Unlock
                      </Button>
                    )}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-4 text-xs text-slate-500">{job.feedback}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
