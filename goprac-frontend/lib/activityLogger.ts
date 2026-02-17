"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;


export function logActivity(action: string, comments?: string) {
  try {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
      return match ? decodeURIComponent(match[2]) : null;
    };

    const rawToken = getCookie("_GP_");
    const token = rawToken ? decodeURIComponent(rawToken) : "0";
    const path = window.location.pathname;
    const pageName = path.split("/")[1] || "home";
    const query = window.location.search;
    const commentText =
      comments || (query === "" ? `${pageName} visit` : `${pageName}${query}`);

    const payload = {
      token,
      pageName,
      comments: commentText,
      action,
    };

    fetch(`${API_URL}/index.php?insertActivityLog`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Silent fail — logging shouldn't interrupt UI
    });
  } catch (error) {
    console.error("Activity log failed:", error);
  }
}


export default function ActivityLogger() {

    const pathname = usePathname(); 
    const searchParams = useSearchParams();

    useEffect(() => {
        logActivity("LAND");
    }, [pathname, searchParams]);
    
    return null;
}
