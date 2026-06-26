"use client";

import { FormEvent, useState, useRef, useEffect } from "react";
import { PrimaryButton, Input } from "./ui";
import { ChatSource } from "@/types";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { FallbackOptions } from "./FallbackOptions";
import { GmailAuthDialog } from "./GmailAuthDialog";
import { CVSearchDialog } from "./CVSearchDialog";
import { TopCandidates } from "./TopCandidates";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  timestamp: Date;
  showFallback?: boolean;
}

interface CVCandidate {
  email: string;
  subject: string;
  senderInfo: string;
  analysis: {
    skills: string[];
    experience: string[];
    education: string[];
    summary: string;
  };
  matchScore: number;
  messageId: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGmailAuth, setShowGmailAuth] = useState(false);
  const [showCVSearch, setShowCVSearch] = useState(false);
  const [gmailEmail, setGmailEmail] = useState("");
  const [gmailAccessToken, setGmailAccessToken] = useState("");
  const [gmailPosition, setGmailPosition] = useState(""); // New: store position from pattern
  const [candidates, setCandidates] = useState<CVCandidate[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await fetch("/api/chat-history");
        const data = await response.json();
        if (data.success && data.messages) {
          const reversedMessages = data.messages.reverse();
          const formattedMessages = reversedMessages.flatMap((msg: any) => [
            {
              id: `user-${msg.id}`,
              role: "user" as const,
              content: msg.question,
              timestamp: new Date(msg.asked_at),
            },
            {
              id: `assistant-${msg.id}`,
              role: "assistant" as const,
              content: msg.answer,
              sources: msg.sources,
              timestamp: new Date(msg.asked_at),
            },
          ]);
          setMessages(formattedMessages);
        }
      } catch (e) {
        console.error("Failed to load chat history:", e);
      }
    };
    loadChatHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Detect Gmail CV analysis pattern
  const detectGmailPattern = (
    question: string,
  ): { found: boolean; email: string; position: string } => {
    // Pattern: "analisa cv dari inbox email recruiter@gmail.com untuk posisi software engineer"
    // Also supports: "analisa cv dari inbox email recruiter@gmail.com" (position optional)
    const pattern =
      /analisa?\s+cv\s+dari\s+inbox\s+email\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?:\s+untuk\s+posisi\s+(.+))?/i;
    const match = question.match(pattern);

    let position = "";
    if (match?.[2]) {
      // Extract position and clean it (remove trailing punctuation)
      position = match[2].trim().replace(/[.,!?;:]$/, "");
    }

    return {
      found: !!match,
      email: match?.[1] || "",
      position: position,
    };
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuestion = input;

    // Check for Gmail CV analysis pattern
    const {
      found,
      email: detectedEmail,
      position: detectedPosition,
    } = detectGmailPattern(userQuestion);

    if (found) {
      // Add user message first before showing Gmail dialog
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: userQuestion,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Show Gmail auth dialog with detected email and position
      setGmailEmail(detectedEmail);
      setGmailPosition(detectedPosition); // Store position from pattern
      setShowGmailAuth(true);
      setInput("");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userQuestion,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userQuestion }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        sources: data.sources,
        timestamp: new Date(),
        showFallback: data.noDocumentsFound,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      try {
        await fetch("/api/chat-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: userQuestion,
            answer: data.answer,
            sources: data.sources,
          }),
        });
      } catch (dbError) {
        console.error("Failed to save chat history:", dbError);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setError(msg);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleGmailAuthenticate = (email: string, accessToken: string) => {
    setGmailEmail(email);
    setGmailAccessToken(accessToken);
    setShowGmailAuth(false);
    setShowCVSearch(true);
  };

  const handleCVSearch = async (keyword: string) => {
    if (!gmailAccessToken) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/gmail/search-cvs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: gmailAccessToken,
          keyword,
          position: gmailPosition, // Include position for better matching
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to search CVs");
      }

      setCandidates(data.candidates);
      setShowCVSearch(false);

      // Add assistant message about the search
      let messageContent = `Found ${data.candidates.length} candidates matching "${keyword}" in ${gmailEmail} inbox.`;
      if (gmailPosition) {
        messageContent += ` Looking for best fit for ${gmailPosition} position.`;
      }
      messageContent += " Displaying the top 3 candidates:";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: messageContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to search CVs";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-4/5 mx-auto">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-5xl mb-4">💬</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Start Asking Questions
            </h2>
            <p className="text-gray-600">
              Upload documents first, then ask any question about them.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id}>
                <div
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-md rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>

                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 space-y-2 pt-3 border-t border-gray-300">
                        <p className="text-xs font-semibold">📚 Sources:</p>
                        {message.sources.map((source, idx) => (
                          <div
                            key={idx}
                            className="text-xs bg-white/20 p-2 rounded"
                          >
                            <p className="font-semibold">{source.document}</p>
                            <p className="mt-1 line-clamp-2">
                              "{source.excerpt}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {message.showFallback && message.role === "assistant" && (
                  <div className="mt-3">
                    <FallbackOptions
                      onSelectOption={() => {
                        console.log("Fallback option selected");
                      }}
                      isLoading={loading}
                    />
                  </div>
                )}
              </div>
            ))}
            {loading && <ThinkingIndicator isVisible={true} />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {error && (
        <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="border-t border-gray-200 bg-white p-4 space-y-2">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the documents..."
            disabled={loading}
            className="flex-1"
          />
          <PrimaryButton type="submit" disabled={loading || !input.trim()}>
            {loading ? "⏳" : "📤"}
          </PrimaryButton>
        </form>
        {messages.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={async () => {
                setMessages([]);
                setError(null);
                try {
                  await fetch("/api/chat-history", { method: "DELETE" });
                } catch (e) {
                  console.error("Failed to clear chat history:", e);
                }
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear History
            </button>
          </div>
        )}
      </div>

      {/* Gmail Authentication Dialog */}
      <GmailAuthDialog
        isOpen={showGmailAuth}
        onClose={() => setShowGmailAuth(false)}
        onAuthenticate={handleGmailAuthenticate}
        isLoading={loading}
        defaultEmail={gmailEmail}
      />

      {/* CV Search Dialog */}
      <CVSearchDialog
        isOpen={showCVSearch}
        email={gmailEmail}
        onClose={() => setShowCVSearch(false)}
        onSearch={handleCVSearch}
        isLoading={loading}
      />

      {/* Top Candidates Display */}
      {candidates.length > 0 && (
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <TopCandidates
            candidates={candidates}
            onClose={() => setCandidates([])}
            isLoading={loading}
          />
        </div>
      )}
    </div>
  );
}
