"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type LeaderboardEntry = {
  id: number;
  candidateName: string;
  company_name: string;
  subject: string;
  topScore: number;
  rank: number;
  userId: number;
};

export default function Component({ data }: { data: LeaderboardEntry[] }) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [filterBy, setFilterBy] = useState<"country" | "company_name">(
    "company_name"
  );
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchUsername, setSearchUsername] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (Array.isArray(data)) {
      const sorted = [...data].sort((a, b) => b.topScore - a.topScore);
      const ranked = sorted.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
      setLeaderboardData(ranked);
    }
  }, [data]);

  const getFilterOptions = () => {
    const key = filterBy;
    return [
      ...new Set(leaderboardData.map((item) => item[key]).filter(Boolean)),
    ] as string[];
  };

  const filteredData = leaderboardData
    .filter((item) =>
      selectedFilter === "all" ? true : item[filterBy] === selectedFilter
    )
    .filter((item) =>
      searchUsername.trim()
        ? item.candidateName
            .toLowerCase()
            .includes(searchUsername.toLowerCase())
        : true
    );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Leaderboard - {leaderboardData && leaderboardData[0]?.subject}
        </h1>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Tabs */}
          {/* <div className="flex gap-2">
            {["all", "friends"].map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "outline"}
                onClick={() => setActiveTab(tab)}
                className={
                  activeTab === tab ? "bg-green-500 hover:bg-green-600" : ""
                }
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Button>
            ))}
          </div> */}

          {/* Filters */}
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium">Filter by:</span>

            {/* onValueChange={(val) => setFilterBy(val as "country" | "company")}
            > */}
            <Select
              value={filterBy}
              onValueChange={(val) => setFilterBy(val as "company_name")}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company_name">Company</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All {filterBy === "country" ? "Countries" : "Companies"}
                </SelectItem>
                {getFilterOptions().map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Compare */}
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Type name to search"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((entry, index) => (
                <TableRow key={entry.topScore + "-" + entry.candidateName}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {entry.rank <= 3 ? (
                        <Badge
                          variant="secondary"
                          className={
                            entry.rank === 1
                              ? "bg-yellow-100 text-yellow-800"
                              : entry.rank === 2
                              ? "bg-gray-100 text-gray-800"
                              : "bg-orange-100 text-orange-800"
                          }
                        >
                          #{entry.rank}
                        </Badge>
                      ) : (
                        <span>#{entry.rank}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard?cid=${entry.userId}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                        {entry.candidateName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <span className="font-medium">{entry.candidateName}</span>
                    </div>
                          </Link>
                  </TableCell>
                  <TableCell className="font-semibold text-blue-500">
                    {entry.topScore}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-8">
                    <p className="text-gray-500">
                      Sorry, we require a few more submissions before we
                      generate the leaderboard.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
