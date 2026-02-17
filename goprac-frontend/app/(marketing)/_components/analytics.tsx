'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

const problemSolvingData = [
  { hours: 0, score: 4.0 },
  { hours: 2, score: 4.12 },
  { hours: 4, score: 4.3 },
  { hours: 6, score: 4.3 },
  { hours: 8, score: 4.8 },
  { hours: 10, score: 5.3 },
  { hours: 12, score: 7.0 },
  { hours: 14, score: 10 },
];

const criticalThinkingData = [
  { hours: 0, score: 4.0 },
  { hours: 2, score: 4.1 },
  { hours: 4, score: 4.3 },
  { hours: 6, score: 4.2 },
  { hours: 8, score: 4.5 },
  { hours: 10, score: 5.0 },
  { hours: 12, score: 6.2 },
  { hours: 14, score: 8.5 },
];



const ChartContainer = ({ 
  title, 
  sampleSize, 
  data,
  purpleLineY = 8
}: { 
  title: string; 
  sampleSize: string; 
  data: Array<{ hours: number; score: number }>;
  purpleLineY?: number;
}) => (
  <div className="bg-white rounded-lg shadow-md border-none p-3 sm:p-4 md:p-6">
    <div className="mb-4 sm:mb-6">
      <h2 className="text-base sm:text-lg font-semibold text-blue-600 mb-1">{title}</h2>
      <p className="text-xs sm:text-sm text-gray-600">( Sample Size: {sampleSize} )</p>
    </div>
    
    <div className="h-64 sm:h-72 md:h-80 mb-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 20,
          }}
        >
          <CartesianGrid 
            strokeDasharray="none" 
            stroke="#e5e7eb" 
            strokeWidth={1}
          />
          <XAxis 
            dataKey="hours"
            axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
            tickLine={{ stroke: '#6b7280', strokeWidth: 0.2 }}
            tick={{ fontSize: 10, fill: '#9E9E9E' }}
            domain={[0, 14]}
            type="number"
            ticks={[0, 2, 4, 6, 8, 10, 12, 14]}
          />
          <YAxis 
            axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
            tickLine={{ stroke: '#6b7280', strokeWidth: 0.2 }}
            tick={{ fontSize: 10, fill: '#9E9E9E' }}
            domain={[0, 12]}
            ticks={[0, 2, 4, 6, 8, 10]}
          />
          
          {/* Reference Lines */}
          <ReferenceLine 
            y={purpleLineY} 
            stroke="#a855f7" 
            strokeWidth={3}
            strokeDasharray="none"
            label={{ 
              value: 'Product Company', 
              position: 'insideTopLeft',
              fill: '#a855f7',
              fontSize: 11,
              fontWeight: 600,
              offset: 10
            }}
          />
          <ReferenceLine 
            y={4} 
            stroke="#000000" 
            strokeWidth={3}
            strokeDasharray="none"
            label={{ 
              value: 'Services Company', 
              position: 'insideBottomLeft',
              fill: '#000000',
              fontSize: 11,
              fontWeight: 600,
              offset: 10
            }}
          />
          
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#3b82f6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
    
    <div>
      <div className="flex justify-center">
        <span className="text-[10px] sm:text-xs text-gray-400 font-semibold">Duration of Practice (Hrs)</span>
      </div>
    </div>
  </div>
);

export default function Analytics() {
  return (
    <div className="py-6 sm:py-8 px-2 sm:px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center">
          <div className="relative w-full w-max-2xl">
            <ChartContainer
              title="Problem Solving Skill"
              sampleSize="5000"
              data={problemSolvingData}
              purpleLineY={8}
            />
            <div className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 -rotate-90 origin-center">
              <span className="text-[10px] sm:text-xs text-gray-400 font-semibold whitespace-nowrap">Avg Score</span>
            </div>
          </div>
          
          {/* <div className="relative">
            <ChartContainer
              title="Critical thinking"
              sampleSize="2558"
              data={criticalThinkingData}
              purpleLineY={6}
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 -rotate-90 origin-center">
              <span className="text-xs text-gray-400 font-semibold whitespace-nowrap">Avg Score</span>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

