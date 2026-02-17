"use client";

import React, { useState, useEffect, useMemo} from "react";
import { formatDateDDMMMYYYY } from "@/lib/utils";
import { useUserStore } from "@/stores/userStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter} from "@/components/ui/dialog";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import { MultiSelect, MultiSelectContent, MultiSelectTrigger, MultiSelectValue, MultiSelectItem } from "@/components/multi-select";

const apiHost = process.env.NEXT_PUBLIC_API_URL;
// const apiHost = process.env.NEXT_PUBLIC_NODE_API;
const PAGE_LIMIT = 100;

type CandidateRow = {
  id: any;
  name: string;
  lastActiveDate?: string;
  interviewType?: string;
  attendedInterviews?: Array<any>;
  connect_mentor_data?: Array<{
    interviewId: number;
    interviewName: string;
    paymentstatus: string;
    [key: string]: any;
  }>;
  leadAge?: string;
  workExperience?: string;
  leadStatus?: string;
  leadStatusValue?: string;
  resume?: string;
  lead_stage?: number;
  signUpDate?: string;
  emailId?: string;
  mobileNumber?: string;
};

type LearnerFilterPayload = {
  candidate_search: string;
  leadStage: string[] | null;
  signupfrom_date: string;
  signupto_date: string;
  interviewName: string[] | null;
};


type InstituteRow = {
  id: string | number;
  date?: string | null;
  orgName?: string | null;
  orgType?: string | null;
  email?: string | null;
  phone?: string | null;
  personName?: string | null;
  noOfStudents?: string | null;
  expRange?: string | null;
  location?: string | null;
  leadStatus?: string | null;
};

type InstituteFilterPayload = {
  orgTypes: string[];
  orgName: string;
  expRanges: string[];
  noOfStudents: string[];
  date_from: string;
  date_to: string;
  leadStatuses: string[];
};


export default function LeadManagementPage() {
  const [candidateSearch, setCandidateSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [leadStage, setLeadStage] = useState<string[]>([]);
  const [interviewNameFilter, setInterviewNameFilter] = useState<string[]>([]);
  const currentUserId = useUserStore((state) => state.userId);
  const currentUserType = useUserStore((state) => state.userType);


  const leadStageOptions = [
    { id: "1", value: "Exploring" },
    { id: "2", value: "Interested" },
    { id: "3", value: "Engaged" },
    { id: "4", value: "Ready to Close" }
  ];
  const [leadstatusfilter, setLeadStatusFilter] = useState<{ id: string, value: string }[]>([]);
  const [interviewNames, setInterviewNames] = useState<{ id: string, name: string }[]>([]);
  const [assignedMentors, setAssignedMentors] = useState<{ id: string, name: string }[]>([]);
  const [notassignedMentors, setNotAssignedMentors] = useState<{ id: string, name: string }[]>([]);
  const [showAssignMentorDropdown, setShowAssignMentorDropdown] = useState(true);

  const [tableRows, setTableRows] = useState<CandidateRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [currentPageText, setCurrentPageText] = useState("");
  const [noDataMsg, setNoDataMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);

  // Selection/modal
  const [candidateIdList, setCandidateIdList] = useState<string[]>([]);
  const [assignMentorModalVisible, setAssignMentorModalVisible] = useState(false);
  const [assignMentorMsg, setAssignMentorMsg] = useState("");
  const [mentorIdToAssign, setMentorIdToAssign] = useState("");
  const [bulkUpdateBtnShow, setBulkUpdateBtnShow] = useState(false);
  const [assignMentorBtnShow, setAssignMentorBtnShow] = useState(false);
  const [popoverRowId, setPopoverRowId] = useState<string | null>(null);
  const [signUpDateSort, setSignUpDateSort] = useState<"asc" | "desc" | null>(null);
  const [showPaymentDialogRowId, setShowPaymentDialogRowId] = useState(null);
  const [activeTab, setActiveTab] = useState<"learners" | "institutes">("learners");
  const [instituteRows, setInstituteRows] = useState<InstituteRow[]>([]);
  // Institute filters options loaded from API
  const [instFilters, setInstFilters] = useState({ orgTypes: [], orgNames: [], expRanges: [], noOfStudents: [] });
  const [instLeadStatuses, setInstLeadStatuses] = useState<{ id: string, value: string }[]>([]);


  // Institute filters selected by the user
  const [instOrgType, setInstOrgType] = useState<string[]>([]);
  const [instOrgName, setInstOrgName] = useState<string>("");
  const [instExpRanges, setInstExpRanges] = useState<string[]>([]);
  const [instNoOfStudents, setInstNoOfStudents] = useState<string[]>([]);
  const [instFromDate, setInstFromDate] = useState("");
  const [instToDate, setInstToDate] = useState("");
  const [selectedLeadStatuses, setSelectedLeadStatuses] = useState<string>("");

  

  // Initial fetch
  useEffect(() => {
    if (activeTab === "learners") {
      getFilters();
      getStudents(1);
    } else {
      getInstituteFilters();
      getInstitutes(1);
    }
  }, [activeTab]);


  async function getFilters() {
    setFilterLoading(true);
    try {
      const res = await fetch(`${apiHost}/index.php?getConnecttomentorFilters`);
      // const res = await fetch(`${apiHost}/lmd/getConnecttomentorFilters`);
      const json = await res.json();
      setLeadStatusFilter(json.data.leadstatusfilter || []);
      setInterviewNames(json.data.interview_name || []);
      setAssignedMentors(json.data.assignmentors || []);
      setNotAssignedMentors(json.data.notassignmentors || []);
      setShowAssignMentorDropdown(currentUserType !== "tpmentor");
    } catch (e) {
      setLeadStatusFilter([]);
      setInterviewNames([]);
      setAssignedMentors([]);
      setNotAssignedMentors([]);
    }
    setFilterLoading(false);
  }

  async function getStudents(page = 1, filters: Partial<LearnerFilterPayload> = {}) {
    setTableRows([]);
    setNoDataMsg("");  
    setLoading(true);

    const {
      candidate_search: filterCandidateSearch,
      leadStage: filterLeadStage,
      signupfrom_date: filterSignupFromDate,
      signupto_date: filterSignupToDate,
      interviewName: filterInterviewName,
    } = filters;

    // Safely resolve values
    const candidate_search = filterCandidateSearch !== undefined && filterCandidateSearch !== null
      ? filterCandidateSearch
      : candidateSearch;

    const leadStagePayload =
      Array.isArray(filterLeadStage) && filterLeadStage.length > 0
        ? filterLeadStage
        : Array.isArray(leadStage) && leadStage.length > 0
          ? leadStage
          : null;

    const signupfrom_date =
      filterSignupFromDate !== undefined && filterSignupFromDate !== null
        ? filterSignupFromDate
        : fromDate;

    const signupto_date =
      filterSignupToDate !== undefined && filterSignupToDate !== null
        ? filterSignupToDate
        : toDate;

    const interviewNamePayload =
      Array.isArray(filterInterviewName) && filterInterviewName.length > 0
        ? filterInterviewName
        : Array.isArray(interviewNameFilter) && interviewNameFilter.length > 0
          ? interviewNameFilter
          : null;

  
    try {
      const res = await fetch(`${apiHost}/index.php?getConnecttomentorData`, {
      //  const res = await fetch(`${apiHost}/lmd/getConnecttomentorData`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          userType: currentUserType,
          page,
          limit: PAGE_LIMIT,
          candidate_search,
          leadStage: leadStagePayload,
          signupfrom_date,
          signupto_date,
          interviewName: interviewNamePayload,
        })
      });
      const json = await res.json();
      if (json?.status !== 0 && json?.data) {
        setTableRows(json.data);
        const count = Math.ceil(json.count / PAGE_LIMIT);
        setPageCount(count);
        setCurrentPage(page);
        let start = ((page - 1) * PAGE_LIMIT);
        let end = start + PAGE_LIMIT;
        setCurrentPageText(
          `Showing ${start + 1} to ${end > json.count ? json.count : end} of ${json.count} entries`
        );
      } else {
        setTableRows([]);
        setNoDataMsg("No Record Found");
      }
    } catch (e) {
      setTableRows([]);
      setNoDataMsg("Error while retrieving");
    }
    setLoading(false);
  }

  async function getInstituteFilters() {
    setFilterLoading(true);
    try {
      const res = await fetch(`${apiHost}/index.php?getLmdFilters`);
      // const res = await fetch(`${apiHost}/lmd/getLmdFilters`);
      const json = await res.json();
      if (json?.status === 1) {
        setInstFilters(json.filters);
        setInstLeadStatuses(json.filters.leadStatuses || []);
      }
      else {
        setInstFilters({ orgTypes: [], orgNames: [], expRanges: [], noOfStudents: [] });
        setInstLeadStatuses([]);
      }
    } catch (e) {
      setInstFilters({ orgTypes: [], orgNames: [], expRanges: [], noOfStudents: [] });
      setInstLeadStatuses([]);
    }
    setFilterLoading(false);
  }

  function resetInstituteFilters() {
    setInstOrgType([]);
    setInstOrgName("");
    setInstExpRanges([]);
    setInstNoOfStudents([]);
    setInstFromDate("");
    setInstToDate("");
    setSelectedLeadStatuses("");
    setInstituteRows([]);
    setNoDataMsg("");
    setFilterLoading(true);
    setLoading(true);
    getInstitutes(1, {
      orgTypes: [],
      orgName: "",
      expRanges: [],
      noOfStudents: [],
      date_from: "",
      date_to: "",
      leadStatuses: [],
    });
  }

  async function getInstitutes(page = 1, filters: Partial<InstituteFilterPayload> = {}) {
    setInstituteRows([]);
    setNoDataMsg("");
    setLoading(true);
    const {
      orgTypes = instOrgType,
      orgName = instOrgName,
      expRanges = instExpRanges,
      noOfStudents = instNoOfStudents,
      date_from = instFromDate,
      date_to = instToDate,
      leadStatuses = selectedLeadStatuses ? [selectedLeadStatuses] : [],
    } = filters || {};

    try {
      const res = await fetch(`${apiHost}/index.php?getLmdData`, {
      // const res = await fetch(`${apiHost}/lmd/getLmdData`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          userType: currentUserType,
          page,
          limit: PAGE_LIMIT,
          orgTypes,
          orgName,
          expRanges,
          noOfStudents,
          date_from,
          date_to,
          leadStatuses,
        })
      });
      const json = await res.json();
      if (json?.status === 1 && json.data?.length > 0) {
        const formattedInstitutes = json.data.map((row: any) => ({
          ...row,
          date: row.date ? formatDateDDMMMYYYY(row.date, true) : "",
        }));
        setInstituteRows(formattedInstitutes);
        setPageCount(Math.ceil(json.count / PAGE_LIMIT));
        setCurrentPage(page);
        let start = ((page - 1) * PAGE_LIMIT);
        let end = start + PAGE_LIMIT;
        setCurrentPageText(`Showing ${start + 1} to ${end > json.count ? json.count : end} of ${json.count} entries`);
        setNoDataMsg("");
      } else {
        setInstituteRows([]);
        setNoDataMsg("No Record Found");
      }
    } catch (e) {
      setInstituteRows([]);
      setNoDataMsg("Error while retrieving");
    }
    setLoading(false);
  }

  function resetFilters() {
    // Reset all filter states
    setCandidateSearch("");
    setFromDate("");
    setToDate("");
    setLeadStage([]);
    setInterviewNameFilter([]);
    setCandidateIdList([]);
    setTableRows([]);
    setNoDataMsg("");
    setCurrentPage(1);
    setPageCount(1);
    setCurrentPageText("");
    setFilterLoading(true);
    setLoading(true);
    // Call getStudents with the same payload as initial page load (no filters)
    getStudents(1, {
      candidate_search: "",
      leadStage: null,
      signupfrom_date: "",
      signupto_date: "",
      interviewName: null,
    });
  }

  // Export logic
  async function exportStudent() {
    setLoading(true);
    try {
      const res = await fetch(`${apiHost}/index.php?getConnecttomentorData`, {
        // const res = await fetch(`${apiHost}/lmd/getConnecttomentorData`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          userType: currentUserType,
          page: 0,
          limit: 0,
          candidate_search: candidateSearch,
          leadStage: (leadStage && leadStage.length > 0) ? leadStage : null,
          signupfrom_date: fromDate,
          signupto_date: toDate,
          interviewName: (interviewNameFilter && interviewNameFilter.length > 0) ? interviewNameFilter : null,
        })
      });
      const json = await res.json();
      let str = "";
      if (json.data && Array.isArray(json.data)) {
        const keys = Object.keys(json.data[0]);
        str += keys.join(",") + "\n";
        json.data.forEach((row: any) => {
          str += keys.map(k => `"${row[k] || ""}"`).join(",") + "\n";
        });
        const blob = new Blob([str]);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "Lead_Management_Report.csv";
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (e) {
      setNoDataMsg("Export error");
    }
    setLoading(false);
  }

  function selectAll(checked: boolean | "indeterminate") {
    if (checked === true) setCandidateIdList(tableRows.map(r => String(r.id)));
    else setCandidateIdList([]);
    updateAssignMentorButtons();
  }
  function selectSingle(id: string, checked: boolean | "indeterminate") {
    if (typeof checked !== "boolean") return;
    setCandidateIdList(prev =>
      checked
        ? [...prev, id]
        : prev.filter(cid => cid !== id)
    );
    updateAssignMentorButtons();
  }
  function updateAssignMentorButtons() {
    const len = candidateIdList.length;
    setBulkUpdateBtnShow(len > 1);
    setAssignMentorBtnShow(len > 0);
  }

  async function submitAssignMentor(e: React.FormEvent) {
    e.preventDefault();
    if (!mentorIdToAssign) {
      setAssignMentorMsg("Please select mentor");
      setTimeout(() => setAssignMentorMsg(""), 3000);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiHost}/index.php?updateMentorAssign`, {
      // const res = await fetch(`${apiHost}/lmd/updateMentorAssign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          userType: currentUserType,
          candidateId: candidateIdList,
          mentorId: mentorIdToAssign
        }),
      });
      const json = await res.json();
      if (json.status === 1) {
        setAssignMentorMsg("Data Updated Successfully");
        setTimeout(() => {
          setAssignMentorMsg("");
          setAssignMentorModalVisible(false);
          setCandidateIdList([]);
          getStudents(currentPage);
        }, 2000);
      } else {
        setAssignMentorMsg(json.message ?? "Error");
        setTimeout(() => setAssignMentorMsg(""), 2000);
      }
    } catch (e) {
      setAssignMentorMsg("Assign error");
      setTimeout(() => setAssignMentorMsg(""), 2000);
    }
    setLoading(false);
  }

  async function updateLeadStatus(candidateId: string, newLeadStatus: string) {
    if (!window.confirm("Are you sure you wish to update the status?")) return;
    try {
      const res = await fetch(`${apiHost}/index.php?updateLeadStatus`, {
      // const res = await fetch(`${apiHost}/lmd/updateLeadStatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          userType: currentUserType,
          candidateId,
          leadStatus: newLeadStatus,
        }),
      });
      const json = await res.json();
      setTableRows(prevRows =>
        prevRows.map(row =>
          row.id === candidateId
            ? { ...row, leadStatus: newLeadStatus }
            : row
        )
      );
    } catch (e) {
      setNoDataMsg("Status update error");
    }
  }

  async function updateInstituteLeadStatus(emailId: string, newLeadStatus: string) {
    if (!window.confirm("Are you sure you wish to update the status?")) return;
    try {
      const res = await fetch(`${apiHost}/index.php?updateInstLeadStatus`, {
      // const res = await fetch(`${apiHost}/lmd/updateInstLeadStatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailId,
          leadStatus: newLeadStatus,
        }),
      });
      const json = await res.json();
      if (json.status === 1) {
        setInstituteRows(prevRows =>
          prevRows.map(row =>
            row.email === emailId
              ? { ...row, leadStatus: newLeadStatus }
              : row
          )
        );
      } else {
        setNoDataMsg(json.message || "Status update error");
      }
    } catch (e) {
      setNoDataMsg("Status update error");
    }
  }


  // Pagination items generator function
  function getPaginationItems({
    currentPage,
    pageCount,
    onPageChange
  }) {
    const maxButtons = 5;
    const totalPages = Math.max(1, pageCount);
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= maxButtons + 2) {
      for (let p = 1; p <= totalPages; p++) pages.push(p);
    } else {
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      if (currentPage > 3) {
        pages.push(1, "ellipsis");
      } else {
        for (let p = 1; p < start; p++) pages.push(p);
      }
      for (let p = start; p <= end; p++) pages.push(p);
      if (currentPage < totalPages - 2) {
        pages.push("ellipsis", totalPages);
      } else {
        for (let p = end + 1; p <= totalPages; p++) pages.push(p);
      }
    }

    return pages.map((p, idx) =>
      p === "ellipsis" ? (
        <PaginationItem key={`el-${idx}`}>
          <PaginationEllipsis />
        </PaginationItem>
      ) : (
        <PaginationItem key={p}>
          <PaginationLink
            href="#"
            isActive={p === currentPage}
            onClick={e => {
              e.preventDefault();
              if (currentPage !== p) onPageChange(p as number);
            }}
          >
            {p}
          </PaginationLink>
        </PaginationItem>
      )
    );
  }

  const learnerPaginationItems = useMemo(
    () =>
      getPaginationItems({
        currentPage,
        pageCount,
        onPageChange: getStudents,
      }),
    [currentPage, pageCount, getStudents]
  );

  const institutePaginationItems = useMemo(
    () =>
      getPaginationItems({
        currentPage,
        pageCount,
        onPageChange: getInstitutes,
      }),
    [currentPage, pageCount, getInstitutes]
  );


  const sortedTableRows = useMemo(() => {
    if (!signUpDateSort) return tableRows;
    return [...tableRows].sort((a, b) => {
      if (!a.signUpDate || !b.signUpDate) return 0;
      const aTime = new Date(a.signUpDate).getTime();
      const bTime = new Date(b.signUpDate).getTime();
      if (signUpDateSort === "asc") return aTime - bTime;
      return bTime - aTime;
    });
  }, [tableRows, signUpDateSort]);

  function LoadingSpinner() {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // console.log("sortedTableRows",sortedTableRows)

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      {/* {loading && <LoadingSpinner />} */}
      <div className="mb-6 flex space-x-2 border-b">
        <button
          className={`py-2 px-6 font-semibold border-b-2 cursor-pointer ${activeTab === "learners" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-700"}`}
          onClick={() => setActiveTab("learners")}
        >
          Learners
        </button>
        <button
          className={`py-2 px-6 font-semibold border-b-2 cursor-pointer ${activeTab === "institutes" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-700"}`}
          onClick={() => setActiveTab("institutes")}
        >
          Institutes
        </button>
      </div>

      {activeTab === "learners" && (
        <>
          {/* Headline/Export/Filters */}
          <div className="filter-container pt-5 px-5 mb-6">
            <div className="container-fluid flex justify-between items-center timeline-header">
              <span className="text-2xl font-bold">
                Lead Management Dashboard - Learners
              </span>
              <Button className="btn btn-default ml-4 cursor-pointer" onClick={exportStudent}>Export</Button>
            </div>
            <div className="row panel-body container-fluid timeline-container py-2 gap-5 grid grid-cols-1 md:grid-cols-4 mb-10">
              <div className="w-full flex flex-col gap-1">
                <span className="bg-art">Candidate ( Name/Id )</span>
                <Input
                  type="text"
                  name="candidate_search"
                  id="candidate_search"
                  className="form-control w-full min-w-0"
                  value={candidateSearch}
                  onChange={e => setCandidateSearch(e.target.value)}
                  placeholder="Candidate Name"
                />
              </div>
              <div className="w-full flex flex-col gap-1">
                <span className="bg-art">From Date:</span>
                <Input
                  type="date"
                  name="signupfrom_date"
                  placeholder="From date"
                  id="signupfrom_date"
                  className="form-control w-full min-w-0"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                />
              </div>
              <div className="w-full flex flex-col gap-1">
                <span className="bg-art">To date:</span>
                <Input
                  type="date"
                  name="signupto_date"
                  placeholder="To Date"
                  id="signupto_date"
                  className="form-control w-full min-w-0"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                />
              </div>
              <div className="w-full flex flex-col gap-1 mb-3 selectFilter">
                <span className="bg-art">Lead Stage</span>
                <Select
                  value={leadStage.length > 0 ? leadStage[0] : "all"}
                  onValueChange={val => setLeadStage(val === "all" ? [] : [val])}
                >
                  <SelectTrigger className="cursor-pointer w-full min-w-0">
                    <SelectValue className="cursor-pointer truncate" placeholder="Select Lead Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="cursor-pointer" value="all">All Stages</SelectItem>
                    {leadStageOptions.map((ls) => (
                      <SelectItem className="cursor-pointer" key={ls.id} value={String(ls.id)}>{ls.value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full flex flex-col gap-1 mb-3 selectFilter">
                <span className="bg-art">Interview Name</span>
                <Select
                  value={interviewNameFilter.length > 0 ? interviewNameFilter[0] : "all"}
                  onValueChange={val => setInterviewNameFilter(val === "all" ? [] : [val])}
                >
                  <SelectTrigger className="cursor-pointer w-full min-w-0">
                    <SelectValue className="cursor-pointer truncate" placeholder="Select Interview Name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="cursor-pointer" value="all">All Interviews</SelectItem>
                    {interviewNames.map((inv) => (
                      <SelectItem className="cursor-pointer" key={inv.id} value={String(inv.id)}>{inv.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end md:col-4 w-full">
                <Button
                  className="btn btn-color form-control cursor-pointer px-4 py-2 text-sm w-full max-w-[140px] sm:w-auto sm:max-w-[140px] md:w-auto md:max-w-[140px]"
                  onClick={() => getStudents(1)}
                >
                  Search
                </Button>
                <Button
                  className="btn btn-color form-control cursor-pointer px-4 py-2 text-sm w-full max-w-[140px] sm:w-auto sm:max-w-[140px] md:w-auto md:max-w-[140px]"
                  onClick={resetFilters}
                  disabled={loading}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Assign Mentor button */}
          {candidateIdList.length > 0 && (
            <div className="mb-2 flex items-center justify-start">
              <Button
                id="assignMentor"
                className="btn btn-default"
                onClick={() => setAssignMentorModalVisible(true)}

              >
                {candidateIdList.length > 1 ? "Bulk Assign Mentor" : "Assign Mentor"}
              </Button>
            </div>
          )}

          {/* Table */}
          <div className="container mt-5 table-scroll" id="table-Select">
            {loading ? (
              <div className="flex justify-center items-center py-6">
                {/* Use your LoadingSpinner or just text */}
                <LoadingSpinner /> 
                {/* OR: <span>Loading...</span> */}
              </div>
            ) :
                (<Table>
                  <TableHeader>
                    <TableRow>
                      {showAssignMentorDropdown && (
                        <TableHead className="text-left">
                          <Checkbox
                            checked={candidateIdList.length > 0 && candidateIdList.length === tableRows.length}
                            onCheckedChange={selectAll}
                          />
                        </TableHead>
                      )}
                      <TableHead
                        className="cursor-pointer select-none text-left"
                        onClick={() =>
                          setSignUpDateSort(prev =>
                            prev === "asc" ? "desc" : prev === "desc" ? null : "asc"
                          )
                        }
                      >
                        SignUp Date
                        {signUpDateSort === "asc" && <span> ▲</span>}
                        {signUpDateSort === "desc" && <span> ▼</span>}
                      </TableHead>
                      <TableHead className="text-left">Student Details</TableHead>
                      <TableHead className="text-left">Lead Stage</TableHead>
                      <TableHead className="whitespace-pre-line text-left leading-tight">
                        Last Active{"\n"}Date
                      </TableHead>
                      <TableHead className="whitespace-pre-line text-left leading-tight">
                        Attempt{"\n"}Count
                      </TableHead>
                      <TableHead className="whitespace-pre-line text-left leading-tight">Feedback View{"\n"}Count</TableHead>
                      <TableHead className="text-left">Lead Age</TableHead>
                      <TableHead className="whitespace-pre-line text-left leading-tight">
                        YoE
                      </TableHead>
                      <TableHead className="whitespace-pre-line text-left leading-tight">Call Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedTableRows.length > 0 ? sortedTableRows.map(row => (
                      <TableRow key={row.id}>
                        {showAssignMentorDropdown && (
                          <TableCell>
                            <Checkbox
                              checked={candidateIdList.includes(String(row.id))}
                              onCheckedChange={checked => selectSingle(String(row.id), checked)}
                            />
                          </TableCell>
                        )}
                        <TableCell className="text-left">
                          {row.signUpDate ? (
                            (() => {
                              const formatted = formatDateDDMMMYYYY(Number(row.signUpDate), true);
                              const [datePart, timePart] = formatted.split(" ");
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
                        <TableCell className="text-left">
                          <div className="text-blue-600 hover:underline"><a href={`dashboard?cid=${row.id}`} target="_blank" rel="noopener noreferrer">{row.name}</a></div>
                          {row.emailId && <div className="text-xs text-muted-foreground">Email: {row.emailId}</div>}
                          {row.mobileNumber && <div className="text-xs text-muted-foreground">Phone: {row.mobileNumber}</div>}
                        </TableCell>
                        <TableCell className="text-left">
                          <span className={`px-2 py-1 rounded text-xs ${
                            row.lead_stage === 4 ? 'bg-green-100 text-green-800' :
                            row.lead_stage === 3 ? 'bg-blue-100 text-blue-800' :
                            row.lead_stage === 2 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {
                              leadStageOptions.find(
                                (ls) => String(ls.id) === String(row.lead_stage)
                              )?.value || "Exploring"
                            }
                          </span>
                        </TableCell>
                        <TableCell className="text-left">
                          {row.lastActiveDate ? (
                            (() => {
                              const formatted = formatDateDDMMMYYYY(row.lastActiveDate, true);
                              const [datePart, timePart] = formatted.split(" ");
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
                        <TableCell className="relative text-left">
                          {row.attendedInterviews && row.attendedInterviews.length > 0 ? (
                            <>
                              <span
                                className="cursor-pointer text-blue-600 font-bold underline"
                                onClick={() =>
                                  setPopoverRowId(popoverRowId === row.id ? null : row.id)
                                }
                                tabIndex={0}
                                onBlur={() => setTimeout(() => setPopoverRowId(null), 150)}
                                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setPopoverRowId(row.id) }}
                                role="button"
                                aria-haspopup="dialog"
                              >
                                {row.attendedInterviews.length}
                              </span>
                              {popoverRowId === row.id && (
                                <div
                                  className="absolute z-30 bg-white rounded-2xl border shadow-xl w-[420px] max-h-[480px] overflow-y-auto p-4 top-full left-1/2 -translate-x-1/2 mt-2"
                                >
                                  <div className="font-semibold mb-2">
                                    Interview Details
                                    <button
                                      className="float-right px-2 py-0 text-xl leading-none"
                                      aria-label="Close"
                                      tabIndex={0}
                                      onClick={() => setPopoverRowId(null)}
                                    >×</button>
                                  </div>
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr>
                                        <th className="p-1 border-b whitespace-pre-line leading-tight">Interview{"\n"}Name</th>
                                        <th className="p-1 border-b whitespace-pre-line leading-tight">Interview{"\n"}Status</th>
                                        <th className="p-1 border-b whitespace-pre-line leading-tight">Payment{"\n"}Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {row.attendedInterviews.map((iv: any, idx: number) => {
                                        // Find payment status from connect_mentor_data
                                        let paymentStatus = "-";
                                        if (row.connect_mentor_data && Array.isArray(row.connect_mentor_data)) {
                                          const match = row.connect_mentor_data.find(
                                            cm => cm.interviewId === iv.interviewId
                                          );
                                          if (match && match.paymentstatus) paymentStatus = match.paymentstatus;
                                        }
                                        // Show last 22 chars (date) on next line
                                        let namePart = iv.interviewName;
                                        let datePart = "";
                                        if (iv.interviewName && iv.interviewName.length > 22) {
                                          namePart = iv.interviewName.slice(0, -22);
                                          datePart = iv.interviewName.slice(-22);
                                        }
                                        return (
                                          <tr key={idx}>
                                            <td className="p-1 max-w-[2000px] wrap-break-words whitespace-normal">
                                              {namePart}
                                              <br />
                                              <span className="text-xs text-muted-foreground">{datePart}</span>
                                            </td>
                                            <td className="p-1">{iv.status ? iv.status : '-'}</td>
                                            <td className="p-1">{paymentStatus}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </>
                          ) : (
                            "NA"
                          )}
                        </TableCell>
                        <TableCell className="relative text-left">
                          {(() => {
                            const feedbackData = row.connect_mentor_data || [];
                            if (!feedbackData || feedbackData.length === 0) return 0;
                            // Count of completed practices with payment status Paid/Checkout/Download/Viewed
                            const paidStatuses = ['Paid', 'Checkout', 'Download', 'Viewed'];
                            const paidCount = feedbackData.filter(item => paidStatuses.includes(item.paymentstatus)).length;
                            const displayCount = paidCount > 0 ? paidCount : 0;
                            return displayCount;
                          })()}
                        </TableCell>
                        <TableCell className="text-left">{row.leadAge ?? ""}</TableCell>
                        <TableCell className="text-left">
                          {row.workExperience ? (
                            row.resume ? (
                              <a 
                                href={row.resume} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {row.workExperience}
                              </a>
                            ) : (
                              row.workExperience
                            )
                          ) : ""}
                        </TableCell>
                        <TableCell className="w-40 text-left">
                          <Select
                            value={row.leadStatus || "all"}
                            onValueChange={v => updateLeadStatus(String(row.id), v === "all" ? "" : v)}
                          >
                            <SelectTrigger className="w-full min-w-0 truncate cursor-pointer">
                              <SelectValue placeholder={row.leadStatusValue 
                                  ? leadstatusfilter.find(ls => String(ls.id) === String(row.leadStatus))?.value 
                                  : "Select Call Status"}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem className="cursor-pointer" value="all">Select Call Status</SelectItem>
                              {leadstatusfilter.map(ls => (
                                <SelectItem className="cursor-pointer" key={ls.id} value={String(ls.id)}>{ls.value}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-start py-6 text-muted-foreground"
                        >
                          No Record Found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>)
            }

            {/* Paging */}
            <div className="row my-2">
              <div className="col-xs-6">
                <div className="dataTables_info">{currentPageText}</div>
              </div>
              <div className="col-xs-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        className="cursor-pointer"
                        onClick={() => currentPage > 1 && getStudents(currentPage - 1)}
                        aria-disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    {learnerPaginationItems}
                    <PaginationItem>
                      <PaginationNext
                        className="cursor-pointer"
                        onClick={() => currentPage < pageCount && getStudents(currentPage + 1)}
                        aria-disabled={currentPage === pageCount}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </div>

          <Dialog open={assignMentorModalVisible} onOpenChange={setAssignMentorModalVisible}>
            <DialogContent className="max-w-md w-full p-6">
              <DialogHeader>
                <DialogTitle>Assign Mentor</DialogTitle>
              </DialogHeader>

              <form onSubmit={submitAssignMentor}>
                <div>
                  <Label>Mentor</Label>
                  <Select
                    value={mentorIdToAssign || "none"}
                    onValueChange={(v) => setMentorIdToAssign(v === "none" ? "" : v)}
                  >
                    <SelectTrigger className="w-full cursor-pointer">
                      <SelectValue placeholder="Select Mentor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className="cursor-pointer" value="none">Select Mentor</SelectItem>
                      {assignedMentors.map((m) => (
                        <SelectItem className="cursor-pointer" key={m.id} value={String(m.id)}>
                          {m.name}
                        </SelectItem>
                      ))}
                      {notassignedMentors.map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {assignMentorMsg && (
                  <div className="text-red-600 mt-2">{assignMentorMsg}</div>
                )}

                <DialogFooter>
                  <Button type="submit" className="mt-4 w-full cursor-pointer">
                    Update
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}


      {/* Institutes Tab Content */}
      {activeTab === "institutes" && (
        <div className="filter-container pt-5 px-5 mb-6">
          <div className="container-fluid flex justify-between items-center timeline-header">
            <span className="text-2xl font-bold">
              Lead Management Dashboard - Institutes / Corporates
            </span>
          </div>
          <div className="bg-white dark:bg-muted rounded-lg border border-muted p-4 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-4">
              {/* Org Type */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium">Org Type</span>
                <MultiSelect
                  values={instOrgType}
                  onValuesChange={setInstOrgType}
                >
                  <MultiSelectTrigger className="w-full cursor-pointer">
                    <MultiSelectValue placeholder="Select Org Type" />
                  </MultiSelectTrigger>
                  <MultiSelectContent className="cursor-pointer" search={{ placeholder: "Search org type..." }}>
                    {instFilters.orgTypes.map(type => (
                      <MultiSelectItem className="cursor-pointer" key={type} value={type}>{type}</MultiSelectItem>
                    ))}
                  </MultiSelectContent>
                </MultiSelect>
              </div>
              {/* Org Name */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium">Org Name</span>
                <Select
                  value={instOrgName || "all"}
                  onValueChange={val => setInstOrgName(val === "all" ? "" : val)}
                >
                  <SelectTrigger className="w-full cursor-pointer">
                    <SelectValue placeholder="Type or select org name" />
                  </SelectTrigger>
                  <SelectContent className="min-w-[200px] max-w-[400px]">
                    <SelectItem className="cursor-pointer" value="all">All Org Names</SelectItem>
                    {(instFilters.orgNames as string[])
                      .filter(t => {
                        if (typeof t !== "string" || !t) return false;
                        if (!instOrgName) return true;
                        if (typeof instOrgName !== "string" || !instOrgName) return true;
                        return t.toLowerCase().startsWith(instOrgName.toLowerCase());
                      })
                      .map(t => (
                        <SelectItem className="cursor-pointer" key={t} value={t}>{t}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              {/* Exp Range */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium">Experience Range</span>
                <MultiSelect
                  values={instExpRanges}
                  onValuesChange={setInstExpRanges}
                >
                  <MultiSelectTrigger className="w-full cursor-pointer">
                    <MultiSelectValue placeholder="Select Exp Range" />
                  </MultiSelectTrigger>
                  <MultiSelectContent search={{ placeholder: "Search exp range..." }}>
                    {instFilters.expRanges.map(val => (
                      <MultiSelectItem className="cursor-pointer" key={val} value={val}>{val}</MultiSelectItem>
                    ))}
                  </MultiSelectContent>
                </MultiSelect>
              </div>
              {/* No. of Students */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium">No. of Students</span>
                <MultiSelect
                  values={instNoOfStudents}
                  onValuesChange={setInstNoOfStudents}
                >
                  <MultiSelectTrigger className="w-full cursor-pointer">
                    <MultiSelectValue placeholder="Select No of Students" />
                  </MultiSelectTrigger>
                  <MultiSelectContent search={{ placeholder: "Search no of students..." }}>
                    {instFilters.noOfStudents.map(val => (
                      <MultiSelectItem className="cursor-pointer" key={val} value={val}>{val}</MultiSelectItem>
                    ))}
                  </MultiSelectContent>
                </MultiSelect>
              </div>
              {/* From Date */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium">From Date</span>
                <input
                  type="date"
                  className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={instFromDate}
                  onChange={e => setInstFromDate(e.target.value)}
                />
              </div>

              {/* To Date */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium">To Date</span>
                <input
                  type="date"
                  className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={instToDate}
                  onChange={e => setInstToDate(e.target.value)}
                />
              </div>
              {/* Lead Status */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium">Lead Status</span>
                <Select
                  value={selectedLeadStatuses || "all"}
                  onValueChange={val => setSelectedLeadStatuses(val === "all" ? "" : val)}
                >
                  <SelectTrigger className="w-full cursor-pointer">
                    <SelectValue placeholder="Select Lead Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="cursor-pointer" value="all">All Statuses</SelectItem>
                    {instLeadStatuses.map(ls => (
                      <SelectItem className="cursor-pointer" key={ls.id} value={String(ls.id)}>{ls.value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button className="cursor-pointer" size="sm" variant="default" onClick={() => getInstitutes(1)}>
                Search
              </Button>
              <Button className="cursor-pointer" size="sm" variant="outline" onClick={resetInstituteFilters} disabled={loading}>
                Reset
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-6">
                {/* Use your LoadingSpinner or just text */}
                <LoadingSpinner /> 
                {/* OR: <span>Loading...</span> */}
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-pre-line leading-tight">
                    Registration{"\n"}Date
                  </TableHead>
                  <TableHead>Org Name</TableHead>
                  <TableHead>Org Type</TableHead>          
                  <TableHead>Person Name</TableHead>
                  <TableHead className="whitespace-pre-line leading-tight">
                      No{"\n"}of Students
                  </TableHead>
                  <TableHead className="whitespace-pre-line leading-tight">
                    Exp{"\n"}Range
                  </TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="whitespace-pre-line leading-tight">Status Update</TableHead>
                  <TableHead>Lead Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instituteRows.length > 0 ? instituteRows.map(row => (
                  <TableRow key={row.id}>
                    <TableCell>
                      {row.date ? (
                        (() => {
                          const formatted = formatDateDDMMMYYYY(row.date, true);
                          const [datePart, timePart] = formatted.split(" ");
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
                    <TableCell className="max-w-[200px] break-words whitespace-normal">
                      <div className="text-md">{row.orgName ?? ""}</div>
                      {row.email && <div className="text-xs text-muted-foreground">Email: {row.email}</div>}
                      {row.phone && <div className="text-xs text-muted-foreground">Phone: {row.phone}</div>}
                    </TableCell>
                    <TableCell>{row.orgType ?? ""}</TableCell>
                    <TableCell>{row.personName ?? ""}</TableCell>
                    <TableCell>{row.noOfStudents ?? ""}</TableCell>
                    <TableCell>{row.expRange ?? ""}</TableCell>
                    <TableCell>{row.location ?? ""}</TableCell>
                    <TableCell className="w-40">
                      <Select
                        value={row.leadStatus || "all"}
                        onValueChange={v => updateInstituteLeadStatus(String(row.email), v === "all" ? "" : v)}
                      >
                        <SelectTrigger className="w-full min-w-0 truncate cursor-pointer">
                          <SelectValue placeholder={
                              row.leadStatus 
                                ? instLeadStatuses.find(ls => ls.id === row.leadStatus)?.value 
                                : "Select Lead Status"
                            } />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem className="cursor-pointer" value="all">Select Lead Status</SelectItem>
                          {instLeadStatuses?.map(ls => (
                            <SelectItem className="cursor-pointer" key={ls.id} value={String(ls.id)}>{ls.value}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>                 
                    </TableCell>
                    <TableCell>
                      {row.leadStatus 
                        ? instLeadStatuses.find(ls => ls.id === row.leadStatus)?.value || row.leadStatus
                        : ""}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={11}>{noDataMsg}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            )}
          </div>

          {/* Paging */}
          <div className="row my-2">
            <div className="col-xs-6">
              <div className="dataTables_info">{currentPageText}</div>
            </div>
            <div className="col-xs-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className="cursor-pointer"
                      onClick={e => {
                        e.preventDefault();
                        if (currentPage > 1) getInstitutes(currentPage - 1);
                      }}
                      aria-disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  {institutePaginationItems}
                  <PaginationItem>
                    <PaginationNext
                      className="cursor-pointer"
                      onClick={e => {
                        e.preventDefault();
                        if (currentPage < pageCount) getInstitutes(currentPage + 1);
                      }}
                      aria-disabled={currentPage === pageCount}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
