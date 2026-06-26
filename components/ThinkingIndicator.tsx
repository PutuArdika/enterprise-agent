"use client";

import { useState, useEffect } from "react";

interface ThinkingIndicatorProps {
  isVisible?: boolean;
}

const thinkingMessages = [
  "Analyzing documents...",
  "Processing your question...",
  "Searching relevant sections...",
  "Generating response...",
  "Retrieving information...",
  "Thinking carefully...",
  "Extracting context...",
  "Building answer...",
];

export function ThinkingIndicator({
  isVisible = true,
}: ThinkingIndicatorProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % thinkingMessages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="flex justify-start">
      <div className="bg-gray-200 text-gray-900 rounded-lg p-3 max-w-md">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
          </div>
          <p className="text-sm font-medium text-gray-700">
            {thinkingMessages[messageIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
