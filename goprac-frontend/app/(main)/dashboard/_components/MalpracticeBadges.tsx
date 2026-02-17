import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Flag } from "lucide-react";

const MalpracticeType = {
  GENUINE: "GENUINE",
  SUSPICIOUS: "SUSPICIOUS",
  MALPRACTICE: "MALPRACTICE",
};

export default function MalpracticeBadges({ job }) {
  if (!job?.malpractice_stats) return null;

  // Parse JSON safely
  let stats = [];
  try {
    stats = JSON.parse(job.malpractice_stats);
  } catch (e) {
    console.error("Invalid JSON in malpractice_stats:", job.malpractice_stats);
    return null;
  }

  // Group by malpracticeValue
  const grouped = stats.reduce((acc, item) => {
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

  return (
    <span className="flex flex-wrap gap-2 mt-1">
      {Object.entries(grouped)
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([key, value]) => {
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
            <span
              className={`cursor-pointer inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${color}`}
            >
              <Flag className="w-4 h-4" /> {value.count}
            </span>
          </span>
        );
      })}
    </span>
  );
}
