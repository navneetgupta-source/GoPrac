"use client"; // needed if you're in Next.js 13+ app directory

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";

interface DailyTask {
  competency_name: string;
  importance: string;
  level_name: string;
  daily_tasks: string;
}

interface Blueprint {
  id: number;
  preInterviewId: number;
  std_domain: string;
  skills: string[];
  experience_level: string;
  daily_task_description: DailyTask[];
  status: string; // N, Q, I, Y, E
  generated_blueprint?: {
    std_competencies_blueprint: Competency[];
  };
  generated_questions?: any;
  created_at: string;
}
const statusMap: Record<string, { label: string; color: string }> = {
  N: { label: "Pending", color: "gray" },
  Q: { label: "Queued", color: "blue" },
  I: { label: "In Progress", color: "orange" },
  Y: { label: "Success", color: "green" },
  E: { label: "Error", color: "red" },
};

type Topic = {
  topic_name: string;
  topic_description: string;
  topic_level: string;
  topic_question_types: string;
  topic_id: string;
};

type Competency = {
  competency_name: string;
  competency_level: string;
  competency_id: string;
  list_of_topics: Topic[];
};

function safeParseJSON(str: string | null) {
  if (!str) return null;

  try {
    const cleaned = str
      .trim()
      .replace(/^```[a-z]*\n?/, "")
      .replace(/```$/, "");

    let parsed = JSON.parse(cleaned);

    // if it’s STILL a string (double-encoded), parse again
    // if (typeof parsed === "string") {
    //   parsed = JSON.parse(parsed);
    // }

    return parsed;
  } catch (err) {
    console.error("❌ Failed to parse JSON:", err, "Raw string:", str);
    return null;
  }
}

const Page = () => {
  const [data, setData] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Adjust URL to your PHP endpoint
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?getBlueprintList`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}), // or { preInterviewId: 5001 } if you want a specific row
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          // Parse generated_blueprint JSON string
          const parsedData = json.data.map((bp: any) => ({
            ...bp,
            generated_blueprint: safeParseJSON(bp.generated_blueprint),
            generated_questions: safeParseJSON(bp.generated_questions),
          }));
          setData(parsedData);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching:", err);
        setLoading(false);
      });
  }, []);

  const handleGenerate = (blueprint: Blueprint) => {
    alert(`Generate action for PreInterviewId: ${blueprint.preInterviewId}`);
    // here you can call another API or trigger logic
  };

  if (loading) return <div>Loading...</div>;

  console.log("xx", data);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Blueprint List</h1>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">
              PreInterview ID
            </th>
            <th className="border border-gray-300 px-4 py-2">Domain</th>
            <th className="border border-gray-300 px-4 py-2">Experience</th>
            <th className="border border-gray-300 px-4 py-2">Skills</th>
            <th className="border border-gray-300 px-4 py-2">Daily Tasks</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const status = statusMap[item.status] || {
              label: item.status,
              color: "black",
            };
            return (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">
                  {item.preInterviewId}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {item.std_domain}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {item.experience_level}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {item.skills?.join(", ")}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <ul className="list-disc list-inside">
                    {item.daily_task_description?.map((task, idx) => (
                      <li key={idx}>
                        <strong>{task.competency_name}</strong> (
                        {task.level_name}, {task.importance}) –{" "}
                        {task.daily_tasks}
                      </li>
                    ))}
                  </ul>
                </td>
                <td
                  className={`border border-gray-300 px-4 py-2 text-${status.color}-600 font-semibold`}
                >
                  {status.label}
                </td>

                <td className="border border-gray-300 px-4 py-2 text-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">View</Button>
                    </DialogTrigger>
                    <DialogContent className="min-w-[95%] max-h-[95%] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          Generated Content (Blueprint ID: {item.id})
                        </DialogTitle>
                      </DialogHeader>
                      <div className="mt-4 space-y-4 ">
                        {item.generated_blueprint?.std_competencies_blueprint?.map(
                          (comp, idx) => (
                            <div
                              key={idx}
                              className="border p-3 rounded shadow-sm"
                            >
                              <h3 className="font-bold">
                                {comp.competency_name} ({comp.competency_level})
                              </h3>
                              <table className="min-w-full mt-2 border-collapse border border-gray-300">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="border px-2 py-1">
                                      Topic Name
                                    </th>
                                    <th className="border px-2 py-1">
                                      Description
                                    </th>
                                    <th className="border px-2 py-1">Level</th>
                                    <th className="border px-2 py-1">
                                      Question Types
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {comp.list_of_topics.map((topic) => (
                                    <tr key={topic.topic_id}>
                                      <td className="border px-2 py-1">
                                        {topic.topic_name}
                                      </td>
                                      <td className="border px-2 py-1">
                                        {topic.topic_description}
                                      </td>
                                      <td className="border px-2 py-1">
                                        {topic.topic_level}
                                      </td>
                                      <td className="border px-2 py-1">
                                        {topic.topic_question_types}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )
                        )}
                        {!item.generated_blueprint && (
                          <p className="text-gray-500">
                            No generated content available
                          </p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <button
                    onClick={() => handleGenerate(item)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Generate
                  </button>
                </td>

                {/* <td className="border border-gray-300 px-4 py-2 text-center">

                </td> */}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
export default Page;
