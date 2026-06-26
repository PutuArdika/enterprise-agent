"use client";

import { useState, useEffect } from "react";
import { PrimaryButton, Input } from "./ui";

interface GmailAuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: (email: string, accessToken: string) => void;
  isLoading?: boolean;
  defaultEmail?: string;
}

export function GmailAuthDialog({
  isOpen,
  onClose,
  onAuthenticate,
  isLoading = false,
  defaultEmail = "",
}: GmailAuthDialogProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [authCode, setAuthCode] = useState("");
  const [step, setStep] = useState<"email" | "auth">("email");
  const [error, setError] = useState<string | null>(null);

  // Update email when defaultEmail changes (when dialog is opened)
  useEffect(() => {
    if (isOpen && defaultEmail) {
      setEmail(defaultEmail);
      setError(null);
      setAuthCode("");
      setStep("email");
    }
  }, [isOpen, defaultEmail]);

  // Listen for authorization code from popup window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our own origin for security
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "GMAIL_AUTH_CODE" && event.data.code) {
        setAuthCode(event.data.code);
        setStep("auth");
        setError(null);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Auto-hide dialog immediately on error
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // 2 seconds to see the error
      return () => clearTimeout(timer);
    }
  }, [error, onClose]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      // Initiate OAuth flow
      const response = await fetch("/api/gmail/auth-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to initiate authentication");
        return;
      }

      // Redirect to Google OAuth
      window.open(data.authUrl, "gmail-auth", "width=500,height=600");
      setStep("auth");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  };

  const handleAuthCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!authCode.trim()) {
      setError("Please enter the authorization code");
      return;
    }

    try {
      const response = await fetch("/api/gmail/exchange-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: authCode }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to exchange token");
        return;
      }

      onAuthenticate(email, data.accessToken);
      setEmail("");
      setAuthCode("");
      setStep("email");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Token exchange failed");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Gmail Authentication</h2>

        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gmail Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@gmail.com"
                disabled={isLoading}
                className="w-full"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <PrimaryButton
                type="submit"
                disabled={isLoading || !email.trim()}
                className="flex-1"
              >
                {isLoading ? "⏳ Connecting..." : "Continue"}
              </PrimaryButton>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAuthCodeSubmit} className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
              A browser window has opened for Gmail authentication. After
              authorizing, paste the code below:
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Authorization Code
              </label>
              <Input
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                placeholder="Paste the authorization code here"
                disabled={isLoading}
                className="w-full"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setAuthCode("");
                  setError(null);
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                disabled={isLoading}
              >
                Back
              </button>
              <PrimaryButton
                type="submit"
                disabled={isLoading || !authCode.trim()}
                className="flex-1"
              >
                {isLoading ? "⏳ Verifying..." : "Verify"}
              </PrimaryButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
