"use client";

import React, { useEffect, useRef, useState } from "react";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.min.css";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Filter, UserRoundPlus, Lock, Unlock } from "lucide-react";

import { toast } from "sonner";
type JobEntry = any;

type Institute = {
  entityType: "institute" | "corporate";
  entityId: string;
  entityName: string;
  inviteCode: string;
  jobs: JobEntry[];
};

const API_HOST = process.env.NEXT_PUBLIC_API_URL;

export default function InvitationDashboard() {
  const router = useRouter();
  const hasChecked = useRef(false);
  const loggedInUserType = useUserStore((state) => state.userType);
  const pracIsLoggedin = useUserStore((state) => state.pracIsLoggedin);
  const userId = useUserStore((state) => state.userId);  
  
  // console.log("Practice Inv Page - pracIsLoggedin:", pracIsLoggedin);
  // console.log("Practice Inv Page - loggedInUserType:", loggedInUserType);
  const gridRef = useRef<HTMLDivElement>(null);
  const hotInstance = useRef<any>(null);

  const [currentUserId] = useState<string | null>(() =>
    typeof window !== "undefined"
      ? document.cookie.match(/(^| )pracUser=([^;]+)/)?.[2] || null
      : null
  );
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [selectedInstituteKey, setSelectedInstituteKey] = useState<string>("");
  const [jobsSelectOptions, setJobsSelectOptions] = useState<JobEntry[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [interviewLink, setInterviewLink] = useState("");
  const [isLoading, setIsLoading] = useState<string>("");
  const [reportData, setReportData] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(false);
  const hasSelectedJob = !!selectedJobId;

  useEffect(() => {
    const currentDate = new Date();
    const twoMonthsBack = new Date();
    twoMonthsBack.setMonth(currentDate.getMonth() - 3);
    setDateFrom(twoMonthsBack.toISOString().split("T")[0]);
    setDateTo(currentDate.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    // ✅ ONLY initialize after authorization check completes
    if (pracIsLoggedin !== "true" || !loggedInUserType) {
      return; // Don't create grid yet
    }

    if (gridRef.current && !hotInstance.current) {
      hotInstance.current = new Handsontable(gridRef.current, {
        data: [],
        colHeaders: ["Name", "Email", "Mobile"],
        columns: [
          { data: 0, type: "text" },
          { data: 1, type: "text" },
          { data: 2, type: "numeric", width: 40 },
        ],
        rowHeaders: true,
        width: "100%",
        height: "auto",
        stretchH: "all",
        licenseKey: "non-commercial-and-evaluation",
      });
      hotInstance.current.alter("insert_row_below");
    }
    
    return () => {
      if (hotInstance.current) {
        hotInstance.current.destroy();
        hotInstance.current = null;
      }
    };
  }, [pracIsLoggedin, loggedInUserType]);


  useEffect(() => {
    if (!currentUserId) return;
    setIsLoading("Loading...");
    fetch(API_HOST + "/index.php?getPracticeInvitationFilters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUserId }),
    })
      .then((r) => r.json())
      .then((result) => {
        const allJobs: JobEntry[] = [
          ...(result.colleges || []).map((job: any) => ({
            ...job,
            entityType: "institute",
          })),
          ...(result.corporate || []).map((job: any) => ({
            ...job,
            entityType: "corporate",
          })),
        ];
        const entityMap = new Map<string, Institute>();
        for (const job of allJobs) {
          const entityType = job.entityType as "institute" | "corporate";
          const entityId = job.entityId?.toString();
          const entityName = job.entityName;
          const groupKey = `${entityType}:${entityId}`;
          const inviteCode = job.inviteCode;
          if (!entityId) continue;
          if (!entityMap.has(groupKey)) {
            entityMap.set(groupKey, {
              entityType,
              entityId,
              entityName,
              inviteCode,
              jobs: [],
            });
          }
          entityMap.get(groupKey)!.jobs.push(job);
        }
        const institutesArray = Array.from(entityMap.values());
        setInstitutes(institutesArray);

        // Auto-select first institute
        if (institutesArray.length > 0) {
          const firstKey = `${institutesArray[0].entityType}:${institutesArray[0].entityId}`;
          setSelectedInstituteKey(firstKey);

          // Auto-select first job under that institute (if any)
          const firstJobs = institutesArray[0].jobs || [];
          if (firstJobs.length > 0) {
            setJobsSelectOptions(firstJobs);
            setSelectedJobId(firstJobs[0].id);
          }
        }
        setIsLoading("");
      })
      .catch(() => {

        setIsLoading("");
        alert("Error while getting the information");

      });
  }, [currentUserId]);

  useEffect(() => {
    if (!selectedInstituteKey) {
      setJobsSelectOptions([]);
      setSelectedJobId("");
      setInterviewLink("");
      return;
    }

    const found = institutes.find(
      (inst) => `${inst.entityType}:${inst.entityId}` === selectedInstituteKey
    );
    if (found) {
      setJobsSelectOptions(found.jobs);
      //  Auto slect the first job
        setSelectedJobId(found.jobs[0].id || "");
      
    } else {
      setJobsSelectOptions([]);
      setSelectedJobId("");
    }
    
    setInterviewLink("");
  }, [selectedInstituteKey, institutes]);

  useEffect(() => {
    if (!selectedJobId) {
      setInterviewLink("");
      return;
    }
    const selectedInstitute = institutes.find(
      i => `${i.entityType}:${i.entityId}` === selectedInstituteKey
    );
    let cParam = "";
    if (selectedInstitute) {
      cParam =
        selectedInstitute.entityType === "institute"
          ? `${selectedInstitute.inviteCode}`
          : `${selectedInstitute.inviteCode}`;
    }
    setInterviewLink(`${window.location.host}/job?p=${selectedJobId}&c=${cParam}`);
  }, [selectedJobId, selectedInstituteKey, institutes]);

  useEffect(() => {
    if (!hasSelectedJob) return; // do nothing until a job is selected

    let canceled = false;
    const jobIdAtStart = selectedJobId;

    (async () => {
      try {
        const state = await loadRestrictedOnly(jobIdAtStart);
        if (canceled) return;
        if (jobIdAtStart !== selectedJobId) return; // ignore stale response
        const serverIsRestricted = state?.restrictedOnly === "Y";
        setIsLocked(serverIsRestricted);
      } catch {
        if (!canceled && jobIdAtStart === selectedJobId) {
          setIsLocked(false);
        }
      }
    })();

    return () => { canceled = true; };
  }, [hasSelectedJob, selectedJobId]); // runs when job changes


  const handleSearch = () => {
    setIsLoading("Loading...");
    let collegeId = "";
    let entityType = "";
    let inviteCode = '';
    if (selectedInstituteKey) {
      const found = institutes.find(
        (inst) => `${inst.entityType}:${inst.entityId}` === selectedInstituteKey
      );
      collegeId = found?.entityId ?? "";
      entityType = found?.entityType ?? "";
      inviteCode = found?.inviteCode ?? "";
    }
    fetch(API_HOST + "/index.php?getPracticeInvitationData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: currentUserId,
        collegeId: collegeId,
        from: dateFrom,
        to: dateTo,
        entityType: entityType,
        inviteCode:inviteCode,
        preInterviewId: selectedJobId,
      }),
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.report) setReportData(result.report);
        setIsLoading("");
      })
      .catch(() => {
        alert("Error while getting the information");
        setIsLoading("");
      });
  };

  const handleImportExcel = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const excelData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
      if (hotInstance.current) {
        hotInstance.current.loadData(excelData.slice(1));
        hotInstance.current.alter("insert_row_below");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleAddEmails = () => {
    if (!selectedJobId) {
      return;
    }
    if (!hotInstance.current) return;
    let gridData = hotInstance.current.getData();
    gridData = gridData.filter((entry: any) => entry[1]);
    // console.log("gridData",gridData)
    let emailArray = gridData
      .map((entry: any) => entry[1]?.trim())
      .filter((email: string) => email && email !== "");
    let mobileArray = gridData
      .map((entry: any) => entry[2]?.toString().trim())
      .filter((mobile: string) => mobile && mobile !== "");

    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const mobilePattern = /^\d{10}$/;

    let invalidEmails = emailArray.filter(
      (email: string) => !emailPattern.test(email)
    );
    let invalidMobiles = mobileArray.filter(
      (mobile: string) => !mobilePattern.test(mobile)
    );
    if (invalidEmails.length > 0 || invalidMobiles.length > 0) {
      if (invalidEmails.length > 0) {
        alert("Invalid Emails: " + invalidEmails.join(", "));
        return;
      }
      if (invalidMobiles.length > 0) {
        alert("Invalid Mobile Numbers: " + invalidMobiles.join(", "));
        return;
      }
    }

    const selectedInstitute = institutes.find(
      i => `${i.entityType}:${i.entityId}` === selectedInstituteKey
    );
    let inviteCode: null| string = null;
    if (selectedInstitute) {
      inviteCode = selectedInstitute.inviteCode;
    }

    fetch(API_HOST + "/index.php?getPracticeInvitationAddEmails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emails: gridData,
        preInterviewId: selectedJobId,
        inviteCode:inviteCode,
        isRestricted: isLocked
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.result !== "error") {
          hotInstance.current.loadData([]);
          hotInstance.current.alter("insert_row_below");
          toast.success("Candidates Invited");
        } else {
          toast.error("Error inserting emails.");
        }
      })
      .catch(() => {
        toast.error("Error while getting the information");
      });
  };

  // Read current RestrictedOnly state for a job
  async function loadRestrictedOnly(preInterviewId: string) {
    const res = await fetch(API_HOST + "/index.php?restrictedOnly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preInterviewId: Number(preInterviewId) }),
    }); // POST JSON read
    if (!res.ok) throw new Error("Network error");
    return res.json();
  } // returns { restrictedOnly: 'Y' | null }

  // Save RestrictedOnly state for a job
  async function saveRestrictedOnly(preInterviewId: string, isRestricted: boolean) {
    const res = await fetch(API_HOST + "/index.php?restrictedOnly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        preInterviewId: Number(preInterviewId),
        isRestricted: isRestricted,
      }),
    }); // POST JSON write
    if (!res.ok) throw new Error("Network error");
    return res.json();
  } // reconciles UI with server value 

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(interviewLink);
    toast.success("Link copied to clipboard: " + interviewLink);
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
      const isStudent = loggedInUserType === 'student';
          
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
  const isStudent = loggedInUserType === 'student';
  if (pracIsLoggedin !== "true" || isStudent) {
       return (
           <div className="flex items-center justify-center min-h-screen">
              <p className="text-gray-500">Access Denied</p>
            </div>
        );
  }

  return (
    <div className="container py-8 px-6 md:px-30 mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-500">
          Practice Invitation Dashboard
        </h1>
      </div>
      <Card>
        <CardContent className="space-y-6">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" /> Filters
          </CardTitle>
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 min-w-[220px] space-y-2">
              <Label htmlFor="instituteId">
                Institute/Corporate
              </Label>
              <Select
                value={selectedInstituteKey}
                onValueChange={(value) => {
                  setSelectedInstituteKey(value);
                  setReportData(null);
                }}
              >
                <SelectTrigger className="w-full" id="instituteId">
                  <SelectValue placeholder="Select Institute/Corporate" />
                </SelectTrigger>
                <SelectContent>
                  {institutes.map((inst) => (
                    <SelectItem
                      key={`${inst.entityType}:${inst.entityId}`}
                      value={`${inst.entityType}:${inst.entityId}`}
                    >
                      <span>
                        {inst.entityName}
                      </span>
                      <span className="text-xs italic text-gray-600">
                        ({inst.entityType})
                      </span>

                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* <div className="flex-1 min-w-[180px] space-y-2">
              <Label htmlFor="date_from">Invite Date from</Label>
              <Input
                type="date"
                id="date_from"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[180px] space-y-2">
              <Label htmlFor="date_to">Invite Date to</Label>
              <Input
                type="date"
                id="date_to"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div> */}
            {/* <div className="space-y-2">

              <Button
                className="self-stretch"
                onClick={handleSearch}
                disabled={isLoading !== ""}
              >
                Search
              </Button>
            </div> */}

            <div className="flex-1 min-w-[220px] space-y-2">
              <Label htmlFor="preInterviewId">
                Practice/Job for Invitation
              </Label>
              <Select
                value={selectedJobId}
                onValueChange={setSelectedJobId}
                disabled={jobsSelectOptions.length === 0}
              >
                <SelectTrigger className="w-full" id="preInterviewId">
                  <SelectValue placeholder="Select Practice/Job" />
                </SelectTrigger>
                <SelectContent>
                  {jobsSelectOptions.map((j) => (
                    <SelectItem key={j.id} value={j.id}>
                      {j.interviewName} {j.entityType === "corporate" ? "(Corporate)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[300px] space-y-2">
              <Label htmlFor="interviewLink">Invitation Link</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  id="interviewLink"
                  value={interviewLink}
                  readOnly
                />
                <Button
                  variant="secondary"
                  onClick={copyLinkToClipboard}
                  disabled={!interviewLink}
                >
                  Copy
                </Button>
              </div>
            </div>

          </div>
          {/* <div className="flex flex-col md:flex-row items-end gap-6">
            <div className="flex-1 min-w-[220px] space-y-2">
              <Label htmlFor="preInterviewId">
                Practice/Job for Invitation
              </Label>
              <Select
                value={selectedJobId}
                onValueChange={setSelectedJobId}
                disabled={jobsSelectOptions.length === 0}
              >
                <SelectTrigger className="w-full" id="preInterviewId">
                  <SelectValue placeholder="Select Practice/Job" />
                </SelectTrigger>
                <SelectContent>
                  {jobsSelectOptions.map((j) => (
                    <SelectItem key={j.id} value={j.id}>
                      {j.interviewName} {j.entityType === "corporate" ? "(Corporate)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[300px] space-y-2">
              <Label htmlFor="interviewLink">Invitation Link</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  id="interviewLink"
                  value={interviewLink}
                  readOnly
                />
                <Button
                  variant="secondary"
                  onClick={copyLinkToClipboard}
                  disabled={!interviewLink}
                >
                  Copy
                </Button>
              </div>
            </div>
          </div> */}
          <CardTitle className="flex items-center gap-2">
            <UserRoundPlus className="h-5 w-5" /> Add Candidates to Invite
          </CardTitle>
      
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              {/* Left side - Upload Excel */}
              <div className="flex items-center gap-4 flex-1">
                <div>
                  <span className="font-medium">Upload Excel</span>
                  <Input
                    type="file"
                    accept=".xlsx"
                    onChange={handleImportExcel}
                    className="mt-2 w-md"
                  />
                </div>
                <span className="text-xs text-muted-foreground">or paste below</span>
              </div>

              <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2">
                  {hasSelectedJob && (
                    <label
                      className="flex items-center gap-2 cursor-pointer select-none"
                      title={isLocked ? "Restricted Access" : "Open Access"}
                    >
                      <input
                        type="checkbox"
                        role="switch"
                        aria-checked={isLocked}
                        checked={isLocked}
                        onChange={async (e) => {
                          const next = e.target.checked;
                          setIsLocked(next); // optimistic UI
                          try {
                            const resp = await saveRestrictedOnly(String(selectedJobId), next);
                            if (resp && "restrictedOnly" in resp) {
                              const serverIsRestricted = resp.restrictedOnly === "Y";
                              setIsLocked(serverIsRestricted);
                            }
                            toast.success(next ? "Restricted enabled" : "Open access enabled");
                          } catch {
                            setIsLocked(!next); // rollback on error
                            toast.error("Failed to save restriction");
                          }
                        }}
                        className="sr-only"
                      />
                      <span
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isLocked ? "bg-red-600" : "bg-green-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                            isLocked ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </span>
                      <span className="text-sm">
                        {isLocked ? "Restricted" : "Open"}
                      </span>
                    </label>
                  )}
                </div>
              </div>  
            </div>
          <div
            className="outline outline-1 outline-muted-foreground/30 rounded-md mb-4"
          />
          <div
            ref={gridRef}></div>
          <div className="flex justify-center gap-2">
            <Button
              size="lg"
              onClick={handleAddEmails}
              disabled={isLoading !== "" || !selectedJobId }
            >
              Invite
            </Button>
            <Button
              size="lg"
              onClick={handleSearch}
              disabled={isLoading !== "" || !selectedJobId}
            >
              Search
            </Button>
          </div>

          <div className="flex gap-8 mt-6">
            {reportData && (
              <>
                <div className="flex flex-col items-start">
                  <span className="text-lg font-semibold text-gray-900">
                    Candidates Invited
                  </span>
                  <span className="text-2xl font-bold text-blue-600">{reportData.candidates_invited ?? 0}</span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-lg font-semibold text-gray-900">
                    Candidates Signed
                  </span>
                  <span className="text-2xl font-bold text-green-600">{reportData.candidates_signed_in ?? 0}</span>
                </div>
              </>
            )}
          </div>

          {isLoading && (
            <Alert className="mt-4">
              <AlertTitle>Loading</AlertTitle>
              <AlertDescription>{isLoading}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}