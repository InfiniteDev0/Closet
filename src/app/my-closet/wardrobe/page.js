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
  stopTokenRefresh 
} from "@/lib/tokenManager";

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
          logger.warn('No stored auth found', { hasOwner: !!storedOwner, hasToken: !!authToken });
          clearAuthData();
          router.push("/account/auth");
          return;
        }

        // Listen to Firebase auth state changes for real-time security
        authUnsubscribe = onAuthStateChanged(auth, async (user) => {
          if (!isSubscribed) return;

          if (!user) {
            // No authenticated user, clear data and redirect
            logger.warn('No authenticated user');
            clearAuthData();
            router.push("/account/auth");
            return;
          }

          try {
            // Verify the stored user matches the authenticated user
            if (!validateStoredData(storedOwner)) {
              logger.warn('UID mismatch - refreshing user data');
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
            
            logger.authEvent('wardrobe_loaded', user.uid);
          } catch (error) {
            logger.error("Error loading user data", error);
            handleAuthError(error, { context: 'wardrobe_init' });
            clearAuthData();
            router.push("/account/auth");
          } finally {
            if (isSubscribed) {
              setLoading(false);
            }
          }
        });
      } catch (error) {
        logger.error('Failed to initialize auth', error);
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
      }
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      logger.authEvent('logout_attempt', owner?.uid);
      await logout();
      clearAuthData();
      logger.authEvent('logout_success');
      router.push(\"/account/auth\");
    } catch (error) {
      logger.error(\"Logout error\", error);
      // Force logout even if there's an error
      clearAuthData();
      router.push(\"/account/auth\");
    }
  };
      document.cookie = "authToken=; path=/; max-age=0";
      document.cookie = "owner=; path=/; max-age=0";
      router.push("/account/auth");
    }
  };

  if (loading || !owner) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-light tracking-wider">CLOSET</h1>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Welcome, {owner.name || owner.email || "User"}!
          </h2>
          <p className="text-gray-600">Your personal wardrobe awaits!</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900">My Clothes</h3>
              <p className="text-2xl font-bold mt-2">0</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900">Outfits</h3>
              <p className="text-2xl font-bold mt-2">0</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900">Categories</h3>
              <p className="text-2xl font-bold mt-2">0</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
