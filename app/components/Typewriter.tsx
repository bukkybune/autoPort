"use client";

import { useEffect, useState } from "react";

export function Typewriter({
  text,
  speed = 50,
  className = "",
  showCursor = true,
}: {
  text: string;
  speed?: number;
  className?: string;
  showCursor?: boolean;
}) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayText("");
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className={className}>
      {displayText}
      {showCursor && (
        <span
          className="animate-pulse inline-block w-0.5 h-[1em] align-baseline bg-current ml-0.5"
          style={{ animationDuration: "0.75s" }}
          aria-hidden
        />
      )}
    </span>
  );
}
