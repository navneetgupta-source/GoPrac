"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface SkillChartProps {
  title: string
  score: number
  benchmark: number
}

export function SkillChart({ title, score, benchmark }: SkillChartProps) {
  const [showChart, setShowChart] = useState(false)
  const [progressValue, setProgressValue] = useState(0)

  // Create session numbers for x-axis (1-4)
  const sessions = [1, 2, 3, 4]

  useEffect(() => {
    setShowChart(true)
    const timer = setTimeout(() => {
      setProgressValue(score * 10)
    }, 100)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <Card className="overflow-hidden border-none shadow-sm transition-all duration-200 hover:shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-2">
        <CardTitle className="text-base font-medium text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-[150px] w-full relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-500">
            <span>10</span>
            <span>5</span>
            <span>0</span>
          </div>

          {/* Chart area */}
          <div className="absolute left-6 right-0 top-0 h-full">
            {/* Benchmark line */}
            <div
              className={`absolute border-t-2 border-dashed border-blue-400 w-full transition-opacity duration-700 ${showChart ? "opacity-100" : "opacity-0"}`}
              style={{ top: `${100 - benchmark * 10}%` }}
            >
              <span className="absolute right-0 -top-3 bg-blue-100 text-blue-800 text-xs px-1 rounded-md shadow-sm">
                Industry Average: {benchmark}
              </span>
            </div>

            {/* Score line */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500 transition-opacity duration-700 ${showChart ? "opacity-100" : "opacity-0"}`}
            >
              <div
                className="absolute h-3 w-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full -top-[6px] animate-pulse"
                style={{ left: "50%" }}
              ></div>
              <span className="absolute left-1/2 transform -translate-x-1/2 mt-2 text-xs font-medium text-slate-700">
                Your score: {score}
              </span>
            </div>

            {/* X-axis */}
            <div className="absolute bottom-[-20px] left-0 right-0 flex justify-between text-xs text-slate-500">
              {sessions.map((session) => (
                <span key={session}>{session}</span>
              ))}
            </div>
            <div className="absolute bottom-[-35px] left-0 right-0 text-center text-xs text-slate-500">Session No.</div>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-slate-500">Progress</span>
            <span className="font-medium text-slate-700">{score * 10}%</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}
