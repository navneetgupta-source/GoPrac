
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {useUserStore} from '@/stores/userStore';
import { useRouter } from 'next/navigation';
import { formatDateDDMMMYYYY } from '@/lib/utils';

interface FeedbackData {
  id?: string | number;
  name?: string;
  emailId?: string;
  mobileNumber?: string;
  stream?: string;
  collegeName?: string;
  currentAssessmentType?: string;
  sessionId?: string | number;
  intId?: string | number;
  interview_name?: string;
  completion_status?: string;
  totalRespond?: string | number;
  totalSkip?: string | number;
  totalQuestion?: string | number;
  durationOfPracticeProduct?: string | string[];
  paymentStatus?: string;
  malpractcount?: string | number;
  AssessmentStatusDate?: string;
  fbr_status?: string;
  yop?: string;
}

interface Filters {
  userId: string;
  userType: string;
  page: number;
  limit: number;
  college: (string | number)[] | null;
  stream: string;
  yop: string;
  menu: string;
  activity: string;
  category: string;
  feedbackStatus: string;
  candidate_name: string;
  from_date: string;
  to_date: string;
  isTieUpStatus: string;
  btwocPaid: string;
  interviewname: (string | number)[] | null;
  candidate_id: string;
  assessment_from: string;
  assessment_to: string;
  redirect: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function FeedbackDashboard() {

  const loggedInUserType = useUserStore((state) => state.userType);
  const pracIsLoggedin = useUserStore((state) => state.pracIsLoggedin);
  const loggedInUserId = useUserStore((state) => state.userId);

  const router = useRouter();
  const hasChecked = useRef(false);

  const userId = loggedInUserId || "";
  const userType = loggedInUserType || "";
  const isLoggedIn = pracIsLoggedin === "true";
    
  const [data, setData] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPageText, setCurrentPageText] = useState<string>('');

  // raw options from API (may contain different shapes)
  const [collegeOptions, setCollegeOptions] = useState<any[]>([]);
  const [interviewOptions, setInterviewOptions] = useState<any[]>([]);

  // filtered lists for search-as-you-type
  const [filteredCollegeOptions, setFilteredCollegeOptions] = useState<any[]>([]);
  const [filteredInterviewOptions, setFilteredInterviewOptions] = useState<any[]>([]);

  // visible selected names in inputs
  const [selectedCollegeName, setSelectedCollegeName] = useState('');
  const [selectedInterviewName, setSelectedInterviewName] = useState('');

  // dropdown visibility toggles
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [showInterviewDropdown, setShowInterviewDropdown] = useState(false);

  // some selects also show a visual arrow
  const [yopOptions, setYopOptions] = useState<string[]>([]);

  const collegeInputRef = useRef<HTMLDivElement | null>(null);
  const interviewInputRef = useRef<HTMLDivElement | null>(null);

  const defaultFilters: Filters = {
    userId: loggedInUserId || '',
    userType: loggedInUserType || '',
    page: 1,
    limit: 100,
    college: null,
    stream: '',
    yop: '',
    menu: '',
    activity: '',
    category: '',
    feedbackStatus: '',
    candidate_name: '',
    from_date: '',
    to_date: '',
    isTieUpStatus: '',
    btwocPaid: '',
    interviewname: null,
    candidate_id: '',
    assessment_from: '',
    assessment_to: '',
    redirect: '',
  };

  const [filters, setFilters] = useState<Filters>(defaultFilters);

  // UTIL: normalize college object to { id, label }
  const normalizeCollege = (c: any) => {
    // handle many possible shapes from API
    const id = c?.id ?? c?.college_id ?? c?.collegeId ?? c?.value ?? c?.college ?? String(c);
    const label = c?.college ?? c?.name ?? c?.label ?? String(c);
    return { id, label, raw: c };
  };

  // UTIL: normalize interview object to { id, label }
  const normalizeInterview = (i: any) => {
    const id = i?.id ?? i?.interviewid ?? i?.interviewId ?? i?.value ?? i?.interview_name ?? i?.name ?? String(i);
    const label = i?.name && i?.id ? `${i.id} - ${i.name}` : i?.name || i?.interview_name || String(i);
    return { id, label, raw: i };
  };


   // ============ AUTHORIZATION CHECK ============
  useEffect(() => {
    if (pracIsLoggedin === null || loggedInUserType === null) return;
    if (hasChecked.current) return;
    hasChecked.current = true;

    // BLOCK if not admin
    if (pracIsLoggedin !== "true" || loggedInUserType !== "admin") {
      router.replace("/");
    }
  }, [pracIsLoggedin, loggedInUserType, router]);


  const fetchData = async (appliedFilters: Filters) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/index.php?getFeedbackDashboardData`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appliedFilters),
      });
      const result = await res.json();
      const fetchedData = result?.data || [];
      const processed = fetchedData.map((item: any) => ({
        ...item,
        currentAssessmentType: item.fbr_status ?? item.currentAssessmentType ?? '-',
        completion_status: item.completion_status ?? '-',
      }));
      setData(processed);
      setTotalCount(result?.count ?? 0);
      const total = Number(result?.count ?? 0);
      const page = Number(appliedFilters?.page ?? 1);
      const limit =
        Number(appliedFilters?.limit ?? defaultFilters?.limit ?? filters?.limit ?? 30);

      if (total <= 0) {
        setCurrentPageText('Showing 0 to 0 of 0 entries');
      } else {
        const start = (page - 1) * limit;
        const end = start + limit;
        setCurrentPageText(
          `Showing ${start + 1} to ${end > total ? total : end} of ${total} entries`
        );
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    if (pracIsLoggedin !== "true" || loggedInUserType !== 'admin' || !loggedInUserId) {
      return;
    }

    // YOP list
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    for (let y = currentYear; y >= 1979; y--) years.push(String(y));
    setYopOptions(years);

    // fetch filter options
    const fetchFilterOptions = async () => {
      try {
        const res = await fetch(`${API_BASE}/index.php?getfeedbackDashboardFilters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: loggedInUserId, userType: loggedInUserType, cat: '' }),
        });
        const result = await res.json();
        const collegesRaw = result?.college ?? [];
        const interviewsRaw = result?.interviewname ?? [];

        // normalize into consistent shape while keeping raw for later
        const colleges = collegesRaw.map(normalizeCollege);
        const interviews = interviewsRaw.map(normalizeInterview);

        setCollegeOptions(colleges);
        setFilteredCollegeOptions(colleges);

        setInterviewOptions(interviews);
        setFilteredInterviewOptions(interviews);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };

    fetchFilterOptions();
    // initial data load

    const initialFilters = { 
      ...defaultFilters, 
      userId: loggedInUserId, 
      userType: loggedInUserType 
    };
    fetchData(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ pracIsLoggedin, loggedInUserId, loggedInUserType]);

  // central filter setter
  const handleFilterChange = (key: keyof Filters, value: any) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  // Search applies filters (college/interview already stored in filters by selection handlers)
  const handleSearch = () => {
    // ensure page resets to 1
    fetchData({ ...filters, page: 1 });
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleClear = () => {
    setFilters(defaultFilters);
    setSelectedCollegeName('');
    setSelectedInterviewName('');
    // reset filtered options to all options
    setFilteredCollegeOptions(collegeOptions);
    setFilteredInterviewOptions(interviewOptions);
    fetchData(defaultFilters);
  };

  const handlePageChange = (newPage: number) => {
    fetchData({ ...filters, page: newPage });
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // COLLEGE input handlers (search local options only; selection updates filters but DOES NOT auto-fetch)
  const handleCollegeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedCollegeName(val);
    if (!val) {
      setFilteredCollegeOptions(collegeOptions);
      setShowCollegeDropdown(false);
      // don't clear filters automatically; user must press Search
    } else {
      setFilteredCollegeOptions(
        collegeOptions.filter((c) => (c.label || '').toLowerCase().includes(val.toLowerCase()))
      );
      setShowCollegeDropdown(true);
    }
  };

  const handleCollegeSelect = (college: any) => {
    // college is normalized { id, label, raw }
    const id = college?.id ?? college.label;
    handleFilterChange('college', [id]);
    setSelectedCollegeName(college.label);
    setShowCollegeDropdown(false);
  };

  // INTERVIEW input handlers
  const handleInterviewInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedInterviewName(val);
    if (!val) {
      setFilteredInterviewOptions(interviewOptions);
      setShowInterviewDropdown(false);
    } else {
      setFilteredInterviewOptions(
        interviewOptions.filter((i) => (i.label || '').toLowerCase().includes(val.toLowerCase()))
      );
      setShowInterviewDropdown(true);
    }
  };

  const handleInterviewSelect = (interview: any) => {
    const id = interview?.id ?? interview.label;
    handleFilterChange('interviewname', [id]);
    setSelectedInterviewName(interview.label);
    setShowInterviewDropdown(false);
  };

  // export CSV (fetches all filtered records with large limit)
  const handleExportCsv = async () => {
    try {
      const exportFilters = { ...filters, page: 1, limit: 10000 };
      const res = await fetch(`${API_BASE}/index.php?getFeedbackDashboardData`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportFilters),
      });
      const result = await res.json();
      const exportData = result?.data ?? [];

      if (!exportData.length) {
        alert('No records found to export!');
        return;
      }

      const headers = [
        'Date Of Interview',
        'Interview Name',
        'Candidate Name',
        'Email',
        'Contact',
        'College',
        'AI Screening Status',
        'Respond/Skip/Total',
        'Duration',
        'Payment Status',
        'Assessment Status',
        'Malpractice Count',
      ];

      const rows = exportData.map((r: any) => [
        r.AssessmentStatusDate ?? '-',
        r.interview_name ?? '-',
        r.name ?? '-',
        r.emailId ?? '-',
        r.contactNumber ?? '-',
        r.collegeName ?? '-',
        r.completion_status ?? '-',
        `${r.totalRespond ?? '-'} / ${r.totalSkip ?? '-'} / ${r.totalQuestion ?? '-'}`,
        r.durationOfPracticeProduct ?? '-',
        r.paymentStatus ?? '-',
        r.currentAssessmentType ?? '-',
        r.malpractcount ?? '0',
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Feedback_Report.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('CSV export error:', err);
      alert('Failed to export report.');
    }
  };

  // helpers
  const formatDuration = (duration?: string) => {
    if (!duration) return '-';
    if (String(duration).includes(':')) return duration;
    const total = Number(duration);
    if (isNaN(total)) return String(duration);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const mapAIScreeningStatus = (s?: string) => {
    switch (String(s ?? '').toLowerCase()) {
      case '0':
        return 'Incomplete';
      case '1':
        return 'Complete';
      default:
        return s ?? '-';
    }
  };

  const mapAssessmentStatus = (s?: string) => {
    switch (String(s)) {
      case '0':
        return 'Assessment is Open';
      case '1':
        return 'Assessment In-Progress';
      case '2':
        return 'Assessment Completed';
      case '-2':
        return 'Open Feedback';
      case '-3':
        return 'Assessment Verification';
      case '-4':
        return 'Assessment Rejected';
      default:
        return s ?? '-';
    }
  };

  // close dropdowns by clicking outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (collegeInputRef.current && !collegeInputRef.current.contains(e.target as Node)) {
        setShowCollegeDropdown(false);
      }
      if (interviewInputRef.current && !interviewInputRef.current.contains(e.target as Node)) {
        setShowInterviewDropdown(false);
      }
    };
    document.addEventListener('click', handleOutside);
    return () => document.removeEventListener('click', handleOutside);
  }, []);

  if (loading) {
    return (
      <main className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-gray-700 animate-pulse text-lg">Loading Dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-500">Assessment Dashboard</h1>
        <div className="flex gap-3">
          <button
            onClick={handleExportCsv}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg shadow cursor-pointer"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* College with arrow */}
          <div className="relative" ref={collegeInputRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
            <div className="relative">
              <input
                type="text"
                value={selectedCollegeName}
                onChange={handleCollegeInput}
                onFocus={() => setShowCollegeDropdown(true)}
                placeholder="Search or select college"
                className="border p-2 rounded w-full pr-9 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowCollegeDropdown((s) => !s)}
                className="absolute right-2 top-2 text-gray-600 hover:text-gray-700"
                aria-label="toggle college dropdown"
              >
                {showCollegeDropdown ? '▲' : '▼'}
              </button>
            </div>

            {showCollegeDropdown && filteredCollegeOptions.length > 0 && (
              <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-md max-h-56 overflow-y-auto text-sm">
                {filteredCollegeOptions.map((c: any, idx: number) => (
                  <li
                    key={String(c.id ?? c.label ?? idx)}
                    onClick={() => handleCollegeSelect(c)}
                    className="p-2 hover:bg-blue-50 cursor-pointer"
                  >
                    {c.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* YOP */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">YOP / Year of Passing</label>
            <div className="relative">
              <select
                value={filters.yop}
                onChange={(e) => handleFilterChange('yop', e.target.value)}
                className="border p-2 rounded w-full appearance-none pr-8 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">Select YOP</option>
                {yopOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <span className="absolute right-2 top-2 text-gray-500 pointer-events-none">▼</span>
            </div>
          </div>

          {/* AI Screening Status */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">AI Screening Interview Status</label>
            <div className="relative">
              <select
                value={filters.activity}
                onChange={(e) => handleFilterChange('activity', e.target.value)}
                className="border p-2 rounded w-full appearance-none pr-8 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">Select AI Screening Status</option>
                <option value="full">Complete</option>
                <option value="not-full">Incomplete</option>
              </select>
              <span className="absolute right-2 top-2 text-gray-500 pointer-events-none">▼</span>
            </div>
          </div>

          {/* Assessment Status */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Status</label>
            <div className="relative">
              <select
                value={filters.feedbackStatus}
                onChange={(e) => handleFilterChange('feedbackStatus', e.target.value)}
                className="border p-2 rounded w-full appearance-none pr-8 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">Select Assessment Status</option>
                <option value="0">Assessment is Open</option>
                <option value="1">Assessment In-Progress</option>
                <option value="2">Assessment Completed</option>
                <option value="-2">Open Feedback</option>
                <option value="-3">Assessment Verification</option>
                <option value="-4">Assessment Rejected</option>
              </select>
              <span className="absolute right-2 top-2 text-gray-500 pointer-events-none">▼</span>
            </div>
          </div>

          {/* Candidate Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Name</label>
            <input
              value={filters.candidate_name}
              onChange={(e) => handleFilterChange('candidate_name', e.target.value)}
              placeholder="Candidate Name"
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Interview From Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interview From Date</label>
            <input
              type="date"
              value={filters.from_date}
              onChange={(e) => handleFilterChange('from_date', e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Interview To Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interview To Date</label>
            <input
              type="date"
              value={filters.to_date}
              onChange={(e) => handleFilterChange('to_date', e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Assessment Completed From Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Completed From Date</label>
            <input
              type="date"
              value={filters.assessment_from}
              onChange={(e) => handleFilterChange('assessment_from', e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Assessment Completed To Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Completed To Date</label>
            <input
              type="date"
              value={filters.assessment_to}
              onChange={(e) => handleFilterChange('assessment_to', e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Interview Name with arrow */}
          <div className="relative" ref={interviewInputRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interview Name</label>
            <div className="relative">
              <input
                type="text"
                value={selectedInterviewName}
                onChange={handleInterviewInput}
                onFocus={() => setShowInterviewDropdown(true)}
                placeholder="Search or select interview"
                className="border p-2 rounded w-full pr-9 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowInterviewDropdown((s) => !s)}
                className="absolute right-2 top-2 text-gray-600 hover:text-gray-700"
                aria-label="toggle interview dropdown"
              >
                {showInterviewDropdown ? '▲' : '▼'}
              </button>
            </div>

            {showInterviewDropdown && filteredInterviewOptions.length > 0 && (
              <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-md max-h-56 overflow-y-auto text-sm">
                {filteredInterviewOptions.map((it: any, idx: number) => (
                  <li
                    key={String(it.id ?? it.label ?? idx)}
                    onClick={() => handleInterviewSelect(it)}
                    className="p-2 hover:bg-blue-50 cursor-pointer"
                  >
                    {it.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Candidate ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidate ID</label>
            <input
              value={filters.candidate_id}
              onChange={(e) => handleFilterChange('candidate_id', e.target.value)}
              placeholder="Candidate ID (comma separated)"
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSearch}
            className="bg-blue-500 hover:bg-blue-400 text-white px-5 py-2 rounded-lg shadow cursor-pointer"
          >
            Search
          </button>
          <button
            onClick={handleClear}
            className="bg-blue-500 hover:bg-blue-400 text-white px-5 py-2 rounded-lg shadow cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-300">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-800">
            <tr>
              <th className="p-3 text-left font-semibold">Date Of Interview</th>
              <th className="p-3 text-left font-semibold">Interview Name</th>
              <th className="p-3 text-left font-semibold">Candidate Name</th>
              <th className="p-3 text-left font-semibold">AI Screening Status</th>
              <th className="p-3 text-left font-semibold">Respond/Skip/Total</th>
              <th className="p-3 text-left font-semibold">Duration</th>
              <th className="p-3 text-left font-semibold">Payment Status</th>
              <th className="p-3 text-left font-semibold">Assessment Status</th>
              <th className="p-3 text-left font-semibold">Malpractice Count</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((r, i) => (
                <tr key={r.id ?? i} className="border-b hover:bg-gray-50 transition">
                  <td className="p-2">{r.AssessmentStatusDate ? formatDateDDMMMYYYY(r.AssessmentStatusDate, true) : '-'}</td>
                  <td className="p-3">
                    <Link href={`/review?i=${r.intId}&c=${r.id}&s=${r.sessionId}`} className="text-blue-500 hover:underline">
                      {r.interview_name ?? '-'}
                    </Link>
                  </td>
                  <td className="p-3 relative group">
                    {r.name ?? '-'}
                    <span className="ml-1 text-gray-500 cursor-pointer">ⓘ</span>
                    <div className="absolute left-full top-0 mb-2 hidden group-hover:block bg-white text-gray-700 text-xs rounded p-3 shadow z-30 w-64">
                      <p className="font-semibold underline mb-1">Candidate Details:</p>
                      <p><strong>Name:</strong> {r.name ?? '-'}</p>
                      <p><strong>Email:</strong> {r.emailId ?? '-'}</p>
                      <p><strong>Contact:</strong> {r.mobileNumber ?? '-'}</p>
                      <p><strong>Stream:</strong> {r.stream ?? '-'}</p>
                      <p><strong>College:</strong> {r.collegeName ?? '-'}</p>
                    </div>
                  </td>
                  <td className="p-3">{mapAIScreeningStatus(r.completion_status)}</td>
                  <td className="p-3">{`${r.totalRespond ?? '-'} / ${r.totalSkip ?? '-'} / ${r.totalQuestion ?? '-'}`}</td>
                  <td className="p-3">{formatDuration(String(r.durationOfPracticeProduct ?? '-'))}</td>
                  <td className="p-3">{r.paymentStatus ?? '-'}</td>
                  <td className="p-3">
                    <div className="text-gray-500 font-medium">{mapAssessmentStatus(r.currentAssessmentType)}</div>
                    {/* <div className="text-gray-500 text-xs">{r.AssessmentStatusDate ?? '-'}</div> */}
                  </td>
                  <td className="p-3">{r.malpractcount ?? '0'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center p-6 text-gray-500">No records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="py-2 text-sm text-gray-700">
        {currentPageText || `Showing 0 to 0 of ${totalCount} entries`}
      </div>
      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-6 text-sm">
        <button
          disabled={filters.page === 1}
          onClick={() => handlePageChange(filters.page - 1)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 cursor-pointer"
        >
          Previous
        </button>
        <span>Page {filters.page} of {Math.max(1, Math.ceil(totalCount / filters.limit))}</span>
        <button
          disabled={filters.page * filters.limit >= totalCount}
          onClick={() => handlePageChange(filters.page + 1)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 cursor-pointer"
        >
          Next
        </button>
      </div>
    </main>
  );
}
