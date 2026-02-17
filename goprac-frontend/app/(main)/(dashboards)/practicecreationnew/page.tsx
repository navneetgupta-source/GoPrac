"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronDown, Copy, Divide } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from "@/components/ui/dialog";

// TODO : ADD a LFL Columnn with enum 'Y' , "N" value.
// Y -> Locked- No LAR Completion FOLLOW-UP (Job: Practice_Reminders V-4).
// N -> Lock disabled

type PracticeForm = {
  practiceName: string;
  duration: string;
  institute: string;
  logo: File | null;
  domain: string;
  competency: string[];
  practiceType: string;
  description: string;
  core1Topics: string;
  core2Topics: string;
  coreSubject1: string;
  coreSubject2: string;
  difficultyLevel: string;
  preId?: any;
  YOE: string;
};

type CompetencyRow = {
  competencies: string[];
  competencyName?: string;
  topics: string[]; // selected topic IDs
  topicObjects?: {   // all topics for the row
    topicId: string;
    topicName: string;
    subjectId: string;
  }[];
  difficulty: string;
  subjectIds?: string[];
};

export default function PracticeCreation() {
  const [open, setOpen] = useState(false);
  const [existingLogo, setExistingLogo] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [logoUploadUrl, setLogoUploadUrl] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<"success" | "error" | null>(null);

  const [formData, setFormData] = useState<PracticeForm>({
    practiceName: "",
    duration: "",
    institute: "",
    logo: null,
    domain: "",
    competency: [],
    practiceType: "",
    description: "",
    core1Topics: "",
    core2Topics: "",
    coreSubject1: "",
    coreSubject2: "",
    difficultyLevel: "",
    preId: "",
    YOE: "",
  });

  const [filters, setFilters] = useState<any>({
    collegeNames: [],
    roleNames: [],
    competencySubject: [],
    practiceList: [],
  });

  // const toggleItem = (id: string) => {
  //   const exists = formData.competency.includes(id);
  //   setFormData({
  //     ...formData,
  //     competency: exists
  //       ? formData.competency.filter((c) => c !== id)
  //       : [...formData.competency, id],
  //   });
  // };

  // const selectedNames = filters.competencySubject
  //   .filter((c: any) => formData.competency.includes(c.id.toString()))
  //   .map((c: any) => c.name);

  const [competencyRows, setCompetencyRows] = useState<CompetencyRow[]>([
    {
      competencies: [],
      topics: [],
      topicObjects: [], // ✅ initialize empty array
      difficulty: "",
      subjectIds: [],
    },
  ]);
    // Auto-fetch topics for each competency row when its competencies change
    useEffect(() => {
      competencyRows.forEach((row, idx) => {
        // Only fetch if competencies are set and topicObjects is empty
        if (row.competencies.length > 0 && (!row.topicObjects || row.topicObjects.length === 0)) {
          fetchTopics(row.competencies).then((topics) => {
            setCompetencyRows((prevRows) => {
              const copy = [...prevRows];
              // Only update if still empty (avoid overwriting user selection)
              if (!copy[idx].topicObjects || copy[idx].topicObjects.length === 0) {
                copy[idx] = { ...copy[idx], topicObjects: topics };
              }
              return copy;
            });
          });
        }
      });
    }, [competencyRows.map(row => row.competencies.join(","))]);

  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  // 🔹 NEW: mode and selectedPracticeId
  const [mode, setMode] = useState<"start" | "create" | "edit">("start");
  const [selectedPracticeId, setSelectedPracticeId] = useState<string | null>(null);
  const [openAssoc, setOpenAssoc] = useState(false);
  const [statusModal, setStatusModal] = useState({ open: false, message: "", success: true });
  const [assocType, setAssocType] = useState<"institute" | "corporate" | null>(null);
  const [emailList, setEmailList] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string>("");
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Helper: Reset all save-related state (Save button, popups)
  const resetSaveState = () => {
    setSubmitting(false);
    setShowActionButtons(false);
    setShowSuccessPopup(false);
  };
  const [practiceName, setPracticeName] = useState("");
  const [practiceLink, setPracticeLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [popupMessage, setPopupMessage] = useState("Practice Created Successfully");
  const [showEditWarning, setShowEditWarning] = useState(false);

  const filteredCompetencies =
    filters.competencySubject?.filter(
      (c: any) => c.roleId?.toString() === formData.domain
    ) || [];

  // 🔹 Reset invalid competency rows if domain or main competencies change
  useEffect(() => {
    setCompetencyRows((prevRows) => {
      let changed = false;

      const updatedRows = prevRows.map((row) => {
        const validCompetencies = row.competencies.filter((id) =>
          filteredCompetencies.some((fc) => fc.id.toString() === id)
        );

        if (
          validCompetencies.length !== row.competencies.length ||
          validCompetencies.length === 0
        ) {
          changed = true;
          // Reset difficulty if all competencies are removed
          return {
            ...row,
            competencies: validCompetencies,
            topics: [],
            topicObjects: [],
            difficulty: validCompetencies.length === 0 ? "" : row.difficulty,
          };
        }
        return row;
      });

      // 🧠 Only update state if something actually changed
      return changed ? updatedRows : prevRows;
    });
    // 👇 safer dependencies — avoid full array
    // We only depend on domain and competency IDs (stringified)
  }, [formData.domain, JSON.stringify(formData.competency)]);

  // 🧩 Auto-remove invalid main dropdown competencies when domain changes
  useEffect(() => {
    if (!formData.domain || !formData.competency?.length) return;

    const validIds = filteredCompetencies.map((fc: any) => fc.id.toString());
    const filteredSelection = formData.competency.filter((id) =>
      validIds.includes(id)
    );

    if (filteredSelection.length !== formData.competency.length) {
      setFormData((prev) => ({
        ...prev,
        competency: filteredSelection,
      }));
    }
  }, [formData.domain]);

  // Fetch filter data from backend
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await fetch(
          // `${process.env.NEXT_PUBLIC_NODE_API}/practiceCreation/getPracticeCreationFilters`,
          `${process.env.NEXT_PUBLIC_API_URL}/index.php?getPracticeCreationFilters`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: 1, userType: "admin" }),
          }
        );
        const data = await res.json();
        if (data.status === 1) {
          setFilters(data.data);
        }
      } catch (err) {
        console.error("Error fetching filters:", err);
      }
    };

    fetchFilters();
  }, []);

  // Fetch details when editing
  const fetchPracticeDetails = async (id: string) => {
    try {
      const res = await fetch(
        // `${process.env.NEXT_PUBLIC_NODE_API}/practiceCreation/getPracticeDetails`,
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?getPracticeDetails`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ preInterviewId: id }), // 🔑 send ID here
        }
      );

      const data = await res.json();

      if (data.status === 1) {
        const practice = data.data.practiceForm;
        const allCompetencies =
          data.data.competencies?.map((c: any) => c.subjectId) || [];

        setFormData({
          practiceName: practice.practiceName ?? "",
          duration: practice.duration ?? "",
          institute: practice.college_id?.toString() ?? "",
          logo: null, // only if uploading new
          domain: practice.roleId?.toString() ?? "",
          competency: allCompetencies,
          practiceType: practice.practiceType ?? "",
          description: practice.description ?? "",
          core1Topics: "",
          core2Topics: "",
          coreSubject1: "",
          coreSubject2: "",
          difficultyLevel: "",
          preId: id,
          YOE: practice.YOE ?? "",
        });

        // setCompetencyRows(
        //   data.data.competencies?.map((c: any) => {
        //     const allIds = Array.isArray(c.topicId)
        //       ? c.topicId
        //       : (c.topicId || "").split(",").filter(Boolean);
        //     const allNames = Array.isArray(c.topicName)
        //       ? c.topicName
        //       : (c.topicName || "").split(",").filter(Boolean);
        //     const selectedIds = Array.isArray(c.selectedTopicIds)
        //       ? c.selectedTopicIds
        //       : (c.selectedTopicIds || "").split(",").filter(Boolean);

        //     return {
        //       competencies: [c.subjectId?.toString()],
        //       competencyName: c.subjectName || "",
        //       subjectIds: [c.subjectId?.toString()], // ✅ for color generation
        //       topicIds: allIds,                      // ✅ all topic IDs for dropdown
        //       topicNames: allNames,                  // ✅ all topic names for dropdown
        //       topics: selectedIds,                   // ✅ preselected topics
        //       difficulty: (() => {
        //         const diff = c.difficulty?.toLowerCase() || "";
        //         if (diff === "easy") return "basic";
        //         if (diff === "medium") return "average";
        //         if (diff === "hard") return "advanced";
        //         return diff;
        //       })(),
        //     };
        //   }) || []
        // );

        setCompetencyRows(
          data.data.competencies?.map((c: any) => {
            // ✅ Convert topicId/topicName arrays into objects
            const topicObjects = Array.isArray(c.topicId)
              ? c.topicId.map((tId: string, i: number) => ({
                topicId: tId?.toString(),
                topicName: c.topicName?.[i] ?? "",
                subjectId: c.subjectId?.toString(),
              }))
              : (c.topicId || "").split(",").filter(Boolean).map((tId: string, i: number) => ({
                topicId: tId?.toString(),
                topicName: Array.isArray(c.topicName) ? c.topicName[i] : (c.topicName || "").split(",")[i] || "",
                subjectId: c.subjectId?.toString(),
              }));

            // ✅ Extract selected topic IDs properly (support CSV and array)
            const selectedIds = Array.isArray(c.selectedTopicIds)
              ? c.selectedTopicIds
              : (c.selectedTopicIds || "").split(",").filter(Boolean);

            // ✅ Derive UI difficulty from clusterLevel (Edge Case 8)
            // clusterLevel is stored as "Basic,Average,Advanced" or similar cluster
            // Extract the FIRST value as the selected difficulty
            let uiDifficulty = "";
            if (c.difficulty) {
              const clusterLevel = c.difficulty.toString();
              const firstLevel = clusterLevel.split(",")[0]?.trim() || "";
              // Normalize casing
              const normalized = firstLevel.toLowerCase();
              if (normalized === "basic" || normalized === "easy") uiDifficulty = "Basic";
              else if (normalized === "average" || normalized === "medium") uiDifficulty = "Average";
              else if (normalized === "advanced" || normalized === "hard") uiDifficulty = "Advanced";
            }

            return {
              competencies: [c.subjectId?.toString()],
              competencyName: c.subjectName || "",
              subjectIds: [c.subjectId?.toString()],
              topicObjects, // ✅ now correctly populated
              topics: selectedIds, // ✅ preselect topics
              difficulty: uiDifficulty,
            };
          }) || []
        );

        setExistingLogo(practice.logo?.text ?? null);
      } else {
        alert("❌ Failed to load practice details");
      }
    } catch (err) {
      console.error("Error fetching practice details:", err);
    }
  };

  const fetchTopics = async (competencyIds: string[]): Promise<any[]> => {
    const validSubjectIds = competencyIds
      .filter(id => id && id.trim() !== "") // Remove null/empty/whitespace strings
      .map(id => Number(id)) // Convert to number
      .filter(num => !isNaN(num) && num > 0); // Remove NaN and zero

    if (validSubjectIds.length === 0) {
      console.warn("⚠️ No valid subject IDs to fetch topics for.");
      return [];
    }
    try {
      const res = await fetch(
        // `${process.env.NEXT_PUBLIC_NODE_API}/practiceCreation/getInterviewTopicsPractice`,
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?getInterviewTopicsPractice`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: 1,
            userType: "admin",
            subjectId: validSubjectIds,
          }),
        }
      );

      const data = await res.json();

      // ✅ Ensure data.data.topicList is an array
      if (!data?.data?.topicList || !Array.isArray(data.data.topicList)) {
        console.warn("⚠️ Unexpected topics API response:", data);
        return []; // fallback: return empty array to prevent .filter crash
      }

      return data.data.topicList.map((t: any) => ({
        topicId: t.topicId?.toString(),
        topicName: t.topicName ?? "",
        subjectId: t.subjectId?.toString(),
      }));
    } catch (err) {
      console.error("❌ Failed to fetch topics:", err);
      return []; // fallback to safe empty array
    }
  };

  // Enforce a cap of ONE competency row with multi-select competencies
  const addCompetencyRow = () => {
    setCompetencyRows((prevRows) => {
      if (prevRows.length >= 1) return prevRows;
      return [
        ...prevRows,
        {
          competencies: [],
          topics: [],
          topicObjects: [],
          difficulty: "",
          subjectIds: [],
        },
      ];
    });
  };

  const updateCompetencyRow = async (
    index: number,
    field: string,
    value: string | string[]
  ) => {
    if (field === "competencies" && Array.isArray(value)) {
      const topics = await fetchTopics(value);
      setCompetencyRows(prev => {
        const copy = [...prev];
        const row = { ...copy[index], competencies: value, topicObjects: topics, topics: [] };
        copy[index] = row;
        return copy;
      });
    } else {
      setCompetencyRows(prev => {
        const copy = [...prev];
        const row = { ...copy[index], [field]: value };
        copy[index] = row;
        return copy;
      });
    }
  };

  const deleteCompetencyRow = (index: number) => {
    setCompetencyRows(competencyRows.filter((_, i) => i !== index));
  };

  const handlePracticeSelect = async (val: string) => {
    resetSaveState();
    if (val === "new") {
      setMode("create");
      setSelectedPracticeId(null);
      setFormData({
        practiceName: "",
        duration: "",
        institute: "",
        logo: null,
        domain: "",
        competency: [] as string[],
        practiceType: "",
        description: "",
        core1Topics: "",
        core2Topics: "",
        coreSubject1: "",
        coreSubject2: "",
        difficultyLevel: "",
        preId: "",
        YOE: "",
      });
      setCompetencyRows([
        {
          competencies: [],
          topics: [],
          topicObjects: [],
          difficulty: "",
          subjectIds: [],
        },
      ]);
      return;
    }
    setMode("edit");
    setSelectedPracticeId(val);
    await fetchPracticeDetails(val);
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.practiceName.trim()) {
      newErrors.practiceName = "Practice name is required.";
    }
    if (!formData.duration.trim()) {
      newErrors.duration = "Duration is required.";
    }

    // if (!formData.institute?.trim()) {
    //   newErrors.institute = "Please select an institute.";
    // }

    if (!formData.domain) {
      newErrors.domain = "Please select a domain.";
    }
    if (!formData.competency || formData.competency.length === 0) {
      newErrors.competency = "Please select a competency.";
    }
    if (!formData.practiceType) {
      newErrors.practiceType = "Please select a practice type.";
    }
    if (!formData.YOE.trim()) {
      newErrors.YOE = "Years of Experience is required.";
    }

    // Interview Structure: required, not empty, each row must have subject, difficulty, and at least 3 topics PER competency
    if (!competencyRows || competencyRows.length === 0) {
      newErrors.competencyRows = { general: "Interview Structure is required. Please add at least one competency row." };
    } else {
      const competencyRowErrors: { [key: number]: { subject?: string; topics?: string; difficulty?: string } } = {};
      competencyRows.forEach((row, idx) => {
        // Subject required
        if (!row.competencies || row.competencies.length === 0 || !row.competencies[0]) {
          if (!competencyRowErrors[idx]) competencyRowErrors[idx] = {};
          competencyRowErrors[idx].subject = "Please select at least one competency for this row.";
        }
        
        // Edge Case 9: Prevent topics without subjects
        if (row.topics && row.topics.length > 0 && (!row.competencies || row.competencies.length === 0)) {
          if (!competencyRowErrors[idx]) competencyRowErrors[idx] = {};
          competencyRowErrors[idx].subject = "Cannot select topics without selecting competencies first.";
        }
        
        // Edge Case 10: Ensure topics are fully resolved
        if (row.competencies && row.competencies.length > 0 && (!row.topicObjects || row.topicObjects.length === 0)) {
          if (!competencyRowErrors[idx]) competencyRowErrors[idx] = {};
          competencyRowErrors[idx].topics = "Topics are still loading. Please wait before submitting.";
        }
        
        // Validate: Each competency must have at least 3 topics
        if (row.competencies && row.competencies.length > 0 && row.topicObjects && row.topicObjects.length > 0) {
          const topicsByCompetency: { [key: string]: number } = {};
          
          // Count topics per competency
          row.competencies.forEach(compId => {
            topicsByCompetency[compId] = 0;
          });
          
          // Count how many selected topics belong to each competency
          row.topics?.forEach(topicId => {
            const topicObj = row.topicObjects?.find(t => t.topicId === topicId);
            if (topicObj && topicsByCompetency.hasOwnProperty(topicObj.subjectId)) {
              topicsByCompetency[topicObj.subjectId]++;
            }
          });
          
          // Check if any competency has less than 3 topics
          const competenciesWithFewTopics = row.competencies.filter(compId => {
            return (topicsByCompetency[compId] || 0) < 3;
          });
          
          if (competenciesWithFewTopics.length > 0) {
            if (!competencyRowErrors[idx]) competencyRowErrors[idx] = {};
            const compNames = competenciesWithFewTopics.map(compId => {
              return filters.competencySubject.find((c: any) => c.id.toString() === compId)?.name || compId;
            }).join(", ");
            competencyRowErrors[idx].topics = `Each competency needs at least 3 topics. Missing for: ${compNames}`;
          }
        }
        
        // Edge Case 1: Difficulty required - never default silently
        if (!row.difficulty || row.difficulty.trim() === "") {
          if (!competencyRowErrors[idx]) competencyRowErrors[idx] = {};
          competencyRowErrors[idx].difficulty = "Please explicitly select a difficulty level.";
        }
      });
      if (Object.keys(competencyRowErrors).length > 0) {
        newErrors.competencyRows = competencyRowErrors;
      }
    }

    // if (!formData.description.trim()) {
    //   newErrors.description = "Description is required.";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    // Edge Case 3: Warn about destructive edit
    if (mode === "edit" && selectedPracticeId) {
      setShowEditWarning(true);
      return;
    }
    
    await executeSubmit();
  };

  const executeSubmit = async () => {
    setSubmitting(true);

    try {
      // Validate that each competency has at least 3 topics
      let validationError = "";
      competencyRows.forEach((row, idx) => {
        if (row.competencies && row.competencies.length > 0) {
          const topicsByCompetency: { [key: string]: number } = {};
          row.competencies.forEach(compId => { topicsByCompetency[compId] = 0; });
          
          row.topics?.forEach(topicId => {
            const topicObj = row.topicObjects?.find(t => t.topicId === topicId);
            if (topicObj && topicsByCompetency.hasOwnProperty(topicObj.subjectId)) {
              topicsByCompetency[topicObj.subjectId]++;
            }
          });
          
          row.competencies.forEach(compId => {
            if ((topicsByCompetency[compId] || 0) < 3) {
              const compName = filters.competencySubject.find((c: any) => c.id.toString() === compId)?.name || compId;
              validationError = `Each competency needs at least 3 topics. "${compName}" has only ${topicsByCompetency[compId] || 0} topics.`;
            }
          });
        }
      });
      
      if (validationError) {
        alert("⚠️ " + validationError);
        setSubmitting(false);
        return;
      }

      // 1️⃣ Prepare FormData
      const form = new FormData();

      // Main fields
      form.append("practiceName", formData.practiceName || "");
      form.append("practiceDuration", formData.duration || "");
      // Send null for college_id if not selected (legacy parity)
      form.append("college_id", formData.institute ? formData.institute : "null");
      form.append("roleId", formData.domain || "");
      form.append("practiceType", formData.practiceType || "");
      form.append("practiceDescription", formData.description || "");
      form.append("YOE", formData.YOE || "");

      // logoUrl for S3
      if (logoUploadUrl) form.append("logoUrl", logoUploadUrl);
      else if (existingLogo) form.append("logoUrl", existingLogo);

      // Edge Case 7: Sort subject IDs deterministically before submit
      const sortedCompetencies = [...(formData.competency || [])].sort((a, b) => Number(a) - Number(b));
      form.append("subjectId", sortedCompetencies.join(","));

      // form.append("competency", formData.competency?.join(",") || "");


      // 2️⃣ Group by difficulty (legacy logic: always send difficultyLevel as comma string with selected first)
      // Only up to 2 core subjects supported
      let core1: { subjectIds: string[]; topicIds: string[]; difficulty: string } = { subjectIds: [], topicIds: [], difficulty: "" };
      let core2: { subjectIds: string[]; topicIds: string[]; difficulty: string } = { subjectIds: [], topicIds: [], difficulty: "" };
      let core1Diff = "";
      let core2Diff = "";

      // Helper to get difficulty string in required order
      const getDifficultyLevelString = (selected: string) => {
        // Edge Case 6: Normalize casing to strict values
        const normalized = selected.trim();
        const lower = normalized.toLowerCase();
        let strictValue = "";
        if (lower === "basic" || lower === "easy") strictValue = "Basic";
        else if (lower === "average" || lower === "medium") strictValue = "Average";
        else if (lower === "advanced" || lower === "hard") strictValue = "Advanced";
        else {
          alert(`❌ Invalid difficulty value: "${selected}". Must be Basic, Average, or Advanced.`);
          throw new Error(`Invalid difficulty: ${selected}`);
        }
        
        const all = ["Basic", "Average", "Advanced"];
        const idx = all.indexOf(strictValue);
        // Edge Case 2: Always return cluster format
        return [all[idx], ...all.filter((d, i) => i !== idx)].join(",");
      };

      // Assign core1 and core2 from competencyRows (row 0 = section 3, row 1 = section 4)
      if (competencyRows[0]) {
        // Edge Case 7: Sort subject IDs deterministically
        core1.subjectIds = [...(competencyRows[0].competencies ?? [])].sort((a, b) => Number(a) - Number(b));
        core1.topicIds = competencyRows[0].topics ?? [];
        core1.difficulty = competencyRows[0].difficulty || "";
        // Edge Case 1: Block if difficulty not selected (validation already checked this)
        if (core1.difficulty) {
          core1Diff = getDifficultyLevelString(core1.difficulty);
        }
      }
      if (competencyRows[1]) {
        // Edge Case 7: Sort subject IDs deterministically
        core2.subjectIds = [...(competencyRows[1].competencies ?? [])].sort((a, b) => Number(a) - Number(b));
        core2.topicIds = competencyRows[1].topics ?? [];
        core2.difficulty = competencyRows[1].difficulty || "";
        // Edge Case 1: Block if difficulty not selected (validation already checked this)
        if (core2.difficulty) {
          core2Diff = getDifficultyLevelString(core2.difficulty);
        }
      }

      const formatTopics = (topics: string[]) =>
        topics?.length ? topics.join(",") : "";

      const formatSubjects = (subjects: string[]) =>
        subjects?.length ? subjects.join(",") : "";

      form.append("core1Topics", formatTopics(core1.topicIds));
      form.append("core2Topics", formatTopics(core2.topicIds));
      form.append("coreSubject1", formatSubjects(core1.subjectIds));
      form.append("coreSubject2", formatSubjects(core2.subjectIds));
      
      // Compose difficultyLevel as per legacy: core1Diff,core2Diff (skip empty)
      const finalDifficultyLevel = [core1Diff, core2Diff].filter(Boolean).join(",");
      
      // Edge Case 2: Validate that difficultyLevel is always a cluster, never a single value
      if (finalDifficultyLevel) {
        const parts = finalDifficultyLevel.split(",");
        // Each cluster should have 3 values (selected + 2 others)
        // For 1 row: 3 values. For 2 rows: 6 values.
        if (parts.length % 3 !== 0) {
          alert(`❌ Invalid difficulty cluster format. Expected multiples of 3, got ${parts.length} values.`);
          setSubmitting(false);
          return;
        }
      }
      
      form.append("difficultyLevel", finalDifficultyLevel);

      // 3️⃣ Include preId for edit mode, pass null for new practice
      form.append("preId", mode === "edit" && selectedPracticeId ? selectedPracticeId : "");

      // 4️⃣ API Call
      const res = await fetch(
        // `${process.env.NEXT_PUBLIC_NODE_API}/practiceCreation/createPacticeInterview_GoPrac`,
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?createPacticeInterview_GoPrac`,
        { method: "POST", body: form }
      );

      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch (err) {
        console.error("❌ Non-JSON response:", raw);
        alert("Unexpected server response. Please try again later.");
        setSubmitting(false);
        return;
      }

      // 5️⃣ Handle success
      if (data.status === 1) {
        const preInterviewId = data.preId || selectedPracticeId;
        const link = `${window.location.origin}/job?p=${preInterviewId}`;

        setPracticeName(formData.practiceName);
        setPracticeLink(link);

        // 🔹 Unified popup (works for create & edit)
        setPopupMessage(
          mode === "create"
            ? "Practice Created Successfully"
            : "Practice Updated Successfully"
        );

        setShowActionButtons(true);
        setShowSuccessPopup(true);
      } else {
        alert("❌ Failed: " + (data.errorCode || data.data || "Unknown error"));
      }
    } catch (err) {
      console.error("Error calling API:", err);
      alert("❌ Something went wrong while saving.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (formData?.preId) {
      setPracticeLink(`${window.location.origin}/job?p=${formData.preId}`);
    }
  }, [formData?.preId]);


  // Helper: consistent unique color for each competency/subject
  const generateUniqueColor = (subjectId: string | number) => {
    const colors = [
      "#FFB6C1", // Pink
      "#FFD580", // Orange
      "#B0E0E6", // Light Blue
      "#98FB98", // Light Green
      "#E6E6FA", // Lavender
      "#FFA07A", // Light Salmon
      "#AFEEEE", // Pale Turquoise
      "#D8BFD8", // Thistle
      "#FFE4B5", // Moccasin
      "#F0E68C", // Khaki
      "#DDA0DD", // Plum
      "#87CEEB", // Sky Blue
    ];
    const idNum = parseInt(subjectId.toString(), 10);
    return colors[idNum % colors.length];
  };

  const totalSelectedTopics = competencyRows.reduce(
    (count, row) => count + (row.topics?.length || 0),
    0
  );

  const fetchAssociationData = async (type: "institute" | "corporate") => {
    if (!selectedPracticeId) {
      alert("⚠️ Please select a practice first.");
      return;
    }

    setAssocType(type);
    setOpenAssoc(true);

    try {
      const endpoint =
        type === "institute"
          ? "getPracticeAssociated"
          : "getPracticeAssociated2";

      const res = await fetch(
        // `${process.env.NEXT_PUBLIC_NODE_API}/practiceCreation/${endpoint}`,
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: 1,
            userType: "admin",
            preInterviewId: selectedPracticeId,
          }),
        }
      );

      const data = await res.json();
      if (data.status === 1) {
        setEmailList(data.data.corporateList || []);
      } else {
        alert("❌ Failed to fetch data");
      }
    } catch (err) {
      console.error("Error fetching association data:", err);
    }
  };

  // 🟢 Handle Save
  const handleSaveAssociation = async () => {
    if (!selectedEmail) {
      setStatusModal({ open: true, message: "⚠️ Please select an email.", success: false });
      return;
    }

    if (!selectedPracticeId) {
      setStatusModal({ open: true, message: "⚠️ Please select a practice first.", success: false });
      return;
    }

    try {
      const endpoint = assocType === "institute" ? "associatingCollegeId" : "associatingCorporateId";
      const selectedUser = emailList.find((u) => u.emailId === selectedEmail);
      const userId = selectedUser?.id;

      if (!userId) {
        setStatusModal({ open: true, message: "❌ Could not find selected user's ID.", success: false });
        return;
      }

      const body =
        assocType === "institute"
          ? { userId: 1, userType: "admin", preInterviewId: selectedPracticeId, collegeUserId: [userId] }
          : { userId: 1, userType: "admin", preInterviewId: selectedPracticeId, corporateUserId: [userId] };

      // const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API}/practiceCreation/${endpoint}`, {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.status === 1) {
        setStatusModal({
          open: true,
          message: `✅ ${assocType} associated successfully with: ${selectedEmail}`,
          success: true,
        });
      } else {
        setStatusModal({
          open: true,
          message: "❌ Association failed: " + (data.data || "Unknown error"),
          success: false,
        });
      }
    } catch (err) {
      console.error("Error saving association:", err);
      setStatusModal({ open: true, message: "❌ Something went wrong. Check console for details.", success: false });
    } finally {
      setOpenAssoc(false);
      setSelectedEmail("");
    }
  };

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    const f = e.target.files[0];
    setFile(f);
  }

  async function upload() {
    if (!file) return;

    try {
      // 1. Get presigned URL from server
      const resp = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        console.error("❌ Failed to get presigned URL:", errorData);
        alert(
          `Failed to get upload URL: ${errorData.error || errorData.details || 'Unknown error'}. ` +
          `Please check your AWS credentials in .env.local file.`
        );
        return;
      }

      const { uploadUrl, key } = await resp.json();

      // 2. Upload file using fetch PUT
      setUploading(true);
      const putResp = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    setUploading(false);

      if (!putResp.ok) {
        const errorText = await putResp.text();
        console.error("Upload failed", errorText);
        alert(`Upload to S3 failed: ${putResp.status} ${putResp.statusText}`);
        return;
      }

      // The file is now in S3 under `key`
      const publicUrl = `${process.env.NEXT_PUBLIC_AWS_S3_URL}/${key}`;
      console.log("Uploaded to:", publicUrl);
      setLogoUploadUrl(key);
      alert("✅ Logo uploaded successfully!");
    } catch (error: any) {
      setUploading(false);
      console.error("❌ Upload error:", error);
      alert(`Upload failed: ${error?.message || String(error)}`);
    }
  }

  const handleDeletePractice = async () => {
    // Use your existing fallback logic
    const preId = selectedPracticeId || formData.preId;

    if (!preId) {
      setShowConfirmDelete(false);
      setDeleteStatus("error");
      return;
    }

    try {
      const res = await fetch(
        // `${process.env.NEXT_PUBLIC_NODE_API}/practiceCreation/deletePracticeInterview`,
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?deletePracticeInterview`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preId }),
        }
      );

      const raw = await res.text();
      let data;

      try {
        data = JSON.parse(raw);
      } catch (err) {
        console.error("❌ Invalid JSON from server:", raw);
        setShowConfirmDelete(false);
        setDeleteStatus("error");
        return;
      }

      if (data.status === 1) {
        setShowConfirmDelete(false);
        setDeleteStatus("success");

        // optional reset after popup
        setTimeout(() => {
          setDeleteStatus(null);
          setShowActionButtons(false);
          setFormData({
            practiceName: "",
            duration: "",
            institute: "",
            logo: null,
            domain: "",
            competency: [],
            practiceType: "",
            description: "",
            core1Topics: "",
            core2Topics: "",
            coreSubject1: "",
            coreSubject2: "",
            difficultyLevel: "",
            preId: "",
            YOE: "",
          });
        }, 2000);
      } else {
        console.error("Delete failed:", data);
        setDeleteStatus("error");
      }
    } catch (err) {
      console.error("Error deleting practice:", err);
      setDeleteStatus("error");
    }
  };

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-center text-3xl font-bold">Practice Creation</h1>
      {/* Step 1: Choose action */}
      <Card className="max-w-lg mx-auto shadow-lg p-6 space-y-4 text-center">
        <CardTitle className="text-xl font-semibold">
          {mode === "start" ? "Select an Action" : "Switch or Create Practice"}
        </CardTitle>

        <Button
          onClick={() => {
            resetSaveState();
            setMode("create");
            setSelectedPracticeId(null);
            setFormData({
              practiceName: "",
              duration: "",
              institute: "",
              logo: null,
              domain: "",
              competency: [],
              practiceType: "",
              description: "",
              core1Topics: "",
              core2Topics: "",
              coreSubject1: "",
              coreSubject2: "",
              difficultyLevel: "",
              preId: "",
              YOE: "",
            });
            setCompetencyRows([
              {
                competencies: [],
                topics: [],
                topicObjects: [],
                difficulty: "",
                subjectIds: [],
              },
            ]);
            setLogoUploadUrl(null);
            setExistingLogo(null);
          }}
          className="bg-blue-500 hover:bg-blue-600 hover:cursor-pointer text-white font-semibold"
        >
          ➕ Create a New Practice
        </Button>

        <Select
          value={selectedPracticeId || ""}
          onValueChange={(val) => handlePracticeSelect(val)}
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="Edit an Existing Practice" />
          </SelectTrigger>
          <SelectContent>
            {filters.practiceList?.map((p: any, idx: number) => (
              <SelectItem
                key={`practice-${p.id}-${idx}`}
                value={p.id.toString()}
                className="cursor-pointer"
              >
                {p.name} ({p.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {/* Step 2: Show full form when mode is create or edit */}
      {mode !== "start" && (
        <>
          <Card className="max-w-6xl mx-auto shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">
                {mode === "create" ? "Create a New Practice" : "Edit Practice"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Fields in 2-column grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Practice Name */}
                <div className="flex flex-col">
                  <label className="mb-1 font-medium">Practice Name <span className="text-red-500">*</span></label>
                  <Input
                    placeholder="Enter practice name"
                    value={formData.practiceName}
                    onChange={(e) =>
                      setFormData({ ...formData, practiceName: e.target.value })
                    }
                  />
                  {errors.practiceName && (
                    <span className="text-red-500 text-sm">
                      {errors.practiceName}
                    </span>
                  )}
                </div>

                {/* Duration */}
                <div className="flex flex-col">
                  <label className="mb-1 font-medium">Duration (mins) <span className="text-red-500">*</span></label>
                  <Input
                    placeholder="Enter duration"
                    value={formData.duration ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                  />
                  {errors.duration && (
                    <span className="text-red-500 text-sm">
                      {errors.duration}
                    </span>
                  )}
                </div>

                {/* Years of Experience */}
                <div className="flex flex-col">
                  <label className="mb-1 font-medium">Years of Experience (range, e.g. 0-2) <span className="text-red-500">*</span></label>
                  <Input
                    placeholder="Enter range (e.g. 0-2)"
                    value={formData.YOE ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Allow partial inputs like "1", "1-" or "1-2"
                      if (/^\d{0,2}(-\d{0,2})?$/.test(val)) {
                        setFormData({ ...formData, YOE: val });
                      }
                    }}
                  />
                  {errors.YOE && (
                    <span className="text-red-500 text-sm">{errors.YOE}</span>
                  )}
                </div>

                {/* Institute */}
                <div className="flex flex-col">
                  <label className="mb-1 font-medium">Institute</label>
                  <Select
                    value={formData.institute}
                    onValueChange={(val) =>
                      setFormData({ ...formData, institute: val })
                    }
                  >
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue placeholder="Select Institute" />
                    </SelectTrigger>
                    <SelectContent>
                      {filters.collegeNames?.map(
                        (college: any, idx: number) => (
                          <SelectItem
                            key={`college-${college.id}-${idx}`}
                            value={college.id.toString()}
                            className="cursor-pointer"
                          >
                            {college.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  {errors.institute && (
                    <span className="text-red-500 text-sm">
                      {errors.institute}
                    </span>
                  )}
                </div>

                <div className="flex flex-col">
                  <div className="flex gap-4">
                    {existingLogo ? (
                      <div>
                        <label className="mb-1 font-medium">
                          Existing Logo
                        </label>
                        <img
                          src={`${process.env.NEXT_PUBLIC_AWS_S3_URL}/${existingLogo}`}
                          alt="Existing Logo"
                          className="mt-2 rounded border w-32 h-32 object-contain"
                        />
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        No logo uploaded
                      </span>
                    )}
                    {logoUploadUrl && (
                      <div>
                        {existingLogo && (
                          <label className="mb-1 font-medium">Uploaded Logo</label>
                        )}
                        <img
                          src={`${process.env.NEXT_PUBLIC_AWS_S3_URL}/${logoUploadUrl}`}
                          alt="Uploaded Logo"
                          className="mt-2 rounded border w-32 h-32 object-contain"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 items-center mt-2">
                    <Input
                      type="file"
                      accept="image/*"
                      className="cursor-pointer"
                      onChange={handleFileChange}
                    />
                    <Button onClick={upload} disabled={uploading || !file}>
                      {uploading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </div>

                {/* Domain */}
                <div className="flex flex-col">
                  <label className="mb-1 font-medium">Domain <span className="text-red-500">*</span></label>
                  <Select
                    value={formData.domain}
                    onValueChange={(val) =>
                      setFormData({ ...formData, domain: val })
                    }
                  >
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue placeholder="Select Domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {filters.roleNames.map((role: any, idx: number) => (
                        <SelectItem
                          key={`role-${role.id}-${idx}`}
                          value={role.id.toString()}
                          className="cursor-pointer"
                        >
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.domain && (
                    <span className="text-red-500 text-sm">
                      {errors.domain}
                    </span>
                  )}
                </div>

                {/* Competency */}
                <div className="flex flex-col">
                  <label className="mb-1 font-medium">Competencies <span className="text-red-500">*</span></label>

                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full justify-between rounded-lg border bg-white px-3 py-2 text-left text-sm cursor-pointer"
                      >
                        {formData.competency.length > 0
                          ? formData.competency
                            .map(
                              (id) =>
                                filters.competencySubject.find(
                                  (c: any) => c.id.toString() === id
                                )?.name
                            )
                            .filter(Boolean)
                            .join(", ")
                          : "Select Competencies"}
                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                      </button>
                    </PopoverTrigger>

                    <PopoverContent className="p-0 w-[300px]">
                      <Command>
                        <CommandInput placeholder="Search competencies..." />
                        <CommandList className="max-h-56 overflow-y-auto">
                          <CommandEmpty>No competencies found.</CommandEmpty>
                          <CommandGroup heading="All Competencies">
                            {filteredCompetencies
                              .sort((a: any, b: any) =>
                                a.name.localeCompare(b.name)
                              )
                              .map((c: any) => (
                                <CommandItem
                                  key={c.id}
                                  onSelect={() => {
                                    const exists = formData.competency.includes(c.id.toString());
                                    const newSelection = exists
                                      ? formData.competency.filter((id) => id !== c.id.toString())
                                      : [...formData.competency, c.id.toString()];
                                    setFormData({
                                      ...formData,
                                      competency: newSelection,
                                    });
                                  }}
                                  className={`flex justify-between px-3 py-2 rounded-md cursor-pointer
                                  ${formData.competency.includes(c.id.toString())
                                      ? "bg-gray-200 text-black"
                                      : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                  <span>{c.name}</span>
                                  {formData.competency.includes(c.id.toString()) && (
                                    <Check className="h-4 w-4 text-primary" />
                                  )}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {errors.competency && (
                    <span className="text-red-500 text-sm">
                      {errors.competency}
                    </span>
                  )}

                  {/* Show selected names inside the trigger-like box */}
                  {formData.competency.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {formData.competency.map((id) => {
                        const name = filters.competencySubject.find(
                          (c: any) => c.id.toString() === id
                        )?.name;
                        return (
                          <span
                            key={id}
                            className="bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded-full"
                          >
                            {name}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {errors.competency && (
                    <span className="text-red-500 text-sm">
                      {errors.competency}
                    </span>
                  )}
                </div>

                {/* Practice Type */}
                <div className="flex flex-col">
                  <label className="mb-1 font-medium">Practice Type <span className="text-red-500">*</span></label>
                  <Select
                    value={formData.practiceType}
                    onValueChange={(val) =>
                      setFormData({ ...formData, practiceType: val })
                    }
                  >
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue placeholder="Select Practice Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">-- Select Practice Type --</SelectItem>
                      <SelectItem value="freetrial" className="cursor-pointer">FreeTrial</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.practiceType && (
                    <span className="text-red-500 text-sm">
                      {errors.practiceType}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Description</label>
                <RichTextEditor
                  value={formData.description ?? ""}
                  onChange={(val) => setFormData({ ...formData, description: val })}
                  placeholder="Enter description"
                />
                {errors.description && (
                  <span className="text-red-500 text-sm">
                    {errors.description}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="max-w-6xl mx-auto shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Add Competencies to Practice
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Interview Structure Validation Errors */}
              {errors.competencyRows && (
                <div className="mb-2">
                  {/* General error (e.g., no rows) */}
                  {errors.competencyRows.general && (
                    <div className="text-red-500 text-sm text-center mb-1">
                      {errors.competencyRows.general}
                    </div>
                  )}
                  {/* Per-row errors */}
                  {Object.keys(errors.competencyRows)
                    .filter((k) => k !== "general")
                    .map((rowIdx) => {
                      const rowErr = errors.competencyRows[rowIdx];
                      if (!rowErr) return null;
                      return (
                        <div key={rowIdx} className="text-red-500 text-xs text-center">
                          Row {parseInt(rowIdx) + 1}: {Object.values(rowErr).filter(Boolean).join(" | ")}
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Add Competency Button (disabled if 2 rows) */}
              <div
                title={competencyRows.length >= 1 ? "You can only add one Row. | Select Up to 4 Competency." : "Add Competency"}
                className={competencyRows.length >= 1 ? "cursor-not-allowed inline-block" : "inline-block"}
              >
                <Button
                  variant="outline"
                  onClick={addCompetencyRow}
                  disabled={competencyRows.length >= 1}
                  className={
                    competencyRows.length >= 1
                      ? "cursor-not-allowed"
                      : "hover:cursor-pointer"
                  }
                >
                  Add Competency
                </Button>
              </div>

              {/* Table-like container */}
              <div className="border rounded-md">
                {/* Column Headers */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-semibold text-gray-700 bg-gray-100 p-3 border-b justify-center">
                  <div className="flex justify-center">Competency</div>
                  <div className="flex justify-center">Topic</div>
                  <div className="flex justify-center">Difficulty Level</div>
                  <div className="flex justify-center">Action</div>
                </div>

                {/* Dynamic rows */}
                {competencyRows.map((row, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-3 border-b"
                  >
                    {/* Competency Multi-select (max 4)*/}
                    <div className="flex justify-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="flex w-full justify-between rounded-lg border bg-white px-3 py-2 text-left text-sm focus:ring-2 focus:ring-primary transition hover:bg-gray-50 cursor-pointer"
                          >
                            {row.competencies.length > 0
                              ? `${row.competencies.length} competency(s) selected`
                              : "Select Competency (max 4)"}
                            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                          </button>
                        </PopoverTrigger>

                        <PopoverContent className="p-0 w-[300px]">
                          <Command>
                            <CommandInput placeholder="Search competencies..." />
                            <CommandList className="max-h-56 overflow-y-auto">
                              <CommandEmpty>
                                No competencies found.
                              </CommandEmpty>
                              <CommandGroup heading="Select up to 4 Competencies">
                                {Array.from(
                                  new Map(
                                    (filteredCompetencies || []).map(
                                      (c: any) => [c.id, c]
                                    )
                                  ).values()
                                )
                                  .sort((a: any, b: any) =>
                                    a.name.localeCompare(b.name)
                                  )
                                  .map((c: any) => {
                                    const isSelected = row.competencies.includes(c.id.toString());
                                    const isDisabled = !isSelected && row.competencies.length >= 4;
                                    
                                    return (
                                      <CommandItem
                                        key={c.id}
                                        onSelect={() => {
                                          if (isDisabled) return;
                                          
                                          // Multi-select: toggle selection (max 4)
                                          const newSelection = isSelected
                                            ? row.competencies.filter((id) => id !== c.id.toString())
                                            : [...row.competencies, c.id.toString()];
                                          
                                          updateCompetencyRow(index, "competencies", newSelection);
                                        }}
                                        disabled={isDisabled}
                                        style={{
                                          backgroundColor: isSelected
                                            ? generateUniqueColor(c.id)
                                            : `${generateUniqueColor(c.id)}33`,
                                          color: isSelected ? "#000" : "#333",
                                          opacity: isDisabled ? 0.5 : 1,
                                          cursor: isDisabled ? "not-allowed" : "pointer",
                                        }}
                                        className="flex justify-between px-3 py-2 rounded-md transition-colors"
                                      >
                                        <span>{c.name}</span>
                                        {isSelected && (
                                          <Check className="h-4 w-4 text-primary shrink-0" />
                                        )}
                                      </CommandItem>
                                    );
                                  })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Topic Multi-select with color-coding by subject ID */}
                    <div className="flex justify-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="flex w-full justify-between items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm focus:ring-2 focus:ring-primary transition hover:bg-gray-50 cursor-pointer"
                          >
                            {row.topics.length > 0
                              ? `${row.topics.length} topic(s) selected`
                              : "Select Topics"}
                            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                          </button>
                        </PopoverTrigger>

                        <PopoverContent className="p-0 w-[400px] shadow-md border rounded-lg">
                          <Command>
                            <CommandInput
                              placeholder="Search topics..."
                              className="border-b text-sm px-2 py-1"
                            />
                            <CommandList className="max-h-64 overflow-y-auto">
                              <CommandEmpty>No topics found.</CommandEmpty>
                              <CommandGroup heading="Topics (color-coded by subject)">
                                {row.topicObjects?.map((topic) => {
                                  const color = generateUniqueColor(topic.subjectId || row.competencies?.[0]);
                                  const isSelected = row.topics.includes(topic.topicId);

                                  return (
                                    <CommandItem
                                      key={topic.topicId}
                                      onSelect={() => {
                                        const updatedTopics = isSelected
                                          ? row.topics.filter(t => t !== topic.topicId)
                                          : [...row.topics, topic.topicId];
                                        updateCompetencyRow(index, "topics", updatedTopics);
                                      }}
                                      style={{
                                        backgroundColor: isSelected ? color : `${color}44`,
                                        color: isSelected ? "#000" : "#333",
                                        borderLeft: `4px solid ${color}`,
                                      }}
                                      className="flex justify-between items-center px-3 py-2 text-sm rounded-md cursor-pointer mb-1"
                                    >
                                      <span className="flex-1 truncate">
                                        {topic.topicName}
                                        <span 
                                          className="ml-2 text-xs font-medium px-2 py-0.5 rounded"
                                          style={{ 
                                            backgroundColor: color, 
                                            color: '#000',
                                            border: '1px solid rgba(0,0,0,0.2)'
                                          }}
                                        >
                                          Subject: {topic.subjectId}
                                        </span>
                                      </span>
                                      {isSelected && <Check className="h-4 w-4 text-primary shrink-0 ml-2" />}
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Difficulty */}
                    <div className="flex justify-center">
                      <Select
                        value={row.difficulty}
                        onValueChange={(val) =>
                          updateCompetencyRow(index, "difficulty", val)
                        }
                      >
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Select Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem className="cursor-pointer" value="Basic">Basic</SelectItem>
                          <SelectItem className="cursor-pointer" value="Average">Average</SelectItem>
                          <SelectItem className="cursor-pointer" value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Delete */}
                    <div className="flex justify-center">
                      <Button
                        variant="destructive"
                        onClick={() => deleteCompetencyRow(index)}
                        className="px-1 py-2 hover:cursor-pointer bg-red-500 hover:bg-red-400"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Validation message for topic selection */}
              <div className="text-center text-sm text-gray-600 mt-2">
                <p>ℹ️ Remember: Each selected competency must have at least 3 topics.</p>
              </div>

              {/* Save Competencies */}
              <div className="flex justify-center">
                <Button
                  onClick={handleSubmit}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold hover:cursor-pointer"
                  disabled={submitting || showActionButtons}
                >
                  {submitting
                    ? "Saving..."
                    : showActionButtons
                      ? "Saved Successfully"
                      : "Save Practice with Competencies"}
                </Button>
              </div>

              {/* ✅ Success Popup */}
              <Dialog open={showSuccessPopup} onOpenChange={(open) => {
                setShowSuccessPopup(open);
                if (!open) resetSaveState();
              }}>
                <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
                <DialogContent className="max-w-lg p-0 border-none bg-white rounded-lg shadow-2xl">
                  <div className="flex justify-between items-center p-4 border-b">
                    <DialogTitle className="text-lg font-semibold text-gray-800">
                      {popupMessage}
                    </DialogTitle>

                    {/* ✅ Copy Icon Button */}
                    <button
                      onClick={() => {
                        if (practiceName && practiceLink) {
                          const textToCopy = `Practice Name: ${practiceName}\nPractice Link: ${practiceLink}`;
                          navigator.clipboard.writeText(textToCopy);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500);
                        } else {
                          alert("⚠️ Missing practice name or link to copy.");
                        }
                      }}
                      className="p-1 rounded hover:bg-gray-100 transition"
                      aria-label="Copy Practice Info"
                    >
                      <Copy className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>

                  {/* ✅ Copied Feedback */}
                  {copied && (
                    <div className="text-center text-green-600 text-sm font-medium mt-1">
                      Practice info copied!
                    </div>
                  )}

                  {/* ✅ Popup Content */}
                  <div className="p-6 space-y-3">
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Practice Name:</span>{" "}
                      {practiceName}
                    </p>
                    <p className="text-sm break-all">
                      <span className="font-medium text-gray-700">Practice Link:</span>{" "}
                      <a
                        href={practiceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {practiceLink}
                      </a>
                    </p>
                  </div>

                  {/* ✅ Popup Footer */}
                  <div className="flex justify-end p-4 border-t">
                    <Button
                      onClick={() => setShowSuccessPopup(false)}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Close
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* ✅ Post-Save Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4 mt-6 border-t pt-4">

                {/* Preview and Copy — show if either in edit mode or showActionButtons is true */}
                {(mode === "edit" || showActionButtons) && (
                  <>
                    {/* Preview Button */}
                    <Button
                      variant="outline"
                      onClick={() => window.open(practiceLink, "_blank")}
                      disabled={!practiceLink}
                    >
                      Preview
                    </Button>

                    {/* Copy Data Button */}
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => {
                        if (practiceLink) {
                          navigator.clipboard.writeText(practiceLink);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500);
                        } else {
                          alert("⚠️ No practice link available to copy.");
                        }
                      }}
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? "Copied!" : "Copy Link"}
                    </Button>
                  </>
                )}

                {/* 🗑️ Delete Practice — only in edit mode when a practice is selected */}
                {mode === "edit" && (selectedPracticeId || formData.preId) && (
                  <Button
                    variant="destructive"
                    onClick={() => setShowConfirmDelete(true)}
                  >
                    Delete Practice
                  </Button>
                )}
              </div>

              {/* Deletion Actions*/}
              {showConfirmDelete && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-2xl shadow-xl w-[350px] text-center space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">Confirm Delete</h2>
                    <p className="text-gray-600">
                      Are you sure you want to delete this practice? This action cannot be undone.
                    </p>
                    <div className="flex justify-center gap-4 mt-4">
                      <Button variant="outline" onClick={() => setShowConfirmDelete(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDeletePractice}>
                        Yes, Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              {deleteStatus && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-2xl shadow-xl w-[320px] text-center space-y-4">
                    <h2
                      className={`text-xl font-semibold ${deleteStatus === "success" ? "text-green-600" : "text-red-600"
                        }`}
                    >
                      {deleteStatus === "success"
                        ? "Practice Deleted!"
                        : "Deletion Failed!"}
                    </h2>
                    <p className="text-gray-600">
                      {deleteStatus === "success"
                        ? "The practice has been successfully removed."
                        : "Something went wrong while deleting the practice."}
                    </p>
                    <Button
                      onClick={() => setDeleteStatus(null)}
                      variant={deleteStatus === "success" ? "default" : "destructive"}
                    >
                      OK
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* ✅ Practice List section - always visible */}
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Practice List</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-row gap-4 justify-between">
          <Select onValueChange={(val) => {
            setSelectedPracticeId(val);
            console.log("Selected Practice ID:", val);
          }}>
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder="Nothing selected" />
            </SelectTrigger>
            <SelectContent>
              {filters.practiceList?.map((p: any, idx: number) => (
                <SelectItem
                  key={`practice-${p.id}-${idx}`}
                  value={p.id.toString()}
                  className="cursor-pointer"
                >
                  {p.name} ({p.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="default"
            className="bg-blue-500 hover:bg-blue-600 hover:cursor-pointer text-white font-semibold"
            onClick={() => {
              if (!selectedPracticeId) {
                alert("⚠️ Please select a practice first.");
                return;
              }
              fetchAssociationData("institute");
            }}
          >
            Associate Institute Email
          </Button>

          <Button
            variant="default"
            className="bg-blue-500 hover:bg-blue-600 hover:cursor-pointer text-white font-semibold"
            onClick={() => {
              if (!selectedPracticeId) {
                alert("⚠️ Please select a practice first.");
                return;
              }
              fetchAssociationData("corporate");
            }}
          >
            Associate Corporate Email
          </Button>
        </CardContent>
      </Card>

      {/* 🔹 Popup Modal */}
      <Dialog open={openAssoc} onOpenChange={setOpenAssoc}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Associating Practice To{" "}
              {assocType === "institute" ? "Institute" : "Corporate"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <label className="font-medium">
              {assocType === "institute"
                ? "Institute User Email"
                : "Corporate User Email"}
            </label>
            <Select value={selectedEmail} onValueChange={setSelectedEmail}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Email" />
              </SelectTrigger>
              <SelectContent>
                {emailList.map((u: any) => (
                  <SelectItem key={u.id} value={u.emailId}>
                    {u.emailId} ({u.firstName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold hover:cursor-pointer"
              onClick={handleSaveAssociation}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* 🔹 Status Popup Dialog */}
      <Dialog open={statusModal.open} onOpenChange={() => setStatusModal({ ...statusModal, open: false })}>
        <DialogContent className="sm:max-w-xs text-center">
          <DialogHeader>
            <DialogTitle>{statusModal.success ? "Success" : "Error"}</DialogTitle>
          </DialogHeader>
          <p className="my-4">{statusModal.message}</p>
          <Button onClick={() => setStatusModal({ ...statusModal, open: false })} className="bg-orange-500 hover:bg-orange-600">
            Ok
          </Button>
        </DialogContent>
      </Dialog>

      {/* 🔹 Edit Warning Dialog - Edge Case 3 */}
      <Dialog open={showEditWarning} onOpenChange={setShowEditWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⚠️ Confirm Destructive Edit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Editing this practice will <strong>delete and recreate</strong> the interview structure and transaction records in the database.
            </p>
            <p className="text-sm text-gray-700">
              This action cannot be undone. Are you sure you want to proceed?
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowEditWarning(false)}
                className="hover:cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                onClick={() => {
                  setShowEditWarning(false);
                  executeSubmit();
                }}
              >
                Confirm Edit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// in next.config.js
// module.exports = {
//   async rewrites() {
//     return [
//       {
//         source: '/practiceCreation',
//         destination: '/practicecreation',
//       },
//     ]
//   },
// }
