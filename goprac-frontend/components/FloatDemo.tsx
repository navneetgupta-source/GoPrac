"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X } from "lucide-react";

interface FloatDemoProps {
  targetRef: React.RefObject<HTMLElement | null>;
  icon?: React.ReactNode;
  label?: string;
  bgColor?: string;
}

const FloatDemo: React.FC<FloatDemoProps> = ({
  targetRef,
  icon,
  label = "Request Demo",
  bgColor = "bg-gradient-to-r from-blue-500 to-indigo-600",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!targetRef.current) return;

      const rect = targetRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // Check if target is at least 1% visible
      const targetHeight = rect.height;
      const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
      const visibilityPercentage = (visibleHeight / targetHeight) * 100;

      // Show button only when target is less than 1% visible (essentially not visible)
      setIsVisible(visibilityPercentage < 1);
    };

    // Initial check
    handleScroll();

    // Add scroll listener
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [targetRef]);

  const handleClick = () => {
    if (!targetRef.current) return;

    const rect = targetRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const offset = 96; // Offset for fixed headers

    window.scrollTo({
      top: rect.top + scrollTop - offset,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-in-out transform ${
        isVisible
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-32 opacity-0 scale-75 pointer-events-none"
      }`}
    >
      <button
        onClick={handleClick}
        className={`group relative ${bgColor} text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 overflow-hidden w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center`}
        aria-label={label}
      >
        {/* Display label text in circular button */}
        <span className="text-[10px] sm:text-xs font-bold text-center px-1 flex flex-col items-center justify-center leading-tight">
          {label.split(' ').map((word, i) => (
            <span key={i}>{word}</span>
          ))}
        </span>

        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
      </button>

      {/* Ripple effect on hover */}
      <div className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-30 animate-ping pointer-events-none"></div>
    </div>
  );
};

export default FloatDemo;
