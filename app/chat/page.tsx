"use client";

import { Navigation } from "@/components/Navigation";
import { ChatInterface } from "@/components/ChatInterface";

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}
