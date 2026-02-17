"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FileText } from "lucide-react";

import { useUserStore } from "@/stores/userStore";
import { FeedbackCard } from "./_components/feedback-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function ReviewPage() {
  const [review, setReview] = useState(null);
  const [filters, setFilters] = useState(null);
  const [subjectId, setSubjectId] = useState<null | string>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const searchParams = useSearchParams();
  const userId = useUserStore((state) => state.userId);

  useEffect(() => {
    const s = searchParams.get("s");
    if (s) setSubjectId(s);
  }, [searchParams]);

  // Fetch topic filters
  useEffect(() => {
    if (!subjectId || !userId) return;

    const controller = new AbortController();

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?getBestPeerTopics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectId, userId }),
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(setFilters)
      .catch((err) => {
        if (err.name === "AbortError") {
          console.log("Previous request aborted");
        } else {
          console.error(err);
        }
      });

    // Cleanup function to abort previous fetch if subjectId/userId changes
    return () => {
      controller.abort();
    };
  }, [subjectId, userId]);

  const fetchReview = (topicIds: string[]) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?getBestPeer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectId, topicIds }),
    })
      .then((res) => res.json())
      .then(setReview)
      .catch(console.error);
  };

  // Fetch review on subjectId or selectedTopics change
  useEffect(() => {
    if (subjectId) {
      fetchReview(selectedTopics);
    }
  }, [subjectId, selectedTopics]);

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  if (!review) return <div className="text-gray-500 italic flex justify-center">Loading...</div>;

  return (
    <div className="container px-4 py-6 sm:px-6 lg:px-8 mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8 rounded-xl bg-gradient-to-r from-blue-100 via-indigo-50 to-indigo-50 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-primary p-3 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Learn from Top Peer Responses
            </h1>
            <p className="text-slate-500">
              Review answers, Feedback Summary, and Learning Notes to improve
              your own.
            </p>
          </div>
        </div>
      </div>

      {/* Subject Title */}
      {review[0]?.favourite_subject && (
        <Card>
          <CardHeader>
            <CardTitle className="font-medium text-slate-500">
              Competency Name
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="font-semibold">{review[0].favourite_subject}</span>
          </CardContent>
        </Card>
      )}

      {/* Filter Dropdown */}
      {filters?.length > 0 && (
        <Card className="p-4 mb-4">
          <CardTitle className="text-slate-700 mb-2">
            Filter by Topics
          </CardTitle>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-64 justify-start text-left"
              >
                {selectedTopics.length > 0
                  ? `${selectedTopics.length} topic(s) selected`
                  : "Select topics..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandList className="max-h-60 overflow-auto">
                  {filters.map((topic) => {
                    const isGray = topic.status === "gray";
                    const isGreen = topic.status === "green";

                    return (
                      <CommandItem
                        key={topic.topicId}
                        onSelect={() => {
                          if (!isGray) toggleTopic(topic.topicId);
                        }}
                        className={`flex justify-start gap-2 ${
                          isGray
                            ? "text-gray-400 cursor-not-allowed"
                            : isGreen
                            ? "text-green-600 hover:text-green-700"
                            : "text-black"
                        }`}
                        disabled={isGray}
                      >
                        <Checkbox
                          checked={selectedTopics.includes(topic.topicId)}
                          disabled={isGray}
                        />
                        {topic.topicName}
                      </CommandItem>
                    );
                  })}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </Card>
      )}

      {/* Feedback Cards */}
      {review.map((item, index) => (
        <FeedbackCard
          index={index + 1}
          key={item.questionId}
          data={item}
          totalQuestions={review.length}
          showFeedback={true}
        />
      ))}
    </div>
  );
}
