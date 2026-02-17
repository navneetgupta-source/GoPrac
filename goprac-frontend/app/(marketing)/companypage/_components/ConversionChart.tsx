'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const conversionData = [
  { skillRange: '0-2', conversion: 20, sampleSize: 150 },
  { skillRange: '2-5', conversion: 45, sampleSize: 400 },
  { skillRange: '5-7', conversion: 76, sampleSize: 350 },
  { skillRange: '7-10', conversion: 80, sampleSize: 220 },
];

// Custom dot component to render labels above each point
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!payload) return null;
  
  return (
    <g>
      {/* Render the dot */}
      <circle 
        cx={cx} 
        cy={cy} 
        r={4} 
        fill="#3b82f6" 
        strokeWidth={2} 
        stroke="#3b82f6"
      />
      {/* Render the label above the dot */}
      <text 
        x={cx} 
        y={cy - 15} 
        textAnchor="middle" 
        fill="#666666" 
        fontSize="12"
        fontWeight="500"
      >
        <tspan x={cx} dy="0">{`${payload.conversion}%`}</tspan>
      </text>
    </g>
  );
};

export default function ConversionChart() {
  return (
    <div className="bg-white rounded-lg shadow-md border-none p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-blue-600 mb-1">Skill Score Vs Conversion</h2>
        <p className="text-sm text-gray-600">Higher thinking skills lead to better hiring outcomes</p>
      </div>
      
      {/* EXACT structure from Analytics.tsx */}
      <div className="relative">
        <div className="h-80 mb-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={conversionData}
              margin={{
                top: 10,
                right: 30,
                left: 20, // Back to original left margin since label is positioned outside
                bottom: 20,
              }}
            >
              <CartesianGrid 
                strokeDasharray="none" 
                stroke="#e5e7eb" 
                strokeWidth={1}
              />
              <XAxis 
                dataKey="skillRange"
                axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                tickLine={{ stroke: '#6b7280', strokeWidth: 0.2 }}
                tick={{ fontSize: 12, fill: '#9E9E9E' }}
              />
              <YAxis 
                axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                tickLine={{ stroke: '#6b7280', strokeWidth: 0.2 }}
                tick={{ fontSize: 12, fill: '#9E9E9E' }}
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              
              <Line 
                type="monotone" 
                dataKey="conversion" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={<CustomDot />}
                activeDot={{ r: 6, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Y-axis label - Perfect position, outside chart area */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 -rotate-90 origin-center"
          style={{ left: '-60px' }}
        >
          <span className="text-xs text-gray-400 font-semibold whitespace-nowrap">Shortlist to Hire conversion (%)</span>
        </div>
      </div>
      
      {/* EXACT bottom structure from Analytics.tsx */}
      <div>
        <div className="flex justify-center">
          <span className="text-xs text-gray-400 font-semibold">Thinking skill score range</span>
        </div>
      </div>
    </div>
  );
}
