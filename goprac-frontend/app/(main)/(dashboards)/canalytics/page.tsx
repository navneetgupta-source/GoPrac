"use client";
import React, { useEffect, useState } from "react";

function getParameterByName(name: string, url?: string) {
  if (!url) url = window.location.href;
  name = name.replace(/[[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export default function Canalytics() {
  type CanalyticsItem = {
    aoe?: string;
    competency?: string;
    jobs_posted: number;
    job_seekers: number;
    job_applicants: number;
    job_matches: number;
    client_shortlists: number;
  };

  const [data, setData] = useState<CanalyticsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fromDate, setFromDate] = useState("2025-03-07");
  const [toDate, setToDate] = useState("2025-03-10");

  useEffect(() => {
    fetchData(fromDate, toDate);
  }, []);

  const fetchData = async (from: string, to: string) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?getCanalyticsData`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: 1, from, to }),
        }
      );
      const result = await response.json();
      console.log("API response:", result);
      setData(result.data || []);
    } catch (e) {
      setError("Error while getting the information");
      setData([]);
    }
    setIsLoading(false);
  };

  const handleLoadClick = () => {
    fetchData(fromDate, toDate);
  };

  const totals = data.reduce(
    (acc, item) => {
      acc.jobsPosted += Number(item.jobs_posted || 0);
      acc.jobSeekers += Number(item.job_seekers || 0);
      acc.jobApplicants += Number(item.job_applicants || 0);
      acc.jobMatches += Number(item.job_matches || 0);
      acc.clientShortlists += Number(item.client_shortlists || 0);
      return acc;
    },
    {
      jobsPosted: 0,
      jobSeekers: 0,
      jobApplicants: 0,
      jobMatches: 0,
      clientShortlists: 0,
    }
  );

  return (
    <div className="font-sans p-6">
      <h2 className="text-2xl md:text-2xl font-bold text-blue-700 mb-4">
        Competency Analytics Report
      </h2>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700">
            Assign Date from
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">
            Assign Date to
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="self-end">
          <button
            onClick={handleLoadClick}
            className="bg-blue-700 text-white px-4 py-2 rounded-md shadow hover:bg-blue-800 transition-colors text-sm md:text-base"
          >
            Load Data
          </button>
        </div>
      </div>

      {isLoading && <div className="text-gray-600 mb-2 mx-auto">Loading...</div>}
      {error && <div className="text-red-600 mb-2 mx-auto">{error}</div>}
      {!isLoading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm md:text-base">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                {[
                  "Domain",
                  "Competency",
                  "Jobs Posted",
                  "Job Seekers (DB)",
                  "Job Applicants",
                  "Job Matches",
                  "Client Shortlists",
                ].map((header) => (
                  <th
                    key={header}
                    className="border border-gray-300 px-3 py-2 text-left"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && !isLoading && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-3 text-center text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              )}

              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2">
                    {item.aoe || ""}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    {item.competency || ""}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    {item.jobs_posted || 0}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    {item.job_seekers || 0}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    {item.job_applicants || 0}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    {item.job_matches || 0}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    {item.client_shortlists || 0}
                  </td>
                </tr>
              ))}

              {!!data.length && (
                <tr className="font-bold bg-gray-100">
                  <td colSpan={2} className="border border-gray-300 px-3 py-2">
                    Total
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    {totals.jobsPosted}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    {totals.jobSeekers}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    {totals.jobApplicants}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    {totals.jobMatches}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    {totals.clientShortlists}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
