"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { format } from "date-fns";
import { formatDateDDMMMYYYY } from "@/lib/utils";
import { CalendarIcon, Download, Filter, Link as LinkIcon, Search, FileSpreadsheet } from "lucide-react";
import { BsFileEarmarkExcel } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { redirect, useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import Link from "next/link";

interface Data {
  instituteCode: string;
  userInstituteCode: string;
  instituteEmailId: string,
  instituteMobileNumber: string,
  instituteName: string;
  contactType: string;
  jobName: string;
  jobStatus: string;
  preInterviewId: number;
  jobPostDate: string; // ISO Date string
  firstName: string;
  mobileNumber: string;
  emailId: string;
  candidateId: number;
  candidateStatus: string;
  review_status: string;
  aiInterview: "Y" | "N";
  shortlisted: "Y" | "N";
  offered: "Y" | "N";
  intScore: number;
  percentile: string;
  applicantSuitability: string; // Add this line
}

interface DataGroup {
  instituteName: string;
  instituteCode: string;
  instituteMobileNumber: string;
  instituteEmailId: string;
  jobName: string;
  jobStatus: String;
  preInterviewId: number;
  jobPostDate: string; // ISO Date string
  contactType: string; // Add this line
  items: Data[];
}

export default function InstituteEngagementPage() {

  const router = useRouter();
  const hasChecked = useRef(false);
  const loggedInUserType = useUserStore((state) => state.userType);
  const pracIsLoggedin = useUserStore((state) => state.pracIsLoggedin);
  const userId = useUserStore((state) => state.userId);
  
  // console.log("Institute Job - pracIsLoggedin:", pracIsLoggedin);
  // console.log("Institute Job Page - loggedInUserType:", loggedInUserType);
  // --- state & fetch ---
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- filters & sorts ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstitute, setSelectedInstitute] = useState("all");
  const [selectedInterview, setSelectedInterview] = useState("all");
  const [selectedAiInterview, setselectedAiInterview] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [sortBy, setSortBy] = useState<string>("instituteName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  // const [selectedPerformance, setSelectedPerformance] = useState("all");
  // const [selectedCalls, setSelectedCalls] = useState("all");
  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `/api/institute-engagement/data`
        );
        if (!res.ok) throw new Error("Network response was not ok");
        const json = await res.json();

        // console.log("json", json);
      //   console.log("Sample data object:", json[0]);
      // console.log("All available fields:", Object.keys(json[0] || {}));
      
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const uniqueInstitutesMap = new Map();

  (data || []).forEach((r) => {
    if (!uniqueInstitutesMap.has(r.instituteCode)) {
      uniqueInstitutesMap.set(r.instituteCode, r.instituteName);
    }
  });

  const uniqueInstitutes = Array.from(uniqueInstitutesMap, ([code, name]) => ({
    instituteCode: code,
    instituteName: name,
  }));

  const uniqueInterviewsMap = new Map();

  (data || []).forEach((r) => {
    if (!uniqueInterviewsMap.has(r.jobName)) {
      uniqueInterviewsMap.set(r.jobName, r.preInterviewId);
    }
  });

  // const uniqueInstitutes = Array.from(uniqueInstitutesMap, ([code, name]) => ({
  //   instituteCode: code,
  //   instituteName: name,
  // }));

  const uniqueInterviews = Array.from(uniqueInterviewsMap, ([jobName, preInterviewId]) => ({
    jobName,
    preInterviewId,
  }));

  // console.log("data", data)

  // Apply Filters
  const filtered = useMemo(() => {
    return (data || []).filter((item) => {
      const matchesSearch =
        item.instituteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.instituteCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesInstitute =
        selectedInstitute === "all" || item.instituteCode === selectedInstitute;

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus.trim().toLowerCase() === "shortlisted" &&
          item.shortlisted === "Y") ||
        (selectedStatus.trim().toLowerCase() === "offered" &&
          item.offered === "Y");

      const matchesAiInterviewStatus =
        selectedAiInterview.trim().toLowerCase() === "all" ||
        item.aiInterview.trim().toLowerCase() ===
        selectedAiInterview.trim().toLowerCase();

      const matchesInterview =
        selectedInterview === "all" || selectedInterview === item.jobName;

      const jobPostDate = new Date(item.jobPostDate);

      // console.log("jobPostDate", jobPostDate);
      // console.log("dateFrom", dateFrom);

      const afterFrom = !dateFrom || jobPostDate >= dateFrom;

      const beforeTo = !dateTo || jobPostDate <= dateTo;

      return (
        matchesSearch &&
        matchesInstitute &&
        matchesStatus &&
        matchesAiInterviewStatus &&
        matchesInterview &&
        afterFrom &&
        beforeTo
      );
    });
  }, [
    data,
    searchTerm,
    selectedInstitute,
    selectedAiInterview,
    selectedStatus,
    selectedInterview,
    dateFrom,
    dateTo,
  ]);

  //     selectedCalls,
  //     matchesCalls &&
  //     matchesPerf &&
  //     selectedPerformance,

  // console.log("filtered", filtered);

  const grouped: DataGroup[] = useMemo(() => {
    const map = new Map<string, DataGroup>();

    filtered.forEach((item) => {
      const compositeKey = `${item.instituteCode}|${item.jobName}`;
      if (!map.has(compositeKey)) {
        map.set(compositeKey, {
          instituteName: item.instituteName,
          instituteCode: item.instituteCode,
          instituteMobileNumber: item.instituteMobileNumber,
          instituteEmailId: item.instituteEmailId,
          jobName: item.jobName,
          jobStatus: item.jobStatus,
          preInterviewId: item.preInterviewId,
          jobPostDate: item.jobPostDate,
          contactType: item.contactType, // Add this line
          items: [],
        });
      }
      map.get(compositeKey)!.items.push(item);
    });

    return Array.from(map.values());
  }, [filtered]);

  // console.log("grouped", grouped);

  const sortedData = useMemo(() => {
  return [...grouped].sort((a, b) => {
    let aValue, bValue;
    
    // Get values based on sortBy
    switch(sortBy) {
      case "instituteName":
        aValue = a.instituteName;
        bValue = b.instituteName;
        break;
      case "instituteCode":
        aValue = a.instituteCode;
        bValue = b.instituteCode;
        break;
      case "jobName":
        aValue = a.jobName;
        bValue = b.jobName;
        break;
      case "jobPostDate":
        aValue = new Date(a.jobPostDate);
        bValue = new Date(b.jobPostDate);
        break;
      case "jobStatus":
        aValue = a.jobStatus;
        bValue = b.jobStatus;
        break;
      case "contactType": // Add this case
        aValue = a.contactType;
        bValue = b.contactType;
        break;
      default:
        return 0;
    }
    
    // Sort logic
    let comparison = 0;
    if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
    }
    
    return sortOrder === "asc" ? comparison : -comparison;
  });
}, [grouped, sortBy, sortOrder]);


  const downloadCSVForInstitute = (instituteName: string, instituteCode: string, preInterviewId: number) => {
    const filterData = data.filter((r) => r.instituteCode === instituteCode && r.preInterviewId === preInterviewId);
    if (!filterData.length) return;

    const header = [
      "Job Name",
      "Candiate Name", 
      "Email Id",
      "Phone Number",
      "AI Interview Status",
      "Interview Score",
      "Recruitment Status",
      "Interview Performance"
    ];
    const csvRows = [
      header,
      ...filterData.map((r) => [
        r.jobName,
        r.firstName,
        r.emailId,
        r.mobileNumber,
        r.aiInterview === "Y" 
          ? "Completed"
          : (r.review_status == null ? "Scheduled" : "Incomplete"),
        r.intScore,
        r.candidateStatus,
        r.applicantSuitability
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvRows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    
    const jobName = filterData[0]?.jobName;
    const todayDate = new Date().toLocaleDateString('en-GB');
    const formattedDate = todayDate.replace(/\//g, '-');
    
    a.href = url;
    a.download = `${jobName}"${preInterviewId}"_${instituteName}_${formattedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (

    <div className="container mx-auto px-6 md:px-30  p-6 space-y-6 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Institute Job Report
          </h1>
          <p className="text-muted-foreground">
            Monitor per-job, per-college candidate performance and application summary.
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="gap-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            {/* Search */}
            <div className="space-y-2">
              <label className="font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Institute or Job..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            {/* Institute */}
            <div className="space-y-2 w-full">
              <label className="font-medium">Institute</label>
              <Select
                value={selectedInstitute}
                onValueChange={setSelectedInstitute}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Institutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {uniqueInstitutes.map((ic) => (
                    <SelectItem key={ic.instituteCode} value={ic.instituteCode}>
                      {ic.instituteName} <span className="text-muted-foreground">({ic.instituteCode})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Job/Interview */}
            <div className="space-y-2 w-full">
              <label className="font-medium">Job</label>
              <Select
                value={selectedInterview}
                onValueChange={setSelectedInterview}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Jobs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {uniqueInterviews.map((i) => (
                    <SelectItem key={i.preInterviewId} value={i.jobName}>
                      {i.jobName}  <span className="text-muted-foreground">({i.preInterviewId})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Application Status */}
            <div className="space-y-2 w-full">
              <label className="font-medium">Application Status</label>
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="offered">Offered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Screening Interview Status */}
            <div className="space-y-2 w-full">
              <label className="font-medium">
                Ai Screening Interview Status
              </label>
              <Select
                value={selectedAiInterview}
                onValueChange={setselectedAiInterview}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Y">Taken</SelectItem>
                  <SelectItem value="N">Not Taken</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Date Range */}
            <div className="space-y-2 w-full">
              <label className="font-medium">Date Range</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "dd/MM/yyyy") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Interview Performance */}
            {/* <div className="space-y-2">
                <label className="font-medium">
                  Interview Performance
                </label>
                <Select
                  value={selectedPerformance}
                  onValueChange={setSelectedPerformance}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="gap-2 m-0 p-0 px-0 border-0 rounded-none shadow-none">
        <CardHeader className="px-0 bg-gray-50">
          <div className="flex items-center justify-between">
            <CardTitle></CardTitle>
            <div className="flex items-center gap-2">
              <label className="text-sm">Sort by:</label>
              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as any)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jobPostDate">Post Date</SelectItem>
                  <SelectItem value="contactType">Contact Type</SelectItem>
                  <SelectItem value="instituteCode">Code</SelectItem>
                  <SelectItem value="instituteName">Institute</SelectItem>
                  <SelectItem value="jobName">Job</SelectItem>
                  {/* <SelectItem value="firstName">Candidate</SelectItem> */}
                  <SelectItem value="candidateStatus">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 text-xs">
          <div className="rounded-md border">
            <Table>
              <TableHeader className="text-xs">
                <TableRow>
                  <TableHead 
                    onClick={() => handleSort("jobPostDate")}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-1">
                      Date of Posting
                      {sortBy === "jobPostDate" && (
                        <span className="text-xs">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    onClick={() => handleSort("contactType")}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-center gap-1">
                      Contact Type
                      {sortBy === "contactType" && (
                        <span className="text-xs">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>

                  <TableHead 
                    onClick={() => handleSort("instituteName")}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-1">
                      Institute
                      {sortBy === "instituteName" && (
                        <span className="text-xs">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>

                  <TableHead>Contact</TableHead>

                  <TableHead 
                    onClick={() => handleSort("jobName")}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-1">
                      Job
                      {sortBy === "jobName" && (
                        <span className="text-xs">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>

                  <TableHead
                    onClick={() => handleSort("jobStatus")}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-1">
                      Job Status
                      {sortBy === "jobStatus" && (
                        <span className="text-xs">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>

                  {/* <TableHead>Contact</TableHead> */}
                  {/* <TableHead>Jobs Shared</TableHead> */}
                  <TableHead>Applicants</TableHead>
                  <TableHead>AI Interviewed</TableHead>
                  <TableHead>Shortlisted</TableHead>
                  <TableHead>Offers</TableHead>
                  <TableHead>Student-wise Report</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.length > 0 ? (sortedData.map((group: DataGroup) => {

                  const applicants = group.items.map((i) => i.firstName);

                  const shortlisted = group.items
                    .filter((i) => i.shortlisted === "Y")
                    .map((i) => i.firstName);

                  const aiInterview = group.items
                    .filter((i) => i.aiInterview === "Y")
                    .map((i) => i.firstName);

                  const offered = group.items
                    .filter((i) => i.offered === "Y")
                    .map((i) => i.firstName);

                  const jobs = [
                    ...new Set(group.items.map((i) => i.jobName)),
                  ];
                  return (
                    <TableRow
                      key={group.preInterviewId + "-" + group.instituteCode}
                      className="hover:bg-muted/50 text-xs"
                    >
                      <TableCell className="text-center">
                        {group.jobPostDate ? (
                          (() => {
                            const formatted = formatDateDDMMMYYYY(group.jobPostDate, true);
                            const [datePart, timePart] = formatted.split(' ');
                            return (
                              <>
                                <div>{datePart}</div>
                                {timePart && (
                                  <div className="text-xs text-muted-foreground">{timePart}</div>
                                )}
                              </>
                            );
                          })()
                        ) : ""}
                      </TableCell>

                      {/* Add this new cell */}
                      <TableCell className="text-center">
                        {group.contactType || "N/A"}
                      </TableCell>

                      <TableCell className="space-x-2">
                        <div className="text-xs">
                          <div className="font-medium">{group.instituteCode}</div>
                          <div className="text-muted-foreground w-[200px] max-w-[200px] whitespace-normal break-words">
                            {group.instituteName}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-left">
                        <div className="text-xs">
                          <div className="text-left">{group.instituteEmailId}</div>
                          <div className="text-left">{group.instituteMobileNumber}</div>
                        </div>
                      </TableCell>

                      <TableCell className="space-x-2 text-xs">
                        <span className="w-[200px] max-w-[200px] whitespace-normal break-words text-xs">
                          {group.jobName}
                        </span>
                        <Link href={`/job?p=${group.preInterviewId}`}>
                          <Badge variant="outline" className="cursor-pointer hover:underline text-blue-600">
                            {group.preInterviewId} <LinkIcon />
                          </Badge>
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">
                        {group.jobStatus?.toLowerCase() === "active" ? "Active" : "Inactive"}
                      </TableCell>

                      {/* <TableCell className="text-left">
                          <div className="text-left">{`${group.instituteEmailId}`}</div>
                          <div className="text-left">{`${group.instituteMobileNumber}`}</div>
                        </TableCell> */}
                      {/* <TableCell className="text-center">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" className="cursor-pointer">{jobs.length}</Button>
                            </PopoverTrigger>
                            <PopoverContent>
                              {jobs.map((j, idx) => (
                                <div key={idx}>{j}</div>
                              ))}
                            </PopoverContent>
                          </Popover>
                        </TableCell> */}

                      <TableCell className="text-center">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" className="cursor-pointer">
                              {applicants.length}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="max-h-[300px] overflow-y-auto">
                            {applicants.map((n, idx) => (
                              <div key={idx}>{n}</div>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </TableCell>

                      <TableCell className="text-center">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" className="cursor-pointer">
                              {aiInterview.length}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="max-h-[300px] overflow-y-auto">
                            {aiInterview.map((n, idx) => (
                              <div key={idx}>{n}</div>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell className="text-center">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" className="cursor-pointer">
                              {shortlisted.length}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="max-h-[300px] overflow-y-auto">
                            {shortlisted.map((n, idx) => (
                              <div key={idx}>{n}</div>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </TableCell>

                      <TableCell className="text-center">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" className="cursor-pointer">{offered.length}</Button>
                          </PopoverTrigger>
                          <PopoverContent className="max-h-[300px] overflow-y-auto">
                            {offered.map((j, idx) => (
                              <div key={idx}>{j}</div>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 cursor-pointer hover:bg-gray-50"
                          onClick={() =>
                            downloadCSVForInstitute(group.instituteName, group.instituteCode, group.preInterviewId)
                          }
                          title="Download Report"
                        >
                          <BsFileEarmarkExcel className="h-5 w-5 text-green-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })) : (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-4">
                      No data found for the applied filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
function getServerSession(authOptions: any) {
  throw new Error("Function not implemented.");
}
