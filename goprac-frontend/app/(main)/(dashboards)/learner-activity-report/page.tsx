"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import "handsontable/dist/handsontable.full.min.css";
// import Chart from "chart.js/auto";
// import annotationPlugin from "chartjs-plugin-annotation";
import { ChartBar, Filter, Table, TrendingUp } from "lucide-react";
// import { MultiSelect } from "@/components/multi-select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
// import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useUserStore } from "@/stores/userStore";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/multi-select";

// Chart.register(annotationPlugin);

const ALL_COMPETENCY_OPTION = { id: "0", name: "All Competencies" };

type JobEntry = any;
type Institute = {
  entityType: "institute" | "corporate" | "goprac";
  entityId: string;
  entityName: string;
  inviteCode: string;
  jobs: JobEntry[];
};

type Competency = { id: string; name: string };

const API_HOST = process.env.NEXT_PUBLIC_API_URL;

export default function LearnerActivityReport() {
  const router = useRouter();
  const hasChecked = useRef(false);
  const loggedInUserType = useUserStore((state) => state.userType);
  const pracIsLoggedin = useUserStore((state) => state.pracIsLoggedin);
  const userId = useUserStore((state) => state.userId);

  //   console.log("LAR Page - pracIsLoggedin:", pracIsLoggedin);
  //   console.log("LAR Page - loggedInUserType:", loggedInUserType);

  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [jobsSelectOptions, setJobsSelectOptions] = useState<JobEntry[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [competencyOptions, setCompetencyOptions] = useState<Competency[]>([]);
  const [selectedInstituteKey, setSelectedInstituteKey] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string[]>([]);
  const [selectedCompetencyId, setSelectedCompetencyId] = useState("0");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [interviewLink, setInterviewLink] = useState<string[]>([]);

  // New: Store all and filtered candidates separately
  const [allCandidates, setAllCandidates] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  // const [chartsData, setChartsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<string>("");
  // const chartContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentDate = new Date();
    const sixMonthsBack = new Date();
    sixMonthsBack.setMonth(currentDate.getMonth() - 6);
    setDateFrom(sixMonthsBack.toISOString().split("T")[0]);
    setDateTo(currentDate.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    setIsLoading("Loading filters...");
    fetch(`${API_HOST}/index.php?getlarFilters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId:
          typeof window !== "undefined"
            ? document.cookie.match(/(^| )pracUser=([^;]+)/)?.[2] || null
            : null,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        const allJobs: JobEntry[] = [
          ...(data.colleges || []).map((job: any) => ({
            ...job,
            entityType: "institute",
            competencyIds: job.competencies
              ? job.competencies.split(",").map((id) => id.trim())
              : [],
          })),
          ...(data.corporate || []).map((job: any) => ({
            ...job,
            entityType: "corporate",
            competencyIds: job.competencies
              ? job.competencies.split(",").map((id) => id.trim())
              : [],
          })),
          ...(data.goprac || []).map((job: any) => ({
            ...job,
            entityType: "goprac",
            competencyIds: job.competencies
              ? job.competencies.split(",").map((id) => id.trim())
              : [],
          })),
        ];
        const entityMap = new Map<string, Institute>();
        allJobs.forEach((job) => {
          const entityType = job.entityType;
          const entityId = job.entityId?.toString();
          const entityName = job.entityName;
          const inviteCode = job.inviteCode;
          const key = `${entityType}:${entityId}`;
          if (!entityId) return;
          if (!entityMap.has(key)) {
            entityMap.set(key, {
              entityType,
              entityId,
              entityName,
              inviteCode,
              jobs: [],
            });
          }
          entityMap.get(key)!.jobs.push(job);
        });
        const groupedInstitutes = Array.from(entityMap.values());
        setInstitutes(groupedInstitutes);
        if (groupedInstitutes.length > 0) {
          setSelectedInstituteKey(
            `${groupedInstitutes[0].entityType}:${groupedInstitutes[0].entityId}`
          );
        }
        setCompetencies(data.competencySubject || []);
        setCompetencyOptions([
          ALL_COMPETENCY_OPTION,
          ...(data.competencySubject || []),
        ]);
        setIsLoading("");
      })
      .catch(() => {
        setIsLoading("");
        alert("Error loading filters!");
      });
  }, []);

  useEffect(() => {
    setSelectedJobId([]);
    setSelectedCompetencyId("0");
    // Clear previous data when institute changes
    setAllCandidates([]);
    setCandidates([]);
    setReport(null);
  }, [selectedInstituteKey]);

  // Effect 1: Handle institute selection and auto-select first practice
  useEffect(() => {
    if (!selectedInstituteKey || institutes.length === 0) {
      setJobsSelectOptions([]);
      setSelectedJobId([]);
      return;
    }

    const institute = institutes.find(
      (i) => `${i.entityType}:${i.entityId}` === selectedInstituteKey
    );

    const jobs = institute ? institute.jobs : [];
    setJobsSelectOptions(jobs);

    // Auto-select first practice when institute changes
    if (jobs.length > 0) {
      setSelectedJobId([jobs[0].id]);
    } else {
      setSelectedJobId([]);
    }
  }, [institutes, selectedInstituteKey]);

  // Effect 2: Handle competency filtering based on selected practices
  useEffect(() => {
    if (!selectedInstituteKey || institutes.length === 0) {
      setCompetencyOptions([ALL_COMPETENCY_OPTION]);
      return;
    }

    const institute = institutes.find(
      (i) => `${i.entityType}:${i.entityId}` === selectedInstituteKey
    );

    let filteredCompetencies: Competency[] = [];

    // Only show competencies when practices are selected
    if (Array.isArray(selectedJobId) && selectedJobId.length > 0) {
      const selectedJobs =
        institute?.jobs.filter((j) => selectedJobId.includes(j.id)) || [];
      const allCompetencyIds = selectedJobs.flatMap(
        (j) => j.competencyIds || []
      );

      if (allCompetencyIds.length > 0) {
        const allCompetencyIdStrings = allCompetencyIds.map((id: any) =>
          String(id).trim()
        );

        const matchedCompetencies = competencies.filter((c: any) =>
          allCompetencyIdStrings.includes(String(c.id).trim())
        );

        // Deduplicate by competency ID (keep first occurrence, ignore domain)
        const seenIds = new Set<string>();
        filteredCompetencies = matchedCompetencies.filter((c: any) => {
          const competencyId = String(c.id);
          if (seenIds.has(competencyId)) {
            return false; // Skip - already have this competency
          }
          seenIds.add(competencyId);
          return true; // Keep first occurrence
        });
      }
    }
    // If no practices selected, filteredCompetencies remains empty

    setCompetencyOptions([ALL_COMPETENCY_OPTION, ...filteredCompetencies]);
  }, [institutes, selectedInstituteKey, selectedJobId, competencies]);

  // Filter candidates locally on competency change
  useEffect(() => {
    if (isLoading) return;

    if (selectedCompetencyId === "0") {
      setCandidates(allCandidates);
    } else {
      const selectedComp = competencyOptions.find(
        (c) => c.id === selectedCompetencyId
      )?.name;
      if (!selectedComp) {
        setCandidates(allCandidates);
        return;
      }
      setCandidates(
        allCandidates.filter(
          (candidate) =>
            candidate.competency && candidate.competency.includes(selectedComp)
        )
      );
    }
  }, [selectedCompetencyId, allCandidates, competencyOptions]);

  // useEffect(() => {
  //     if (report || candidates.length > 0) fetchAndRenderCharts();
  // }, [report, candidates]);

  useEffect(() => {
    if (!selectedJobId || selectedJobId.length === 0) {
      setInterviewLink([]);
      return;
    }

    // console.log("selectedJobId", selectedJobId)

    const selectedInstitute = institutes.find(
      (i) => `${i.entityType}:${i.entityId}` === selectedInstituteKey
    );

    // let cParam = "";
    // if (selectedInstitute) {
    //     cParam = selectedInstitute.inviteCode;
    // }
    if (!selectedInstitute) {
      setInterviewLink([]);
      return;
    }
    // Map over the array of jobIds
    // const links = selectedJobId.map(jobId =>
    //     `${window.location.host}/job?p=${jobId}&c=${cParam}`
    // );
    const links = selectedJobId.map((jobId) => {
      // Find the specific job to get its inviteCode
      const job = selectedInstitute.jobs.find((j) => j.id === jobId);
      const cParam = job?.inviteCode || "";

      return `${window.location.origin}/job?p=${jobId}&c=${cParam}`;
    });

    setInterviewLink(links);
  }, [selectedJobId, selectedInstituteKey, institutes]);

  const fetchReportData = async () => {
    setIsLoading("Fetching Report...");
    const [entityType, entityId] = selectedInstituteKey
      ? selectedInstituteKey.split(":")
      : [null, null];

    let inviteCode = "";
    if (selectedInstituteKey) {
      const found = institutes.find(
        (inst) => `${inst.entityType}:${inst.entityId}` === selectedInstituteKey
      );
      inviteCode = found?.inviteCode ?? "";
    }

    // competencyId removed from the payload, local filtering only!
    let url = `${API_HOST}/index.php?getlarData`;
    let userId =
      typeof window !== "undefined"
        ? document.cookie.match(/(^| )pracUser=([^;]+)/)?.[2] || null
        : null;
    let payload: any = {
      userId,
      entityId: entityId,
      collegeId: entityType === "institute" ? entityId : undefined,
      companyId: entityType === "corporate" ? entityId : undefined,
      from: dateFrom,
      to: dateTo,
      preInterviewId: selectedJobId,
      inviteCode: inviteCode,
    };
    Object.keys(payload).forEach(
      (k) =>
        (payload[k] === undefined || payload[k] === "") && delete payload[k]
    );
    let res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    let result = await res.json();
    setReport(result.report);
    setAllCandidates(result.data); // Save full list
    setCandidates(result.data); // Show all initially
    setIsLoading("");
  };

  // const fetchAndRenderCharts = async () => {

  //     if (!chartContainer.current) return;
  //     // chartContainer.current.innerHTML = "";

  //     // console.log("chartContainer",chartContainer.current);

  //     let userId =
  //         typeof window !== "undefined"
  //             ? document.cookie.match(/(^| )pracUser=([^;]+)/)?.[2] || null
  //             : null;
  //     const [entityType, entityId] = selectedInstituteKey ? selectedInstituteKey.split(":") : [null, null];
  //     let competencyId = selectedCompetencyId === "0" ? "" : selectedCompetencyId;

  //     let inviteCode = '';
  //     if (selectedInstituteKey) {
  //         const found = institutes.find(
  //             (inst) => `${inst.entityType}:${inst.entityId}` === selectedInstituteKey
  //         );
  //         inviteCode = found?.inviteCode ?? "";
  //     }

  //     let url = `${API_HOST}/index.php?getlarChartData`;
  //     let payload: any = {
  //         userId,
  //         collegeId: entityType === "institute" ? entityId : undefined,
  //         companyId: entityType === "corporate" ? entityId : undefined,
  //         from: dateFrom,
  //         to: dateTo,
  //         competencyId,
  //         preInterviewId: selectedJobId,
  //         inviteCode: inviteCode
  //     };
  //     Object.keys(payload).forEach(
  //         (k) => (payload[k] === undefined || payload[k] === "") && delete payload[k]
  //     );
  //     let res = await fetch(url, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(payload),
  //     });
  //     let result = await res.json();
  //     if (!result.data) return;
  //     // console.log("xx", result.data)

  //     const grouped: Record<string, any[]> = {};
  //     result.data.forEach((entry: any) => {
  //         if (!grouped[entry.skill]) grouped[entry.skill] = [];
  //         grouped[entry.skill].push(entry);
  //     });

  //     chartContainer.current.innerHTML = "";

  //     Object.keys(grouped).forEach((skill) => {
  //         // console.log("grouped",grouped)
  //         const skillData = grouped[skill];
  //         const sessionMap: Record<string, number[]> = {};
  //         skillData.forEach((entry: any) => {
  //             const session = entry.session;
  //             const score = parseFloat(entry.score);
  //             if (!sessionMap[session]) sessionMap[session] = [];
  //             sessionMap[session].push(score);
  //         });
  //         const avgPoints = Object.keys(sessionMap).map((session) => {
  //             const scores = sessionMap[session];
  //             const avg = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
  //             return { x: parseInt(session), y: parseFloat(avg.toFixed(2)) };
  //         });
  //         const wrapper = document.createElement("div");
  //         wrapper.className = "chart-wrapper";
  //         const canvas = document.createElement("canvas");
  //         wrapper.appendChild(canvas);
  //         chartContainer.current!.appendChild(wrapper);

  //         new Chart(canvas.getContext("2d")!, {
  //             type: "scatter",
  //             data: {
  //                 datasets: [
  //                     {
  //                         label: `Avg Scores - ${skill}`,
  //                         data: avgPoints,
  //                         pointBackgroundColor: "orange",
  //                         pointRadius: 5,
  //                         showLine: true,
  //                         borderColor: "orange",
  //                         borderWidth: 1,
  //                     },
  //                 ],
  //             },
  //             options: {
  //                 responsive: true,
  //                 scales: {
  //                     x: {
  //                         type: "linear",
  //                         title: { display: true, text: skill },
  //                         ticks: {
  //                             callback: (value: any) =>
  //                                 Number.isInteger(value) ? `Session ${value}` : "",
  //                             stepSize: 1,
  //                             min: 0.5,
  //                         },
  //                     },
  //                     y: {
  //                         title: { display: true, text: "Avg Score" },
  //                         min: 0,
  //                         max: 10,
  //                     },
  //                 },
  //                 plugins: {
  //                     legend: { display: false },
  //                     annotation: {
  //                         annotations: {},
  //                     },
  //                 },
  //             },
  //         });
  //     });
  // };

  // const summaryRows = [
  //     ["Candidates invited", report?.candidates_invited],
  //     ["Candidates Signed", report?.candidates_signed_in],
  //     ["Candidates Practiced", report?.candidates_practiced],
  //     ["Total Practice Hours", report?.totalPracticeDuration],
  // ];

  async function assignMessage(mobileNumber: string, preInterviewId: string) {
    let url = `${API_HOST}/index.php?larAssignMessage`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber, preInterviewId }),
      });
      const result = await res.json();
      if (result.status === 1) {
        // Update data (e.g., re-fetch your table/list)
        alert("Assignment Message resent.");
      } else {
        console.log("Unable to resend");
      }
    } catch (error) {
      alert("Error while processing the request.");
      console.error(error);
    }
  }

  const tableColumns = [
    "Name",
    "Practices",
    "Practice Start Date",
    "Practice (hrs)",
    "Completed Practice (Count)",
    "Best Score",
    "Platform feedback",
    "Assign Message Sent",
    "Status",
  ];

//   const exportToExcel = () => {
//     // Convert candidates into plain rows
//     const rows = candidates.map((row) => ({
//       Candidate: row.candidateName || "Not Signed Up",
//       Email: row.emailId,
//       Mobile: row.mobileNumber ?? "",
//       Practices: row.practices,
//       "Practice Start Date": row.firstCompletionDate,
//       "Practice Duration": row.practiceDuration,
//       "Session Count": row.sessionCount,
//       "Best Score": row.bestScore,
//       "UI Rating": row.userInterface ? `${row.userInterface}/5` : "",
//       "Assign Message": row.assignMessage,
//     }));

//     // Create worksheet & workbook
//     const worksheet = XLSX.utils.json_to_sheet(rows);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");

//     // Generate filename: InstituteName_LAR_DD_MM_YYYY
//     const getCurrentDate = () => {
//       const now = new Date();
//       const day = String(now.getDate()).padStart(2, "0");
//       const month = String(now.getMonth() + 1).padStart(2, "0");
//       const year = now.getFullYear();
//       return `${day}_${month}_${year}`;
//     };

//     // Get institute name from selected institute
//     let instituteName = "Unknown";

//     if (
//       selectedInstituteKey &&
//       selectedInstituteKey.trim() !== "" &&
//       institutes.length > 0
//     ) {
//       // Handle different formats: "institute:2152" vs "institute|2152"
//       const normalizedKey = selectedInstituteKey.replace(":", "|");

//       let selectedInstitute = institutes.find(
//         (ins) => `${ins.entityType}|${ins.entityId}` === normalizedKey
//       );

//       // If still not found, try alternative approach
//       if (!selectedInstitute) {
//         const [entityType, entityId] = selectedInstituteKey.split(/[:|]/);
//         selectedInstitute = institutes.find(
//           (ins) =>
//             ins.entityType === entityType &&
//             ins.entityId.toString() === entityId
//         );
//       }

//       if (selectedInstitute && selectedInstitute.entityName) {
//         instituteName = selectedInstitute.entityName;
//       }
//     }

//     // Clean institute name for filename - remove spaces and invalid characters
//     const cleanInstituteName = instituteName
//       .replace(/[<>:"/\\|?*]/g, "") // Remove invalid filename characters
//       .replace(/\s+/g, ""); // Remove all spaces

//     const currentDate = getCurrentDate();
//     const filename = `${cleanInstituteName}_LAR_${currentDate}.xlsx`;

//     // Generate Excel file and trigger download
//     const excelBuffer = XLSX.write(workbook, {
//       bookType: "xlsx",
//       type: "array",
//     });
//     const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
//     saveAs(blob, filename);
//   };

  const exportToExcel = async () => {
    // Convert candidates into plain rows (your existing mapping)
    const rows = candidates.map((row) => ({
      Candidate: row.candidateName || "Not Signed Up",
      Email: row.emailId,
      Mobile: row.mobileNumber ?? "",
      Practices: row.practices,
      "Practice Start Date": row.firstCompletionDate,
      "Practice Duration": row.practiceDuration,
      "Session Count": row.sessionCount,
      "Best Score": row.bestScore,
      "UI Rating": row.userInterface ? `${row.userInterface}/5` : "",
      "Assign Message": row.assignMessage,
    }));

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Candidates");

    // Add header row from object keys
    if (rows.length > 0) {
      worksheet.columns = Object.keys(rows[0]).map((key) => ({
        header: key,
        key,
      }));
    }

    // Add data rows
    rows.forEach((row) => {
      worksheet.addRow(row);
    });

    // Same date helper
    const getCurrentDate = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      return `${day}_${month}_${year}`;
    };

    // Same institute name resolution
    let instituteName = "Unknown";

    if (
      selectedInstituteKey &&
      selectedInstituteKey.trim() !== "" &&
      institutes.length > 0
    ) {
      const normalizedKey = selectedInstituteKey.replace(":", "|");

      let selectedInstitute = institutes.find(
        (ins) => `${ins.entityType}|${ins.entityId}` === normalizedKey
      );

      if (!selectedInstitute) {
        const [entityType, entityId] = selectedInstituteKey.split(/[:|]/);
        selectedInstitute = institutes.find(
          (ins) =>
            ins.entityType === entityType &&
            ins.entityId.toString() === entityId
        );
      }

      if (selectedInstitute && selectedInstitute.entityName) {
        instituteName = selectedInstitute.entityName;
      }
    }

    const cleanInstituteName = instituteName
      .replace(/[<>:"/\\|?*]/g, "")
      .replace(/\s+/g, "");

    const currentDate = getCurrentDate();
    const filename = `${cleanInstituteName}_LAR_${currentDate}.xlsx`;

    // Generate buffer in browser and trigger download
    const buffer = await workbook.xlsx.writeBuffer(); // returns an ArrayBuffer-like object[web:5][web:15]
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, filename);
  };

  const handleDelete = async (
    candidateId: any,
    emailId: string,
    preInterviewId: any
  ) => {
    try {
      // Update UI immediately (optimistic update)
      setCandidates((prevCandidates) =>
        prevCandidates.map((row) =>
          row.emailId === emailId && row.preInterviewId === preInterviewId
            ? { ...row, deleted: "Y" }
            : row
        )
      );

      setAllCandidates((prevCandidates) =>
        prevCandidates.map((row) =>
          row.emailId === emailId && row.preInterviewId === preInterviewId
            ? { ...row, deleted: "Y" }
            : row
        )
      );

      // Make API call
      const response = await fetch(
        API_HOST + "/index.php?updateCandidateDeleteStatus",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emailId: emailId,
            preInterviewId: preInterviewId,
            deleted: "Y",
          }),
        }
      );

      const result = await response.json();
      if (!result.success) {
        // Revert on failure
        setCandidates((prevCandidates) =>
          prevCandidates.map((row) =>
            row.emailId === emailId && row.preInterviewId === preInterviewId
              ? { ...row, deleted: "N" }
              : row
          )
        );
        setAllCandidates((prevCandidates) =>
          prevCandidates.map((row) =>
            row.emailId === emailId && row.preInterviewId === preInterviewId
              ? { ...row, deleted: "N" }
              : row
          )
        );
        alert("Delete failed");
      }
    } catch (error) {
      // Revert on error - same logic as above
      setCandidates((prevCandidates) =>
        prevCandidates.map((row) =>
          row.emailId === emailId && row.preInterviewId === preInterviewId
            ? { ...row, deleted: "N" }
            : row
        )
      );
      setAllCandidates((prevCandidates) =>
        prevCandidates.map((row) =>
          row.emailId === emailId && row.preInterviewId === preInterviewId
            ? { ...row, deleted: "N" }
            : row
        )
      );
      console.error("Delete failed:", error);
    }
  };

  const handleRestore = async (
    candidateId: any,
    emailId: string,
    preInterviewId: any
  ) => {
    try {
      // Update UI immediately (optimistic update)
      setCandidates((prevCandidates) =>
        prevCandidates.map((row) =>
          row.emailId === emailId && row.preInterviewId === preInterviewId
            ? { ...row, deleted: "N" }
            : row
        )
      );

      setAllCandidates((prevCandidates) =>
        prevCandidates.map((row) =>
          row.emailId === emailId && row.preInterviewId === preInterviewId
            ? { ...row, deleted: "N" }
            : row
        )
      );

      // Make API call to update database
      const response = await fetch(
        API_HOST + "/index.php?updateCandidateDeleteStatus",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emailId: emailId,
            preInterviewId: preInterviewId,
            deleted: "N",
          }),
        }
      );

      const result = await response.json();
      if (!result.success) {
        // Revert on failure
        setCandidates((prevCandidates) =>
          prevCandidates.map((row) =>
            row.emailId === emailId && row.preInterviewId === preInterviewId
              ? { ...row, deleted: "Y" }
              : row
          )
        );
        setAllCandidates((prevCandidates) =>
          prevCandidates.map((row) =>
            row.emailId === emailId && row.preInterviewId === preInterviewId
              ? { ...row, deleted: "Y" }
              : row
          )
        );
        alert("Restore failed");
      }
    } catch (error) {
      // Revert on error
      setCandidates((prevCandidates) =>
        prevCandidates.map((row) =>
          row.emailId === emailId && row.preInterviewId === preInterviewId
            ? { ...row, deleted: "Y" }
            : row
        )
      );
      setAllCandidates((prevCandidates) =>
        prevCandidates.map((row) =>
          row.emailId === emailId && row.preInterviewId === preInterviewId
            ? { ...row, deleted: "Y" }
            : row
        )
      );
      console.error("Restore failed:", error);
    }
  };

  // ToggleSwitch Component
  const ToggleSwitch = ({
    checked,
    onChange,
    disabled = false,
  }: {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
  }) => {
    return (
      <div className="flex flex-col items-center gap-1">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
          />
          <div
            className={`w-12 h-6 rounded-full peer transition-colors duration-300 ease-in-out relative ${
              checked
                ? "bg-red-600" // Green when checked (UnDelete)
                : "bg-green-600" // Red when unchecked (Delete - DEFAULT)
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ease-in-out ${
                checked ? "translate-x-6" : "translate-x-0"
              }`}
            ></span>
          </div>
        </label>
        <span
          className={`text-xs font-semibold ${
            checked ? "text-red-600" : "text-green-600"
          }`}
        >
          {checked ? "Deleted" : "Active"}
        </span>
      </div>
    );
  };

  // Check if user is NOT a student
  useEffect(() => {
    // ✅ 1. Check null FIRST (before hasChecked)
    if (pracIsLoggedin === null || loggedInUserType === null) {
      return; // Don't check yet, store is loading
    }

    // ✅ 2. Then check hasChecked
    if (hasChecked.current) return;
    hasChecked.current = true;

    // ✅ 3. Include both 'student' and 'candidate'
    const isStudent = loggedInUserType === "student";

    if (pracIsLoggedin !== "true" || isStudent) {
      router.replace("/");
    }
  }, [pracIsLoggedin, loggedInUserType, router]);

  // ✅ 1. First check if store is loaded
  if (pracIsLoggedin === null || loggedInUserType === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // ✅ 2. Then check if student (include 'candidate')
  const isStudent = loggedInUserType === "student";
  if (pracIsLoggedin !== "true" || isStudent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Access Denied</p>
      </div>
    );
  }

  return (
    <div className="container py-8 px-6 md:px-30 mx-auto">
      <div className="mb-4 text-2xl font-bold text-blue-500">
        Learner Activity Report
      </div>
      <Card>
        <CardContent className="space-y-5">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" /> Filters
          </CardTitle>
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex-1 min-w-[220px] space-y-2">
              <Label htmlFor="instituteId">Institute</Label>
              <Select
                value={selectedInstituteKey}
                onValueChange={setSelectedInstituteKey}
              >
                <SelectTrigger id="instituteId" className="w-full">
                  <SelectValue placeholder="Select Institute" />
                </SelectTrigger>
                <SelectContent>
                  {institutes.map((ins) => (
                    <SelectItem
                      value={`${ins.entityType}:${ins.entityId}`}
                      key={`${ins.entityType}:${ins.entityId}`}
                    >
                      <span>{ins.entityName}</span>
                      <span className="text-xs italic text-gray-700">
                        ({ins.entityType})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[220px] space-y-2">
              <Label htmlFor="preInterviewId">Practice</Label>
              {/* <Select
                                value={selectedJobId}
                                onValueChange={setSelectedJobId}
                            >
                                <SelectTrigger id="preInterviewId" className="w-full">
                                    <SelectValue placeholder="Select Practice" />
                                </SelectTrigger>
                                <SelectContent>

                                    {jobsSelectOptions.map((j: any) => (
                                        <SelectItem value={j.id} key={j.id}>
                                            {j.interviewName}
                                            {j.entityName ? ` (${j.entityName})` : ""}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select> */}

              <MultiSelect
                values={selectedJobId}
                onValuesChange={setSelectedJobId}
              >
                <MultiSelectTrigger className="w-full ">
                  <MultiSelectValue
                    overflowBehavior="cutoff"
                    placeholder="Select Practice"
                  />
                </MultiSelectTrigger>
                <MultiSelectContent search={false}>
                  <MultiSelectGroup>
                    {jobsSelectOptions.map((j: any) => (
                      <MultiSelectItem value={j.id} key={j.id}>
                        {j.interviewName}
                      </MultiSelectItem>
                      // <MultiSelectItem
                      //     value={`${j.entityType}:${j.id}`}
                      //     key={`${j.entityType}:${j.id}`}
                      // >
                      //     {j.interviewName} {j.entityName ? `(${j.entityName})` : ""}
                      // </MultiSelectItem>
                    ))}
                  </MultiSelectGroup>
                </MultiSelectContent>
              </MultiSelect>
            </div>
            <div className="flex-1 min-w-[220px] space-y-2">
              <Label htmlFor="competency">Competency</Label>
              <Select
                value={selectedCompetencyId}
                onValueChange={setSelectedCompetencyId}
                disabled={!selectedJobId || selectedJobId.length === 0}
              >
                <SelectTrigger id="competency" className="w-full">
                  <SelectValue placeholder="Select Competency" />
                </SelectTrigger>
                <SelectContent>
                  {competencyOptions.map((c) => (
                    <SelectItem value={c.id} key={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[180px] space-y-2">
              <Label htmlFor="date_from">Start Date</Label>
              <Input
                type="date"
                id="date_from"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[180px] space-y-2">
              <Label htmlFor="date_to">End Date</Label>
              <Input
                type="date"
                id="date_to"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="self-end">
              <Button
                onClick={fetchReportData}
                disabled={isLoading !== "" || selectedJobId.length <= 0}
              >
                Search
              </Button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 min-w-[320px] space-y-2">
              <Label htmlFor="interviewLink">Invitation Links</Label>
              {interviewLink.map((link, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    type="text"
                    id={`interviewLink-${idx}`}
                    value={link}
                    readOnly
                  />
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(link);
                      toast.success("Link copied to clipboard: " + link);
                    }}
                  >
                    Copy
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* {report && (
                <Card className="my-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ChartBar />  Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full border mt-0 mb-0">
                            <tbody>
                                {summaryRows.map(([title, val], idx) => (
                                    <tr key={title} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                        <th className="text-left px-4 py-2 font-medium">{title}</th>
                                        <td className="px-4 py-2">{val ?? "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )} */}

      {report?.leaderboard_top_3 && (
        <Card className="my-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp /> Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap">
              <div className="w-full text-lg">{report.leaderboard_top_3}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* <div
                id="chartsContainer"
                ref={chartContainer}
                className="flex flex-wrap gap-5 my-8"
            ></div> */}

      <div className="">
        {candidates && candidates.length > 0 && (
          <Card className="my-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex  items-center text-green-600 w-fit">
                  <Table height={16} width={16} />
                </span>
                <span
                  onClick={exportToExcel}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Export Candidate Activity Report
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg mb-8">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    {tableColumns.map((col) => (
                      <th key={col} className="px-4 py-2 border">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((row, idx) => (
                    <tr className="border" key={row.candidateId || idx}>
                      <td className="px-4 py-2 border text-left">
                        {row.candidateId ? (
                          <a
                            href={`/dashboard?cid=${row.candidateId}`}
                            className="text-blue-600 underline font-semibold"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {row.candidateName}
                          </a>
                        ) : (
                          <span>(Not Signed Up)</span>
                        )}
                        <br />
                        <span>{row.emailId}</span>
                        <span>{row.mobileNumber ?? ""}</span>
                      </td>
                      <td className="px-4 py-2 border text-left">
                        {row.practices}
                      </td>
                      {/* <td className="px-4 py-2 border text-left">
                                                {row.competency}
                                            </td> */}
                      <td className="px-4 py-2 border">
                        {row.firstCompletionDate}
                      </td>
                      <td className="px-4 py-2 border">
                        {row.practiceDuration}
                      </td>
                      <td className="px-4 py-2 border">{row.sessionCount}</td>
                      <td className="px-4 py-2 border">{row.bestScore}</td>
                      <td className="px-4 py-2 border">
                        {row.userInterface ? `${row.userInterface}/5` : ""}
                      </td>
                      <td className="px-4 py-2 border">
                        <span>{row.assignMessage}</span>
                        <Button
                          size="sm"
                          className="bg-blue-600 text-white ml-2"
                          onClick={() =>
                            assignMessage(row.mobileNumber, row.preInterviewId)
                          }
                        >
                          Resend
                        </Button>
                      </td>

                      {/* TOGGLE CELL */}
                      <td className="px-4 py-2 text-center">
                        <ToggleSwitch
                          checked={row.deleted === "Y"} // checked = deleted (shows UnDelete)
                          onChange={() => {
                            if (row.deleted === "Y") {
                              // Currently deleted, so restore (UnDelete action)
                              handleRestore(
                                row.candidateId,
                                row.emailId,
                                row.preInterviewId
                              );
                            } else {
                              // Currently active, so delete (Delete action)
                              handleDelete(
                                row.candidateId,
                                row.emailId,
                                row.preInterviewId
                              );
                            }
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
        {isLoading && (
          <Alert className="mt-4">
            <AlertTitle>Loading</AlertTitle>
            <AlertDescription>{isLoading}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
