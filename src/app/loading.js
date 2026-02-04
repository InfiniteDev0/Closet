"use client";

import { useState, useEffect } from "react";

export default function Loading() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 10000); // Adjust speed here (50ms = ~5 seconds total)

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-light tracking-wider mb-8">CLOSET</h1>
      </div>

      <div className="fixed bottom-20 w-full px-8">
        <div className="max-w-md mx-auto">
          <div className="relative">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-black rounded-full transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-center text-xs tracking-widest mt-4 text-gray-600">
              LOADING
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
