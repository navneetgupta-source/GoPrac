"use client"
import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { logActivity } from "@/lib/activityLogger"

interface Role {
  roleId: number
  roleName: string
  subjects: Subject[]
}

interface Subject {
  preInterviewId: string
  name: string
  subject: string
  commaSepSubjects: string
  price: number | null
}

interface HierarchyData {
  [yoe: string]: Role[]
}

const TrialSelectionForm = () => {
  const router = useRouter()
  const [yoeList, setYoeList] = useState<string[]>([])
  const [hierarchy, setHierarchy] = useState<HierarchyData>({})
  const [roleList, setRoleList] = useState<Role[]>([])
  const [subjectList, setSubjectList] = useState<Subject[]>([])

  const [selectedYOE, setSelectedYOE] = useState<string>("")
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")

  const [loading, setLoading] = useState(true)

  // Fetch all data once on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?getProductFilters`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        })
        const data = await response.json()
        if (data.status === 1 && data.data) {
          setYoeList(data.data.yoeList || [])
          setHierarchy(data.data.hierarchy || {})
        }
      } catch (error) {
        console.error("Error fetching filters data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAllData()
  }, [])

  // Filter roles when YOE is selected (client-side filtering)
  useEffect(() => {
    if (!selectedYOE || !hierarchy[selectedYOE]) {
      setRoleList([])
      setSelectedRole("")
      setSubjectList([])
      setSelectedSubject("")
      return
    }

    setRoleList(hierarchy[selectedYOE] || [])
    setSelectedRole("")
    setSubjectList([])
    setSelectedSubject("")
  }, [selectedYOE, hierarchy])

  // Filter subjects when Role is selected 
  useEffect(() => {
    if (!selectedRole || roleList.length === 0) {
      setSubjectList([])
      setSelectedSubject("")
      return
    }

    const selectedRoleData = roleList.find((role) => role.roleId.toString() === selectedRole)

    setSubjectList(selectedRoleData?.subjects || [])
    setSelectedSubject("")
  }, [selectedRole, roleList])

  const handleStartFreeTrial = () => {
    if (!selectedSubject) {
      alert("Please select YOE, Role, and Subject to start your free trial")
      return
    }

    // Check if user is logged in
    const isLoggedIn = document.cookie.split(";").some((cookie) => 
      cookie.trim().startsWith("PracIsLoggedin=") && cookie.split("=")[1] === "true"
    )

    logActivity(
      "FREE_TRIAL_START",
      `User started free trial: YOE=${selectedYOE}, Role=${selectedRole}, Subject=${selectedSubject}`,
    )

    if (!isLoggedIn) {
      // Redirect to homepage with login & redirect params
      window.location.href = `/?login=1&redirectTo=${encodeURIComponent(`/job?p=${selectedSubject}`)}`
    } else {
      // Open in new window to avoid cookie issues
      window.open(`/job?p=${selectedSubject}`, '_blank')
    }
  }

  return (
    <div className="rounded-3xl border border-white/80 bg-white/90 backdrop-blur-lg p-8 shadow-xl shadow-slate-200/60">
      <h3 className="text-xl font-bold text-blue-600 mb-6 text-center">Start with a Free Thinking-Skills Test</h3>

      <div className="space-y-4">
        {/* YOE Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience <span className="text-red-400">*</span></label>
          <div className="relative">
            <select
              value={selectedYOE}
              onChange={(e) => setSelectedYOE(e.target.value)}
              disabled={loading}
              className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">{loading ? "Loading..." : "Select YOE"}</option>
              {yoeList.map((yoe) => (
                <option key={yoe} value={yoe}>
                  {yoe}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Role Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Domain <span className="text-red-400">*</span></label>
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              disabled={!selectedYOE}
              className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select Domain</option>
              {roleList.map((role) => (
                <option key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Subject Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Subject <span className="text-red-400">*</span></label>
          <div className="relative">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={!selectedRole}
              className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select Subject</option>
              {subjectList.map((subject) => (
                <option key={subject.preInterviewId} value={subject.preInterviewId}>
                  {subject.subject || subject.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Start Free Trial Button */}
        <div className="flex justify-center">
          <button
            onClick={handleStartFreeTrial}
            disabled={!selectedSubject}
            className="mt-4 w-full max-w-[200px] sm:max-w-xs mx-auto bg-linear-to-r from-blue-600 via-indigo-500 to-purple-500 text-white font-semibold py-2.5 rounded-full shadow-lg cursor-pointer transition-all duration-200
              enabled:hover:shadow-xl enabled:transform enabled:hover:-translate-y-0.5 enabled:hover:scale-105
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
            <span className="ml-2">→</span>
          </button>
        </div>

        {/* Helper Text */}
        {/* {(selectedYOE || selectedRole || selectedSubject) && (
          <p className="text-xs text-gray-500 text-center mt-2">
            Select all three options to start your personalized trial
          </p>
        )} */}
      </div>
    </div>
  )
}

export default TrialSelectionForm
