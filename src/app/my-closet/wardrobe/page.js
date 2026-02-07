"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { logger } from "@/lib/logger";
import { handleAuthError } from "@/lib/errorHandler";
import {
  getStoredUserData,
  validateStoredData,
  clearAuthData,
  storeUserData,
  startTokenRefresh,
  stopTokenRefresh,
} from "@/lib/tokenManager";
import Navbar from "@/components/shared/navbar";
import ClosetView from "./views/closetviews";

export default function Wardrobe() {
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isSubscribed = true;
    let authUnsubscribe;

    const initializeAuth = async () => {
      try {
        // CRITICAL: Immediate check before Firebase initializes
        const storedOwner = getStoredUserData();
        const authToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("authToken="));

        if (!storedOwner || !authToken) {
          // No stored auth, redirect immediately
          logger.warn("No stored auth found", {
            hasOwner: !!storedOwner,
            hasToken: !!authToken,
          });
          clearAuthData();
          router.push("/account/auth");
          return;
        }

        // Listen to Firebase auth state changes for real-time security
        authUnsubscribe = onAuthStateChanged(auth, async (user) => {
          if (!isSubscribed) return;

          if (!user) {
            // No authenticated user, clear data and redirect
            logger.warn("No authenticated user");
            clearAuthData();
            router.push("/account/auth");
            return;
          }

          try {
            // Verify the stored user matches the authenticated user
            if (!validateStoredData(storedOwner)) {
              logger.warn("UID mismatch - refreshing user data");
              // UID mismatch - refresh data
              await storeUserData(user);
              if (isSubscribed) {
                setOwner(getStoredUserData());
              }
            } else {
              if (isSubscribed) {
                setOwner(storedOwner);
              }
            }

            // Start automatic token refresh
            startTokenRefresh();

            logger.authEvent("wardrobe_loaded", user.uid);
          } catch (error) {
            logger.error("Error loading user data", error);
            handleAuthError(error, { context: "wardrobe_init" });
            clearAuthData();
            router.push("/account/auth");
          } finally {
            if (isSubscribed) {
              setLoading(false);
            }
          }
        });
      } catch (error) {
        logger.error("Failed to initialize auth", error);
        clearAuthData();
        router.push("/account/auth");
      }
    };

    initializeAuth();

    return () => {
      isSubscribed = false;
      stopTokenRefresh();
      if (authUnsubscribe) {
        authUnsubscribe();
      }
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      logger.authEvent("logout_attempt", owner?.uid);
      await logout();
      clearAuthData();
      logger.authEvent("logout_success");
      router.push("/account/auth");
    } catch (error) {
      logger.error("Logout error", error);
      // Force logout even if there's an error
      clearAuthData();
      router.push("/account/auth");
    }
  };

  // if (loading || !owner) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-white">
  //       <div className="flex flex-col items-center space-y-4">
  //         {/* Spinner */}
  //         <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>

  //         {/* Subtle text */}
  //         <p className="text-sm text-gray-500 tracking-wide">
  //           Loading your wardrobe...
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  

  return (
    <div className="">
      <ClosetView owner={owner} />
    </div>
  );
}
