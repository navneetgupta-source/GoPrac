"use client";
import { useEffect, useState, useRef } from "react";
import { Pencil, Funnel, Flag  } from "lucide-react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation"
import { useUserStore } from "@/stores/userStore";
import { formatDateDDMMMYYYY } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface UserData {
  id: string;
  firstName: string;
  emailId: string;
  mobileNumber: string;
  createdOn: string;
  resume: string | null;
  college: string | null;
  specialization: string | null;
  year: string | null;
  workExperience: string | null;
  payment_status: string | null;
  payment_history?: string | null;
  usertype: string;
  source: string | null;
  active?: string;
  verificationStatus?: string;
  deleted_at?: string | null;
  malpractice_stats?: any;
}

// extra type for popup
interface UserInfo extends UserData {
  qualification?: string;
  s_value?: string;
  rate?: number;
  watchDuration?: number;
  recruiterName?: string;
}

export default function Users() {

  const router = useRouter();
  const hasChecked = useRef(false);
  const loggedInUserType = useUserStore((state) => state.userType);
  const pracIsLoggedin = useUserStore((state) => state.pracIsLoggedin);
  
  // console.log("Users Page - pracIsLoggedin:", pracIsLoggedin);
  // console.log("Users Page - loggedInUserType:", loggedInUserType);

  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1); // 👈 current page
  const [totalEntries, setTotalEntries] = useState(0); // 👈 total users count

  // popup state
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [userType, setUserType] = useState(selectedUser?.usertype ?? "");
  const [corporates, setCorporates] = useState<
    { id: string; firstName: string }[]
  >([]);
  const [associatedCorporate, setAssociatedCorporate] = useState<string[]>([]);
  const [colleges, setColleges] = useState<
    { id: string; collegeName: string }[]
  >([]);
  const [experts, setExperts] = useState<{ id: string; name: string }[]>([]);
  const [selectedExpert, setSelectedExpert] = useState("");
  const [rate, setRate] = useState<number | "">("");
  const [watchDuration, setWatchDuration] = useState<number | "">("");
  const [recruiterName, setRecruiterName] = useState<string>("");
  // const [selectedYear, setSelectedYear] = useState<Date | null>(null);
  const [streams, setStreams] = useState<{ id: string; stream: string }[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [competencySubjects, setCompetencySubjects] = useState<any[]>([]);
  // Popup states for Add forms
  const [openAddPopup, setOpenAddPopup] = useState<
    null | "college" | "company" | "location"
  >(null);
  const [newName, setNewName] = useState("");
  const [openAddSubject, setOpenAddSubject] = useState(false);
  // For subject popup
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]); // ✅ multiple roles
  const [selectedStatus, setSelectedStatus] = useState<"Y" | "N" | "" | null>(
    null
  );
  const [selectedIsCompetency, setSelectedIsCompetency] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newIsCompetency, setNewIsCompetency] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [locations, setLocations] = useState<
    { id: string; cityName: string }[]
  >([]);
  const [locLoading, setLocLoading] = useState(false);
  const [collegeLoading, setCollegeLoading] = useState(false);
  const [corporateLoading, setCorporateLoading] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [contactType, setContactType] = useState<string>("");
  const [selectedCorporateCompany, setSelectedCorporateCompany] = useState<string>("");

  // Filters
  const [filterCollege, setFilterCollege] = useState("");
  const [filterStream, setFilterStream] = useState("");
  const [filterUserType, setFilterUserType] = useState("");
  const [filterYOP, setFilterYOP] = useState<number | null>(null);
  const [filterEmail, setFilterEmail] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterMobile, setFilterMobile] = useState("");
  const [filterCandidateId, setFilterCandidateId] = useState("");
  const [filterVerification, setFilterVerification] = useState("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [yoeFrom, setYoeFrom] = useState("");
  const [yoeTo, setYoeTo] = useState("");

  // const toUnix = (dateStr: string, endOfDay = false): number | "" => {
  //   if (!dateStr) return "";
  //   const date = new Date(dateStr);
  //   if (endOfDay) {
  //     date.setHours(23, 59, 59, 999);
  //   } else {
  //     date.setHours(0, 0, 0, 0);
  //   }
  //   return Math.floor(date.getTime() / 1000); // ✅ UNIX seconds
  // };

  const limit = 100;

  const fetchHomepageFilters = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?getHomepageFilters`
      );
      const data = await res.json();
      // console.log("Homepage filters:", data);

      if (data.specialization) {
        setStreams(data.specialization); // specialization = stream list
      }
      if (data.college || data.collegeList) {
        const collegesData = data.college || data.collegeList;
        setColleges(
          collegesData.map((c: any) => ({
            id: String(c.id),
            collegeName: c.collegeName || c.name || c.college || "",
          }))
        );
      }
      if (data.roleNames) {
        setRoles(data.roleNames);
      }
      if (data.competencySubject) {
        setCompetencySubjects(data.competencySubject);
      }
      if (data.locationList) {
        setLocations(
          data.locationList.map((loc: any) => ({
            id: String(loc.id),
            cityName: loc.cityName,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching homepage filters", err);
    } finally {
      setCollegeLoading(false);
    }
  };

  useEffect(() => {
    fetchHomepageFilters();
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchUsers(1, fromDate, toDate);
  };

  // fetch users
  const fetchUsers = async (
    pageNumber = 1,
    fromDate: string | "" = "",
    toDate: string | "" = ""
  ) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?getUserData`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "1",
            userType: "admin",
            page: pageNumber,
            limit: limit,
            college: filterCollege,
            stream: filterStream,
            usertype: filterUserType,
            yop: filterYOP ?? "",
            emailId: filterEmail,
            candidate_name: filterName,
            candidate_mob: filterMobile,
            candidate_id: filterCandidateId,
            verificationStatus: filterVerification,
            from_date: fromDate ?? "",
            to_date: toDate ?? "",
            yoe_from: yoeFrom,
            yoe_to: yoeTo,
          }),
        }
      );
      const data = await res.json();
      if (data.status === 1) {
        setUsers(data.data || []);
        setTotalEntries(data.count ?? 0);

        if (data.Companys) {
          // 👇 normalizing to same shape as corporates
          setCorporates(
            data.Companys.map((c: any) => ({ id: c.id, firstName: c.name }))
          );
        }
      } else {
        console.error("API error", data);
      }
    } catch (error) {
      console.error("Fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  // useEffect(() => {
  //   async function fetchCorporates() {
  //     if (!selectedUser || selectedUser.usertype !== "corporate") return;

  //     try {
  //       const res = await fetch(
  //         `${process.env.NEXT_PUBLIC_API_URL}/index.php?getAssociatedCorporate`,
  //         {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({
  //             userId: selectedUser.id,
  //             userType: selectedUser.usertype,
  //             preInterviewId: [1], // 👈 replace with actual preInterviewId if available
  //           }),
  //         }
  //       );

  //       const data = await res.json();
  //       // if (data?.data?.corporateList) {
  //       //   const uniqueCorporates = Array.from(
  //       //     new Map(
  //       //       data.data.corporateList.map((c: any) => [
  //       //         c.id,
  //       //         { id: String(c.id), firstName: c.firstName || c.name }
  //       //       ])
  //       //     ).values()
  //       //   ) as { id: string; firstName: string }[];

  //       //   setCorporates(uniqueCorporates);
  //       // }

  //       if (data?.data?.associatedCorporate) {
  //         setAssociatedCorporate(
  //           data.data.associatedCorporate.map((c: { id: string }) => c.id)
  //         );
  //       }
  //     } catch (err) {
  //       console.error("Error fetching corporates", err);
  //     } finally {
  //       setCorporateLoading(false);
  //     }
  //   }

  //   fetchCorporates();
  // }, [open, selectedUser]);

  const fetchUserFilters = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?getUserFilters`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: "1" }), // pass actual userId
        }
      );

      const data = await res.json();
      // console.log("User filters:", data);
      // console.log("Subjects list:", data.subjects);

      // Roles
      if (data.role) {
        setRoles(data.role.map((r: any) => ({ id: r.id, name: r.role })));
      }

      // Competency subjects
      if (data.competencySkill) {
        setCompetencySubjects(data.competencySkill);
      }

      // Subjects (new)
      if (data.subjects) {
        // ✅ keep full object so active, roleId, subjectType remain available
        const uniqueSubjects = Array.from(
          new Map(
            data.subjects.map((s: any) => [
              s.id,
              {
                id: String(s.id),
                name: s.name,
                roleId: s.roleId ? String(s.roleId) : null,
                active: s.active,
                subjectType: s.subjectType,
              },
            ])
          ).values()
        );

        setSubjects(uniqueSubjects);
      }
    } catch (err) {
      console.error("Error fetching user filters", err);
    }
  };

  useEffect(() => {
    fetchUserFilters();
  }, []);

  const handleUpdateSubject = async () => {
    if (!selectedSubject) {
      alert("Please select a subject");
      return;
    }

    // ✅ capture competency checkbox if you have it in your React form
    const isCompetencySubject = selectedIsCompetency || false;

    // console.log("current Subject ID:", selectedSubject);
    // console.log("current Role ID:", selectedRoles);
    // console.log("current active:", selectedStatus);
    // console.log("isCompetencySubject:", isCompetencySubject);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?UpdateSubjectRoleStatus`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subjectId: selectedSubject,
            selectedRoles,
            selectedActiveStatus: selectedStatus,
            isCompetencySubject: selectedIsCompetency,
          }),
        }
      );

      const data = await res.json();
      if (data.status === "1") {
        alert("✅ Subject updated!");
        fetchHomepageFilters();

        // ✅ reset form (if needed in React)
        setSelectedSubject("");
        setSelectedRoles([]);
        setSelectedStatus("");
        setSelectedIsCompetency(false);

        setOpenAddSubject(false);
      } else {
        alert("⚠️ " + (data.errorCode || data.result));
      }
    } catch (err) {
      console.error("Update subject error", err);
      alert("❌ Failed to update subject");
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject.trim()) {
      alert("Enter subject name");
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?addNewSubject1`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Subject: newSubject.trim(), // subject name
            isCompetencySubject: newIsCompetency,
          }),
        }
      );
      const data = await res.json();
      if (data.status === 1) {
        alert("✅ Subject added successfully!");
        fetchHomepageFilters(); // refresh subject list
        setNewSubject("");
        setNewIsCompetency(false); // reset (not used by backend)
        setOpenAddSubject(false);
      } else {
        alert("⚠️ " + (data.errorCode || data.result));
      }
    } catch (err) {
      console.error("Add subject error", err);
      alert("❌ Failed to add subject");
    }
  };

  const handleVerify = async (id: string) => {
    if (!confirm("Are you sure you want to verify this account?")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?verifyAccountByAdmin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidateId: id,
            userType: "admin", // since your PHP checks for admin
          }),
        }
      );

      const data = await res.json();
      if (data.status === 1) {
        alert("✅ User verified successfully!");
        // refresh list to reflect change
        fetchUsers(page);
      } else {
        alert("⚠️ " + (data.errorCode || data.result));
      }
    } catch (err) {
      console.error("Verify error", err);
      alert("❌ Failed to verify user.");
    }
  };

  useEffect(() => {
    async function fetchExperts() {
      if (!open || userType !== "expert") return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/index.php?getExpertList`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ panelId: "" }), // panelId required in your API
          }
        );
        const data = await res.json();
        if (data?.status === 1 && data.list) {
          setExperts(data.list);
        }
      } catch (err) {
        console.error("Error fetching experts", err);
      }
    }
    fetchExperts();
  }, [open, userType]);

  // ✅ fetch suggested locations dynamically
  const fetchSuggestedLocations = async (inputValue: string = ""): Promise<void> => {
    try {
      setLocLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?getSuggestedLocationList`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: inputValue }), // API expects { name }
        }
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setLocations(
          data.map((loc: any) => ({
            id: String(loc.id),
            cityName: loc.cityName,
          }))
        );
      } else {
        setLocations([]);
      }
    } catch (e) {
      console.error("fetchSuggestedLocations error", e);
    } finally {
      setLocLoading(false);
    }
  };

  useEffect(() => {
    if (openAddPopup === "location" && locations.length === 0) {
      fetchSuggestedLocations("");
    }
  }, [openAddPopup]);

  const handleEditUserType = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?getUserInfoAdmin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id }),
        }
      );
      const data = await res.json();

      if (data) {
        setSelectedUser(data);
        setUserType(data.usertype);

        if (data.usertype === "expert") {
          setRate(data.rate ?? "");
          setWatchDuration(data.watchDuration ?? "");
          setSelectedExpert(data.panelId ?? "");
        }

        // if (data.usertype === "corporate") {
        //   // if (data.corporates) {
        //   //   const uniqueCorporates = Array.from(
        //   //     new Map(
        //   //       data.corporates.map((c: any) => [
        //   //         c.id,
        //   //         { id: String(c.id), firstName: c.firstName || c.name }
        //   //       ])
        //   //     ).values()
        //   //   ) as { id: string; firstName: string }[];

        //   //   setCorporates(uniqueCorporates);
        //   // }

        //   setAssociatedCorporate(data.corporate_ids ?? []);
        //   setRecruiterName(data.recruiterName ?? "");
        // }
        if (data.usertype === "corporate") {
          if (data.corporate_id) {
            setSelectedCorporateCompany(String(data.corporate_id));
          }
          setRecruiterName(data.recruiterName ?? "");
        }

        if (data.usertype === "college") {
          setAssociatedCorporate(data.college_ids ?? []);
          setContactType(data.contactType || "");
          if (data.college_id) {
            setSelectedCollege(String(data.college_id));
          }
        }

        setOpen(true);
      }
    } catch (err) {
      console.error("Popup fetch error", err);
    }
    
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    const payload: any = {
      userId: Number(selectedUser.id),
      usertype: userType,
      recruiter_name: recruiterName || "",
      panelId: userType === "expert" ? String(selectedExpert || "0") : "0",
      college_id: userType === "college" ? [String(selectedCollege || "0")] : null,
      corporate_id: userType === "corporate" ? Number(selectedCorporateCompany || "0") : null,
      rate: userType === "expert" ? String(rate || "0") : "0",
      videowatch: userType === "expert" ? String(watchDuration || "0") : "0",
      contact_type: userType === "college" ? contactType : "",
    };

    console.log("Payload being sent:", JSON.stringify(payload, null, 2));

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?userTypeChange`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Invalid JSON from server:", text);
        alert("Server error: " + text);
        return;
      }

      if (data.status === 1) {
        alert("User updated successfully!");
        setOpen(false);
        fetchUsers(page);
      } else {
        alert("Error: " + data.result);
        console.error("Update failed:", data.errorCode);
      }
    } catch (err) {
      console.error("Update error", err);
    }
  };


  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete/restore this user?")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?deleteUser`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id }), // 👈 must send userId (not id)
        }
      );

      const data = await res.json();

      if (data.status === 1) {
        alert("User delete/restore updated!");
        // Option A: reload full list
        fetchUsers();
        // Option B: Optimistic update: toggle deleted_at locally in state
        // setUsers((prev) => prev.map(u => u.id === id ? { ...u, deleted_at: u.deleted_at ? null : new Date().toISOString() } : u));
      } else {
        alert("Error: " + data.result);
      }
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const parsePaymentHistory = (history?: string | null) => {
    try {
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  };


  const isFilterApplied =
    Boolean(filterCollege ||
      filterStream ||
      filterUserType ||
      filterYOP ||
      filterEmail ||
      filterName ||
      filterMobile ||
      filterCandidateId ||
      filterVerification ||
      fromDate ||
      toDate ||
      yoeFrom ||
      yoeTo);

  const handleAddItem = async (
    type: "college" | "company" | "location",
    name: string
  ) => {
    if (!name.trim()) {
      alert("Please enter a name.");
      return;
    }

    let endpoint = "";
    let body: Record<string, string> = {};

    if (type === "college") {
      endpoint = "addNewCollege";
      body = { college: name };
    } else if (type === "company") {
      endpoint = "addNewCompany1";
      body = { company: name };
    } else if (type === "location") {
      endpoint = "addNewLocation1";
      body = { Location: name };
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      if (data.status === 1) {
        alert(
          `✅ ${
            type.charAt(0).toUpperCase() + type.slice(1)
          } added successfully!`
        );
        setOpenAddPopup(null);
        setNewName("");
        fetchHomepageFilters(); // refresh lists
      } else {
        alert(`⚠️ ${data.errorCode || data.result}`);
      }
    } catch (err) {
      console.error("Add error", err);
      alert(`❌ Failed to add ${type}`);
    }
  };

  const handleClear = () => {
    setFilterCollege("");
    setFilterStream("");
    setFilterUserType("");
    setFilterYOP(null);
    setFilterEmail("");
    setFilterName("");
    setFilterMobile("");
    setFilterCandidateId("");
    setFilterVerification("");
    setFromDate("");
    setToDate("");
    setYoeFrom("");
    setYoeTo("");

    setPage(1);
    fetchUsers(1);
  };

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

  // if (loading) return <p className="p-4">Loading...</p>;
  if (loading) return <div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-xl font-bold text-gray-800 mb-4">User Dashboard</h1>

      {/* --- Filters + Buttons --- */}
      <div className="mb-6 bg-white shadow-md rounded-lg p-4">
        {/* --- Buttons --- */}
        <div className="flex flex-wrap gap-3 my-2 justify-end">
          {/* Export Users */}
          {/* <button
            onClick={handleExportUsers}
            disabled={!isFilterApplied}
            className={`px-3 py-1 rounded shadow text-white ${!isFilterApplied
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
              }`}
          >
            Export Users
          </button> */}
          <button
            onClick={() => setOpenAddPopup("college")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded shadow"
          >
            Add College
          </button>

          <button
            onClick={() => setOpenAddPopup("company")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded shadow"
          >
            Add Company
          </button>

          <button
            onClick={() => setOpenAddPopup("location")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded shadow"
          >
            Add Location
          </button>
          <button
            onClick={() => setOpenAddSubject(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded shadow"
          >
            Add Subject
          </button>
        </div>

        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b">
          <Funnel className="h-5 w-5 text-gray-800" />
          <span className="text-base font-semibold text-gray-900">Filters</span>
          <div className="ml-auto text-xs text-gray-500">{isFilterApplied ? "Filters applied" : "No filters applied"}</div>
        </div>

        {/* --- Filters Grid 1 --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">College</label>
            <Select
              options={colleges.map((c) => ({
                value: c.id,
                label: c.collegeName,
              }))}
              value={
                colleges.find((c) => c.id === filterCollege)
                  ? {
                      value: filterCollege,
                      label: colleges.find((c) => c.id === filterCollege)
                        ?.collegeName,
                    }
                  : null
              }
              onChange={(option) =>
                setFilterCollege(option ? option.value : "")
              }
              placeholder="Select College..."
              isClearable
            />
          </div>

          {/* <div>
            <label className="block text-sm font-medium mb-1">Stream</label>
            <Select
              options={streams.map((s) => ({ value: s.id, label: s.stream }))}
              value={
                filterStream
                  ? { value: filterStream, label: streams.find((s) => s.id === filterStream)?.stream }
                  : null
              }
              onChange={(option) => setFilterStream(option ? option.value : "")}
              placeholder="Select Stream..."
              isClearable
            />
          </div> */}

          <div>
            <label className="block text-sm font-medium mb-1">User Type</label>
            <select
              value={filterUserType}
              onChange={(e) => setFilterUserType(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full"
            >
              <option value="">Select User Type</option>
              <option value="admin">Admin</option>
              <option value="college">College</option>
              <option value="expert">Expert</option>
              <option value="mentor">Mentor</option>
              <option value="student">Student</option>
              <option value="tpmentor">TPMentor</option>
              <option value="corporate">Corporate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Year of Passing
            </label>
            <DatePicker
              selected={filterYOP ? new Date(filterYOP, 0) : null}
              onChange={(date: Date | null) => {
                if (date) {
                  setFilterYOP(date.getFullYear());
                } else {
                  setFilterYOP(null);
                }
              }}
              showYearPicker
              dateFormat="yyyy"
              placeholderText="Select Year"
              className="border rounded px-3 py-2 text-sm w-full"
            />
          </div>
        </div>

        {/* --- Filters Grid 2 --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="flex flex-row justify-between">
            <div>
              <label className="block text-sm font-medium mb-1">
                YOE (From)
              </label>
              <select
                value={yoeFrom}
                onChange={(e) => setYoeFrom(e.target.value)}
                className="border rounded px-3 py-2 text-sm w-35"
              >
                <option value="">Select</option>
                <option value="0">Fresher</option>
                {Array.from({ length: 20 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} Yrs
                  </option>
                ))}
                <option value="20+">20+ Yrs</option>
              </select>
            </div>
            {/* To YOE */}
            <div>
              <label className="block text-sm font-medium mb-1">YOE (To)</label>
              <select
                value={yoeTo}
                onChange={(e) => setYoeTo(e.target.value)}
                className="border rounded px-3 py-2 text-sm w-35"
              >
                <option value="">Select</option>
                <option value="0">Fresher</option>
                {Array.from({ length: 20 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} Yrs
                  </option>
                ))}
                <option value="20+">20+ Yrs</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Candidate Email Id
            </label>
            <input
              type="text"
              className="border rounded px-3 py-2 text-sm w-full"
              placeholder="Enter Email Id"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Candidate Name
            </label>
            <input
              type="text"
              className="border rounded px-3 py-2 text-sm w-full"
              placeholder="Enter Name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Candidate Mobile No
            </label>
            <input
              type="text"
              className="border rounded px-3 py-2 text-sm w-full"
              placeholder="Enter Mobile No"
              value={filterMobile}
              onChange={(e) => setFilterMobile(e.target.value)}
            />
          </div>
        </div>

        {/* --- Filters Grid 3 --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Candidate Id
            </label>
            <input
              type="text"
              className="border rounded px-3 py-2 text-sm w-full"
              placeholder="Enter Candidate Id"
              value={filterCandidateId}
              onChange={(e) => setFilterCandidateId(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Account Verification Status
            </label>
            <select
              value={filterVerification}
              onChange={(e) => setFilterVerification(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full"
            >
              <option value="">Select Status</option>
              <option value="Y">Verified</option>
              <option value="N">Not Verified</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">SIGNUP From Date</label>
            <input
              type="date"
              className="border rounded px-3 py-2 text-sm w-full"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">SIGNUP To Date</label>
            <input
              type="date"
              className="border rounded px-3 py-2 text-sm w-full"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-2">
          <button
            onClick={handleSearch}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded shadow"
          >
            Search
          </button>
          <button
            onClick={handleClear}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded shadow"
          >
            Clear
          </button>
        </div>
      </div>

      {/* --- Popup for College, Company & Location --- */}
      {openAddPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setOpenAddPopup(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold mb-2">
              Add New{" "}
              {openAddPopup.charAt(0).toUpperCase() + openAddPopup.slice(1)}
            </h2>
            <p className="text-red-600 text-sm mb-4">
              Before adding {openAddPopup} name first check it in the{" "}
              {openAddPopup} list. Is the name available in the list or not?
            </p>

            {/* 🔍 Searchable Select */}
            <label className="block text-sm font-medium mb-1">
              Search {openAddPopup} Name
            </label>
            <Select
              className="mb-4"
              options={
                openAddPopup === "college"
                  ? colleges.map((c) => ({ value: c.id, label: c.collegeName }))
                  : openAddPopup === "company"
                  ? corporates.map((co) => ({
                      value: co.id,
                      label: co.firstName,
                    }))
                  : openAddPopup === "location"
                  ? locations.map((loc) => ({
                      value: loc.id,
                      label: loc.cityName,
                    }))
                  : []
              }
              placeholder={`Search ${openAddPopup}`}
              isClearable
              isSearchable
              isLoading={
                (openAddPopup === "college" && collegeLoading) ||
                (openAddPopup === "company" && corporateLoading) ||
                (openAddPopup === "location" && locLoading)
              }
              onInputChange={(inputValue, { action }) => {
                if (openAddPopup === "location" && action === "input-change") {
                  fetchSuggestedLocations(inputValue); //  call API as user types
                }
              }}
              onChange={(option) => {
                if (option) {
                  setNewName(option.label); // auto-fill input if selecting existing
                } else {
                  setNewName(""); // clear when deselected
                }
              }}
            />

            {/* Input new name */}
            <label className="block text-sm font-medium mb-1">
              Enter {openAddPopup} Name
            </label>
            <input
              type="text"
              placeholder={`Enter ${openAddPopup} Name`}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full mb-4"
            />

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenAddPopup(null)}
                className="bg-gray-200 px-4 py-2 rounded"
              >
                Close
              </button>
              <button
                onClick={() => handleAddItem(openAddPopup, newName)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Popup for Subject --- */}
      {openAddSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button
              onClick={() => setOpenAddSubject(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold mb-2">Add New Subject</h2>
            <p className="text-red-600 text-sm mb-4">
              Before adding Subject name first check it in the Subject list. Is
              the name available in the list or not?
            </p>

            {/* Role dropdown */}
            <label className="block text-sm font-medium mb-1">Edit Roles</label>
            <Select
              isMulti
              options={roles.map(r => ({ value: r.id, label: r.name }))}  // backend expects ids
              value={roles.filter(r => selectedRoles.includes(r.id)).map(r => ({ value: r.id, label: r.name }))}
              onChange={(selected) => setSelectedRoles(selected.map((s: any) => s.value))}
              className="mb-3"
            />

            {/* Search Subject Dropdown */}
            <label className="block text-sm font-medium mb-1">
              Search Subject Name
            </label>
            <Select
              options={subjects.map((s) => ({ value: s.id, label: s.name }))}
              value={
                selectedSubject
                  ? {
                      value: selectedSubject,
                      label: subjects.find(
                        (s) => s.id === String(selectedSubject)
                      )?.name,
                    }
                  : null
              }
              onChange={(option) => {
                if (option) {
                  const subjId = String(option.value);
                  setSelectedSubject(subjId);

                  // ✅ get all rows for this subjectId (handles multiple roles)
                  const subjRows = subjects.filter((s) => s.id === subjId);

                  if (subjRows.length > 0) {
                    // ✅ sync status & competency from first row
                    setSelectedStatus(subjRows[0].active === "Y" ? "Y" : "N");
                    setSelectedIsCompetency(subjRows[0].subjectType === "competency");

                    // ✅ collect ALL roles for this subject
                    const roles: string[] = subjRows
                      .map((s) => (s.roleId ? String(s.roleId) : "")) // convert roleId to string, fallback to ""
                      .filter((r): r is string => r !== "");          // type guard → keeps only strings
                    setSelectedRoles(roles);
                  }
                } else {
                  setSelectedSubject(null);
                  setSelectedStatus("");
                  setSelectedIsCompetency(false);
                  setSelectedRoles([]);
                }
              }}
              placeholder="Select Subject..."
              isClearable
            />


            {/* Status */}
            <label className="block text-sm font-medium mb-1">
              Edit Status
            </label>
            <select
              value={selectedStatus ?? ""}
              onChange={(e) =>
                setSelectedStatus(e.target.value as "Y" | "N" | "")
              }
              className="border rounded px-3 py-2 text-sm w-full mb-3"
            >
              <option value="Y">Active</option>
              <option value="N">Inactive</option>
            </select>

            {/* Checkbox */}
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={selectedIsCompetency}
                onChange={(e) => setSelectedIsCompetency(e.target.checked)}
              />
              <label className="text-sm">Is competency subject?</label>
            </div>

            <button
              onClick={() => handleUpdateSubject()}
              className="bg-blue-500 hover:bg-blue-600 text-white w-full py-2 rounded mb-6">
              Update
            </button>
            <hr className="my-4" />

            {/* Add new subject */}
            <label className="block text-sm font-medium mb-1">
              Enter New Subject
            </label>
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full mb-3"
              placeholder="Enter Subject Name"
            />

            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={newIsCompetency}
                onChange={(e) => setNewIsCompetency(e.target.checked)}
              />
              <label className="text-sm">Is competency subject?</label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenAddSubject(false)}
                className="bg-gray-200 px-4 py-2 rounded"
              >
                Close
              </button>
              <button
                onClick={() => handleAddSubject()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Popup Modal --- */}
      {open && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-lg font-bold mb-4">Change User Type</h2>

            <div className="mb-3">
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                value={selectedUser.firstName}
                disabled
                className="w-full border rounded px-3 py-2 text-sm bg-gray-100"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium">Email Id</label>
              <input
                type="email"
                value={selectedUser.emailId}
                disabled
                className="w-full border rounded px-3 py-2 text-sm bg-gray-100"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium">User Type</label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="admin">Admin</option>
                <option value="college">College</option>
                <option value="expert">Expert</option>
                <option value="mentor">Mentor</option>
                <option value="student">Student</option>
                <option value="tpmentor">TPMentor</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>

            {/* College specific */}
            {userType === "college" && (
              <>
                <div className="mb-3">
                  <label className="block text-sm font-medium">
                    Select College
                  </label>
                  <Select
                    options={colleges.map((c) => ({ value: c.id, label: c.collegeName }))}
                    value={
                      selectedCollege && colleges.length > 0
                        ? colleges.find((c) => c.id === selectedCollege)
                          ? { value: selectedCollege, label: colleges.find((c) => c.id === selectedCollege)?.collegeName }
                          : null
                        : null
                    }
                    onChange={(option) => {
                      setSelectedCollege(option ? option.value : "");
                    }}
                    placeholder="Select College..."
                    isClearable
                  />
                </div>
                
                {/* Contact Type Radio Buttons */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-2">
                    Contact Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="contactType"
                        value="College"
                        checked={contactType === "College"}
                        onChange={(e) => setContactType(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">College</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="contactType"
                        value="Institute"
                        checked={contactType === "Institute"}
                        onChange={(e) => setContactType(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">Institute</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Expert specific */}
            {userType === "expert" && (
              <>
                <div className="mb-3">
                  <label className="block text-sm font-medium">
                    Rate / Question
                  </label>
                  <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium">
                    Watch Duration / hr
                  </label>
                  <input
                    type="number"
                    value={watchDuration}
                    onChange={(e) => setWatchDuration(Number(e.target.value))}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium">
                    Select Expert
                  </label>
                  <Select
                    options={experts.map((ex) => ({
                      value: ex.id,
                      label: ex.name,
                    }))}
                    value={
                      selectedExpert
                        ? {
                            value: selectedExpert,
                            label: experts.find(
                              (ex) => ex.id === selectedExpert
                            )?.name,
                          }
                        : null
                    }
                    onChange={(option) =>
                      setSelectedExpert(option ? option.value : "")
                    }
                    placeholder="Select Expert..."
                    isClearable
                  />
                  <p className="text-red-600 text-xs mt-1">
                    If Expert name is not available, don’t select any expert
                  </p>
                </div>
              </>
            )}

            {/* Corporate specific */}
            {userType === "corporate" && (
              <>
                <div className="mb-3">
                  <label className="block text-sm font-medium">
                    Select Company
                  </label>
                  <Select
                    options={corporates.map((co) => ({
                      value: co.id,
                      label: co.firstName,
                    }))}
                    value={selectedCorporateCompany ? { 
                      value: selectedCorporateCompany, 
                      label: corporates.find((c) => c.id === selectedCorporateCompany)?.firstName 
                    } : null}
                    onChange={(option) => setSelectedCorporateCompany(option ? option.value : "")}
                    placeholder="Select Company..."
                    isClearable
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium">
                    Recruiter Name
                  </label>
                  <input
                    type="text"
                    value={recruiterName}
                    onChange={(e) => setRecruiterName(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
              </>
            )}

            <button
              onClick={handleUpdate}
              className="bg-blue-500 text-white px-4 py-2 rounded w-full"
            >
              Update
            </button>
          </div>
        </div>
      )}

      {/* --- Users Table --- */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="border p-2">
                <Checkbox
                  checked={selected.length === users.length && users.length > 0}
                  onCheckedChange={(checked) =>
                    checked
                      ? setSelected(users.map((u) => u.id))
                      : setSelected([])
                  }
                />
              </th>
              <th className="px-4 py-3">Signup Date</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">YOE</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Resume</th>
              <th className="px-4 py-3">Payment Status</th>
              <th className="px-4 py-3">User Type</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Verification Status</th>
              <th className="px-4 py-3">Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr
                key={u.id}
                className={idx % 2 === 0 ? "bg-blue-50" : "bg-white"}
              >
                <td className="border p-2 text-center">
                  <Checkbox
                    checked={selected.includes(u.id)}
                    onCheckedChange={(checked) => {
                      if (checked === true) {
                        setSelected((prev) => [...prev, u.id]);
                      } else {
                        setSelected((prev) => prev.filter((x) => x !== u.id));
                      }
                    }}
                  />
                </td>
                <td className="border p-2 text-center">
                  {u.createdOn ? (() => {
                    const formatted = formatDateDDMMMYYYY(Number(u.createdOn), true);
                    const [datePart, timePart] = formatted.split(" ");
                    return (
                      <>
                        <div>{datePart}</div>
                        {timePart && (
                          <div className="text-xs text-muted-foreground">{timePart}</div>
                        )}
                      </>
                    );
                  })() : ""}
                </td>
                <td className="border p-2">
                  <div className="flex flex-col">
                  <span>{u.firstName}</span>
                  <span className="text-gray-700">{u.emailId}</span>
                  </div>
                  {/* <span>
                    {u.malpractice_stats &&
                      (() => {
                        type Interview = {
                          name: string;
                          sessionId: string;
                        };

                        type Grouped = {
                          [key: string]: {
                            count: number;
                            interviews: Interview[];
                          };
                        };

                        enum MalpracticeType {
                          GENUINE = "GENUINE",
                          SUSPICIOUS = "SUSPICIOUS",
                          MALPRACTICE = "MALPRACTICE",
                        }

                        const stats = JSON.parse(u.malpractice_stats);
                        const grouped: Grouped = stats.reduce((acc, item) => {
                          if (!acc[item.malpracticeValue]) {
                            acc[item.malpracticeValue] = {
                              count: 0,
                              interviews: [],
                            };
                          }
                          acc[item.malpracticeValue].count += item.count;
                          acc[item.malpracticeValue].interviews.push({
                            name: item.interviewName,
                            sessionId: item.interviewSessionId,
                          });
                          return acc;
                        }, {});

                        // console.dir(grouped)

                        return (
                          <span className="flex flex-wrap gap-2 mt-1">
                            {Object.entries(grouped).map(
                              ([key, value]: [
                                string,
                                { count: number; interviews: any[] }
                              ]) => {
                                let color =
                                  key === MalpracticeType.GENUINE
                                    ? "text-green-700 bg-green-100"
                                    : key === MalpracticeType.SUSPICIOUS
                                    ? "text-orange-700 bg-orange-100"
                                    : key === MalpracticeType.MALPRACTICE
                                    ? "text-red-700 bg-red-100"
                                    : "text-gray-700 bg-gray-100";

                                return (
                                  <span key={key} className="mb-2">
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <span
                                          className={`cursor-pointer inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${color}`}
                                        >
                                          <Flag className="w-4 h-4" />
                                          {value.count}
                                        </span>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-64 p-2">
                                        <ul className="list-disc list-inside text-xs text-slate-600">
                                          {value.interviews.map(
                                            (interview, idx) => (
                                              <li key={idx}>
                                                <a
                                                  href={`/review?s=${interview.sessionId}`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-blue-600 hover:underline"
                                                >
                                                  {interview.name}
                                                </a>
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      </PopoverContent>
                                    </Popover>
                                  </span>
                                );
                              }
                            )}
                          </span>
                        );
                      })()}
                  </span> */}
                </td>
                <td className="border p-2">{u.workExperience ?? "N/A"}</td>
                <td className="border p-2">{u.mobileNumber}</td>
                <td className="border p-2">
                  {u.resume ? (
                    <a
                      href={u.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Resume
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
                {/* <td className="border p-2">
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    {u.payment_status || "Not Paid"}
                  </span>
                </td> */}
                <td className="border p-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <span
                        className={
                          `cursor-pointer bg-gray-100 text-gray-800 px-2 py-1 rounded inline-block ` +
                          (u.payment_history && u.payment_history !== "null" && u.payment_history !== "" ? "border-b-2 border-blue-500" : "")
                        }
                      >
                        {u.payment_status || "Not Paid"}
                      </span>
                    </PopoverTrigger>

                    <PopoverContent className="w-72 p-2">
                      {parsePaymentHistory(u.payment_history).length === 0 ? (
                        <p className="text-xs text-gray-500">No payment history</p>
                      ) : (
                        <table className="w-full text-xs border">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border px-1 py-1 text-left">Status</th>
                              <th className="border px-1 py-1 text-right">Amount</th>
                              <th className="border px-1 py-1">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parsePaymentHistory(u.payment_history).map(
                              (p: any, idx: number) => (
                                <tr key={idx}>
                                  <td className="border px-1 py-1">{p.status}</td>
                                  <td className="border px-1 py-1 text-right">₹{p.amount}</td>
                                  <td className="border px-1 py-1">
                                    {new Date(p.updated_at).toLocaleString()}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      )}
                    </PopoverContent>
                  </Popover>
                </td>
                <td className="p-2 flex items-center justify-between">
                  {u.usertype}
                  <button
                    onClick={() => handleEditUserType(u.id)}
                    className="ml-2 p-1 border border-blue-200 rounded hover:bg-gray-100"
                  >
                    <Pencil size={16} className="text-blue-500" />
                  </button>
                </td>
                <td className="border p-2">{u.active ?? "Inactive"}</td>
                <td className="p-2 border text-center">
                  {u.verificationStatus === "Y" ? (
                    <span className="text-green-600 font-semibold">
                      Verified
                    </span>
                  ) : (
                    <button
                      onClick={() => handleVerify(u.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Verify
                    </button>
                  )}
                </td>

                <td className="border p-2">
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="bg-red-400 text-white px-3 py-1 rounded"
                  >
                    {u.deleted_at ? "Restore" : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* --- Pagination Controls --- */}
        <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50">
          <p className="text-sm text-gray-600">
            Showing {(page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, totalEntries)} of {totalEntries} entries
          </p>

          <div className="space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-3 py-1 border rounded ${
                page === 1
                  ? "bg-blue-200 text-blue-500 cursor-not-allowed"
                  : "bg-white text-blue-700 hover:bg-blue-100"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() =>
                setPage((p) => (p * limit < totalEntries ? p + 1 : p))
              }
              disabled={page * limit >= totalEntries}
              className={`px-3 py-1 border rounded ${
                page * limit >= totalEntries
                  ? "bg-blue-200 text-blue-500 cursor-not-allowed"
                  : "bg-white text-blue-700 hover:bg-blue-100"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
