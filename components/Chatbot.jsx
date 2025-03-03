"use client";
import { useState } from "react";
import { MessageCircle, Sparkles } from "lucide-react";

const Chatbot = () => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="relative w-[] h-full z-50">
      {/* Chatbot Icon */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition"
      >
        <Sparkles size={24} />
      </button>

      {/* Chat UI Panel */}
      {chatOpen && (
        <div className="fixed bottom-16 right-6 w-[300px] h-[400px] bg-white shadow-lg rounded-lg p-4 flex flex-col">
          <div className="flex justify-between items-center border-b pb-2 mb-2">
            <h2 className="text-lg font-semibold">AI Chatbot</h2>
            <button onClick={() => setChatOpen(false)} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 text-sm text-gray-700">
            <p>👋 Hello! How can I assist you today?</p>
          </div>
          <input
            type="text"
            placeholder="Type a message..."
            className="w-full p-2 border rounded-md text-sm"
          />
        </div>
      )}
    </div>
  );
};

export default Chatbot;
