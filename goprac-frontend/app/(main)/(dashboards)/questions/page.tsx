"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckIcon, XCircle, ChevronDown, XIcon, Funnel, Upload as UploadIcon } from "lucide-react";
import * as XLSX from "xlsx";
// import ExcelJS from "exceljs";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

/* =================================================================================
   Constants
   ================================================================================= */
const GET_QUESTIONS_URL = `${process.env.NEXT_PUBLIC_API_URL}/index.php?getQuestionData`;
const GET_FILTERS_URL = `${process.env.NEXT_PUBLIC_API_URL}/index.php?getQuestionDashboardAllFilters`;
const ARCHIVE_URL = `${process.env.NEXT_PUBLIC_API_URL}/index.php?deleteQuestionsById`;
const GENERATE_ALT_URL = `${process.env.NEXT_PUBLIC_API_URL}/index.php?fetchAlternateQuestionsFlag`;
const UPLOAD_ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/index.php?getQuestionConversionToJson`;

// const USER_ID = "4";
// const USER_TYPE = "admin";
const PAGE_SIZE = 100;
const FETCH_TIMEOUT_MS = 30000;

/* =================================================================================
   Types
   ================================================================================= */
type SubjectOption = { id: string; favourite_subject: string };
type KeySkillOption = { id: string; key_skill: string };
type LevelOption = { questionLevel: string };
type GenericOption = { id: string; name: string };

type FilterOptionsData = {
  activeSubject: SubjectOption[];
  key_skill: KeySkillOption[];
  topic: GenericOption[];
  questionLevel: LevelOption[];
};

type QuestionItem = {
  id: string;
  // youtubeId?: string | null;
  followUp?: string | null;
  questionType?: string | null;
  priorityStatus?: string | null;
  frequency?: string | null;
  topic_name?: string | null;
  subject_name?: string | null;
  questionLevel?: string | null;
  questionStatus?: string | null;
  alternateQuestionStatus?: string | number | null;
  key_skill_id?: string | null;
  isWbRequired?: string | null;
  questionText?: string | null;
  idk1?: string | null;
  idk2?: string | null;
};

type ApiEnvelope<T = any> = {
  status?: number;
  data?: T;
  count?: number;
  data1?: Array<{ field?: string; sequence?: string | number }>;
  [k: string]: any;
};

type FilterState = {
  subject: string;
  keySkill: string;
  topic: string;
  isWbRequired: string;
  frequencyUsage: string;
  questionLevel: string;
  questionId: string;
  quesStatus: string[];
  quesType: string;
  alternateQuestionStatus: string;
};

/* =================================================================================
   UI: MultiSelect2
   ================================================================================= */
const multiSelectVariants = cva(
  "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
  {
    variants: {
      variant: {
        default: "border-foreground/10 text-foreground bg-card hover:bg-card/80",
        secondary: "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        inverted: "inverted",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  options: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[];
  onValueChange: (value: string[]) => void;
  defaultValue?: string[];
  placeholder?: string;
  animation?: number;
  maxCount?: number;
  modalPopover?: boolean;
  asChild?: boolean;
  className?: string;
}

const MultiSelect2 = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  ({ options, onValueChange, variant, defaultValue = [], placeholder = "Select options", animation = 0, maxCount = 3, modalPopover = false, className, ...props }, ref) => {
    const [selectedValues, setSelectedValues] = React.useState<string[]>(defaultValue);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

    React.useEffect(() => setSelectedValues(defaultValue), [defaultValue]);

    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") setIsPopoverOpen(true);
      else if (event.key === "Backspace" && !event.currentTarget.value) {
        const next = [...selectedValues];
        next.pop();
        setSelectedValues(next);
        onValueChange(next);
      }
    };

    const toggleOption = (option: string) => {
      const next = selectedValues.includes(option)
        ? selectedValues.filter((v) => v !== option)
        : [...selectedValues, option];
      setSelectedValues(next);
      onValueChange(next);
    };

    const handleClear = () => {
      setSelectedValues([]);
      onValueChange([]);
    };

    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal={modalPopover}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            onClick={() => setIsPopoverOpen((p) => !p)}
            className={cn("flex w-full p-1 rounded-md min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit border border-input", className)}
          >
            {selectedValues.length > 0 ? (
              <div className="flex justify-between items-center w-full">
                <div className="flex flex-wrap items-center">
                  {selectedValues.slice(0, maxCount).map((value) => {
                    const option = options.find((o) => o.value === value);
                    return (
                      <Badge key={value} className={cn(multiSelectVariants({ variant }))} style={{ animationDuration: `${animation}s` }}>
                        {option?.label}
                        <XCircle
                          className="ml-2 h-4 w-4 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOption(value);
                          }}
                        />
                      </Badge>
                    );
                  })}
                  {selectedValues.length > maxCount && (
                    <Badge className={cn("bg-transparent text-foreground border-foreground/1 hover:bg-transparent", multiSelectVariants({ variant }))} style={{ animationDuration: `${animation}s` }}>
                      {`+ ${selectedValues.length - maxCount} more`}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <XIcon
                    className="h-4 mx-2 cursor-pointer text-muted-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear();
                    }}
                  />
                  <Separator orientation="vertical" className="flex min-h-6 h-full" />
                  <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full mx-auto">
                <span className="text-sm text-muted-foreground mx-3">{placeholder}</span>
                <ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" onEscapeKeyDown={() => setIsPopoverOpen(false)}>
          <Command>
            <CommandInput placeholder="Search..." onKeyDown={handleInputKeyDown} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <CommandItem key={option.value} onSelect={() => toggleOption(option.value)} className="cursor-pointer">
                      <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                        <CheckIcon className="h-4 w-4" />
                      </div>
                      {option.icon && <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <div className="flex items-center justify-between">
                  {selectedValues.length > 0 && (
                    <>
                      <CommandItem onSelect={handleClear} className="flex-1 justify-center cursor-pointer">
                        Clear
                      </CommandItem>
                      <Separator orientation="vertical" className="flex min-h-6 h-full" />
                    </>
                  )}
                  <CommandItem onSelect={() => setIsPopoverOpen(false)} className="flex-1 justify-center cursor-pointer">
                    Close
                  </CommandItem>
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);
MultiSelect2.displayName = "MultiSelect2";

/* =================================================================================
   Utility helpers
   ================================================================================= */
function mapRow(d: any): QuestionItem {
  return {
    id: String(d?.id ?? ""),
    // youtubeId: d?.youtubeId ?? null,
    followUp: d?.followUp ?? null,
    questionType: d?.questionType ?? null,
    priorityStatus: d?.priorityStatus ?? null,
    frequency: d?.frequency ?? null,
    topic_name: d?.topic_name ?? null,
    subject_name: d?.subject_name ?? null,
    questionLevel: d?.questionLevel ?? null,
    questionStatus: d?.questionStatus ?? null,
    alternateQuestionStatus: d?.alternateQuestionStatus ?? null,
    key_skill_id: d?.key_skill_id ?? null,
    isWbRequired: d?.isWbRequired ?? null,
    questionText: d?.questionText ?? null,
    idk1: d?.idk1 ?? null,
    idk2: d?.idk2 ?? null,
  };
}

function getTagFromFollowUp(followUp?: string | null): "P" | "C1" | "C2" | "C" {
  const val = (followUp ?? "").trim().toLowerCase();
  if (val === "" || val === "parent" || val === "single") return "P";
  const compact = val.replace(/\s+/g, " ").trim();
  if (compact === "child 1" || compact === "child1" || compact === "c1") return "C1";
  if (compact === "child 2" || compact === "child2" || compact === "c2") return "C2";
  if (
    compact === "child 3" || compact === "child3" || compact === "c3" ||
    compact === "child 4" || compact === "child4" || compact === "c4" ||
    compact === "child 5" || compact === "child5" || compact === "c5" ||
    compact === "child 6" || compact === "child6" || compact === "c6"
  ) return "C";
  return "P";
}

function formatAltStatusForTable(raw: string | number | null | undefined): string {
  // Handle null/empty cases first
  if (!raw || raw === "_" || raw === "null" || raw === "NULL") {
    return "Not Available";
  }
  
  // Convert to string and map directly
  const value = String(raw).trim();
  
  switch (value) {
    case "0":
    case "1":
      return "In Progress";
    case "2":
      return "Available";
    case "3":
      return "Error";  
    case "4":
      return "Reviewed";
    default:
      return "Not Available";
  }
}


function toFrequencyPayload(value: string) {
  if (!value) return { frequencyUsage: "" };
  return { frequencyUsage: value };
}

function toAlternateStatusPayload(value: string) {
  if (!value || value === "All") return { omitAlt: true, omitQuesStatus: true };
  
  // Frontend display -> Backend expected mapping
  const slugMap: Record<string, string> = {
    "Not Available": "Not-Available",
    "In Progress": "In-Progress",  
    "Available": "Available",
    "Error": "Error",
    "Reviewed": "Reviewed",
  };
  
  const mappedValue = slugMap[value];
  if (!mappedValue) return { omitAlt: true };
  
  return { 
    alternateQuestionStatus: mappedValue, 
    omitQuesStatus: true 
  };
}

function buildApiPayload(filters: FilterState, page: number, userId: string, userType: string): Record<string, any> {
  const freq = toFrequencyPayload(filters.frequencyUsage);
  const alt = toAlternateStatusPayload(filters.alternateQuestionStatus);

  const base: Record<string, any> = {
    userId: userId,
    userType: userType,
    page,
    limit: PAGE_SIZE,
    subject: filters.subject ? [filters.subject] : null,
    keySkill: filters.keySkill ? [filters.keySkill] : null,
    topic: filters.topic ? [filters.topic] : null,
    isWbRequired: filters.isWbRequired || "",
    questionLevel: filters.questionLevel ? [filters.questionLevel] : null,
    questionId: filters.questionId || "",
    quesStatus: filters.quesStatus.length > 0 ? filters.quesStatus : null,
    quesType: filters.quesType || "",
    vimeoId: "",
    ...freq,
    questionType: filters.quesType || "",
    alternateQuestionStatus: "",
  };

  if ((alt as any).omitAlt) delete base.alternateQuestionStatus;
  else if (typeof (alt as any).alternateQuestionStatus === "string") base.alternateQuestionStatus = (alt as any).alternateQuestionStatus;

  if ((alt as any).omitQuesStatus) delete base.quesStatus;
  else if ((alt as any).quesStatus === null) base.quesStatus = null;

  return base;
}

/* =================================================================================
   Small modals
   ================================================================================= */
function MessageModal({ open, onClose, title, message }: { open: boolean; onClose: () => void; title: string; message: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative z-[121] w-[min(520px,92vw)] bg-white rounded-lg shadow-2xl border p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-3 text-sm text-gray-800 whitespace-pre-wrap">{message}</div>
        <div className="mt-5 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-900">Close</button>
        </div>
      </div>
    </div>
  );
}

/* AlertModal sits ABOVE everything*/
function AlertModal({ open, title, message, onClose }: { open: boolean; title: string; message: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" className="relative z-[151] w-[min(560px,92vw)] rounded-lg border bg-white shadow-2xl">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-md text-gray-500 hover:bg-gray-100" aria-label="Close">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 whitespace-pre-wrap text-sm text-gray-800 max-h-[60vh] overflow-auto">{message}</div>
        <div className="px-5 pb-5 flex justify-end">
          <button onClick={onClose} className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700">OK</button>
        </div>
      </div>
    </div>
  );
}

/* =================================================================================
   Upload Questions Modal — client parses Excel and POSTs JSON; validation-aware
   ================================================================================= */
type UploadQuestionsModalProps = {
  open: boolean;
  onClose: () => void;
  subjects: SubjectOption[] | null;
  onSuccess: (summary?: string) => void;
  onShowAlert: (title: string, body: string) => void; // show top-most alert
};

function UploadQuestionsModal({ open, onClose, subjects, onSuccess, onShowAlert }: UploadQuestionsModalProps) {
  const [subjectId, setSubjectId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSubjectId("");
      setFile(null);
      setSubmitting(false);
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const readExcelToJson = async (f: File): Promise<any[]> => {
    const buf = await f.arrayBuffer();
    const wb: XLSX.WorkBook = XLSX.read(buf, { type: "array" });
    if (!wb || !Array.isArray(wb.SheetNames) || wb.SheetNames.length === 0) throw new Error("The uploaded workbook has no sheets.");
    const firstSheetName: string = wb.SheetNames[0];
    const sheet: XLSX.WorkSheet | undefined = wb.Sheets[firstSheetName];
    if (!sheet) throw new Error("The first sheet is missing or unreadable.");
    const raw = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
    return raw.map((row) => {
      const out: Record<string, any> = {};
      Object.keys(row || {}).forEach((k) => (out[k] = row[k]));
      return out;
    });
  };

//   const readExcelToJson = async (f: File): Promise<any[]> => {
//   const buf = await f.arrayBuffer();

//   const wb = new ExcelJS.Workbook();
//   await wb.xlsx.load(buf); // load from ArrayBuffer in browser[web:21]

//   if (!wb || !Array.isArray(wb.worksheets) || wb.worksheets.length === 0) {
//     throw new Error("The uploaded workbook has no sheets.");
//   }

//   const sheet = wb.worksheets[0];
//   if (!sheet) {
//     throw new Error("The first sheet is missing or unreadable.");
//   }

//   // Build JSON similar to XLSX.utils.sheet_to_json with header row
//   const out: any[] = [];

//   // Get header row (first row)
//   const headerRow = sheet.getRow(1);
//   const headers: string[] = [];

//   headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
//     // Use empty string if header cell is empty, like defval: ""[web:27][web:37]
//     headers[colNumber - 1] = (cell.value ?? "") as string;
//   });

//   // Iterate remaining rows and map to objects
//   sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
//     if (rowNumber === 1) return; // skip header row

//     const obj: Record<string, any> = {};

//     row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
//       const key = headers[colNumber - 1] ?? "";
//       if (key !== "") {
//         obj[key] = cell.value ?? "";
//       }
//     });

//     // Keep behavior close to original: push even if some cells are empty
//     // but ignore completely empty rows if desired:
//     const hasAnyValue = Object.values(obj).some(v => v !== "");
//     if (hasAnyValue) out.push(obj);
//   });

//   // Shape is already plain objects; original code cloned keys, so just return
//   return out;
// };

  const handleUpload = async () => {
    setError(null);
    if (!subjectId) {
      setError("Please select a subject.");
      return;
    }
    if (!file) {
      setError("Please choose a .xls or .xlsx file.");
      return;
    }
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!["xls", "xlsx"].includes(ext)) {
      setError("Only .xls or .xlsx files are supported.");
      return;
    }

    try {
      setSubmitting(true);
      const rows = await readExcelToJson(file);

      const payload = { jsonData: rows, subjectId: String(subjectId) };

      const res = await fetch(UPLOAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const rawText = await res.text();

      // extract JSON even if notices/HTML wrap it
      const js = rawText.indexOf("{");
      const je = rawText.lastIndexOf("}");
      let parsed: ApiEnvelope | null = null;
      if (js !== -1 && je !== -1 && je > js) {
        try {
          parsed = JSON.parse(rawText.slice(js, je + 1));
        } catch {
          parsed = null;
        }
      }

      const presentAlertFromData1 = (items: Array<{ field?: string; sequence?: string | number }>) => {
        const header = "Invalid fields, Please fix the following fields and try again:";
        const lines = items.map((it) => {
          const f = it?.field ?? "Unknown";
          const seq = (it?.sequence ?? "").toString().trim();
          return seq ? `Row ${seq}: invalid ${f}` : `Row #: invalid ${f}`;
        });
        onShowAlert("Validation error", [header, ...lines].join("\n"));
      };

      const presentAlertFromText = (txt: string) => {
        const cleaned = txt.replace(/<br\s*\/?>/gi, "\n").replace(/<\/?b>/gi, "").replace(/<\/?[^>]+>/g, "").trim();
        onShowAlert("Validation error", cleaned);
      };

      if (parsed) {
        if (parsed.status !== 1) {
          presentAlertFromText(rawText);
          return;
        }
        const issues = Array.isArray(parsed.data1) ? parsed.data1 : [];
        if (issues.length > 0) {
          presentAlertFromData1(issues as any);
          return;
        }
        onSuccess("Questions uploaded successfully. Please refresh the page.");
        onClose();
        return;
      }

      // Fallback: text indicates invalid
      if (/Invalid fields/i.test(rawText) || /invalid\s+[A-Za-z0-9_]+/i.test(rawText)) {
        presentAlertFromText(rawText);
        return;
      }

      if (!res.ok) {
        presentAlertFromText(rawText || `HTTP ${res.status}`);
        return;
      }

      onSuccess("Questions uploaded successfully. Please refresh the page.");
      onClose();
    } catch (e: any) {
      setError(e?.message || "Upload failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const sampleUrl = "https://docs.google.com/spreadsheets/d/1jq3Vv6enGtGqSuEk4m42zb9GirxTJqCi_ysJR7by2bs/edit#gid=1804410302";

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative z-[131] w-[min(900px,96vw)] max-h-[92vh] overflow-auto bg-white rounded-xl shadow-2xl border">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Upload Questions</h2>
          <button onClick={onClose} className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 min-h-[42px]">
              <option value="">Select Subject</option>
              {subjects?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.favourite_subject}
                </option>
              ))}
            </select>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Choose a file (.xls, .xlsx)</label>
              <input
                type="file"
                accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(e) => {
                  const input = e.target as HTMLInputElement;
                  const f = input.files?.[0] ?? null;
                  setFile(f);
                }}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-6">
              <button onClick={handleUpload} disabled={submitting} className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-md text-white font-semibold shadow-sm", submitting ? "bg-indigo-600" : "bg-indigo-500 hover:bg-indigo-600")}>
                <UploadIcon className="h-4 w-4" />
                {submitting ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Instructions for uploading a file:</h3>
            <div className="mt-2 text-sm text-gray-800 leading-6">
              <p>The file should have the following columns:</p>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>Match</li>
                <li>Sequence</li>
                <li>Question No</li>
                <li>Topic Name</li>
                <li>Interview Questions Text</li>
                <li>Key Skill to be Assessed</li>
                <li>Detailed Complete Solution</li>
                <li>Student Instruction</li>
                <li>Is Whiteboard Required by Student to Answer This Question?</li>
                <li>Question Level</li>
                <li>Expected Time to Answer</li>
                <li>Type of Question</li>
                <li>Visual Content</li>
              </ul>
              <p className="mt-3">Only files with a single sheet are supported.</p>
              <p>No empty rows and columns should exist other than in question rows.</p>
              <p className="mt-3">
                For reference, you can use this{" "}
                <a href={sampleUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-700 underline">
                  Sample Questions file
                </a>{" "}
                for formatting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =================================================================================
   Filters and Preview (unchanged from previous good version)
   ================================================================================= */
type QuestionFiltersProps = {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onSearch: () => void;
  onClear: () => void;
  loading: boolean;
  options: FilterOptionsData | null;
  optionsLoading: boolean;
};

const FieldLabel = ({ text }: { text: string }) => (
  <div className="flex items-center gap-1.5 mb-1">
    <span className="text-[13px] font-semibold text-gray-900 bg-gray-200 px-2 py-0.5 rounded">{text}</span>
  </div>
);

const FilterField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <FieldLabel text={label} />
    {children}
  </div>
);

const QUESTION_STATUS_OPTIONS = [
  { value: "rawQus", label: "Raw Qns" },
  { value: "readyToUse", label: "Ready to use" },
  { value: "readyUpdatedUse", label: "Ready to use plus" },
  { value: "inactive", label: "Trash" },
];

const QUESTION_TYPE_OPTIONS = ["Start", "Universal", "Climax", "Thank You"];

function QuestionFilters({ filters, onFilterChange, onSearch, onClear, loading, options, optionsLoading }: QuestionFiltersProps) {
  const anyFilterApplied =
    !!(filters.subject ||
      filters.keySkill ||
      filters.topic ||
      filters.isWbRequired ||
      filters.frequencyUsage ||
      filters.questionLevel ||
      filters.questionId ||
      filters.quesType ||
      filters.alternateQuestionStatus) ||
    (filters.quesStatus && filters.quesStatus.length > 0);

  const primaryButtonClass = anyFilterApplied ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-blue-300 hover:bg-blue-400 text-white";
  const secondaryButtonClass = anyFilterApplied ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-blue-300 hover:bg-blue-400 text-white";
  const commonSelectClasses = "w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 min-h-[42px]";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onFilterChange({ [e.target.name]: e.target.value });

  return (
    <div className="bg-white p-0 rounded-xl shadow-md border border-gray-200 mb-6 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b">
        <Funnel className="h-5 w-5 text-gray-800" />
        <span className="text-base font-semibold text-gray-900">Filters</span>
        <div className="ml-auto text-xs text-gray-500">{anyFilterApplied ? "Filters applied" : "No filters applied"}</div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FilterField label="Subject">
            <select name="subject" value={filters.subject} onChange={handleChange} className={commonSelectClasses} disabled={optionsLoading}>
              <option value="">{optionsLoading ? "Loading..." : "Select Subject"}</option>
              {options?.activeSubject?.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.favourite_subject}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Key Skill">
            <select name="keySkill" value={filters.keySkill} onChange={handleChange} className={commonSelectClasses} disabled={optionsLoading}>
              <option value="">{optionsLoading ? "Loading..." : "Select Key Skill"}</option>
              {options?.key_skill?.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.key_skill}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Topic">
            <select name="topic" value={filters.topic} onChange={handleChange} className={commonSelectClasses} disabled={optionsLoading}>
              <option value="">{optionsLoading ? "Loading..." : "Select Topic"}</option>
              {options?.topic?.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Level of Difficulty">
            <select name="questionLevel" value={filters.questionLevel} onChange={handleChange} className={commonSelectClasses} disabled={optionsLoading}>
              <option value="">{optionsLoading ? "Loading..." : "Select Level"}</option>
              {options?.questionLevel?.map((opt) => (
                <option key={opt.questionLevel} value={opt.questionLevel}>
                  {opt.questionLevel}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Student White Board Required">
            <select name="isWbRequired" value={filters.isWbRequired} onChange={handleChange} className={commonSelectClasses}>
              <option value="">Select Status</option>
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </select>
          </FilterField>

          <FilterField label="Frequency of Usage">
            <select name="frequencyUsage" value={filters.frequencyUsage} onChange={handleChange} className={commonSelectClasses}>
              <option value="">Select Frequency</option>
              <option value="0">0</option>
              <option value="1-10">1-10</option>
              <option value="10-50">10-50</option>
              <option value="50+">50+</option>
            </select>
          </FilterField>

          <FilterField label="Question Id">
            <input type="text" name="questionId" value={filters.questionId} onChange={handleChange} placeholder="IDs, comma separated" className="w-full border-gray-300 rounded-md shadow-sm min-h-[42px]" />
          </FilterField>

          <FilterField label="Question Status">
            <MultiSelect2
              options={QUESTION_STATUS_OPTIONS}
              onValueChange={(sel) => onFilterChange({ quesStatus: sel })}
              defaultValue={filters.quesStatus}
              placeholder="Select Status..."
              className="w-full"
            />
          </FilterField>

          <FilterField label="Question Type">
            <select name="quesType" value={filters.quesType} onChange={handleChange} className={commonSelectClasses}>
              <option value="">Select Type</option>
              {["Start", "Universal", "Climax", "Thank You"].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Alternate Question Status">
            <select name="alternateQuestionStatus" value={filters.alternateQuestionStatus} onChange={handleChange} className={commonSelectClasses}>
              <option value="">Select Status</option>
              <option value="All">All</option>
              <option value="Not Available">Not Available</option>
              <option value="In Progress">In Progress</option>
              <option value="Available">Available</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Error">Error</option>
            </select>
          </FilterField>
        </div>

        <div className="flex items-center justify-start gap-4 mt-6 pt-6 border-t">
          <button onClick={onSearch} disabled={loading || optionsLoading} className={cn("px-6 py-2 rounded-md font-semibold shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed", primaryButtonClass)}>
            {loading ? "Searching..." : "Search"}
          </button>
          <button onClick={onClear} disabled={loading || optionsLoading} className={cn("px-6 py-2 rounded-md font-semibold shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed", secondaryButtonClass)}>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

type PreviewTab = "Original" | "IDK1" | "IDK2";
function PreviewModal({ open, onClose, record }: { open: boolean; onClose: () => void; record: QuestionItem | null }) {
  const [tab, setTab] = useState<PreviewTab>("Original");
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setTab("Original");
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [open]);

  if (!open || !record) return null;

  const content = tab === "Original" ? (record.questionText ?? "—") : tab === "IDK1" ? (record.idk1 ?? "—") : (record.idk2 ?? "—");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Preview">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div ref={dialogRef} className="relative z-[101] w-[min(960px,96vw)] max-h-[90vh] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            {(["Original", "IDK1", "IDK2"] as PreviewTab[]).map((t) => {
              const active = tab === t;
              return (
                <button key={t} onClick={() => setTab(t)} className={cn("px-3 py-1 rounded-md text-sm font-medium", active ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}>
                  {t}
                </button>
              );
            })}
          </div>
          <button onClick={onClose} aria-label="Close preview" className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800" title="Close">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 overflow-auto">
          <div className="whitespace-pre-wrap text-sm leading-6 text-gray-800">{content}</div>
        </div>

        <div className="p-3 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-800 text-white font-medium">Close</button>
        </div>
      </div>
    </div>
  );
}

/* =================================================================================
   Main Page
   ================================================================================= */
export default function QuestionDashboard() {
  const router = useRouter();
  const hasChecked = useRef(false);
  
  // ============ GET VALUES FROM ZUSTAND STORE ============
  const loggedInUserType = useUserStore((state) => state.userType);
  const pracIsLoggedin = useUserStore((state) => state.pracIsLoggedin);
  const loggedInUserId = useUserStore((state) => state.userId);

  // Use these throughout your component instead of the old functions
  const userId = loggedInUserId || "";
  const userType = loggedInUserType || "";
  const isLoggedIn = pracIsLoggedin === "true";
  
  // console.log("questions Page - pracIsLoggedin:", pracIsLoggedin);
  // console.log("questions Page - loggedInUserType:", loggedInUserType);
  // ========================================================
  const [rows, setRows] = useState<QuestionItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    subject: "",
    keySkill: "",
    topic: "",
    isWbRequired: "",
    frequencyUsage: "",
    questionLevel: "",
    questionId: "",
    quesStatus: [],
    quesType: "",
    alternateQuestionStatus: "",
  });
  const [activeFilters, setActiveFilters] = useState<FilterState>({ ...filters });

  const [filterOptions, setFilterOptions] = useState<FilterOptionsData | null>(null);
  const [optionsLoading, setOptionsLoading] = useState<boolean>(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [previewRecord, setPreviewRecord] = useState<QuestionItem | null>(null);

  const [actionLoading, setActionLoading] = useState<"archive" | "generate" | null>(null);

  const [msgOpen, setMsgOpen] = useState(false);
  const [msgTitle, setMsgTitle] = useState("");
  const [msgBody, setMsgBody] = useState("");

  const [uploadOpen, setUploadOpen] = useState(false);
  
  // Alert modal for invalid uploads (always on top)
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertBody, setAlertBody] = useState("");
  const showAlert = (title: string, body: string) => {
    setAlertTitle(title);
    setAlertBody(body);
    setAlertOpen(true);
  };

  const reqRef = useRef<{ id: number; controller?: AbortController } | null>(null);
  const nextReqId = useRef(1);

  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);

  const pageIds = useMemo(() => rows.map((r) => r.id), [rows]);
  const selectedOnPageCount = useMemo(() => pageIds.reduce((acc, id) => acc + (selectedIds.has(id) ? 1 : 0), 0), [pageIds, selectedIds]);
  const allOnPageSelected = selectedOnPageCount > 0 && selectedOnPageCount === pageIds.length;
  const noneOnPageSelected = selectedOnPageCount === 0;
  const someOnPageSelected = !noneOnPageSelected && !allOnPageSelected;

  useEffect(() => {
    if (headerCheckboxRef.current) headerCheckboxRef.current.indeterminate = someOnPageSelected;
  }, [someOnPageSelected]);

  useEffect(() => {
    (async () => {
      try {
        setOptionsLoading(true);
        setOptionsError(null);
        const res = await fetch(GET_FILTERS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidateId: userId }),
        });
        if (!res.ok) throw new Error(`Server responded with HTTP error ${res.status}`);
        const json: ApiEnvelope<FilterOptionsData> = await res.json();
        setFilterOptions(json as any);
      } catch (err: any) {
        setOptionsError(err.message || "Could not load filter options.");
      } finally {
        setOptionsLoading(false);
      }
    })();
  }, [userId]);

  const startLoad = useCallback(async (pg: number, currentFilters: FilterState) => {
    if (reqRef.current?.controller) reqRef.current.controller.abort("superseded");
    const controller = new AbortController();
    const id = nextReqId.current++;
    reqRef.current = { id, controller };
    setLoading(true);
    setErrorMsg(null);

    const payload = buildApiPayload(currentFilters, pg, userId, userType);
    const timeout = setTimeout(() => controller.abort("timeout"), FETCH_TIMEOUT_MS);

    try {
      const res = await fetch(GET_QUESTIONS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const text = await res.text();
      const jsonStartIndex = text.indexOf("{");
      if (jsonStartIndex === -1) throw new Error("Server sent an unexpected response.");
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const jsonResponse: ApiEnvelope = JSON.parse(text.substring(jsonStartIndex));

      if (Array.isArray(jsonResponse.data)) {
        setRows(jsonResponse.data.map(mapRow));
        setTotal(typeof jsonResponse.count === "number" ? jsonResponse.count : 0);
      } else {
        setRows([]);
        setTotal(0);
      }
      if (reqRef.current?.id !== id) return;
    } catch (err: any) {
      if (reqRef.current?.id !== id) return;
      if (err?.name !== "AbortError") {
        setErrorMsg(err.message || "Failed to load data");
        setRows([]);
        setTotal(0);
      }
    } finally {
      if (reqRef.current?.id === id) {
        setLoading(false);
        reqRef.current = { id, controller: undefined };
      }
      clearTimeout(timeout);
    }
  }, [userId, userType]);

  useEffect(() => {
    startLoad(page, activeFilters);
  }, [page, activeFilters, startLoad]);

  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => setFilters((prev) => ({ ...prev, ...newFilters })), []);

  const handleSearch = useCallback(() => {
    setActiveFilters(filters);
    if (page !== 1) setPage(1);
  }, [filters, page]);

  const handleClear = useCallback(() => {
    const initial: FilterState = {
      subject: "",
      keySkill: "",
      topic: "",
      isWbRequired: "",
      frequencyUsage: "",
      questionLevel: "",
      questionId: "",
      quesStatus: [],
      quesType: "",
      alternateQuestionStatus: "",
    };
    setFilters(initial);
    setActiveFilters(initial);
    if (page !== 1) setPage(1);
    setSelectedIds(new Set());
  }, [page]);

  const paginationItems = useMemo(() => {
    const maxButtons = 5;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= maxButtons + 2) {
      for (let p = 1; p <= totalPages; p++) pages.push(p);
    } else {
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);
      if (page > 3) {
        pages.push(1);
        pages.push("ellipsis");
      } else {
        for (let p = 1; p < start; p++) pages.push(p);
      }
      for (let p = start; p <= end; p++) pages.push(p);
      if (page < totalPages - 2) {
        pages.push("ellipsis");
        pages.push(totalPages);
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
            isActive={p === page}
            onClick={(e) => {
              e.preventDefault();
              setPage(p as number);
            }}
          >
            {p}
          </PaginationLink>
        </PaginationItem>
      )
    );
  }, [page, total]);

  const toggleRow = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const toggleAllOnPage = useCallback(
    (checked: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (checked) pageIds.forEach((id) => next.add(id));
        else pageIds.forEach((id) => next.delete(id));
        return next;
      });
    },
    [pageIds]
  );

  const buildIdsCsv = useCallback(() => Array.from(selectedIds).join(","), [selectedIds]);

  const doPostAction = useCallback(async (url: string, body: any) => {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const text = await res.text().catch(() => "");
    if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
    return true;
  }, []);

  const showMessage = useCallback((title: string, body: string) => {
    setMsgTitle(title);
    setMsgBody(body);
    setMsgOpen(true);
  }, []);

  const handleArchive = useCallback(async () => {
    const ids = buildIdsCsv();
    if (!ids) {
      showMessage("No selection", "Please select at least one question to archive.");
      return;
    }
    try {
      setActionLoading("archive");
      await doPostAction(ARCHIVE_URL, { questionIds: ids });
      showMessage("Archived", "Selected question deleted.");
      const del = new Set(ids.split(","));
      setRows((prev) => prev.filter((r) => !del.has(r.id)));
      setSelectedIds((prev) => {
        const n = new Set(prev);
        del.forEach((x) => n.delete(x));
        return n;
      });
    } catch (e: any) {
      showMessage("Archive failed", e?.message || "Unknown error");
    } finally {
      setActionLoading(null);
    }
  }, [buildIdsCsv, doPostAction, showMessage]);

  const handleGenerateAlt = useCallback(async () => {
    const idsCsv = buildIdsCsv();
    if (!idsCsv) {
      showMessage("No selection", "Please select at least one question to generate alternates.");
      return;
    }
    try {
      setActionLoading("generate");
      await doPostAction(GENERATE_ALT_URL, { questionIds: idsCsv });
      const ids = new Set(idsCsv.split(","));
      setRows((prev) => prev.map((r) => (ids.has(r.id) ? { ...r, alternateQuestionStatus: 1 } : r)));
      showMessage("Submitted", "Selected questions sent to prompt. Alternate status set to In-Progress.");
    } catch (e: any) {
      showMessage("Generation failed", e?.message || "Unknown error");
    } finally {
      setActionLoading(null);
    }
  }, [buildIdsCsv, doPostAction, showMessage]);

  const openPreview = useCallback((rec: QuestionItem) => {
    setPreviewRecord(rec);
    setPreviewOpen(true);
  }, []);
  const closePreview = useCallback(() => setPreviewOpen(false), []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    // ✅ Check null FIRST (before hasChecked)
    if (pracIsLoggedin === null || loggedInUserType === null) {
      return; // Exit but DON'T set hasChecked yet
    }
    
    // ✅ THEN check hasChecked
    if (hasChecked.current) return;
    hasChecked.current = true;
    
    // ✅ Now do authorization
    if (pracIsLoggedin !== "true" || loggedInUserType !== "admin") {
      router.replace("/");
    }
  }, [pracIsLoggedin, loggedInUserType, router]);

  // ✅ 1. First check if store is loaded (null check)
  if (pracIsLoggedin === null || loggedInUserType === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // ✅ 2. Then check authorization
  if (pracIsLoggedin !== "true" || loggedInUserType !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Access Denied</p>
      </div>
    );
  }
  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-blue-500">Question Dashboard</h1>
        <button onClick={() => setUploadOpen(true)} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-sm" title="Upload Questions">
          <UploadIcon className="h-4 w-4" />
          Upload Questions
        </button>
      </div>

      {optionsError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">
          {optionsError}
        </div>
      )}

      <QuestionFilters
        filters={filters}
        onFilterChange={(f) => setFilters((p) => ({ ...p, ...f }))}
        onSearch={() => {
          setActiveFilters(filters);
          if (page !== 1) setPage(1);
        }}
        onClear={handleClear}
        loading={loading}
        options={filterOptions}
        optionsLoading={optionsLoading}
      />

      <div className="overflow-x-auto bg-white shadow-lg rounded-xl border border-gray-200">
        <table className="min-w-full border-collapse table-fixed">
          <thead>
            <tr className="bg-gray-50">
              <th colSpan={12} className="px-4 py-2 text-left text-sm text-gray-600"></th>
              <th className="px-3 py-2">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={handleGenerateAlt} disabled={actionLoading !== null || selectedIds.size === 0} className={cn("px-3 py-1.5 rounded-md text-xs font-semibold text-white shadow-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed", actionLoading === "generate" ? "bg-indigo-600" : "bg-indigo-500 hover:bg-indigo-600")} title="Generate Alternative Questions for selected">
                    Generate Alternative Questions
                  </button>
                  <button onClick={handleArchive} disabled={actionLoading !== null || selectedIds.size === 0} className={cn("px-3 py-1.5 rounded-md text-xs font-semibold text-white shadow-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed", actionLoading === "archive" ? "bg-rose-600" : "bg-rose-500 hover:bg-rose-600")} title="Archive Selected Questions">
                    Archive Selected Questions
                  </button>
                </div>
              </th>
            </tr>

            <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-left">
              <th className="px-4 py-3">Question Details</th>
              <th className="px-4 py-3">Question Type</th>
              <th className="px-4 py-3">Question Flag</th>
              <th className="px-4 py-3">Frequency</th>
              <th className="px-4 py-3">Topic Name</th>
              <th className="px-4 py-3">Subject Name</th>
              <th className="px-4 py-3">Question Level</th>
              <th className="px-4 py-3">Question Status</th>
              <th className="px-4 py-3">Alternate Questions Status</th>
              <th className="px-4 py-3">Key Skill Name</th>
              <th className="px-4 py-3">IsWbRequired</th>
              <th className="px-4 py-3">Preview</th>
              <th className="px-3 py-3 text-center w-[56px]">
                <div className="flex items-center justify-center">
                  <span className="text-white font-semibold">Select All ({selectedIds.size})</span>
                  <input
                    ref={headerCheckboxRef}
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={(e) => toggleAllOnPage(e.target.checked)}
                    className="h-4 w-4 accent-indigo-600"
                    aria-label="Select all rows on this page"
                    title="Select/Deselect all on this page"
                  />
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={13}>
                  Loading...
                </td>
              </tr>
            )}

            {!loading && errorMsg && (
              <tr>
                <td className="px-4 py-6 text-center text-red-600 whitespace-pre-wrap" colSpan={13}>
                  {errorMsg}
                </td>
              </tr>
            )}

            {!loading && !errorMsg && rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={13}>
                  No records found
                </td>
              </tr>
            )}

            {!loading &&
              !errorMsg &&
              rows.map((q, i) => {
                const tag = getTagFromFollowUp(q.followUp);
                const isFlagged = q.priorityStatus === "1";
                // const yt = q.youtubeId ?? "—";
                const altLabel = formatAltStatusForTable(q.alternateQuestionStatus);
                const checked = selectedIds.has(q.id);

                return (
                  <tr key={q.id} className={cn("text-sm hover:bg-indigo-50 transition", i % 2 === 0 ? "bg-gray-50" : "bg-white")}>
                    <td className="px-4 py-3 text-gray-700 align-middle">
                      <div className="flex flex-col justify-center min-h-[64px]">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">ID: {q.id}</span>
                          <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs", String(tag).startsWith("C") ? "border-blue-300 bg-blue-50 text-blue-700" : "border-emerald-300 bg-emerald-50 text-emerald-700")} title={tag}>
                            {tag}
                          </span>
                        </div>
                        {/* <div className="mt-1 font-mono text-xs text-gray-600">YouTube: {yt}</div> */}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-indigo-700 font-medium">{q.questionType ?? "—"}</td>
                    <td className={cn("px-4 py-3 font-semibold", isFlagged ? "text-red-600" : "text-gray-600")}>{isFlagged ? "Flagged" : "Normal"}</td>
                    <td className="px-4 py-3">{q.frequency ?? "0"}</td>
                    <td className="px-4 py-3">{q.topic_name ?? "—"}</td>
                    <td className="px-4 py-3">{q.subject_name ?? "—"}</td>
                    <td className="px-4 py-3">{q.questionLevel ?? "—"}</td>
                    <td className="px-4 py-3">{q.questionStatus ?? "—"}</td>
                    <td className="px-4 py-3">{altLabel}</td>
                    {/* <td className="px-4 py-3">{q.key_skill_id ?? "—"}</td> */}
                    <td className="px-4 py-3">
                      {(() => {
                        if (!q.key_skill_id || !filterOptions?.key_skill) return "—";
                        
                        const keySkillIds = q.key_skill_id.toString().split(',').map((id: string) => id.trim());
                        const keySkillNames = keySkillIds
                          .map(id => {
                            const skill = filterOptions.key_skill?.find((opt: any) => opt.id?.toString() === id);
                            return skill ? skill.key_skill : id;
                          })
                          .join(', ');
                        
                        return keySkillNames || "—";
                      })()}
                    </td>
                
                    <td className="px-4 py-3">{q.isWbRequired ?? "N"}</td>

                    <td className="px-4 py-3">
                      <button onClick={() => openPreview(q)} className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700" aria-label={`Preview question ${q.id}`} title="Preview">
                        Preview
                      </button>
                    </td>

                    <td className="px-3 py-3 text-center align-middle w-[56px]">
                      <input type="checkbox" className="h-4 w-4 accent-indigo-600" checked={checked} onChange={(e) => toggleRow(q.id, e.target.checked)} aria-label={`Select row ${q.id}`} title={`Select ${q.id}`} />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 gap-4">
        <div>Page {page} of {totalPages} • {total} items found • Selected: {selectedIds.size}</div>
        <Pagination className="justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  page > 1 && setPage((p) => p - 1);
                }}
                aria-disabled={page <= 1}
              />
            </PaginationItem>
            {paginationItems}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  page < totalPages && setPage((p) => p + 1);
                }}
                aria-disabled={page >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <PreviewModal open={previewOpen} onClose={closePreview} record={previewRecord} />
      <MessageModal open={msgOpen} onClose={() => setMsgOpen(false)} title={msgTitle} message={msgBody} />
      <AlertModal open={alertOpen} title={alertTitle} message={alertBody} onClose={() => setAlertOpen(false)} />

      <UploadQuestionsModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        subjects={filterOptions?.activeSubject ?? null}
        onSuccess={(summary) => showMessage("Upload complete", summary || "Questions uploaded successfully. Please refresh the page.")}
        onShowAlert={(t, b) => showAlert(t, b)}
      />
    </div>
  );
}
