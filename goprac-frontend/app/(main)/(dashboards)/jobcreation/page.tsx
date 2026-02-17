"use client";

import React, { useEffect, useMemo, useState, useCallback, memo } from "react";
import { useUserStore } from "@/stores/userStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
// import { BasicJobDetails } from "./_components/BasicJobDetails";
// import { SkillsSection } from "./_components/SkillsSection";
// import { JobPromotion } from "./_components/JobPromotion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { MultiSelect, MultiSelectContent, MultiSelectTrigger, MultiSelectValue, MultiSelectItem } from "@/components/multi-select";
import { RichTextEditor } from "@/components/rich-text-editor";

const apiHost = process.env.NEXT_PUBLIC_API_URL || "";

interface InterviewSection {
  section: string;
  subject: string;
  level: string[];
  aSubject: string[];
  cutOff: string;
  topics: string[];
  speakingSkill: boolean;
}


// Types (kept loose to match backend shape)
type FilterResponse = any;
type AttemptDetailsResponse = any;

export default function JobCreationPage() {
  // user
  const currentUserId = useUserStore((s) => s.userId);
  const currentUserType = useUserStore((s) => s.userType);

  // page-level loading & notifications
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [notify, setNotify] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Section: Header controls
  const [mode, setMode] = useState<"create" | "modify">("create"); // toggle: Create A New Job / Modify Existing Job
  const [includeInactive, setIncludeInactive] = useState(false);
  const [interviewList, setInterviewList] = useState<any[]>([]);
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | "">("");
  const [associateCorporateDialogOpen, setAssociateCorporateDialogOpen] = useState(false);
  const [corporateNameList, setCorporateNameList] = useState<any[]>([]);
  const [associatedCorporate, setAssociatedCorporate] = useState<any[]>([]);
  const [selectedCorporateIds, setSelectedCorporateIds] = useState<string[]>([]);

  // filters and master lists
  const [filters, setFilters] = useState<FilterResponse | null>(null);

  // create Interview declaration fields
  const [interviewSections, setInterviewSections] = useState<InterviewSection[]>([]);
  const [companyIdList, setCompanyIdList] = useState<string[]>([]);
  const [serviceType, setServiceType] = useState<string>("");
  const [jobName, setJobName] = useState<string>("");
  const [recruiterEmail, setRecruiterEmail] = useState<string>("");
  const [companyUrl, setCompanyUrl] = useState<string>("");
  const [jobStartDate, setJobStartDate] = useState<string>("");
  const [jobExpireDate, setJobExpireDate] = useState<string>("");
  const [jobIndustryType, setJobIndustryType] = useState<string[]>([]);
  const [headcount, setHeadcount] = useState<string>("");
  const [outstation, setOutstation] = useState<"Y" | "N" | "">("Y"); // Default to "Y" (YES) and disabled, matching old page
  const [apmType, setApmType] = useState<string>("");
  const [employmentType, setEmploymentType] = useState<string>("");
  const [bondAgreementRequired, setBondAgreementRequired] = useState<string>("");
  const [companyEmployeeStrength, setCompanyEmployeeStrength] = useState<string>("");
  const [workingDays, setWorkingDays] = useState<string>("");
  const [jobMode, setJobMode] = useState<string[]>([]); // multi-select
  const [jobShift, setJobShift] = useState<string[]>([]); // multi-select
  const [salaryMin, setSalaryMin] = useState<string>("");
  const [salaryMax, setSalaryMax] = useState<string>("");
  const [noticePeriod, setNoticePeriod] = useState<string>("");
  const [jobLocationIds, setJobLocationIds] = useState<string[]>([]);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [ultraMandatorySkill, setUltraMandatorySkill] = useState<string[]>([]);
  const [goodToHaveSkill, setGoodToHaveSkill] = useState<string[]>([]);
  const [skillText, setSkillText] = useState<string>("");
  const [jobDescriptionHtml, setJobDescriptionHtml] = useState<string>("");
  const [showJDsection, setShowJDSection] = useState<"Y" | "N">("Y");
  const [requestText, setRequestText] = useState<string>("");
  const [apmReady, setApmReady] = useState<string>("");

  // Basic Job Details (section 2)
  const [domainRoleId, setDomainRoleId] = useState<string>(""); // roleId
  const [competencySubjectId, setCompetencySubjectId] = useState<string[]>([]); // subjectId - multi-select

  // Skill dialog
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");
  const [skillsList, setSkillsList] = useState<{ id: string; favourite_subject?: string; name?: string }[]>([]);
  const [skillAddDisabled, setSkillAddDisabled] = useState(true);

  // Additional Job Details (section 3)
  const [jdFileName, setJdFileName] = useState<string | null>(null);
  const [jdFileUrl, setJdFileUrl] = useState<string | null>(null);
  const [jdUploadError, setJdUploadError] = useState<string>("");
  const [jdUploadSuccess, setJdUploadSuccess] = useState<string>("");
  const [jdUploading, setJdUploading] = useState(false);
  const [jdFileType, setJdFileType] = useState<"pdf" | "docx" | null>(null);

  // Experience range (individual min/max values)
  const [expMin, setExpMin] = useState<string>("");
  const [expMax, setExpMax] = useState<string>("");

  const [salaryRangeVisible, setSalaryRangeVisible] = useState<"Y" | "N">("N");

  // Candidate Declaration toggles (CD* fields)
  const [declEmploymentType, setDeclEmploymentType] = useState<"Y" | "N">("Y");
  const [declWorkingDays, setDeclWorkingDays] = useState<"Y" | "N">("Y");
  const [declJobMode, setDeclJobMode] = useState<"Y" | "N">("Y");
  const [declJobShift, setDeclJobShift] = useState<"Y" | "N">("Y");
  const [declCompanyJobLocation, setDeclCompanyJobLocation] = useState<"Y" | "N">("Y");

  // Candidate collection toggles (V* fields)
  const [aCandidateResume, setACandidateResume] = useState<"Y" | "N">("Y");
  const [aCandidateNoticePeriod, setACandidateNoticePeriod] = useState<"Y" | "N">("Y");
  const [aCandidateTotalWorkExp, setACandidateTotalWorkExp] = useState<"Y" | "N">("Y");
  const [aCandidateCurrentLocation, setACandidateCurrentLocation] = useState<"Y" | "N">("Y");
  const [aCandidateCurrentSalary, setACandidateCurrentSalary] = useState<"Y" | "N">("Y");
  const [aCandidateExpectedSalary, setACandidateExpectedSalary] = useState<"Y" | "N">("Y");
  const [aCandidateCurrentCompany, setACandidateCurrentCompany] = useState<"Y" | "N">("Y");

  // AI Screening Interview Creation Request (section 4)
  const [createInterviewOption, setCreateInterviewOption] = useState<"no" | "now">("no");

  // Job Promotion Request (section 5) - Individual checkboxes matching KO.js
  const [promoteGopracDB, setPromoteGopracDB] = useState(false);
  const [promoteSocial, setPromoteSocial] = useState(false);
  const [promoteLinkedIn, setPromoteLinkedIn] = useState(false);
  const [promoteNaukri, setPromoteNaukri] = useState(false);
  const [promoteIST, setPromoteIST] = useState(false);
  const [doNotPromote, setDoNotPromote] = useState(false);

  // other backend response details
  const [profilePreferences, setProfilePreferences] = useState<any[]>([]);
  const [locationsMaster, setLocationsMaster] = useState<any[]>([]);
  const [roleNames, setRoleNames] = useState<any[]>([]);
  const [competencySubjects, setCompetencySubjects] = useState<any[]>([]);
  const [companyUrls, setCompanyUrls] = useState<any[]>([]);
  const [companyNames, setCompanyNames] = useState<any[]>([]);

  // New missing state variables
  const [advancedProfileMatch, setAdvancedProfileMatch] = useState<"Y" | "N">("Y");
  const [candidateDeclaration, setCandidateDeclaration] = useState<"Y" | "N">("Y");
  const [additionalInfo, setAdditionalInfo] = useState<"Y" | "N">("Y");
  const [showJDSectionToggle, setShowJDSectionToggle] = useState<"Y" | "N">("Y");
  const [includeBehavioral, setIncludeBehavioral] = useState(false);
  const [s3Uploading, setS3Uploading] = useState(false);
  const [jobMatchDialogOpen, setJobMatchDialogOpen] = useState(false);
  const [jobMatchData, setJobMatchData] = useState<any>(null);
  const [validationState, setValidationState] = useState(0);
  const [pendingInterview, setPendingInterview] = useState("");
  const [attemptDetails, setAttemptDetails] = useState(0);
  const [generatedLinks, setGeneratedLinks] = useState<{
    social?: string;
    linkedin?: string;
    naukri?: string;
    gopracDB?: string;
    ist?: string;
  }>({});
  const [availableTopics, setAvailableTopics] = useState<{[key: string]: any[]}>({});
  const [filteredCompetencySubjects, setFilteredCompetencySubjects] = useState<any[]>([]);
  
  // IAS-specific fields
  const [iasJobLink, setIasJobLink] = useState("");
  const [iasCompanyLogo, setIasCompanyLogo] = useState("");
  
  // Link display states (matches KO.js linkbox, copybox)
  const [showLinkBox, setShowLinkBox] = useState(false);
  const [showCopyBox, setShowCopyBox] = useState(false);
  const [displayMsg, setDisplayMsg] = useState("");
  
  // Company logo (for both RAS and IAS)
  const [companyLogo, setCompanyLogo] = useState("");

  // misc
  const [saving, setSaving] = useState(false);

  // ---------- Utility: simple notify helper ----------
  function showNotify(type: "success" | "error", text: string) {
    setNotify({ type, text });
    setTimeout(() => setNotify(null), 4000);
  }

  // ---------- Filter competency subjects when role changes ----------
  useEffect(() => {
    if (domainRoleId && competencySubjects.length > 0) {
      const filtered = competencySubjects.filter((c: any) => 
        !c.roleId || c.roleId === domainRoleId || c.roleId === "null"
      );
      setFilteredCompetencySubjects(filtered);
    } else {
      setFilteredCompetencySubjects(competencySubjects);
    }
  }, [domainRoleId, competencySubjects]);

  // ---------- Filter skills based on mandatory selection (Skill Cascading) ----------
  useEffect(() => {
    // Ultra-mandatory skills must be a subset of required skills
    // When required skills change, keep only ultra-mandatory skills that are still in required
    if (requiredSkills.length > 0 && ultraMandatorySkill.length > 0) {
      const filteredUltra = ultraMandatorySkill.filter(s => requiredSkills.includes(s));
      if (filteredUltra.length !== ultraMandatorySkill.length) {
        setUltraMandatorySkill(filteredUltra);
      }
    } else if (requiredSkills.length === 0) {
      // If no required skills, clear ultra-mandatory
      setUltraMandatorySkill([]);
    }
  }, [requiredSkills]);

  // ---------- Handle mandatory skill change (cascading logic) ----------
  const handleMandatorySkillChange = useCallback((newRequiredSkills: string[]) => {
    setRequiredSkills(newRequiredSkills);
    
    // Remove selected mandatory skills from ultraMandatory if they exist there
    const filteredUltra = ultraMandatorySkill.filter(skill => !newRequiredSkills.includes(skill));
    if (filteredUltra.length !== ultraMandatorySkill.length) {
      setUltraMandatorySkill(filteredUltra);
    }
    
    // Remove selected mandatory skills from goodToHave if they exist there
    const filteredGood = goodToHaveSkill.filter(skill => !newRequiredSkills.includes(skill));
    if (filteredGood.length !== goodToHaveSkill.length) {
      setGoodToHaveSkill(filteredGood);
    }
  }, [ultraMandatorySkill, goodToHaveSkill]);

  // ---------- Handle ultra mandatory skill change (cascading logic) ----------
  const handleUltraMandatorySkillChange = useCallback((newUltraSkills: string[]) => {
    setUltraMandatorySkill(newUltraSkills);
    
    // Remove selected ultra mandatory skills from goodToHave if they exist there
    const combinedMandatory = [...requiredSkills, ...newUltraSkills];
    const filteredGood = goodToHaveSkill.filter(skill => !combinedMandatory.includes(skill));
    if (filteredGood.length !== goodToHaveSkill.length) {
      setGoodToHaveSkill(filteredGood);
    }
  }, [requiredSkills, goodToHaveSkill]);

  // ---------- Get available skills for dropdown (filtered by previous selections) ----------
  function getAvailableSkillsForUltraMandatory(): any[] {
    return availableUltraMandatorySkills;
  }

  function getAvailableSkillsForGoodToHave(): any[] {
    return availableGoodToHaveSkills;
  }

  // ---------- Handle service type change behavior (IAS vs RAS) ----------
  useEffect(() => {
    if (serviceType === "IAS") {
      // IAS: disable "Do Not Promote" checkbox
      setDoNotPromote(false);
      // When IAS is selected, uncheck Collect Candidate Information
      setAdvancedProfileMatch("N");
      setACandidateResume("N");
      setACandidateNoticePeriod("N");
      setACandidateTotalWorkExp("N");
      setACandidateCurrentLocation("N");
      setACandidateCurrentSalary("N");
      setACandidateExpectedSalary("N");
      setACandidateCurrentCompany("N");
    } else if (serviceType === "RAS") {
      // RAS: enable "Do Not Promote"
      // When RAS is selected, check Collect Candidate Information by default
      setAdvancedProfileMatch("Y");
      setACandidateResume("Y");
      setACandidateNoticePeriod("Y");
      setACandidateTotalWorkExp("Y");
      setACandidateCurrentLocation("Y");
      setACandidateCurrentSalary("Y");
      setACandidateExpectedSalary("Y");
      setACandidateCurrentCompany("Y");
    }
  }, [serviceType]);

  // ---------- Toggle promotion checkboxes (matches KO.js togglePromote logic) ----------
  const handlePromotionCheckboxChange = useCallback((checkboxName: string, value: boolean) => {
    // If "Do Not Promote" is checked, uncheck all others
    if (checkboxName === "doNotPromote" && value) {
      setPromoteGopracDB(false);
      setPromoteSocial(false);
      setPromoteLinkedIn(false);
      setPromoteNaukri(false);
      setPromoteIST(false);
      setDoNotPromote(true);
    } else if (checkboxName === "doNotPromote" && !value) {
      setDoNotPromote(false);
    } else {
      // If any promotion checkbox is checked, uncheck "Do Not Promote"
      if (value) {
        setDoNotPromote(false);
      }
      
      // Update the specific checkbox
      switch (checkboxName) {
        case "gopracDB":
          setPromoteGopracDB(value);
          break;
        case "social":
          setPromoteSocial(value);
          break;
        case "linkedIn":
          setPromoteLinkedIn(value);
          break;
        case "naukri":
          setPromoteNaukri(value);
          break;
        case "ist":
          setPromoteIST(value);
          break;
      }
    }
  }, []);

  // ---------- Fetch filters on page load ----------
  useEffect(() => {
    fetchFilters();
  }, [currentUserId, currentUserType]);

  async function fetchFilters() {
    setFilterLoading(true);
    try {
      const res = await fetch(`${apiHost}/index.php?getinterviewCreationFilters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, userType: currentUserType }),
      });
      const json = await res.json();
      if (json?.status === 1) {
        const d = json.data;
        setFilters(d);
        setCompanyNames(d.companyNames || []);
        setCompanyUrls(d.companyUrls || []);
        setRoleNames(d.roleNames || []);
        setCompetencySubjects(d.competencySubject || []);
        setFilteredCompetencySubjects(d.competencySubject || []);
        setSkillsList(d.skills || []);
        setLocationsMaster(d.locations || []);
        const interviews = d.interviewList || [];
        setInterviewList(interviews);
      } else {
        showNotify("error", "Unable to fetch filters");
      }
    } catch (err) {
      showNotify("error", "Error fetching filters");
    }
    setFilterLoading(false);
  }

  // ---------- When user selects interview (modify mode) fetch attempt details & edit details ----------
  useEffect(() => {
    if (mode === "modify" && selectedInterviewId) {
      // Reset interview structure fields before loading new interview
      setCreateInterviewOption("no");
      setInterviewSections([]);
      setIncludeBehavioral(false);
      
      fetchAttemptDetails([selectedInterviewId]);
      fetchEditInterviewDetails([selectedInterviewId]);
    } else if (mode === "create") {
      // Reset all form fields when switching to create mode
      resetAllFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedInterviewId]);

  // ---------- Reset all form fields ----------
  function resetAllFields() {
    // Basic fields
    setCompanyIdList([]);
    setServiceType("");
    setJobName("");
    setRecruiterEmail("");
    setCompanyUrl("");
    setJobStartDate("");
    setJobExpireDate("");
    setJobIndustryType([]);
    setHeadcount("");
    setOutstation("");
    setApmType("");
    setEmploymentType("");
    setBondAgreementRequired("");
    setCompanyEmployeeStrength("");
    setWorkingDays("");
    setJobMode([]);
    setJobShift([]);
    setSalaryMin("");
    setSalaryMax("");
    setNoticePeriod("");
    setJobLocationIds([]);
    setRequiredSkills([]);
    setUltraMandatorySkill([]);
    setGoodToHaveSkill([]);
    setSkillText("");
    setJobDescriptionHtml("");
    setShowJDSection("Y");
    setRequestText("");
    setApmReady("");
    
    // Skill dialog
    setSkillSearch("");
    setSkillDialogOpen(false);
    
    // Role and competency
    setDomainRoleId("");
    setCompetencySubjectId([]);
    
    // JD file
    setJdFileName(null);
    setJdFileUrl(null);
    setJdFileType(null);
    setJdUploadError("");
    setJdUploadSuccess("");
    setJdUploading(false);
    
    // Experience range
    setExpMin("");
    setExpMax("");
    
    setSalaryRangeVisible("N");
    
    // Candidate Declaration toggles
    setDeclEmploymentType("Y");
    setDeclWorkingDays("Y");
    setDeclJobMode("Y");
    setDeclJobShift("Y");
    setDeclCompanyJobLocation("Y");
    
    // Candidate collection toggles
    setACandidateResume("Y");
    setACandidateNoticePeriod("Y");
    setACandidateTotalWorkExp("Y");
    setACandidateCurrentLocation("Y");
    setACandidateCurrentSalary("Y");
    setACandidateExpectedSalary("Y");
    setACandidateCurrentCompany("Y");
    
    // AI Screening Interview
    setCreateInterviewOption("no");
    
    // Job Promotion
    setPromoteGopracDB(false);
    setPromoteSocial(false);
    setPromoteLinkedIn(false);
    setPromoteNaukri(false);
    setPromoteIST(false);
    setDoNotPromote(false);
    
    // Other fields
    setAdvancedProfileMatch("Y");
    setCandidateDeclaration("Y");
    setAdditionalInfo("Y");
    setShowJDSectionToggle("Y");
    setIncludeBehavioral(false);
    setValidationState(0);
    setPendingInterview("");
    setAttemptDetails(0);
    setGeneratedLinks({});
    
    // Interview sections
    setInterviewSections([]);
    
    // IAS-specific fields
    setIasJobLink("");
    setIasCompanyLogo("");
    
    // Company logo
    setCompanyLogo("");
    
    // Link display states
    setShowLinkBox(false);
    setShowCopyBox(false);
    setDisplayMsg("");
    
    // Selected interview
    setSelectedInterviewId("");
  }

  async function fetchAttemptDetails(preInterviewIdArray: string[]) {
    setLoading(true);
    try {
      const res = await fetch(`${apiHost}/index.php?getAttempdetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, userType: currentUserType, preInterviewId: preInterviewIdArray }),
      });
      const json = await res.json();
      if (json?.status === 1) {
        const d = json.data;
        // populate fields using jobForm & preference as viewmodel expects
        const jobForm = (d.jobForm && d.jobForm[0]) || {};
        // main mapping - follow your viewmodel / backend keys
        setCompanyIdList(jobForm.company_id ? String(jobForm.company_id).split(",") : []);
        setJobName(jobForm.interviewName || "");
        setRecruiterEmail(jobForm.RecruiterEmail || "");
        setCompanyUrl(jobForm.company_url || "");
        setJobStartDate(jobForm.interviewStartDate || "");
        setJobExpireDate(jobForm.interviewExpireDate || "");
        setJobIndustryType(
          jobForm.vcdJobIndustryType
            ? (Array.isArray(jobForm.vcdJobIndustryType)
                ? jobForm.vcdJobIndustryType
                : String(jobForm.vcdJobIndustryType).split(',').filter(Boolean))
            : []
        );
        setHeadcount(jobForm.iHeadcount || "");
        setOutstation(jobForm.outstationFlag === "Y" ? "Y" : jobForm.outstationFlag === "N" ? "N" : "");
        setApmType(jobForm.apmType || "");
        setRequiredSkills(jobForm.requiredSkills ? String(jobForm.requiredSkills).split(/\s*,\s*/) : []);
        setUltraMandatorySkill(jobForm.ultraMandatorySkill ? String(jobForm.ultraMandatorySkill).split(/\s*,\s*/) : []);
        setGoodToHaveSkill(jobForm.goodToHaveSkill ? String(jobForm.goodToHaveSkill).split(/\s*,\s*/) : []);
        setShowJDSection(jobForm.showJDsection === "Y" ? "Y" : "N");
        setJobDescriptionHtml(jobForm.JDsection || "");
        setEmploymentType(jobForm.employmentType || "");
        setBondAgreementRequired(jobForm.bondAgreementRequired || "");
        setWorkingDays(jobForm.iWorkingDays || "");
        setJobMode(
          jobForm.iJobMode
            ? (Array.isArray(jobForm.iJobMode)
                ? jobForm.iJobMode
                : String(jobForm.iJobMode).split(',').filter(Boolean))
            : []
        );
        setJobShift(
          jobForm.ishift
            ? (Array.isArray(jobForm.ishift)
                ? jobForm.ishift
                : String(jobForm.ishift).split(',').filter(Boolean))
            : []
        );
        setNoticePeriod(jobForm.inoticePeriod || "");
        setCompanyEmployeeStrength(jobForm.iStrength || "");
        setServiceType(jobForm.serviceType || "");
        setDomainRoleId(jobForm.roleId || "");
        setCompetencySubjectId(
          jobForm.subjectId
            ? (Array.isArray(jobForm.subjectId)
                ? jobForm.subjectId
                : String(jobForm.subjectId).split(',').filter(Boolean))
            : []
        );
        
        // Attempt details count
        if (d.attemptedDetails !== undefined) {
          setAttemptDetails(Number(d.attemptedDetails));
        }
        
        // preferences
        setProfilePreferences(d.preference || []);
        setSkillsList(d.skills || skillsList);
        setLocationsMaster(d.locations || locationsMaster);
        
        // Parse preference array to populate fields
        if (d.preference && Array.isArray(d.preference)) {
          const organizedData: Record<string, string> = {};
          d.preference.forEach((item: any) => {
            if (item.fieldName && item.fieldValue) {
              organizedData[item.fieldName] = item.fieldValue;
            }
          });

          // Experience Range: "2-5" -> expMin=2, expMax=5
          if (organizedData.workExperience) {
            const parts = organizedData.workExperience.split('-');
            if (parts.length === 2) {
              setExpMin(parts[0].trim());
              setExpMax(parts[1].trim());
            }
          }

          // Salary Range: "400000-5000000" -> salaryMin=400000, salaryMax=5000000
          if (organizedData.currentSalary) {
            const parts = organizedData.currentSalary.split('-');
            if (parts.length === 2) {
              setSalaryMin(parts[0].trim());
              setSalaryMax(parts[1].trim());
            }
          }

          // Job Shift: "Day Shift" (single value or comma-separated)
          if (organizedData.shift) {
            const shifts = organizedData.shift.split(',').map((s: string) => s.trim()).filter(Boolean);
            setJobShift(shifts);
          }

          // Notice Period: "Immediate" (single value)
          if (organizedData.noticePeriod) {
            setNoticePeriod(organizedData.noticePeriod);
          }

          // Job Mode: workLocationPreference -> "Office", "Remote", etc.
          if (organizedData.workLocationPreference) {
            const modes = organizedData.workLocationPreference.split(',').map((m: string) => m.trim()).filter(Boolean);
            setJobMode(modes);
          }

          // Job Location: currentLocation -> "153" (location ID)
          if (organizedData.currentLocation) {
            const locationIds = organizedData.currentLocation.split(',').map((loc: string) => loc.trim()).filter(Boolean);
            setJobLocationIds(locationIds);
          }

          // Job Industry Type: jobType (comma-separated industry types)
          if (organizedData.jobType) {
            const industryTypes = organizedData.jobType.split(',').map((type: string) => type.trim()).filter(Boolean);
            setJobIndustryType(industryTypes);
          }
        }
        
        setAttemptDetails(d.attemptedDetails || 0);
        
        // Generate job link (matches viewmodel getAttemptDetails)
        const jobLink = `${window.location.origin}/job?p=${jobForm.id}`;
        setIasJobLink(jobLink);
        console.log("Generated job link:", jobLink);
        
        // Set pending interview flag based on attemptDetails (matches viewmodel)
      } else {
        showNotify("error", "Unable to fetch interview details");
      }
    } catch (err) {
      showNotify("error", "Error fetching attempt details");
    }
    setLoading(false);
  }

  async function fetchEditInterviewDetails(preInterviewIdArray: string[]) {
    setLoading(true);
    try {
      const res = await fetch(`${apiHost}/index.php?editInterviewDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, userType: currentUserType, preInterviewId: preInterviewIdArray }),
      });
      const json = await res.json();
      if (json?.status === 1) {
        const d = json.data;
        
        // Basic fields
        if (d.jobName) setJobName(d.jobName);
        if (d.serviceType) setServiceType(d.serviceType);
        if (d.recruiterEmail) setRecruiterEmail(d.recruiterEmail);
        if (d.companyUrl) setCompanyUrl(d.companyUrl);
        if (d.domainRoleId || d.roleId) setDomainRoleId(d.domainRoleId || d.roleId);
        if (d.competencySubjectId || d.subjectId) {
          const value = d.competencySubjectId || d.subjectId;
          setCompetencySubjectId(
            Array.isArray(value) ? value : 
            typeof value === 'string' ? value.split(',').filter(Boolean) : []
          );
        }
        if (d.jobIndustryType || d.jobType) {
          const value = d.jobIndustryType || d.jobType;
          setJobIndustryType(
            Array.isArray(value) ? value : 
            typeof value === 'string' ? value.split(',').filter(Boolean) : []
          );
        }
        
        // Dates - convert from API format to YYYY-MM-DD
        if (d.jobStartDate || d.interviewStartDate) {
          setJobStartDate(formatDateForInput(d.jobStartDate || d.interviewStartDate));
        }
        if (d.jobExpireDate || d.interviewEndDate) {
          setJobExpireDate(formatDateForInput(d.jobExpireDate || d.interviewEndDate));
        }
        // Note: submitBeforeDate is separate from jobExpireDate in some workflows
        // Not setting it here to avoid overwriting jobExpireDate
        
        // Numeric fields
        if (d.headcount !== undefined && d.headcount !== null) {
          setHeadcount(d.headcount.toString());
        }
        
        // Skills - map from API format to array of skill IDs
        if (d.requiredSkills && Array.isArray(d.requiredSkills)) {
          const skillIds = d.requiredSkills.map((s: any) => s.skillId || s.id || s);
          setRequiredSkills(skillIds);
        }
        if (d.ultraMandatorySkill && Array.isArray(d.ultraMandatorySkill)) {
          const skillIds = d.ultraMandatorySkill.map((s: any) => s.skillId || s.id || s);
          setUltraMandatorySkill(skillIds);
        }
        if (d.goodToHaveSkill && Array.isArray(d.goodToHaveSkill)) {
          const skillIds = d.goodToHaveSkill.map((s: any) => s.skillId || s.id || s);
          setGoodToHaveSkill(skillIds);
        }
        
        // Salary fields
        if (d.salaryMin !== undefined && d.salaryMin !== null) {
          setSalaryMin(d.salaryMin.toString());
        }
        if (d.salaryMax !== undefined && d.salaryMax !== null) {
          setSalaryMax(d.salaryMax.toString());
        }
        if (d.salaryRangeVisible !== undefined) {
          setSalaryRangeVisible(d.salaryRangeVisible === "Y" ? "Y" : "N");
        }
        
        // Experience fields
        if (d.expMin !== undefined && d.expMin !== null) {
          setExpMin(d.expMin.toString());
        }
        if (d.expMax !== undefined && d.expMax !== null) {
          setExpMax(d.expMax.toString());
        }
        
        // Notice period
        if (d.noticePeriod !== undefined && d.noticePeriod !== null) {
          setNoticePeriod(d.noticePeriod.toString());
        }
        
        // Job details
        if (d.jobDescriptionHtml || d.jobDescription) {
          setJobDescriptionHtml(d.jobDescriptionHtml || d.jobDescription);
        }
        if (d.requestText) setRequestText(d.requestText);
        
        // Job location IDs
        if (d.jobLocationIds && Array.isArray(d.jobLocationIds)) {
          setJobLocationIds(d.jobLocationIds.map((l: any) => l.toString()));
        } else if (d.iJobLocation) {
          // iJobLocation might be comma-separated string
          const locations = typeof d.iJobLocation === 'string' 
            ? d.iJobLocation.split(',').filter(Boolean).map((l: string) => l.trim())
            : Array.isArray(d.iJobLocation) ? d.iJobLocation.map((l: any) => l.toString()) : [];
          setJobLocationIds(locations);
        }
        
        // Employment details
        if (d.employmentType) setEmploymentType(d.employmentType);
        if (d.workingDays) setWorkingDays(d.workingDays);
        if (d.jobMode || d.iJobMode) {
          const value = d.jobMode || d.iJobMode;
          setJobMode(
            Array.isArray(value) ? value : 
            typeof value === 'string' ? value.split(',').filter(Boolean) : []
          );
        }
        if (d.jobShift || d.ishift) {
          const value = d.jobShift || d.ishift;
          setJobShift(
            Array.isArray(value) ? value : 
            typeof value === 'string' ? value.split(',').filter(Boolean) : []
          );
        }
        if (d.outstation !== undefined) {
          // Handle multiple formats: "Y", "Yes", true, 1, etc.
          const isYes = d.outstation === "Y" || d.outstation === "Yes" || d.outstation === true || d.outstation === 1 || d.outstation === "1";
          setOutstation(isYes ? "Y" : "N");
        }
        if (d.bondAgreementRequired) setBondAgreementRequired(d.bondAgreementRequired);
        if (d.companyEmployeeStrength) setCompanyEmployeeStrength(d.companyEmployeeStrength);
        
        // APM fields
        if (d.apmType) setApmType(d.apmType);
        if (d.apmReady) setApmReady(d.apmReady);
        
        // JD file
        if (d.jdFileName) setJdFileName(d.jdFileName);
        if (d.jdFileUrl) setJdFileUrl(d.jdFileUrl);
        
        // Show JD section toggle
        if (d.showJDsection !== undefined) {
          setShowJDSection(d.showJDsection === "Y" ? "Y" : "N");
        }
        
        // Candidate Declaration toggles
        if (d.declEmploymentType !== undefined) {
          setDeclEmploymentType(d.declEmploymentType === "Y" ? "Y" : "N");
        }
        if (d.declWorkingDays !== undefined) {
          setDeclWorkingDays(d.declWorkingDays === "Y" ? "Y" : "N");
        }
        if (d.declJobMode !== undefined) {
          setDeclJobMode(d.declJobMode === "Y" ? "Y" : "N");
        }
        if (d.declJobShift !== undefined) {
          setDeclJobShift(d.declJobShift === "Y" ? "Y" : "N");
        }
        if (d.declCompanyJobLocation !== undefined) {
          setDeclCompanyJobLocation(d.declCompanyJobLocation === "Y" ? "Y" : "N");
        }
        
        // Candidate collection toggles
        if (d.aCandidateResume !== undefined) {
          setACandidateResume(d.aCandidateResume === "Y" ? "Y" : "N");
        }
        if (d.aCandidateNoticePeriod !== undefined) {
          setACandidateNoticePeriod(d.aCandidateNoticePeriod === "Y" ? "Y" : "N");
        }
        if (d.aCandidateTotalWorkExp !== undefined) {
          setACandidateTotalWorkExp(d.aCandidateTotalWorkExp === "Y" ? "Y" : "N");
        }
        if (d.aCandidateCurrentLocation !== undefined) {
          setACandidateCurrentLocation(d.aCandidateCurrentLocation === "Y" ? "Y" : "N");
        }
        if (d.aCandidateCurrentSalary !== undefined) {
          setACandidateCurrentSalary(d.aCandidateCurrentSalary === "Y" ? "Y" : "N");
        }
        if (d.aCandidateExpectedSalary !== undefined) {
          setACandidateExpectedSalary(d.aCandidateExpectedSalary === "Y" ? "Y" : "N");
        }
        if (d.aCandidateCurrentCompany !== undefined) {
          setACandidateCurrentCompany(d.aCandidateCurrentCompany === "Y" ? "Y" : "N");
        }
        
        // Promotion values - map to individual checkboxes
        if (d.promoteValue && Array.isArray(d.promoteValue)) {
          const promotions = d.promoteValue.map((p: any) => p.jobpromotion);
          setPromoteGopracDB(promotions.includes("G"));
          setPromoteSocial(promotions.includes("S"));
          setPromoteLinkedIn(promotions.includes("L"));
          setPromoteNaukri(promotions.includes("NK"));
          setPromoteIST(promotions.includes("I"));
          setDoNotPromote(promotions.includes("NONE"));
        }
        
        // Interview structure - map from SCPS format or interviewSections
        if (d.scps && Array.isArray(d.scps) && d.scps.length > 0) {
          const sections = d.scps.map((scp: any) => ({
            id: scp.id || Date.now() + Math.random(),
            sectionTitle: scp.sectionTitle || scp.title || "",
            difficultyLevel: scp.difficultyLevel || scp.difficulty || "Medium",
            topicId: scp.topicId || scp.topic || "",
            subject1: scp.subject1 || "",
            subject2: scp.subject2 || "",
            isAssessment: scp.isAssessment || false,
          }));
          setInterviewSections(sections);
        } else if (d.interviewSections && Array.isArray(d.interviewSections)) {
          setInterviewSections(d.interviewSections);
        }
        
        // Additional fields based on service type
        if (d.serviceType === "IAS") {
          if (d.iasJobLink) setIasJobLink(d.iasJobLink);
          if (d.iasCompanyLogo) setIasCompanyLogo(d.iasCompanyLogo);
        }
        
        // Company logo (for both RAS and IAS)
        if (d.companyLogo) setCompanyLogo(d.companyLogo);
        
        // Company ID list
        if (d.companyIdList && Array.isArray(d.companyIdList)) {
          setCompanyIdList(d.companyIdList.map((id: any) => id.toString()));
        }
        
        // Success message
        showNotify("success", "Job details loaded for editing");
      } else {
        showNotify("error", "Unable to fetch interview edit details");
      }
    } catch (err) {
      console.error("Error fetching interview edit details:", err);
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      showNotify("error", `Error loading job: ${errorMsg}`);
    }
    setLoading(false);
  }
  
  // Helper function to format date from API format to input format (YYYY-MM-DD)
  function formatDateForInput(dateString: string): string {
    if (!dateString) return "";
    try {
      // Handle various date formats from API
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  }

  // ---------- Skill dialog behavior ----------
  useEffect(() => {
    // enable Add only when skillSearch is non-empty and not present in skillsList (case-insensitive)
    const exists = skillsList.some((s) => {
      const n = s.favourite_subject || s.name || "";
      return n.trim().toLowerCase() === skillSearch.trim().toLowerCase();
    });
    setSkillAddDisabled(!skillSearch.trim() || exists);
  }, [skillSearch, skillsList]);

  async function handleAddSkill() {
    if (!skillSearch.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiHost}/index.php?addSkillMaster`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favourite_subject: skillSearch.trim() }),
      });
      const json = await res.json();
      if (json?.status === 1) {
        // refresh skill list (we can call getinterviewCreationFilters or getAttempdetails depending on mode)
        await fetchFilters();
        setSkillDialogOpen(false);
        setSkillSearch("");
        showNotify("success", "Skill added");
      } else {
        showNotify("error", json?.errorCode || "Error adding skill");
      }
    } catch (err) {
      showNotify("error", "Error adding skill");
    }
    setLoading(false);
  }

  // ---------- JD file select with auto-upload (matches viewmodel) ----------
  async function handleJdFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset messages
    setJdUploadError("");
    setJdUploadSuccess("");
    setJdUploading(true);

    // File extension validation
    const allowedExtensions = /\.(pdf|docx)$/i;
    if (!allowedExtensions.test(file.name)) {
      setJdUploadError("Please select a PDF or DOCX file.");
      setTimeout(() => setJdUploadError(""), 3000);
      setJdUploading(false);
      e.target.value = ""; // Clear input
      return;
    }

    // File size validation (10MB max)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setJdUploadError("File size exceeds limit (10MB max).");
      setTimeout(() => setJdUploadError(""), 3000);
      setJdUploading(false);
      e.target.value = ""; // Clear input
      return;
    }

    // Auto-upload to S3
    await uploadJdToS3(file);
    e.target.value = ""; // Clear input for potential re-upload
  }

  // ---------- Handle company selection to populate URL ----------
  const handleCompanyChange = useCallback((selectedCompanyId: string) => {
    if (selectedCompanyId === "none") {
      setCompanyIdList([]);
      setCompanyUrl("");
      return;
    }
    setCompanyIdList([selectedCompanyId]);
    // Find the selected company from companyUrls and populate URL
    const selectedCompany = companyUrls.find((c: any) => String(c.company_id) === selectedCompanyId);
    if (selectedCompany && selectedCompany.company_url) {
      setCompanyUrl(selectedCompany.company_url);
    } else {
      setCompanyUrl("");
    }
  }, [companyUrls]);

  // ---------- Upload JD to S3 using AWS SDK (matches viewmodel) ----------
  async function uploadJdToS3(file: File) {
    try {
      // Get AWS SDK from window
      const AWS = (window as any).AWS;
      if (!AWS) {
        throw new Error("AWS SDK not loaded");
      }

      // Determine content type and file extension
      let contentType: string;
      let fileExt: string;
      let fileTypeIcon: "pdf" | "docx";

      if (file.type === "application/pdf") {
        contentType = "application/pdf";
        fileExt = "pdf";
        fileTypeIcon = "pdf";
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        fileExt = "docx";
        fileTypeIcon = "docx";
      } else {
        throw new Error("Unsupported file type");
      }

      // Generate filename: companyId_jobName_JD.ext (matches viewmodel)
      const companyId = companyIdList[0] || "unknown";
      const jobNameClean = jobName.replace(/[^a-zA-Z0-9]/g, "_") || "job";
      const newFileName = `${companyId}_${jobNameClean}_JD.${fileExt}`;

      // Configure AWS (empty keys as in viewmodel)
      AWS.config.update({
        accessKeyId: "",
        secretAccessKey: "",
        region: "ap-south-1",
      });

      const s3 = new AWS.S3();
      const bucketName = "tempgoprac";

      // Upload parameters
      const uploadParams = {
        Bucket: bucketName,
        Key: newFileName,
        Body: file,
        ContentType: contentType,
        ACL: "public-read",
        Metadata: {
          "Content-Disposition": `attachment; filename="${newFileName}"`,
        },
      };

      // Upload to S3
      const data = await s3.upload(uploadParams).promise();
      
      // Update state on success
      setJdFileUrl(data.Location);
      setJdFileName(newFileName);
      setJdFileType(fileTypeIcon);
      setJdUploadSuccess("File uploaded successfully");
      setJdUploadError("");
      
      console.log("File uploaded successfully:", data.Location);
    } catch (err: any) {
      console.error("Error uploading file:", err);
      setJdUploadError("Error uploading the file");
      setJdFileUrl(null);
      setJdFileName(null);
      setJdFileType(null);
    } finally {
      setJdUploading(false);
      // Clear success message after 3 seconds
      setTimeout(() => setJdUploadSuccess(""), 3000);
    }
  }
  
  // ---------- Remove uploaded JD file ----------
  function handleRemoveJD() {
    setJdFileName(null);
    setJdFileUrl(null);
    setJdFileType(null);
    setJdUploadError("");
    setJdUploadSuccess("");
    setJdUploading(false);
  }



  // ---------- Load topics for selected subject(s) ----------
  async function loadTopicsForSubject(subjectId: string) {
    if (!subjectId) return;
    
    // Collect all selected subjects from interview sections
    const allSelectedSubjects = interviewSections
      .map(s => s.subject)
      .filter(s => s);
    
    // Add the current subject if not already included
    if (!allSelectedSubjects.includes(subjectId)) {
      allSelectedSubjects.push(subjectId);
    }
    
    // Make API call with comma-separated subject IDs
    const subjectIds = allSelectedSubjects.join(',');
    
    try {
      const res = await fetch(`${apiHost}/index.php?getInterviewTopics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: currentUserId, 
          userType: currentUserType,
          subjectId: subjectIds
        }),
      });
      const json = await res.json();
      if (json?.status === 1 && json?.data?.topicList) {
        // Group topics by subjectId for easy lookup
        const topicsBySubject: {[key: string]: any[]} = {};
        json.data.topicList.forEach((topic: any) => {
          const sid = String(topic.subjectId);
          if (!topicsBySubject[sid]) {
            topicsBySubject[sid] = [];
          }
          topicsBySubject[sid].push({
            id: topic.topicId,
            name: topic.topicName,
            subjectId: topic.subjectId
          });
        });
        
        // Update available topics state
        setAvailableTopics(prev => ({
          ...prev,
          ...topicsBySubject
        }));
      }
    } catch (err) {
      console.error("Error loading topics", err);
    }
  }

  // ---------- Helper function to show alert ----------
  function dAlert(msg: string) {
    showNotify("error", msg);
  }

  // ---------- Remove interview section with validation ----------
  function handleRemoveSection(index: number) {
    const newSections = interviewSections.filter((_, i) => i !== index);
    setInterviewSections(newSections);
    showNotify("success", "Section removed successfully");
  }

  // ---------- Update interview section field ----------
  function updateInterviewSection(index: number, field: keyof InterviewSection, value: any) {
    const newSections = [...interviewSections];
    newSections[index] = { ...newSections[index], [field]: value };
    setInterviewSections(newSections);

    // If subject changed, load topics
    if (field === "subject" && value) {
      const subjectIds = Array.isArray(value) ? value : [value];
      subjectIds.forEach(subId => {
        if (subId) {
          loadTopicsForSubject(subId);
        }
      });
    }
  }

  // ---------- Get available subjects for dropdown (filter out already selected) ----------
  function getAvailableSubjects(currentIdx?: number): any[] {
    // Get all selected subjects except from current row
    const selectedSubjects = interviewSections
      .map((s, idx) => (idx !== currentIdx ? s.subject : null))
      .filter(s => s);
    
    // Filter out already selected subjects
    return filteredCompetencySubjects.filter(
      (subject: any) => !selectedSubjects.includes(String(subject.id))
    );
  }

  // ---------- Add New Section with validation (matches jQuery addNewRow logic) ----------
  function handleAddNewSection() {
    const rowCount = interviewSections.length;

    // Validation: if there are existing rows, validate the last one
    if (rowCount > 0) {
      const lastSection = interviewSections[rowCount - 1];

      // Check if subject is selected
      if (!lastSection.subject || lastSection.subject === "") {
        dAlert("Pls Select Min One Subject");
        return;
      }

      // Check if difficulty level is selected
      if (!lastSection.level || lastSection.level.length === 0) {
        dAlert("Pls Select Difficulty Level");
        return;
      }

      // Check if assessment subject is selected
      if (!lastSection.aSubject || lastSection.aSubject.length === 0) {
        dAlert("Pls Select Assessment Subjects");
        return;
      }

      // Validation: if more than 1 row, check difficulty level consistency
      if (rowCount > 1) {
        const prevSection = interviewSections[rowCount - 2];
        if (prevSection.level[0] !== lastSection.level[0]) {
          dAlert(
            "Pls re check Difficulty Level of the Section it should be same for all the sections"
          );
          return;
        }

        // Validation: only one section can have aSubject = "2"
        if (
          prevSection.aSubject[0] === "2" &&
          lastSection.aSubject[0] === "2"
        ) {
          dAlert(
            "Pls select 2 assessment subjects for any section, but only once per interview."
          );
          return;
        }
      }

      // Calculate total selected assessment subjects
      let selectedAssessmentSub = 0;
      for (let i = 0; i < rowCount; i++) {
        selectedAssessmentSub += parseInt(interviewSections[i].aSubject[0] || "0");
      }

      if (selectedAssessmentSub >= 4) {
        dAlert("Already Four Subjects are marked for this interview");
        return;
      }
    }

    // Limit to 3 sections (matching jQuery rowCount > 3 check)
    if (rowCount >= 3) {
      dAlert("There is no other section");
      return;
    }

    // Add new section
    setInterviewSections((s) => [
      ...s,
      {
        section: String(s.length + 3),
        subject: "",
        level: [],
        aSubject: [],
        cutOff: "",
        topics: [],
        speakingSkill: false,
      },
    ]);
  }

  // --- VALIDATION & INTERVIEW CREATION - SDE Expert Level ---
  async function createInterview(flag: string = "") {

  // ========== COMPREHENSIVE VALIDATION RULES (Matching KO.js) ==========
  
  // 1. Company validation
  if (!companyIdList || companyIdList.length === 0) {
    dAlert("Please select a company");
    return;
  }

  // 2. Service Type validation
  if (!serviceType) {
    dAlert("Please select service type (RAS or IAS)");
    return;
  }

  // 3. Role & Competency validation
  if (!domainRoleId) {
    dAlert("Please select a domain/role");
    return;
  }

  if (!competencySubjectId) {
    dAlert("Please select competency subject");
    return;
  }

  // 4. Job Name validation
  if (!jobName || jobName.trim() === "") {
    dAlert("Please enter job name");
    return;
  }

  // 5. Recruiter Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!recruiterEmail || !emailRegex.test(recruiterEmail)) {
    dAlert("Please enter a valid recruiter email address");
    return;
  }

  // 6. Date validations
  if (!jobStartDate) {
    dAlert("Please select job start date");
    return;
  }

  if (!jobExpireDate) {
    dAlert("Please select job expire date");
    return;
  }

  const startDate = new Date(jobStartDate);
  const expireDate = new Date(jobExpireDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Only validate past date when creating a new job, not when editing existing job
  if (mode === "create" && startDate < today) {
    dAlert("Job start date cannot be in the past");
    return;
  }

  if (expireDate <= startDate) {
    dAlert("Job expire date must be after start date");
    return;
  }

  // 7. Headcount validation
  if (!headcount) {
    dAlert("Please enter headcount");
    return;
  }

  const headcountNum = parseInt(headcount);
  if (isNaN(headcountNum) || headcountNum <= 0) {
    dAlert("Headcount must be a positive number");
    return;
  }

  // 8. Outstation validation
  if (!outstation) {
    dAlert("Please select outstation preference");
    return;
  }

  // 9. Employment Type validation
  if (!employmentType) {
    dAlert("Please select employment type");
    return;
  }

  // 10. Bond Agreement validation
  if (!bondAgreementRequired) {
    dAlert("Please select bond agreement requirement");
    return;
  }

  // 11. Skills validation
  if (!requiredSkills || requiredSkills.length === 0) {
    dAlert("Please select at least one mandatory skill");
    return;
  }

  if (!ultraMandatorySkill || ultraMandatorySkill.length === 0) {
    dAlert("Please select at least one ultra-mandatory skill");
    return;
  }

  // Validate ultra-mandatory is subset of mandatory
  const invalidUltra = ultraMandatorySkill.filter(s => !requiredSkills.includes(s));
  if (invalidUltra.length > 0) {
    dAlert("Ultra-mandatory skills must be selected from mandatory skills");
    return;
  }

  // 12. Additional Job Details validations (if section is enabled)
  if (additionalInfo === "Y") {
    // Work Experience validation
    if (!expMin) {
      dAlert("Please enter minimum work experience");
      return;
    }

    if (!expMax) {
      dAlert("Please enter maximum work experience");
      return;
    }

    const minExp = parseInt(expMin);
    const maxExp = parseInt(expMax);

    if (isNaN(minExp) || isNaN(maxExp)) {
      dAlert("Invalid work experience values");
      return;
    }

    if (minExp < 0 || maxExp < 0) {
      dAlert("Experience cannot be negative");
      return;
    }

    if (minExp > maxExp) {
      dAlert("Maximum experience must be greater than or equal to minimum experience");
      return;
    }

    // Salary validation (if visible)
    if (salaryRangeVisible === "Y") {
      if (!salaryMin || !salaryMax) {
        dAlert("Please enter salary range");
        return;
      }

      const minSal = parseInt(salaryMin.replace(/,/g, ""));
      const maxSal = parseInt(salaryMax.replace(/,/g, ""));

      if (isNaN(minSal) || isNaN(maxSal)) {
        dAlert("Invalid salary values");
        return;
      }

      if (minSal < 0 || maxSal < 0) {
        dAlert("Salary cannot be negative");
        return;
      }

      if (minSal !== 0 && minSal < 100000) {
        dAlert("Minimum salary should be at least 1 LPA (100000)");
        return;
      }

      if (maxSal < 100000) {
        dAlert("Maximum salary should be at least 1 LPA (100000)");
        return;
      }

      if (maxSal <= minSal) {
        dAlert("Maximum salary must be greater than minimum salary");
        return;
      }
    }

    // Job Location validation
    if (!jobLocationIds || jobLocationIds.length === 0) {
      dAlert("Please select at least one job location");
      return;
    }

    // Working Days validation
    if (!workingDays) {
      dAlert("Please enter working days");
      return;
    }

    // Job Mode validation
    if (!jobMode || jobMode.length === 0) {
      dAlert("Please select job mode (WFH/WFO/Hybrid)");
      return;
    }

    // Job Shift validation
    if (!jobShift || jobShift.length === 0) {
      dAlert("Please select job shift");
      return;
    }

    // Notice Period validation
    if (!noticePeriod) {
      dAlert("Please select notice period");
      return;
    }

    // Job Description validation (if JD section is enabled)
    if (showJDSectionToggle === "Y" && !jobDescriptionHtml && !jdFileName) {
      dAlert("Please enter job description or upload JD file");
      return;
    }
  }

  // 13. Company Employee Strength validation
  if (companyEmployeeStrength) {
    const strength = parseInt(companyEmployeeStrength);
    if (isNaN(strength) || strength <= 0) {
      dAlert("Company employee strength must be a positive number");
      return;
    }
  }

  // 14. RAS specific validations
  if (serviceType === "RAS") {
    // Advanced Profile Match is MANDATORY for RAS
    if (advancedProfileMatch !== "Y") {
      dAlert("Collect Candidate Information (Advanced Profile Match) is mandatory for RAS jobs");
      return;
    }
  }

  // 15. Job Promotion validation
  const hasPromotion = promoteGopracDB || promoteSocial || promoteLinkedIn || promoteNaukri || promoteIST;
  if (!hasPromotion && !doNotPromote) {
    dAlert("Please select at least one job promotion option or check 'Do Not Promote'");
    return;
  }

  // 16. Interview Structure validation (if creating interview now)
  if (createInterviewOption === "now") {
    if (interviewSections.length === 0 && !includeBehavioral) {
      dAlert("Please add at least one interview section or select 'Request Goprac To Create'");
      return;
    }
  }

  // ========== INTERVIEW STRUCTURE VALIDATION (Enhanced) ==========
  let interviewStructure: any[] = [];
  let hasError = false;
  let calculatedValidationState = 0;

  if (createInterviewOption === "now" && interviewSections.length > 0) {
    // Validate each section
    for (let idx = 0; idx < interviewSections.length; idx++) {
      const row = interviewSections[idx];
      
      if (!row.subject || row.subject.length === 0) {
        dAlert(`Section ${idx + 1}: Please select at least one subject`);
        return;
      }
      
      if (!row.level || row.level.length === 0) {
        dAlert(`Section ${idx + 1}: Please select difficulty level`);
        return;
      }
      
      if (!row.aSubject || row.aSubject.length === 0) {
        dAlert(`Section ${idx + 1}: Please select number of assessment subjects`);
        return;
      }
      
      if (!row.topics || row.topics.length < 3) {
        dAlert(`Section ${idx + 1}: Please select at least 3 topics`);
        return;
      }
      
      // Calculate validation state
      if ((row.section === "3" || row.section === "4") && row.aSubject.includes("2")) {
        calculatedValidationState = 2;
      } else if (calculatedValidationState !== 2 && ["3", "4", "5"].includes(row.section)) {
        calculatedValidationState = 1;
      }
      
      interviewStructure.push({
        section: row.section || (idx + 3).toString(),
        subject: row.subject,
        level: row.level.join(","),
        aSubject: row.aSubject.join(","),
        cutOff: row.cutOff || "",
        topics: row.topics.join(","),
      });
    }

    // Check difficulty level consistency across all sections
    if (interviewSections.length > 1) {
      const firstLevel = interviewSections[0].level[0];
      for (let i = 1; i < interviewSections.length; i++) {
        if (interviewSections[i].level[0] !== firstLevel) {
          dAlert("All sections must have the same difficulty level");
          return;
        }
      }
    }

    // Check total assessment subjects <= 4
    let totalAssessment = 0;
    interviewSections.forEach(sec => {
      if (sec.aSubject && sec.aSubject.length > 0) {
        totalAssessment += parseInt(sec.aSubject[0]);
      }
    });

    if (totalAssessment > 4) {
      dAlert("Total assessment subjects cannot exceed 4");
      return;
    }

    // Check for duplicate sections (2 subjects can only be selected once)
    let twoSubjectCount = 0;
    interviewSections.forEach(sec => {
      if (sec.aSubject && sec.aSubject[0] === "2") {
        twoSubjectCount++;
      }
    });

    if (twoSubjectCount > 1) {
      dAlert("Only one section can have 2 assessment subjects");
      return;
    }
  }
  
  setValidationState(calculatedValidationState);

  interviewStructure.sort((a, b) => Number(a.section) - Number(b.section));
  let coreSubject1 = "", coreSubject1Level = "";
  let coreSubject2 = "", coreSubject2Level = "";
  let codingSubject = "", codingSubjectLevel = "";
  let core1Topics = "", core2Topics = "", codingTopics = "";
  let core1CutOff = "", core2CutOff = "", codingCutOff = "";
  let difficultyLevel = "Basic,Average,Advanced";

  interviewStructure.forEach(item => {
    switch (item.section) {
      case "3":
        coreSubject1 = item.subject;
        coreSubject1Level = item.level;
        core1Topics = item.topics;
        core1CutOff = item.cutOff;
        difficultyLevel = item.level;
        break;
      case "4":
        coreSubject2 = item.subject;
        coreSubject2Level = item.level;
        core2Topics = item.topics;
        core2CutOff = item.cutOff;
        difficultyLevel = item.level;
        break;
      case "5":
        codingSubject = item.subject;
        codingSubjectLevel = item.level;
        codingTopics = item.topics;
        codingCutOff = item.cutOff;
        difficultyLevel = item.level;
        break;
      default: break;
    }
  });

  // Validation: Use your actual validations, adapted to state fields
  if (!companyIdList.length) return dAlert("Pls Enter company Name");
  if (!serviceType) return dAlert("Pls Enter Service Type");
  if (!domainRoleId) return dAlert("Pls Enter role");
  if (!competencySubjectId || competencySubjectId.length === 0) return dAlert("Pls Enter Competency");
  if (!jobName) return dAlert("Pls Enter Interview Name");
  if (!recruiterEmail) return dAlert("Pls Enter Recruiter Email");
  if (!jobStartDate) return dAlert("Pls Select Interview Start Date");
  if (!jobExpireDate) return dAlert("Pls Select Interview End Date");
  if (!headcount) return dAlert("Pls Enter Headcount");
  if (!outstation) return dAlert("Pls Select Outstation Candidates");
  if (!employmentType) return dAlert("Pls Select Employment Type");
  if (!bondAgreementRequired) return dAlert("Pls Select Bond Agreement Required");
  
  // Skills validation
  if (!requiredSkills.length) return dAlert("Please select minimum 1 mandatory skill.");
  if (!ultraMandatorySkill.length) return dAlert("Please select minimum 1 ultra mandatory skill.");
  
  // Additional Job Details validations - only if additionalInfo is checked
  if (additionalInfo === "Y") {
    if (!jobDescriptionHtml && !jdFileName) return dAlert("Pls Enter/Upload job description");
    if (!noticePeriod) return dAlert("Pls Enter Notice Period");
    if (!expMin) return dAlert("Pls Enter Minimum Exp Range");
    if (!salaryMin) return dAlert("Pls Enter Minimum salary in LPA");
    if (parseInt(salaryMin) !== 0 && parseInt(salaryMin) < 100000) {
      return dAlert("Minimum Salary should be greater than 1 LPA");
    }
    if (!salaryMax) return dAlert("Pls Enter Maximun salary in LPA");
    if (parseInt(salaryMax) < 100000) {
      return dAlert("Maximum Salary should be greater than 1 LPA");
    }
    if (parseFloat(salaryMax) <= parseFloat(salaryMin)) {
      return dAlert("Maximum salary should be greater than Minimum Salary");
    }
    if (!jobLocationIds.length) return dAlert("Pls Enter Job Location");
    if (!workingDays) return dAlert("Pls Enter Working Days");
    if (!jobMode || jobMode.length === 0) return dAlert("Pls Enter Job Mode");
    if (!jobShift || jobShift.length === 0) return dAlert("Pls Select shift");
  }
  
  // RAS validation: Advanced Profile Match (Collect Candidate Information) is MANDATORY for RAS
  if (serviceType === "RAS" && advancedProfileMatch !== "Y") {
    return dAlert("Collect Candidate Information (APM) is mandatory for RAS jobs");
  }
  
  // Interview creation checkbox validation - must select one option
  // (already handled by radio button default value "no")
  
  // Job Promotion validation - must select at least one promotion option
  if (!promoteSocial && !promoteLinkedIn && !promoteNaukri && !promoteGopracDB && !promoteIST && !doNotPromote) {
    return dAlert("Please choose at least one job promotion option");
  }

  // Promotion values - build from individual checkbox states
  function buildPromoteValue(): string {
    let codes = "";
    if (promoteSocial) codes += "S,";
    if (promoteLinkedIn) codes += "L,";
    if (promoteNaukri) codes += "N,";
    if (promoteGopracDB) codes += "G,";
    if (promoteIST) codes += "I,";
    return codes.endsWith(",") ? codes.slice(0, -1) : codes;
  }
  const promoteValue = buildPromoteValue();

  // JD file URL is already uploaded if jdFileUrl exists
  const uploadedJDUrl = jdFileUrl || "";

  // Payload
  const payload: any = {
    userId: currentUserId,
    userType: currentUserType,
    serviceType: serviceType,
    companyId: companyIdList, // Keep as array to match old page
    roleId: domainRoleId,
    subjectId: competencySubjectId.join(","),
    interviewName: jobName,
    RecruiterEmail: recruiterEmail,
    companyUrl,
    interviewStartDate: jobStartDate,
    interviewEndDate: jobExpireDate,
    jobType: jobIndustryType,
    iHeadcount: headcount,
    outstation: outstation,
    apmType: "Tech",
    requiredSkills,
    ultraMandatorySkill,
    goodToHaveSkill,
    showJDsectionCheck: showJDSectionToggle,
    jobDescription: jobDescriptionHtml,
    JDupload: uploadedJDUrl || jdFileName || "",
    Additional: additionalInfo,
    iWorkingDays: workingDays,
    iStrength: companyEmployeeStrength,
    iJobMode: jobMode,
    ishift: jobShift,
    inoticePeriod: noticePeriod,
    iEmploymentType: null, // Match old page - sends null
    employmentType,
    bondAgreementRequired,
    iSalaryRange: salaryMin && salaryMax ? `${salaryMin}-${salaryMax}` : "",
    iJobWorkExperience: expMin && expMax ? `${expMin}-${expMax}` : "",
    VcompanySalaryRange: salaryRangeVisible,
    cEmployment: declEmploymentType,
    cWorkingDays: declWorkingDays,
    cJobMode: declJobMode,
    cJobShift: declJobShift,
    cCompanyJobLoc: declCompanyJobLocation,
    aCandidateResume,
    aCandidateNoticePeriod,
    aCandidateTotalWorkExp,
    aCandidateCurrentLocation,
    aCandidateCurrentSalary,
    aCandidateExpectedSalary,
    aCandidateCurrentCompany,
    CandidateDeclaration: candidateDeclaration,
    AdvancedProfileMatch: advancedProfileMatch,
    promoteValue,
    requestText,
    validationState: calculatedValidationState,
    skillText,
    apmReady,
    behavioral: includeBehavioral ? ["178"] : "", // Match old page - behavioral section
    coreSubject1,
    coreSubject1Level,
    core1CutOff,
    core1Topics,
    coreSubject2,
    coreSubject2Level,
    core2CutOff,
    core2Topics,
    codingSubject,
    codingSubjectLevel,
    codingCutOff,
    codingTopics,
    difficultyLevel,
    iJobLocation: jobLocationIds, // Keep as array to match old page
    pendingInterviews: createInterviewOption === "now" ? "N" : "Y",
  };
  
  if (selectedInterviewId && mode === "modify") {
    payload.preInterviewId = selectedInterviewId;
  }

  // Submission
  setSaving(true);
  try {
    const res = await fetch(`${apiHost}/index.php?createAdaptiveInterview_Goprac`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (result.status == 1) {
      setNotify({ type: "success", text: "Interview created Successfully" });
      setTimeout(() => setNotify(null), 3000);
      if (flag !== "publish") setTimeout(() => window.location.reload(), 2000);
    } else {
      dAlert("Error while inserting company");
    }
  } catch (err) {
    dAlert("error while creating the interview");
  }
  setSaving(false);
}


  // ---------- Build payload consistent with your PHP viewmodel ----------
  // function buildPayloadForSave(preInterviewId?: string) {
  //   // match keys used in createAdaptiveInterview_Goprac and edit flows in PHP
  //   const payload: any = {
  //     userId: currentUserId,
  //     userType: currentUserType,
  //     companyId: companyIdList, // PHP expects array -> implode(',',companyId)
  //     roleId: domainRoleId,
  //     subjectId: competencySubjectId,
  //     interviewName: jobName,
  //     RecruiterEmail: recruiterEmail,
  //     companyUrl: companyUrl,
  //     interviewStartDate: jobStartDate,
  //     interviewEndDate: jobExpireDate,
  //     vcdJobIndustryType: jobIndustryType,
  //     iHeadcount: headcount,
  //     outstation: outstationFlag,
  //     apmType,
  //     requiredSkills: requiredSkills,
  //     ultraMandatorySkill: ultraMandatorySkill,
  //     goodToHaveSkill: goodToHaveSkill,
  //     showJDsectionCheck: showJDsection === "Y" ? "Y" : "N",
  //     jobDescription: jobDescriptionHtml,
  //     JDupload: jdFileName || "",
  //     Additional: "Y", // align with viewmodel; toggle if needed
  //     iWorkingDays: workingDays,
  //     iStrength: companyEmployeeStrength,
  //     iJobMode: jobMode ? [jobMode] : [],
  //     ishift: jobShift ? [jobShift] : [],
  //     inoticePeriod: noticePeriod || "",
  //     iEmploymentType: employmentType,
  //     employmentType,
  //     bondAgreementRequired,
  //     iSalaryRange: salaryRange,
  //     cEmployment: employmentType,
  //     cWorkingDays: workingDays,
  //     cJobMode: jobMode,
  //     cJobShift: jobShift,
  //     cCompanyJobLoc: jobLocationIds.join(","),
  //     aCandidateResume,
  //     aCandidateNoticePeriod,
  //     aCandidateTotalWorkExp,
  //     aCandidateCurrentLocation,
  //     aCandidateCurrentSalary,
  //     aCandidateExpectedSalary,
  //     aCandidateCurrentCompany,
  //     jobType: [], // fill from UI profile preferences if implemented
  //     jobTypePreference: "", // placeholder
  //     workExperiencePreference: "",
  //     noticePeriodPreference: "",
  //     shiftsPreference: "",
  //     currentLocationPreference: "",
  //     currentSalaryPreference: "",
  //     workLocationPreferences: "",
  //     validationState: 0, // default; viewmodel uses this to choose scps insertion
  //     skillText: null,
  //     apmReady: null,
  //   };

  //   if (preInterviewId) payload.preInterviewId = preInterviewId;
  //   return payload;
  // }

  // ---------- Save / Create Interview ----------
  // async function handleSaveDraft() {
  //   // Save as draft / create or update
  //   setSaving(true);
  //   const payload = buildPayloadForSave(selectedInterviewId || "");
  //   try {
  //     const res = await fetch(`${apiHost}/index.php?createAdaptiveInterview_Goprac`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     });
  //     const json = await res.json();
  //     if (json?.status === 1 || json?.status === "1") {
  //       showNotify("success", "Saved successfully");
  //       // If server returns created preInterviewId, optionally set selectedInterviewId
  //     } else {
  //       showNotify("error", json?.data || json?.result || "Save failed");
  //     }
  //   } catch (err) {
  //     showNotify("error", "Save error");
  //   }
  //   setSaving(false);
  // }

  // ---------- Publish ----------
  async function handlePublish(val: number) {
    // val==1 => publish='Y' ; val==2 => publish='L' (as per your PHP)
    if (!selectedInterviewId) {
      showNotify("error", "Select interview to publish");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiHost}/index.php?publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, userType: currentUserType, preInterviewId: [selectedInterviewId], val }),
      });
      const json = await res.json();
      if (json?.status === 1 || json?.status === 2 || json?.status === "1") {
        showNotify("success", val === 1 ? "Published" : "Published (L)");
      } else {
        showNotify("error", "Publish error");
      }
    } catch (err) {
      showNotify("error", "Publish error");
    }
    setLoading(false);
  }



  // ---------- Preview Link (matches viewmodel previewLink) ----------
  function handlePreviewLink() {
    // Opens the linkData in new tab (matches KO.js: window.open(linkValue, "_blank"))
    console.log("previewLink - iasJobLink:", iasJobLink);
    
    if (!iasJobLink) {
      showNotify("error", "No link available to preview");
      return;
    }
    
    window.open(iasJobLink, "_blank");
  }

  // ---------- Create Link (matches viewmodel createLink) ----------
  async function handleCreateLink() {
    // Show linkbox and copybox, then call publish(2)
    // Matches KO.js: $("#linkbox").css("display", "block"); $("#copybox").css("display", "block"); app.viewModels.jobCreation.publish(2);
    
    if (!selectedInterviewId) {
      showNotify("error", "No interview selected");
      return;
    }
    
    // Show link box and copy box
    setShowLinkBox(true);
    setShowCopyBox(true);
    
    // Call publish with val=2 (create link mode)
    await handlePublish(2);
  }

  // ---------- Copy link to clipboard (matches viewmodel copyLink) ----------
  function handleCopyLink(linkType?: string) {
    // If linkType provided, use generatedLinks (for social media links)
    // Otherwise use iasJobLink (for main job link)
    const link = linkType ? generatedLinks[linkType as keyof typeof generatedLinks] : iasJobLink;
    
    if (!link) {
      showNotify("error", "No link available");
      return;
    }
    
    navigator.clipboard.writeText(link).then(() => {
      setDisplayMsg("Link Copied !");
      setTimeout(() => {
        setDisplayMsg("");
      }, 1000);
      showNotify("success", "Link copied to clipboard");
    }).catch(() => {
      showNotify("error", "Failed to copy link");
    });
  }

  // ---------- Delete interview ----------
  async function handleDeleteInterview() {
    if (!selectedInterviewId) {
      showNotify("error", "Please select an interview to delete");
      return;
    }

    if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiHost}/index.php?deletePreInterview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          userType: currentUserType,
          preInterviewId: selectedInterviewId,
        }),
      });

      const json = await res.json();
      if (json?.status === 1) {
        showNotify("success", "Interview deleted successfully");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        showNotify("error", "Error deleting interview");
      }
    } catch (err) {
      showNotify("error", "Error deleting interview");
    }
    setLoading(false);
  }

  // ---------- Get URL parameter by name ----------
  function getParameterByName(name: string, url?: string): string | null {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  // ---------- Optimize promotion state checks to avoid recalculation ----------
  const promotionChecks = useMemo(() => ({
    goprac: promoteGopracDB,
    social: promoteSocial,
    linkedin: promoteLinkedIn,
    naukri: promoteNaukri,
    internal: promoteIST,
    doNotPromote: doNotPromote,
  }), [promoteGopracDB, promoteSocial, promoteLinkedIn, promoteNaukri, promoteIST, doNotPromote]);

  // ========== STABLE SETTERS WRAPPED IN useCallback TO PREVENT RE-RENDERS ==========
  const setServiceTypeStable = useCallback((value: string) => setServiceType(value), []);
  const setJobNameStable = useCallback((value: string) => setJobName(value), []);
  const setRecruiterEmailStable = useCallback((value: string) => setRecruiterEmail(value), []);
  const setCompanyUrlStable = useCallback((value: string) => setCompanyUrl(value), []);
  const setJobStartDateStable = useCallback((value: string) => setJobStartDate(value), []);
  const setJobExpireDateStable = useCallback((value: string) => setJobExpireDate(value), []);
  const setJobIndustryTypeStable = useCallback((value: string[]) => setJobIndustryType(value), []);
  const setHeadcountStable = useCallback((value: string) => setHeadcount(value), []);
  const setOutstationStable = useCallback((value: string) => {
    setOutstation(value === "none" ? "" : (value as "Y" | "N"));
  }, []);
  const setDomainRoleIdStable = useCallback((v: string) => setDomainRoleId(v === "none" ? "" : v), []);
  const setCompetencySubjectIdStable = useCallback((value: string[]) => setCompetencySubjectId(value), []);
  const setRequiredSkillsStable = useCallback(handleMandatorySkillChange, [handleMandatorySkillChange]);
  const setUltraMandatorySkillStable = useCallback(handleUltraMandatorySkillChange, [handleUltraMandatorySkillChange]);
  const setGoodToHaveSkillStable = useCallback((value: string[]) => setGoodToHaveSkill(value), []);
  const setEmploymentTypeStable = useCallback((v: string) => setEmploymentType(v === "none" ? "" : v), []);
  const setBondAgreementRequiredStable = useCallback((v: string) => setBondAgreementRequired(v === "none" ? "" : v), []);
  const setWorkingDaysStable = useCallback((value: string) => setWorkingDays(value), []);
  const setJobModeStable = useCallback((value: string[]) => setJobMode(value), []);
  const setJobShiftStable = useCallback((value: string[]) => setJobShift(value), []);
  const setNoticePeriodStable = useCallback((value: string) => setNoticePeriod(value), []);
  const setExpMinStable = useCallback((value: string) => setExpMin(value), []);
  const setExpMaxStable = useCallback((value: string) => setExpMax(value), []);
  const setSalaryMinStable = useCallback((value: string) => setSalaryMin(value), []);
  const setSalaryMaxStable = useCallback((value: string) => setSalaryMax(value), []);
  const setSalaryRangeVisibleStable = useCallback((value: string) => setSalaryRangeVisible(value as "Y" | "N"), []);
  const setJobLocationIdsStable = useCallback((value: string[]) => setJobLocationIds(value), []);
  const setCompanyEmployeeStrengthStable = useCallback((value: string) => setCompanyEmployeeStrength(value), []);
  const setApmTypeStable = useCallback((value: string) => setApmType(value), []);

  // ---------- Generate promotion links on demand ----------
  // Note: Links are generated when user clicks "Create Link" or "Preview" buttons
  // They are NOT auto-generated to avoid unnecessary API calls

  // ---------- Associate Corporate workflow ----------
  async function openAssociateCorporateDialog() {
    if (!selectedInterviewId) {
      showNotify("error", "Please select an interview");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiHost}/index.php?getAssociatedCorporate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: currentUserId, 
          userType: currentUserType, 
          preInterviewId: [selectedInterviewId] // PHP expects array
        }),
      });
      const json = await res.json();
      if (json?.status === 1) {
        const data = json.data;
        setCorporateNameList(data.corporateList || []);
        setAssociatedCorporate(data.associatedCorporate || []);
        
        // Pre-select already associated corporate IDs
        const associatedIds = (data.associatedCorporate || []).map((c: any) => String(c.id));
        setSelectedCorporateIds(associatedIds);
        
        setAssociateCorporateDialogOpen(true);
      } else {
        showNotify("error", "Error fetching corporate data");
      }
    } catch (err) {
      showNotify("error", "Error loading corporate list");
    }
    setLoading(false);
  }

  async function submitAssociateCorporate() {
    if (!selectedInterviewId) return;
    
    if (!selectedCorporateIds || selectedCorporateIds.length === 0) {
      showNotify("error", "Please select at least one corporate");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiHost}/index.php?associatingCorporateId`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          userType: currentUserType,
          preInterviewId: selectedInterviewId,
          corporateUserId: selectedCorporateIds,
        }),
      });
      const json = await res.json();
      if (json?.status === 1) {
        showNotify("success", "Interview Associated Successfully");
        setAssociateCorporateDialogOpen(false);
        setSelectedCorporateIds([]);
        // Refresh filters to reload interview list
        fetchFilters();
      } else {
        showNotify("error", "Error while associating corporate");
      }
    } catch (err) {
      showNotify("error", "Error associating corporate");
    }
    setLoading(false);
  }

  // ---------- Delete preInterview ----------
  async function handleDelete(preInterviewIds: string[]) {
    if (!confirm("Are you sure you want to delete selected interview(s)?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiHost}/index.php?deletePreInterview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, userType: currentUserType, preInterviewId: preInterviewIds }),
      });
      const json = await res.json();
      if (json?.status === 1) {
        showNotify("success", "Deleted");
        // refresh interview list
        fetchFilters();
      } else {
        showNotify("error", "Delete failed");
      }
    } catch (err) {
      showNotify("error", "Delete error");
    }
    setLoading(false);
  }

  // ---------- Memoize character count to avoid regex on every render ----------
  const jobDescriptionCharCount = useMemo(() => {
    if (typeof document !== 'undefined') {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = jobDescriptionHtml;
      return (tempDiv.textContent || tempDiv.innerText || '').trim().length;
    }
    return jobDescriptionHtml.replace(/<[^>]*>/g, '').length;
  }, [jobDescriptionHtml]);
  const companyOptions = useMemo(() => companyNames || [], [companyNames]);
  const roleOptions = useMemo(() => roleNames || [], [roleNames]);
  const competencyOptions = useMemo(() => competencySubjects || [], [competencySubjects]);
  const locationOptions = useMemo(() => locationsMaster || [], [locationsMaster]);
  const skillOptions = useMemo(() => skillsList || [], [skillsList]);

  // ---------- Memoize filtered skill options to avoid recalculation ----------
  const availableUltraMandatorySkills = useMemo(() => {
    if (!filters?.skills) return [];
    return filters.skills.filter((skill: any) => !requiredSkills.includes(skill.id));
  }, [filters?.skills, requiredSkills]);

  const availableGoodToHaveSkills = useMemo(() => {
    if (!filters?.skills) return [];
    const combined = [...requiredSkills, ...ultraMandatorySkill];
    return filters.skills.filter((skill: any) => !combined.includes(skill.id));
  }, [filters?.skills, requiredSkills, ultraMandatorySkill]);

  // ---------- Optimize checkbox handlers with useCallback ----------
  const handleCandidateDeclarationChange = useCallback((checked: boolean) => {
    setCandidateDeclaration(checked ? "Y" : "N");
    if (!checked) {
      setDeclEmploymentType("N");
      setDeclWorkingDays("N");
      setDeclJobMode("N");
      setDeclJobShift("N");
      setDeclCompanyJobLocation("N");
    }
  }, []);

  const handleAdvancedProfileMatchChange = useCallback((checked: boolean) => {
    setAdvancedProfileMatch(checked ? "Y" : "N");
    if (!checked) {
      setACandidateResume("N");
      setACandidateNoticePeriod("N");
      setACandidateTotalWorkExp("N");
      setACandidateCurrentLocation("N");
      setACandidateCurrentSalary("N");
      setACandidateExpectedSalary("N");
      setACandidateCurrentCompany("N");
    }
  }, []);

  // ---------- Memoize job description onChange to prevent re-renders ----------
  const handleJobDescriptionChange = useCallback((html: string) => {
    setJobDescriptionHtml(html);
  }, []);

  // ---------- Stable callbacks for component props ----------
  const handleServiceTypeChange = useCallback((value: string) => {
    setServiceType(value);
  }, []);

  const handleJobNameChange = useCallback((value: string) => {
    setJobName(value);
  }, []);

  const handleRecruiterEmailChange = useCallback((value: string) => {
    setRecruiterEmail(value);
  }, []);

  const handleCompanyUrlChange = useCallback((value: string) => {
    setCompanyUrl(value);
  }, []);

  const handleJobStartDateChange = useCallback((value: string) => {
    setJobStartDate(value);
  }, []);

  const handleJobExpireDateChange = useCallback((value: string) => {
    setJobExpireDate(value);
  }, []);

  const handleJobIndustryTypeChange = useCallback((value: string[]) => {
    setJobIndustryType(value);
  }, []);

  const handleHeadcountChange = useCallback((value: string) => {
    setHeadcount(value);
  }, []);

  const handleOutstationChange = useCallback((value: "Y" | "N") => {
    setOutstation(value);
  }, []);

  const handleEmploymentTypeChange = useCallback((value: string) => {
    setEmploymentType(value);
  }, []);

  const handleBondAgreementChange = useCallback((value: string) => {
    setBondAgreementRequired(value);
  }, []);

  const handleCompanyEmployeeStrengthChange = useCallback((value: string) => {
    setCompanyEmployeeStrength(value);
  }, []);

  const handleDomainRoleIdChange = useCallback((value: string) => {
    setDomainRoleId(value);
  }, []);

  const handleCompetencySubjectIdChange = useCallback((value: string[]) => {
    setCompetencySubjectId(value);
  }, []);

  const handleOpenSkillDialog = useCallback(() => {
    setSkillDialogOpen(true);
  }, []);

  const handleGoodToHaveSkillChange = useCallback((skills: string[]) => {
    setGoodToHaveSkill(skills);
  }, []);

  // ---------- Render ----------
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Create A New Job</h1>
          <div className="text-sm text-muted-foreground">Use this page to create or modify interview/job</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">Mode</span>
            <Select value={mode} onValueChange={(v) => setMode(v === "modify" ? "modify" : "create")}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="create">Create A New Job</SelectItem>
                <SelectItem value="modify">Modify an Existing Job</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* If modify mode show interview selector and include inactive */}
      {mode === "modify" && (
        <div className="mb-4 bg-white p-4 rounded-lg border">
          <div className="flex gap-3 items-center">
            <Checkbox checked={includeInactive} onCheckedChange={(v) => setIncludeInactive(v ? true : false)} />
            <span className="text-sm">Include inactive jobs</span>

            <div className="ml-4 w-96">
              <Select value={selectedInterviewId || "none"} onValueChange={(v) => setSelectedInterviewId(v === "none" ? "" : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select interview to modify" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select interview</SelectItem>
                  {interviewList.map((it: any) => (
                    <SelectItem key={it.id} value={String(it.id)}>{it.interviewName || it.name || `#${it.id}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => openAssociateCorporateDialog()}>Associate Corporate</Button>
          </div>
        </div>
      )}

      {/* Section 2: Basic Job Details */}
      <div className="mb-6 bg-white p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-3">Fill Basic Job Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Client Service Type <span className="text-red-500">*</span></Label>
            <Select value={serviceType} onValueChange={setServiceTypeStable}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Client Service Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RAS">RAS</SelectItem>
                <SelectItem value="IAS">IAS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Company <span className="text-red-500">*</span></Label>
            <Select value={companyIdList[0] || "none"} onValueChange={handleCompanyChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select Company</SelectItem>
                {companyOptions.map((c: any) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Domain (Role) <span className="text-red-500">*</span></Label>
            <Select value={domainRoleId || "none"} onValueChange={setDomainRoleIdStable}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select Role</SelectItem>
                {roleOptions.map((r: any) => (
                  <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Competency (Multi-select) <span className="text-red-500">*</span></Label>
            <MultiSelect values={competencySubjectId.map(String)} onValuesChange={setCompetencySubjectIdStable}>
              <MultiSelectTrigger className="w-full">
                <MultiSelectValue placeholder="Select Competency" />
              </MultiSelectTrigger>
              <MultiSelectContent>
                {competencyOptions.map((c: any) => (
                  <MultiSelectItem key={c.id} value={String(c.id)}>{c.name}</MultiSelectItem>
                ))}
              </MultiSelectContent>
            </MultiSelect>
          </div>

          <div>
            <Label>Job Name <span className="text-red-500">*</span></Label>
            <Input value={jobName} onChange={(e) => setJobNameStable(e.target.value)} placeholder="Eg: Data Analyst Assessment Interview ..." />
          </div>

          <div>
            <Label>Recruiter Email <span className="text-red-500">*</span></Label>
            <Input value={recruiterEmail} onChange={(e) => setRecruiterEmailStable(e.target.value)} placeholder="recruiter@goprac.com" />
          </div>

          <div>
            <Label>Company URL</Label>
            <Input value={companyUrl} onChange={(e) => setCompanyUrlStable(e.target.value)} placeholder="https://www.example.com" />
          </div>

          <div>
            <Label>Job Start Date <span className="text-red-500">*</span></Label>
            <Input type="date" value={jobStartDate} onChange={(e) => setJobStartDateStable(e.target.value)} />
          </div>

          <div>
            <Label>Job Expire Date <span className="text-red-500">*</span></Label>
            <Input type="date" value={jobExpireDate} onChange={(e) => setJobExpireDateStable(e.target.value)} />
          </div>

          <div>
            <Label>Job Industry Type (Multi-select)</Label>
            <MultiSelect values={jobIndustryType} onValuesChange={setJobIndustryTypeStable}>
              <MultiSelectTrigger className="w-full">
                <MultiSelectValue placeholder="Select Job Industry Type" />
              </MultiSelectTrigger>
              <MultiSelectContent className="max-h-[300px]">
                <MultiSelectItem value="Analytics / KPO / Research">Analytics / KPO / Research</MultiSelectItem>
                <MultiSelectItem value="BPO / Call Centre">BPO / Call Centre</MultiSelectItem>
                <MultiSelectItem value="IT Services & Consulting">IT Services & Consulting</MultiSelectItem>
                <MultiSelectItem value="Electronic Components / Semiconductors">Electronic Components / Semiconductors</MultiSelectItem>
                <MultiSelectItem value="Electronics Manufacturing">Electronics Manufacturing</MultiSelectItem>
                <MultiSelectItem value="3D Printing">3D Printing</MultiSelectItem>
                <MultiSelectItem value="AI/ML">AI/ML</MultiSelectItem>
                <MultiSelectItem value="AR/VR">AR/VR</MultiSelectItem>
                <MultiSelectItem value="Blockchain">Blockchain</MultiSelectItem>
                <MultiSelectItem value="Cloud">Cloud</MultiSelectItem>
                <MultiSelectItem value="Cybersecurity">Cybersecurity</MultiSelectItem>
                <MultiSelectItem value="Drones/Robotics">Drones/Robotics</MultiSelectItem>
                <MultiSelectItem value="IoT">IoT</MultiSelectItem>
                <MultiSelectItem value="Nanotechnology">Nanotechnology</MultiSelectItem>
                <MultiSelectItem value="Hardware & Networking">Hardware & Networking</MultiSelectItem>
                <MultiSelectItem value="E-Commerce">E-Commerce</MultiSelectItem>
                <MultiSelectItem value="OTT">OTT</MultiSelectItem>
                <MultiSelectItem value="Other">Other</MultiSelectItem>
                <MultiSelectItem value="Software Product">Software Product</MultiSelectItem>
                <MultiSelectItem value="Banking">Banking</MultiSelectItem>
                <MultiSelectItem value="Asset Management">Asset Management</MultiSelectItem>
                <MultiSelectItem value="Broking">Broking</MultiSelectItem>
                <MultiSelectItem value="FinTech / Payments">FinTech / Payments</MultiSelectItem>
                <MultiSelectItem value="Insurance">Insurance</MultiSelectItem>
                <MultiSelectItem value="Investment Banking / Venture Capital / Private Equity">Investment Banking / Venture Capital / Private Equity</MultiSelectItem>
                <MultiSelectItem value="Micro Finance">Micro Finance</MultiSelectItem>
                <MultiSelectItem value="Financial Services">Financial Services</MultiSelectItem>
                <MultiSelectItem value="Securities and Commodity Exchanges">Securities and Commodity Exchanges</MultiSelectItem>
                <MultiSelectItem value="Education / Training">Education / Training</MultiSelectItem>
                <MultiSelectItem value="E-Learning / EdTech">E-Learning / EdTech</MultiSelectItem>
                <MultiSelectItem value="Auto Components">Auto Components</MultiSelectItem>
                <MultiSelectItem value="Automobile Dealers">Automobile Dealers</MultiSelectItem>
                <MultiSelectItem value="Electric Vehicle (EV)">Electric Vehicle (EV)</MultiSelectItem>
                <MultiSelectItem value="Cement">Cement</MultiSelectItem>
                <MultiSelectItem value="Ceramic">Ceramic</MultiSelectItem>
                <MultiSelectItem value="Glass">Glass</MultiSelectItem>
                <MultiSelectItem value="Chemical">Chemical</MultiSelectItem>
                <MultiSelectItem value="Defence & Aerospace">Defence & Aerospace</MultiSelectItem>
                <MultiSelectItem value="Electrical Equipment">Electrical Equipment</MultiSelectItem>
                <MultiSelectItem value="Fertilizers / Pesticides / Agro chemicals">Fertilizers / Pesticides / Agro chemicals</MultiSelectItem>
                <MultiSelectItem value="Industrial Automation">Industrial Automation</MultiSelectItem>
                <MultiSelectItem value="Construction Equipment">Construction Equipment</MultiSelectItem>
                <MultiSelectItem value="Machine Tools">Machine Tools</MultiSelectItem>
                <MultiSelectItem value="Iron & Steel">Iron & Steel</MultiSelectItem>
                <MultiSelectItem value="Metals & Mining">Metals & Mining</MultiSelectItem>
                <MultiSelectItem value="Packaging & Containers">Packaging & Containers</MultiSelectItem>
                <MultiSelectItem value="Petrochemical / Plastics / Rubber">Petrochemical / Plastics / Rubber</MultiSelectItem>
                <MultiSelectItem value="Pulp & Paper">Pulp & Paper</MultiSelectItem>
                <MultiSelectItem value="Aviation">Aviation</MultiSelectItem>
                <MultiSelectItem value="Courier / Logistics">Courier / Logistics</MultiSelectItem>
                <MultiSelectItem value="Engineering & Construction">Engineering & Construction</MultiSelectItem>
                <MultiSelectItem value="Oil & Gas">Oil & Gas</MultiSelectItem>
                <MultiSelectItem value="Ports & Shipping">Ports & Shipping</MultiSelectItem>
                <MultiSelectItem value="Power">Power</MultiSelectItem>
                <MultiSelectItem value="Railways">Railways</MultiSelectItem>
                <MultiSelectItem value="Real Estate">Real Estate</MultiSelectItem>
                <MultiSelectItem value="Urban Transport">Urban Transport</MultiSelectItem>
                <MultiSelectItem value="Water Treatment / Waste Management">Water Treatment / Waste Management</MultiSelectItem>
                <MultiSelectItem value="Beauty & Personal Care">Beauty & Personal Care</MultiSelectItem>
                <MultiSelectItem value="Beverage">Beverage</MultiSelectItem>
                <MultiSelectItem value="Consumer Electronics & Appliances">Consumer Electronics & Appliances</MultiSelectItem>
                <MultiSelectItem value="Fitness & Wellness">Fitness & Wellness</MultiSelectItem>
                <MultiSelectItem value="FMCG">FMCG</MultiSelectItem>
                <MultiSelectItem value="Furniture & Furnishing">Furniture & Furnishing</MultiSelectItem>
                <MultiSelectItem value="Gems & Jewellery">Gems & Jewellery</MultiSelectItem>
                <MultiSelectItem value="Hotels & Restaurants">Hotels & Restaurants</MultiSelectItem>
                <MultiSelectItem value="Leather">Leather</MultiSelectItem>
                <MultiSelectItem value="Retail">Retail</MultiSelectItem>
                <MultiSelectItem value="Textile & Apparel">Textile & Apparel</MultiSelectItem>
                <MultiSelectItem value="Travel & Tourism">Travel & Tourism</MultiSelectItem>
                <MultiSelectItem value="Biotechnology">Biotechnology</MultiSelectItem>
                <MultiSelectItem value="BioPharma">BioPharma</MultiSelectItem>
                <MultiSelectItem value="Clinical Research / Contract Research">Clinical Research / Contract Research</MultiSelectItem>
                <MultiSelectItem value="Medical Devices & Equipment">Medical Devices & Equipment</MultiSelectItem>
                <MultiSelectItem value="Medical Services / Hospital">Medical Services / Hospital</MultiSelectItem>
                <MultiSelectItem value="Pharmaceutical & Life Sciences">Pharmaceutical & Life Sciences</MultiSelectItem>
                <MultiSelectItem value="Advertising & Marketing">Advertising & Marketing</MultiSelectItem>
                <MultiSelectItem value="Animation & VFX">Animation & VFX</MultiSelectItem>
                <MultiSelectItem value="Events / Live Entertainment">Events / Live Entertainment</MultiSelectItem>
                <MultiSelectItem value="Film / Music / Entertainment">Film / Music / Entertainment</MultiSelectItem>
                <MultiSelectItem value="Gaming">Gaming</MultiSelectItem>
                <MultiSelectItem value="Printing & Publishing">Printing & Publishing</MultiSelectItem>
                <MultiSelectItem value="Sports / Leisure & Recreation">Sports / Leisure & Recreation</MultiSelectItem>
                <MultiSelectItem value="Telecom / ISP">Telecom / ISP</MultiSelectItem>
                <MultiSelectItem value="TV / Radio">TV / Radio</MultiSelectItem>
                <MultiSelectItem value="Professional Services">Professional Services</MultiSelectItem>
                <MultiSelectItem value="Accounting / Auditing">Accounting / Auditing</MultiSelectItem>
                <MultiSelectItem value="Architecture / Interior Design">Architecture / Interior Design</MultiSelectItem>
                <MultiSelectItem value="Content Development / Language">Content Development / Language</MultiSelectItem>
                <MultiSelectItem value="Design">Design</MultiSelectItem>
                <MultiSelectItem value="Facility Management Services">Facility Management Services</MultiSelectItem>
                <MultiSelectItem value="Law Enforcement / Security Services">Law Enforcement / Security Services</MultiSelectItem>
                <MultiSelectItem value="Legal">Legal</MultiSelectItem>
                <MultiSelectItem value="Management Consulting">Management Consulting</MultiSelectItem>
                <MultiSelectItem value="Recruitment / Staffing">Recruitment / Staffing</MultiSelectItem>
                <MultiSelectItem value="Agriculture / Forestry / Fishing">Agriculture / Forestry / Fishing</MultiSelectItem>
                <MultiSelectItem value="Government / Public Administration">Government / Public Administration</MultiSelectItem>
                <MultiSelectItem value="Import & Export">Import & Export</MultiSelectItem>
                <MultiSelectItem value="NGO / Social Services / Industry Associations">NGO / Social Services / Industry Associations</MultiSelectItem>
                <MultiSelectItem value="Others">Others</MultiSelectItem>
              </MultiSelectContent>
            </MultiSelect>

          </div>

          <div>
            <Label>Headcount <span className="text-red-500">*</span></Label>
            <Input value={headcount} onChange={(e) => setHeadcountStable(e.target.value)} placeholder="Eg: 150" />
          </div>

          <div>
            <Label>Allow Outstation Candidate? <span className="text-red-500">*</span></Label>
            <Select value={outstation || "Y"} onValueChange={setOutstationStable} disabled>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="Y">Yes</SelectItem>
                <SelectItem value="N">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Mandatory Skills (min 1) <span className="text-red-500">*</span></Label>
            <MultiSelect values={requiredSkills} onValuesChange={setRequiredSkillsStable}>
              <MultiSelectTrigger className="w-full"><MultiSelectValue placeholder="Select required skills" /></MultiSelectTrigger>
              <MultiSelectContent>
                {skillOptions.map((s: any) => (
                  <MultiSelectItem key={s.id} value={String(s.id)}>{s.favourite_subject || s.name}</MultiSelectItem>
                ))}
              </MultiSelectContent>
            </MultiSelect>
            <div className="mt-2">
              <Button size="sm" onClick={() => setSkillDialogOpen(true)}>Add Skills</Button>
            </div>
          </div>

          <div>
            <Label>Ultra Mandatory Skills (max 3) <span className="text-red-500">*</span></Label>
            <MultiSelect values={ultraMandatorySkill} onValuesChange={setUltraMandatorySkillStable}>
              <MultiSelectTrigger className="w-full"><MultiSelectValue placeholder="Select ultra mandatory skills" /></MultiSelectTrigger>
              <MultiSelectContent>
                {skillOptions.map((s: any) => (
                  <MultiSelectItem key={s.id} value={String(s.id)}>{s.favourite_subject || s.name}</MultiSelectItem>
                ))}
              </MultiSelectContent>
            </MultiSelect>
          </div>

          <div>
            <Label>Good to Have Skills</Label>
            <MultiSelect values={goodToHaveSkill} onValuesChange={setGoodToHaveSkillStable}>
              <MultiSelectTrigger className="w-full"><MultiSelectValue placeholder="Select good to have" /></MultiSelectTrigger>
              <MultiSelectContent>
                {skillOptions.map((s: any) => (
                  <MultiSelectItem key={s.id} value={String(s.id)}>{s.favourite_subject || s.name}</MultiSelectItem>
                ))}
              </MultiSelectContent>
            </MultiSelect>
          </div>
        </div>
      </div>

      {/* Section 3: Additional Job Details */}
      <div className="mb-6 bg-white p-6 rounded-lg border">
        <div className="flex items-center gap-3 mb-3">
          <Checkbox
            checked={additionalInfo === "Y"}
            onCheckedChange={(c) => setAdditionalInfo(c ? "Y" : "N")}
          />
          <h2 className="text-lg font-semibold">Additional Job Details (Fill / Select)</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          All below to be in Additional Job Details as mandatory fields to be filled or selected as applicable.
        </p>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label>Job Description {additionalInfo === "Y" && <span className="text-red-500">*</span>}</Label>
            <RichTextEditor
              value={jobDescriptionHtml}
              onChange={handleJobDescriptionChange}
              placeholder="Enter detailed job description with formatting..."
              className="min-h-[300px]"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {jobDescriptionCharCount} characters
            </div>
          </div>

          <div className="space-y-2">
            <Label>Upload JD (pdf/docx, max 10MB)</Label>
            
            {!jdFileUrl ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <input 
                    id="jdFileInput"
                    type="file" 
                    accept=".pdf,.doc,.docx,application/msword,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                    onChange={handleJdFileSelect}
                    disabled={jdUploading}
                    className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer disabled:opacity-50"
                  />
                  {jdUploading && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <span className="animate-spin">⏳</span>
                      <span>Uploading...</span>
                    </div>
                  )}
                </div>
                
                {jdUploadSuccess && (
                  <div className="text-sm text-green-600 flex items-center gap-1">
                    <span>✅</span>
                    {jdUploadSuccess}
                  </div>
                )}
                
                {jdUploadError && (
                  <div className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span>
                    {jdUploadError}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex-1 flex items-center gap-3">
                  {/* File type icon (matches viewmodel with PDF/Word icons) */}
                  {jdFileType === "pdf" ? (
                    <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h10l4 4v16H2v-1z"/>
                      <text x="5" y="14" fontSize="8" fill="currentColor">PDF</text>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h10l4 4v16H2v-1z"/>
                      <text x="4" y="14" fontSize="7" fill="currentColor">DOC</text>
                    </svg>
                  )}
                  <div className="flex-1">
                    <a 
                      href={jdFileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-gray-900 hover:text-blue-600 hover:underline font-medium"
                    >
                      View JD
                    </a>
                  </div>
                  {/* Re-upload icon (matches viewmodel) */}
                  <label 
                    htmlFor="jdFileInput"
                    className="cursor-pointer p-2 rounded-full border border-orange-500 text-orange-500 hover:bg-orange-50 transition-colors"
                    title="Re-Upload"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 3.5a.5.5 0 01.5.5v9.793l2.146-2.147a.5.5 0 01.708.708l-3 3a.5.5 0 01-.708 0l-3-3a.5.5 0 01.708-.708L9.5 13.793V4a.5.5 0 01.5-.5z"/>
                      <path d="M3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                    </svg>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Company Notice Period {additionalInfo === "Y" && <span className="text-red-500">*</span>}</Label>
              <Select value={noticePeriod} onValueChange={setNoticePeriodStable}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Notice Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Immediate">Immediate</SelectItem>
                  <SelectItem value="15 Days">15 Days</SelectItem>
                  <SelectItem value="30 Days">30 Days</SelectItem>
                  <SelectItem value="45 Days">45 Days</SelectItem>
                  <SelectItem value="60 Days">60 Days</SelectItem>
                  <SelectItem value="90 Days">90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Company Job Experience Range (Yrs) {additionalInfo === "Y" && <span className="text-red-500">*</span>}</Label>
              <div className="flex gap-2">
                <Select value={expMin} onValueChange={setExpMinStable}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Between" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(41)].map((_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={expMax} onValueChange={setExpMaxStable}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="To" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(41)].map((_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Company Job Salary Range {additionalInfo === "Y" && <span className="text-red-500">*</span>}</Label>
              <div className="flex gap-2">
                <Input value={salaryMin} onChange={e => setSalaryMinStable(e.target.value)} placeholder="Between" />
                <Input value={salaryMax} onChange={e => setSalaryMaxStable(e.target.value)} placeholder="To" />
              </div>
              <div className="text-xs text-muted-foreground">Enter salary as 100000 LPA</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
            <div>
              <Label>Salary Range Visible on landing Page</Label>
              <Select value={salaryRangeVisible || "N"} onValueChange={setSalaryRangeVisibleStable}>
                <SelectTrigger><SelectValue placeholder="Select"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="N">Not Visible</SelectItem>
                  <SelectItem value="Y">Visible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Company Job Location {additionalInfo === "Y" && <span className="text-red-500">*</span>}</Label>
              <MultiSelect values={jobLocationIds} onValuesChange={setJobLocationIdsStable}>
                <MultiSelectTrigger className="w-full"><MultiSelectValue placeholder="Select locations" /></MultiSelectTrigger>
                <MultiSelectContent>
                  {locationOptions.map((l: any) => (
                    <MultiSelectItem key={l.id} value={String(l.id)}>{l.cityName}</MultiSelectItem>
                  ))}
                </MultiSelectContent>
              </MultiSelect>
            </div>

            <div>
              <Label>Employment Type <span className="text-red-500">*</span></Label>
              <Select value={employmentType || undefined} onValueChange={setEmploymentTypeStable}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select Employment Type"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Permanent">Permanent</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                  <SelectItem value="Part-Time">Part-Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Bond Agreement Required <span className="text-red-500">*</span></Label>
              <Select value={bondAgreementRequired || "No"} onValueChange={setBondAgreementRequiredStable}>
                <SelectTrigger><SelectValue placeholder="Select"/></SelectTrigger>
                <SelectContent>
                  {/* <SelectItem value="none">Select</SelectItem> */}
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Working Days {additionalInfo === "Y" && <span className="text-red-500">*</span>}</Label>
              <Input value={workingDays} onChange={(e) => setWorkingDaysStable(e.target.value)} placeholder="Eg: 5" />
            </div>

            <div>
              <Label>Job Mode {additionalInfo === "Y" && <span className="text-red-500">*</span>}</Label>
              <MultiSelect values={jobMode} onValuesChange={setJobModeStable}>
                <MultiSelectTrigger className="w-full">
                  <MultiSelectValue placeholder="Job Mode" />
                </MultiSelectTrigger>
                <MultiSelectContent>
                  <MultiSelectItem value="Office">Office</MultiSelectItem>
                  <MultiSelectItem value="Remote">Remote</MultiSelectItem>
                  <MultiSelectItem value="Hybrid">Hybrid</MultiSelectItem>
                </MultiSelectContent>
              </MultiSelect>
            </div>

            <div>
              <Label>Job Shift {additionalInfo === "Y" && <span className="text-red-500">*</span>}</Label>
              <MultiSelect values={jobShift} onValuesChange={setJobShiftStable}>
                <MultiSelectTrigger className="w-full">
                  <MultiSelectValue placeholder="Job Shift" />
                </MultiSelectTrigger>
                <MultiSelectContent>
                  <MultiSelectItem value="Day Shift">Day Shift</MultiSelectItem>
                  <MultiSelectItem value="Night Shift">Night Shift</MultiSelectItem>
                  <MultiSelectItem value="Rotational">Rotational</MultiSelectItem>
                </MultiSelectContent>
              </MultiSelect>

            </div>

            <div>
              <Label>Company Employee Strength</Label>
              <Input value={companyEmployeeStrength} onChange={(e) => setCompanyEmployeeStrengthStable(e.target.value)} placeholder="Eg: 500" />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Checkbox
                checked={candidateDeclaration === "Y"}
                onCheckedChange={handleCandidateDeclarationChange}
              />
              <Label className="font-semibold text-base">Get Candidate Declaration</Label>
            </div>
            
            {candidateDeclaration === "Y" && (
              <div className="flex flex-wrap gap-4 ml-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={declEmploymentType === "Y"}
                    onCheckedChange={(c) => setDeclEmploymentType(c ? "Y" : "N")}
                  />
                  <span className="text-sm">Employment Type</span>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={declWorkingDays === "Y"}
                    onCheckedChange={(c) => setDeclWorkingDays(c ? "Y" : "N")}
                  />
                  <span className="text-sm">Working Days</span>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={declJobMode === "Y"}
                    onCheckedChange={(c) => setDeclJobMode(c ? "Y" : "N")}
                  />
                  <span className="text-sm">Job Mode</span>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={declJobShift === "Y"}
                    onCheckedChange={(c) => setDeclJobShift(c ? "Y" : "N")}
                  />
                  <span className="text-sm">Job Shift</span>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={declCompanyJobLocation === "Y"}
                    onCheckedChange={(c) => setDeclCompanyJobLocation(c ? "Y" : "N")}
                  />
                  <span className="text-sm">Company Job Location</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Checkbox
                checked={advancedProfileMatch === "Y"}
                onCheckedChange={(c) => {
                  setAdvancedProfileMatch(c ? "Y" : "N");
                  if (!c) {
                    // Uncheck all sub-checkboxes when parent is unchecked
                    setACandidateResume("N");
                    setACandidateNoticePeriod("N");
                    setACandidateTotalWorkExp("N");
                    setACandidateCurrentLocation("N");
                    setACandidateCurrentSalary("N");
                    setACandidateExpectedSalary("N");
                    setACandidateCurrentCompany("N");
                  } else {
                    // Check all sub-checkboxes when parent is checked
                    setACandidateResume("Y");
                    setACandidateNoticePeriod("Y");
                    setACandidateTotalWorkExp("Y");
                    setACandidateCurrentLocation("Y");
                    setACandidateCurrentSalary("Y");
                    setACandidateExpectedSalary("Y");
                    setACandidateCurrentCompany("Y");
                  }
                }}
              />
              <Label className="font-semibold text-base">
                Collect Candidate Information
                {serviceType === "RAS" && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            {/* {serviceType === "RAS" && (
              <p className="text-xs text-red-500 ml-8 -mt-2 mb-2">* Mandatory for RAS service type</p>
            )} */}
            
            {advancedProfileMatch === "Y" && (
              <div className="flex flex-wrap gap-4 ml-6">
                <div className="flex items-center gap-2">
                  <Checkbox checked={aCandidateResume === "Y"} onCheckedChange={(c) => setACandidateResume(c ? "Y" : "N")} />
                  <span className="text-sm">Candidate Resume</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={aCandidateNoticePeriod === "Y"} onCheckedChange={(c) => setACandidateNoticePeriod(c ? "Y" : "N")} />
                  <span className="text-sm">Candidate Notice Period / Last Working Day</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={aCandidateTotalWorkExp === "Y"} onCheckedChange={(c) => setACandidateTotalWorkExp(c ? "Y" : "N")} />
                  <span className="text-sm">Candidate Total Work Experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={aCandidateCurrentLocation === "Y"} onCheckedChange={(c) => setACandidateCurrentLocation(c ? "Y" : "N")} />
                  <span className="text-sm">Candidate Current Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={aCandidateCurrentSalary === "Y"} onCheckedChange={(c) => setACandidateCurrentSalary(c ? "Y" : "N")} />
                  <span className="text-sm">Candidate Current Salary</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={aCandidateExpectedSalary === "Y"} onCheckedChange={(c) => setACandidateExpectedSalary(c ? "Y" : "N")} />
                  <span className="text-sm">Candidate Expected Salary</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={aCandidateCurrentCompany === "Y"} onCheckedChange={(c) => setACandidateCurrentCompany(c ? "Y" : "N")} />
                  <span className="text-sm">Candidate Current Company</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 4: AI Screening Interview Creation Request */}
      {attemptDetails > 0 && (
        <div className="mb-6 bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold">Ongoing Interview, Interview Structure Disabled</h3>
        </div>
      )}
      
      <div className="mb-6 bg-white p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-3">AI Screening Interview Creation Request</h2>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={createInterviewOption === "no"} 
              onChange={(e) => setCreateInterviewOption(e.target.checked ? "no" : "now")} 
              disabled={attemptDetails > 0}
            />
            <span className={attemptDetails > 0 ? "text-gray-400" : ""}>Do Not Create the Interview</span>
          </label>
          <label className="flex items-center gap-2">
            <input 
              type="checkbox"
              checked={createInterviewOption === "now"} 
              onChange={(e) => setCreateInterviewOption(e.target.checked ? "now" : "no")} 
              disabled={attemptDetails > 0}
            />
            <span className={attemptDetails > 0 ? "text-gray-400" : ""}>Create Interview Now</span>
          </label>
        </div>

        {/* Interview Structure - only show when Create Interview Now is selected */}
        {createInterviewOption === "now" && (
          <div className="mt-6 border-t pt-4">
            <div className="mb-4">
              <p className="text-sm mb-2">
                <span className="text-red-500">*</span>
                <span className="text-muted-foreground">Please choose the subjects below to create the interview</span>
              </p>
            </div>

            {/* Speaking Skill Checkbox and Table */}
            <div className="mb-4">
              <p className="text-sm mb-2">
                <span className="text-red-500">*</span>
                <span className="text-muted-foreground">Please check this checkbox if you need speaking skill in this interview</span>
              </p>
              <Checkbox
                checked={includeBehavioral}
                onCheckedChange={(c) => setIncludeBehavioral(c ? true : false)}
              />
            </div>

            {/* Speaking Skill Table - only show when checkbox is checked */}
            {includeBehavioral && (
              <div className="mb-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center w-[200px] max-w-[200px]">Subject</TableHead>
                      <TableHead className="text-center w-[200px] max-w-[200px]">Topic</TableHead>
                      <TableHead className="text-center w-[200px] max-w-[200px]">Difficulty Level of the Section</TableHead>
                      <TableHead className="text-center w-[120px] max-w-[120px]">Cut Off</TableHead>
                      <TableHead className="text-center w-[200px] max-w-[200px]">Assessment Subject (Choose Any One/Two)</TableHead>
                      <TableHead className="text-center w-[100px] max-w-[100px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="w-[200px] max-w-[200px] wrap-break-word">
                        <Select disabled value="speaking">
                          <SelectTrigger className="w-full">
                            <SelectValue>Speaking Skill</SelectValue>
                          </SelectTrigger>
                        </Select>
                      </TableCell>
                      <TableCell className="w-[200px] max-w-[200px] wrap-break-word">
                        <Select disabled>
                          <SelectTrigger className="w-full">
                            <SelectValue></SelectValue>
                          </SelectTrigger>
                        </Select>
                      </TableCell>
                      <TableCell className="w-[200px] max-w-[200px] wrap-break-word">
                        <Select disabled>
                          <SelectTrigger className="w-full">
                            <SelectValue></SelectValue>
                          </SelectTrigger>
                        </Select>
                      </TableCell>
                      <TableCell className="w-[120px] max-w-[120px] wrap-break-word">
                        <Input disabled value="" className="w-full" />
                      </TableCell>
                      <TableCell className="w-[200px] max-w-[200px] wrap-break-word">
                        <Select disabled value="2">
                          <SelectTrigger className="w-full">
                            <SelectValue>2</SelectValue>
                          </SelectTrigger>
                        </Select>
                      </TableCell>
                      <TableCell className="w-[100px] max-w-[100px] wrap-break-word"></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Instruction for main table */}
            <div className="mb-4">
              <p className="text-sm">
                <span className="text-red-500">*</span>
                <span className="text-muted-foreground">Please continue to add the subjects further to create the interview.</span>
              </p>
            </div>

            {/* Main Interview Sections Table */}
            <div className="mt-4">
              <div className="mb-3 flex justify-end">
                <Button
                  size="sm"
                  onClick={handleAddNewSection}
                  disabled={!domainRoleId || attemptDetails > 0}
                >
                  Add Section
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center w-[200px] max-w-[200px]">Subject</TableHead>
                      <TableHead className="text-center w-[200px] max-w-[200px]">Topic</TableHead>
                      <TableHead className="text-center w-[200px] max-w-[200px]">Difficulty Level of the Section</TableHead>
                      <TableHead className="text-center w-[120px] max-w-[120px]">Cut Off</TableHead>
                      <TableHead className="text-center w-[200px] max-w-[200px]">Assessment Subject (Choose Any One/Two)</TableHead>
                      <TableHead className="text-center w-[150px] max-w-[150px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
              
              {/* Dynamic rows table */}
              <TableBody>
                  {interviewSections.map((section, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="w-[200px] max-w-[200px] wrap-break-word">
                        <Select
                          value={section.subject}
                          onValueChange={(v) => {
                            const updated = [...interviewSections];
                            updated[idx].subject = v;
                            setInterviewSections(updated);
                            // Load topics for this subject
                            if (v) loadTopicsForSubject(v);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableSubjects(idx).map((s: any) => (
                              <SelectItem key={s.id} value={String(s.id)}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="w-[200px] max-w-[200px] wrap-break-word">
                        <MultiSelect
                          values={section.topics || []}
                          onValuesChange={(v) => {
                            const updated = [...interviewSections];
                            updated[idx].topics = v;
                            setInterviewSections(updated);
                          }}
                        >
                          <MultiSelectTrigger className="w-full max-w-full overflow-hidden">
                            <MultiSelectValue placeholder="Select Topics (min 3)" />
                          </MultiSelectTrigger>
                          <MultiSelectContent>
                            {(availableTopics[section.subject] || []).map((t: any) => (
                              <MultiSelectItem key={t.id} value={String(t.id)}>
                                {t.name}
                              </MultiSelectItem>
                            ))}
                          </MultiSelectContent>
                        </MultiSelect>
                      </TableCell>
                      <TableCell className="w-[200px] max-w-[200px] wrap-break-word">
                        <MultiSelect
                          values={section.level || []}
                          onValuesChange={(v) => {
                            const updated = [...interviewSections];
                            updated[idx].level = v;
                            setInterviewSections(updated);
                          }}
                        >
                          <MultiSelectTrigger className="w-full max-w-full overflow-hidden">
                            <MultiSelectValue placeholder="Select Level" />
                          </MultiSelectTrigger>
                          <MultiSelectContent>
                            <MultiSelectItem value="Basic">Basic</MultiSelectItem>
                            <MultiSelectItem value="Average">Average</MultiSelectItem>
                            <MultiSelectItem value="Advanced">Advanced</MultiSelectItem>
                          </MultiSelectContent>
                        </MultiSelect>
                      </TableCell>
                      <TableCell className="w-[120px] max-w-[120px] wrap-break-word">
                        <Input
                          value={section.cutOff || ""}
                          disabled
                          className="w-full"
                          onChange={(e) => {
                            const updated = [...interviewSections];
                            updated[idx].cutOff = e.target.value;
                            setInterviewSections(updated);
                          }}
                        />
                      </TableCell>
                      <TableCell className="w-[200px] max-w-[200px] wrap-break-word">
                        <MultiSelect
                          values={section.aSubject || []}
                          onValuesChange={(v) => {
                            const updated = [...interviewSections];
                            updated[idx].aSubject = v;
                            setInterviewSections(updated);
                          }}
                        >
                          <MultiSelectTrigger className="w-full max-w-full overflow-hidden">
                            <MultiSelectValue placeholder="Assessment" />
                          </MultiSelectTrigger>
                          <MultiSelectContent>
                            <MultiSelectItem value="1">1</MultiSelectItem>
                            <MultiSelectItem value="2">2</MultiSelectItem>
                          </MultiSelectContent>
                        </MultiSelect>
                      </TableCell>
                      <TableCell className="w-[150px] max-w-[150px] wrap-break-word">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setInterviewSections((s) => s.filter((_, i) => i !== idx));
                          }}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 5: Job Promotion Request */}
      <div className="mb-6 bg-white p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Job Promotion Request</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* GoPrac DB */}
          <label className="p-3 border rounded-lg hover:border-blue-400 transition-colors bg-white cursor-pointer">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={promotionChecks.goprac}
                disabled={promotionChecks.doNotPromote}
                onChange={(e) => handlePromotionCheckboxChange("gopracDB", e.target.checked)}
                className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span className="font-medium text-sm flex-1">GoPrac DB</span>
            </div>
            {promotionChecks.goprac && generatedLinks.gopracDB && (
              <div className="mt-2 ml-6 flex gap-2" onClick={(e) => e.preventDefault()}>
                <Input
                  value={generatedLinks.gopracDB}
                  readOnly
                  className="bg-gray-50 text-xs h-8"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyLink("gopracDB")}
                  className="h-8 px-3 text-xs"
                >
                  Copy
                </Button>
              </div>
            )}
          </label>

          {/* Social Media */}
          <label className="p-3 border rounded-lg hover:border-blue-400 transition-colors bg-white cursor-pointer">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={promotionChecks.social}
                disabled={promotionChecks.doNotPromote}
                onChange={(e) => handlePromotionCheckboxChange("social", e.target.checked)}
                className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span className="font-medium text-sm flex-1">Social Media</span>
            </div>
            {promotionChecks.social && generatedLinks.social && (
              <div className="mt-2 ml-6 flex gap-2" onClick={(e) => e.preventDefault()}>
                <Input
                  value={generatedLinks.social}
                  readOnly
                  className="bg-gray-50 text-xs h-8"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyLink("social")}
                  className="h-8 px-3 text-xs"
                >
                  Copy
                </Button>
              </div>
            )}
          </label>

          {/* LinkedIn */}
          <label className="p-3 border rounded-lg hover:border-blue-400 transition-colors bg-white cursor-pointer">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={promotionChecks.linkedin}
                disabled={promotionChecks.doNotPromote}
                onChange={(e) => handlePromotionCheckboxChange("linkedIn", e.target.checked)}
                className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span className="font-medium text-sm flex-1">LinkedIn</span>
            </div>
            {promotionChecks.linkedin && generatedLinks.linkedin && (
              <div className="mt-2 ml-6 flex gap-2" onClick={(e) => e.preventDefault()}>
                <Input
                  value={generatedLinks.linkedin}
                  readOnly
                  className="bg-gray-50 text-xs h-8"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyLink("linkedin")}
                  className="h-8 px-3 text-xs"
                >
                  Copy
                </Button>
              </div>
            )}
          </label>

          {/* Naukri */}
          <label className="p-3 border rounded-lg hover:border-blue-400 transition-colors bg-white cursor-pointer">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={promotionChecks.naukri}
                disabled={promotionChecks.doNotPromote}
                onChange={(e) => handlePromotionCheckboxChange("naukri", e.target.checked)}
                className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span className="font-medium text-sm flex-1">Naukri</span>
            </div>
            {promotionChecks.naukri && generatedLinks.naukri && (
              <div className="mt-2 ml-6 flex gap-2" onClick={(e) => e.preventDefault()}>
                <Input
                  value={generatedLinks.naukri}
                  readOnly
                  className="bg-gray-50 text-xs h-8"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyLink("naukri")}
                  className="h-8 px-3 text-xs"
                >
                  Copy
                </Button>
              </div>
            )}
          </label>

          {/* Internal Sourcing */}
          <label className="p-3 border rounded-lg hover:border-blue-400 transition-colors bg-white cursor-pointer">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={promotionChecks.internal}
                disabled={promotionChecks.doNotPromote}
                onChange={(e) => handlePromotionCheckboxChange("ist", e.target.checked)}
                className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span className="font-medium text-sm flex-1">Internal Sourcing</span>
            </div>
            {promotionChecks.internal && generatedLinks.ist && (
              <div className="mt-2 ml-6 flex gap-2" onClick={(e) => e.preventDefault()}>
                <Input
                  value={generatedLinks.ist}
                  readOnly
                  className="bg-gray-50 text-xs h-8"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyLink("ist")}
                  className="h-8 px-3 text-xs"
                >
                  Copy
                </Button>
              </div>
            )}
          </label>

          {/* Do Not Promote */}
          <label className="p-3 border-2 rounded-lg border-red-200 bg-red-50 hover:border-red-300 transition-colors cursor-pointer">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={promotionChecks.doNotPromote}
                onChange={(e) => handlePromotionCheckboxChange("doNotPromote", e.target.checked)}
                disabled={serviceType === "IAS"}
                className="w-4 h-4 cursor-pointer accent-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span className="font-medium text-sm text-red-700 flex-1">Do Not Promote</span>
            </div>
          </label>
        </div>
      </div>

      {/* Message if interview created and needs publish */}
      {selectedInterviewId && mode === "modify" && serviceType === "RAS" && (
        <div className="mb-4 bg-blue-50 border border-blue-200 p-4 rounded">
          <p className="text-center text-blue-800">
            Please click Publish button to Publish the Job on the website
          </p>
        </div>
      )}

      {/* Save / Publish buttons */}
      <div className="flex gap-3 flex-wrap">
        <Button onClick={() => createInterview()} disabled={saving || s3Uploading}>
          {saving || s3Uploading ? "Saving..." : mode === "modify" ? "Update Job" : "Save Job"}
        </Button>
        
        {mode === "modify" && selectedInterviewId && (
          <>
            <Button onClick={() => handlePublish(1)} variant="default">
              Publish
            </Button>
            
            <Button onClick={handlePreviewLink} variant="outline">
              Preview
            </Button>
            
            {serviceType === "IAS" && (
              <Button onClick={handleCreateLink} variant="outline">Create Link</Button>
            )}
            
            <Button variant="destructive" onClick={() => handleDelete(selectedInterviewId ? [selectedInterviewId] : [])}>
              Delete
            </Button>
          </>
        )}
      </div>

      {/* Link Box and Copy Box (IAS only, matches viewmodel) */}
      {mode === "modify" && serviceType === "IAS" && showLinkBox && (
        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1">
            <Input 
              value={iasJobLink} 
              readOnly 
              className="bg-gray-50"
            />
            {displayMsg && (
              <span className="text-sm text-green-600 ml-2">{displayMsg}</span>
            )}
          </div>
          {showCopyBox && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => handleCopyLink()}
              title="Copy Link"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
              </svg>
            </Button>
          )}
        </div>
      )}

      {/* Skill dialog */}
      <Dialog open={skillDialogOpen} onOpenChange={setSkillDialogOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Add Skill</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Search or enter skill</Label>
            <Input value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} placeholder="Type skill name..." />
            <div className="mt-3 text-sm">
              <div>Matching skills:</div>
              <ul className="list-disc pl-5">
                {skillsList
                  .filter((s) => (s.favourite_subject || s.name || "").toLowerCase().includes(skillSearch.trim().toLowerCase()))
                  .slice(0, 10)
                  .map((s) => <li key={s.id}>{s.favourite_subject || s.name}</li>)}
              </ul>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <Button onClick={() => setSkillDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddSkill} disabled={skillAddDisabled}>Add</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Match Count Dialog */}
      <Dialog open={jobMatchDialogOpen} onOpenChange={setJobMatchDialogOpen}>
        <DialogContent className="max-w-2xl p-6">
          <DialogHeader>
            <DialogTitle>Job Match Count</DialogTitle>
          </DialogHeader>
          <div>
            {jobMatchData && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {jobMatchData.intDBJobMatch3monthCount || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">3 Month DB Matches</div>
                  </div>
                  <div className="border rounded p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {jobMatchData.intDBJobMatch6monthCount || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">6 Month DB Matches</div>
                  </div>
                  <div className="border rounded p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {jobMatchData.intDBJobMatch12monthCount || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">12 Month DB Matches</div>
                  </div>
                </div>
                
                {(jobMatchData.marketingdata3Month || jobMatchData.marketingdata6Month || jobMatchData.marketingdata12Month) && (
                  <>
                    <h3 className="font-semibold mt-4">Marketing Data</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border rounded p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {jobMatchData.marketingdata3Month || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">3 Month Marketing</div>
                      </div>
                      <div className="border rounded p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {jobMatchData.marketingdata6Month || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">6 Month Marketing</div>
                      </div>
                      <div className="border rounded p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {jobMatchData.marketingdata12Month || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">12 Month Marketing</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            <DialogFooter className="mt-4">
              <Button onClick={() => setJobMatchDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Associate corporate dialog */}
      <Dialog open={associateCorporateDialogOpen} onOpenChange={setAssociateCorporateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Associating Interviews To Corporate</DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Corporate Name
              </label>
              <div className="border rounded max-h-64 overflow-y-auto">
                {corporateNameList.map((corporate: any) => (
                  <div
                    key={corporate.id}
                    className={`p-2 cursor-pointer hover:bg-blue-50 ${
                      selectedCorporateIds.includes(String(corporate.id)) ? 'bg-blue-100 hover:bg-blue-200' : ''
                    }`}
                    onClick={() => {
                      const id = String(corporate.id);
                      if (selectedCorporateIds.includes(id)) {
                        setSelectedCorporateIds(selectedCorporateIds.filter(cid => cid !== id));
                      } else {
                        setSelectedCorporateIds([...selectedCorporateIds, id]);
                      }
                    }}
                  >
                    {corporate.firstName || corporate.name || `Corporate ${corporate.id}`}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setAssociateCorporateDialogOpen(false);
                  setSelectedCorporateIds([]);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={submitAssociateCorporate}
                disabled={loading || selectedCorporateIds.length === 0}
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification */}
      {notify && (
        <div className={`fixed bottom-6 right-6 p-3 rounded shadow ${notify.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {notify.text}
        </div>
      )}
    </div>
  );
}
