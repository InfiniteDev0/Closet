"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronRight,
  Mail,
  AlertCircle,
  File,
  Settings,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn, signUp, signInWithGoogle } from "@/lib/auth";
import { auth } from "@/lib/firebase";
import { logger } from "@/lib/logger";
import {
  validateEmail,
  validatePassword,
  validateName,
} from "@/lib/validators";
import { handleAuthError, retryOperation, isOnline } from "@/lib/errorHandler";
import { storeUserData } from "@/lib/tokenManager";
import { OrbitingCirclesDemo } from "@/components/shared/orbitingcirclesdemo";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [mode, setMode] = useState("sign-in");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Monitor network status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOffline(!isOnline());

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const isSignIn = mode === "sign-in";

  const handleGoogleAuth = async () => {
    if (isOffline) {
      setError(
        "No internet connection. Please check your network and try again.",
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      logger.authEvent("google_signin_attempt");

      // Use retry logic for network resilience
      const result = await retryOperation(() => signInWithGoogle(), {
        maxRetries: 2,
        delayMs: 1000,
        onRetry: (attempt, max) => {
          logger.info(`Retrying Google sign-in (${attempt}/${max})`);
        },
      });

      const user = result.user;
      logger.authEvent("google_signin_success", user.uid);

      // Store user data securely with automatic token management
      await storeUserData(user);

      router.push("/my-closet/wardrobe");
    } catch (err) {
      const { userMessage, shouldRetry } = handleAuthError(err, {
        method: "google_signin",
      });

      setError(userMessage);

      if (shouldRetry) {
        logger.info("Error is retryable - user can try again");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();

    if (isOffline) {
      setError(
        "No internet connection. Please check your network and try again.",
      );
      return;
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setFieldErrors({ email: emailValidation.error });
      setError(emailValidation.error);
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password, {
      minLength: isSignIn ? 6 : 8,
      requireUppercase: !isSignIn,
      requireNumber: !isSignIn,
    });
    if (!passwordValidation.isValid) {
      setFieldErrors({ password: passwordValidation.error });
      setError(passwordValidation.error);
      return;
    }

    // Validate name for sign-up
    if (!isSignIn) {
      const nameValidation = validateName(name);
      if (!nameValidation.isValid) {
        setFieldErrors({ name: nameValidation.error });
        setError(nameValidation.error);
        return;
      }
    }

    try {
      setLoading(true);
      setError("");
      setFieldErrors({});

      logger.authEvent(
        isSignIn ? "email_signin_attempt" : "email_signup_attempt",
      );

      let result;
      if (isSignIn) {
        result = await retryOperation(() => signIn(email, password), {
          maxRetries: 2,
          delayMs: 1000,
        });
      } else {
        result = await retryOperation(() => signUp(email, password), {
          maxRetries: 2,
          delayMs: 1000,
        });
      }

      const user = result.user;
      logger.authEvent(
        isSignIn ? "email_signin_success" : "email_signup_success",
        user.uid,
      );

      // Store user data securely
      await storeUserData(user);

      router.push("/my-closet/wardrobe");
    } catch (err) {
      const { userMessage } = handleAuthError(err, {
        method: isSignIn ? "email_signin" : "email_signup",
      });
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(isSignIn ? "register" : "sign-in");
    setShowEmailForm(false);
    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex flex-col">
        {/* Left Side - Vertical Text with Blue Accent */}
        <div className="bg-white flex flex-col items-center justify-center px-4 py-8 gap-5">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl teachers font-light tracking-tighter ">
              CLOSET
            </h1>
            <p className="text-sm text-gray-600">
              {isSignIn
                ? "Welcome back to your wardrobe."
                : "Organize and manage your clothes effortlessly."}
            </p>
          </div>
          <div className="flex items-center justify-center">
            <Image
              src="https://kuwhirtafuvipkb0.public.blob.vercel-storage.com/WhatsApp%20Image%202026-02-05%20at%2019.13.36%20%281%29.jpeg"
              alt=""
              width={600}
              height={600}
              className="w-[58%] h-auto"
            />
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-3 sm:space-y-4 max-w-md mx-auto w-full">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!showEmailForm ? (
            <>
              <Button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full bg-black hover:bg-gray-900 text-white rounded-full py-6 flex items-center justify-center gap-3 disabled:opacity-50"
                size="lg"
              >
                <Image
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium">
                  {loading
                    ? "Signing in..."
                    : isSignIn
                      ? "Sign in with Google"
                      : "Sign up with Google"}
                </span>
              </Button>

              <Button
                onClick={() => setShowEmailForm(true)}
                disabled={loading}
                variant="outline"
                className="w-full rounded-full py-6 flex items-center justify-center gap-3 disabled:opacity-50"
                size="lg"
              >
                <Mail className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {isSignIn ? "Sign in with Email" : "Sign up with Email"}
                </span>
              </Button>

              <p className="text-center text-xs text-gray-500 mt-4">
                {isSignIn ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <Button
                      onClick={toggleMode}
                      variant="link"
                      className="text-gray-700 underline p-0 h-auto text-xs"
                    >
                      Create account
                    </Button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <Button
                      onClick={toggleMode}
                      variant="link"
                      className="text-gray-700 underline p-0 h-auto text-xs"
                    >
                      Sign in
                    </Button>
                  </>
                )}
              </p>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button
                  onClick={() => {
                    // TODO: Redirect to app store/play store
                    window.open("https://www.apple.com/app-store/", "_blank");
                  }}
                  variant="outline"
                  className="w-full rounded-full py-6 flex bg-black text-white items-center justify-center gap-2"
                  size="lg"
                >
                  <span className="text-sm font-medium">
                    Download the Closet app
                  </span>
                  <ChevronRight />
                </Button>
              </div>
            </>
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {!isSignIn && (
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-full py-3 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                  required
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-full py-3 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-full py-3 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                required
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white rounded-full py-6 disabled:opacity-50"
                size="lg"
              >
                {loading
                  ? "Processing..."
                  : isSignIn
                    ? "Sign In"
                    : "Create Account"}
              </Button>
              <Button
                type="button"
                onClick={() => setShowEmailForm(false)}
                variant="ghost"
                className="w-full text-sm text-gray-600 hover:text-gray-900"
              >
                Back
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
