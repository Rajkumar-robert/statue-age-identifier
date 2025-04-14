"use client";
import { useState } from "react";
import { MessageCircle, Sparkles } from "lucide-react";
import axios from "axios";

const Chatbot = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Make a request to the Next.js API route
      const response = await axios.post("/api/chat", { query: input });
      const botMessage = { sender: "bot", text: response.data.summary };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Error fetching response." },
      ]);
    }

    setInput("");
  }

  return (
    <div className="relative w-full h-full z-50">
      {/* Chatbot Icon */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition"
      >
        <Sparkles size={24} />
      </button>

      {/* Chat UI Panel */}
      {chatOpen && (
        <div className="fixed bottom-16 right-6 w-[320px] h-[400px] bg-white shadow-lg rounded-lg flex flex-col border border-gray-200">
          {/* Header */}
          <div className="flex justify-between items-center bg-blue-500 text-white p-3 rounded-t-lg">
            <h2 className="text-lg font-semibold">AI Chatbot</h2>
            <button onClick={() => setChatOpen(false)} className="text-white hover:text-gray-200">
              ✕
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm text-gray-800">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg max-w-[80%] ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white self-end ml-auto"
                    : "bg-gray-300 text-black self-start"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none"
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
