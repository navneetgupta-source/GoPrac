import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date as dd-MMM-yyyy or dd-MMM-yyyy HH:mm:ss
 * Accepts string (SQL/ISO), number, or Date
 * @param date - date value
 * @param includeTime - whether to include time (HH:mm:ss)
 */
export function formatDateDDMMMYYYY(date: string | number | Date, includeTime = false): string {
  if (!date) return "";
  let d: Date;
  if (typeof date === "string") {
    // Handle SQL format: "YYYY-MM-DD HH:mm:ss"
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(date)) {
      // Convert to ISO by replacing space with T
      d = new Date(date.replace(" ", "T"));
    } else {
      d = new Date(date);
    }
  } else {
    d = new Date(date);
  }
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dateStr = `${pad(d.getDate())}-${monthNames[d.getMonth()]}-${d.getFullYear()}`;
  if (includeTime) {
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    return `${dateStr} ${timeStr}`;
  }
  return dateStr;
}
