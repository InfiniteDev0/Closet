"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Hourglass } from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsLoading(false);

            // Check Firebase authentication state
            onAuthStateChanged(auth, async (user) => {
              if (!user) {
                // No authenticated user
                window.location.href = "/account/auth";
              } else {
                // User is authenticated, verify token is fresh
                try {
                  const idToken = await user.getIdToken();
                  const userData = {
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName || user.email?.split("@")[0],
                    photoURL: user.photoURL,
                    emailVerified: user.emailVerified,
                  };
                  localStorage.setItem(
                    "closet-owner",
                    JSON.stringify(userData),
                  );
                  document.cookie = `authToken=${idToken}; path=/; max-age=3600; SameSite=Strict`;
                  document.cookie = `owner=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=3600; SameSite=Strict`;
                  window.location.href = "/my-closet/wardrobe";
                } catch (error) {
                  console.error("Auth error:", error);
                  window.location.href = "/account/auth";
                }
              }
            });
          }, 300);
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <h1 className="text-6xl font-light tracking-wider">CLOSET</h1>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs text-gray-700">[{progress}%]</span>
            <span className="text-xs tracking-wider text-gray-700">
              LOADING.
            </span>
            <Hourglass className="size-4" />
          </div>
          <div className="h-1 bg-gray-200">
            <div
              className="h-full bg-black transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return <div>{/* Your main app content goes here */}</div>;
}
