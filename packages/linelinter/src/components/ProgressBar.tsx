"use client";

import type { ProgressBarProps } from "../types";

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-4 relative">
      <div
        className="bg-blue-600 h-4 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
        {Math.round(progress)}%
      </div>
    </div>
  );
}
