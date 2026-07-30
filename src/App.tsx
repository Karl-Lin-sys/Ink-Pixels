import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import StoryView from './components/StoryView';
import ChatInterface from './components/ChatInterface';
import { Message, StoryState } from './types';
import { Feather, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [storyState, setStoryState] = useState<StoryState>({
    imageBase64: null,
    mimeType: null,
    openingParagraph: null,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleImageSelected = async (base64: string, mimeType: string) => {
    setStoryState({ imageBase64: base64, mimeType, openingParagraph: null });
    setIsAnalyzing(true);
    setChatHistory([]); // Reset chat when new image is uploaded

    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const data = await response.json();
      setStoryState((prev) => ({ ...prev, openingParagraph: data.text }));
    } catch (error) {
      console.error(error);
      alert("Error analyzing image and generating story. Check console.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    const newMessage: Message = { id: Date.now().toString(), role: "user", text };
    setChatHistory((prev) => [...prev, newMessage]);
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: chatHistory,
          message: text,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get chat response");
      }

      const data = await response.json();
      const modelMessage: Message = { id: (Date.now() + 1).toString(), role: "model", text: data.text };
      setChatHistory((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error(error);
      alert("Error generating response.");
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleReset = () => {
    setStoryState({ imageBase64: null, mimeType: null, openingParagraph: null });
    setChatHistory([]);
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans selection:bg-amber-200 dark:selection:bg-amber-900/50">
      <header className="fixed top-0 inset-x-0 h-16 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white">
            <Feather className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Ink & Pixels</h1>
        </div>
        {storyState.imageBase64 && (
          <button 
            onClick={handleReset}
            className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
          >
            Start New Story
          </button>
        )}
      </header>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {!storyState.imageBase64 ? (
            <motion.div 
              key="uploader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex items-center justify-center"
            >
              <ImageUploader onImageSelected={handleImageSelected} />
            </motion.div>
          ) : isAnalyzing ? (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-6"
            >
              <div className="w-16 h-16 relative">
                <div className="absolute inset-0 rounded-full border-4 border-amber-200 dark:border-amber-900/30"></div>
                <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-medium">Divining the scene...</h3>
                <p className="text-neutral-500 dark:text-neutral-400">Analyzing your image to craft the perfect opening.</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="story"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-140px)]"
            >
              {storyState.openingParagraph && (
                <div className="h-full flex flex-col min-h-0">
                  <StoryView 
                    imageBase64={storyState.imageBase64} 
                    openingParagraph={storyState.openingParagraph} 
                  />
                </div>
              )}
              
              <div className="h-full flex flex-col min-h-0">
                <ChatInterface 
                  history={chatHistory} 
                  onSendMessage={handleSendMessage} 
                  isLoading={isChatLoading} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
