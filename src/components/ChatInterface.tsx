import React, { useState, useRef, useEffect } from "react";
import { Message } from "../types";
import { Send, Loader2, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatInterfaceProps {
  history: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export default function ChatInterface({ history, onSendMessage, isLoading }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800/50 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Co-Writer
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {history.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <p className="text-neutral-400 dark:text-neutral-500 text-sm">
              The opening scene is set.<br />What happens next?
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {history.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "user" 
                    ? "bg-neutral-800 dark:bg-neutral-100 text-white dark:text-neutral-900" 
                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500"
                }`}>
                  {msg.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`px-5 py-3.5 rounded-2xl max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-neutral-800 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-tr-sm"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-tl-sm leading-relaxed"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex gap-4 flex-row"
          >
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 flex items-center justify-center shrink-0">
               <Sparkles className="w-4 h-4" />
            </div>
            <div className="px-5 py-3.5 rounded-2xl rounded-tl-sm bg-neutral-100 dark:bg-neutral-800 flex items-center">
              <Loader2 className="w-4 h-4 text-neutral-400 animate-spin" />
            </div>
          </motion.div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800/50">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Type what happens next..."
            className="w-full bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-full pl-5 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-700 transition-shadow disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
