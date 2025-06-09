'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMessages();
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const fetchMessages = async () => {
    try {
      setMessages([]);
    } catch (error) {
      console.error('Error initializing messages:', error);
    }
  };

  const handleReprocess = async () => {
    setIsReprocessing(true);
    try {
      const response = await fetch('http://localhost:8000/api/reprocess', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add system message
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: "Documents have been reprocessed successfully! You can now ask questions about the new content.",
        sender: 'ai'
      }]);
    } catch (error) {
      console.error('Error reprocessing documents:', error);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: "Sorry, there was an error reprocessing the documents. Please try again.",
        sender: 'ai'
      }]);
    } finally {
      setIsReprocessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim()) {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: inputText }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Add user message
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: inputText,
          sender: 'user'
        }]);
        
        // Add AI response
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: data.response,
          sender: 'ai'
        }]);
        
        setInputText('');
        // Focus input after sending
        inputRef.current?.focus();
      } catch (error) {
        console.error('Error sending message:', error);
        // Add error message
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: "Sorry, I encountered an error. Please try again.",
          sender: 'ai'
        }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex flex-col relative overflow-x-hidden">
      {/* Soft background gradient overlays */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-900/40 to-violet-900/10 blur-3xl" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-cyan-900/30 to-blue-500/10 blur-2xl" />
        <div className="absolute bottom-0 left-1/2 w-[500px] h-[300px] rounded-full bg-gradient-to-tl from-indigo-900/30 to-blue-900/10 blur-2xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between max-w-7xl mx-auto w-full px-6 py-6">
        <div className="flex items-center space-x-3">
          <Link href="/">
            <div className="relative w-14 h-14 cursor-pointer">
              <Image src="/image.png" alt="DAU Logo" fill className="object-contain" priority />
            </div>
          </Link>
          <span className="text-2xl font-bold text-white tracking-tight">Talk 2 DAU</span>
        </div>
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReprocess}
            disabled={isReprocessing}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-full shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span>Reprocess Documents</span>
            {isReprocessing && (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
          </motion.button>
          <Link href="https://github.com/NT1906/Talk2DAU.git" target="_blank" rel="noopener noreferrer">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="text-gray-300 hover:text-blue-400 transition-colors">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </motion.div>
          </Link>
        </div>
      </nav>

      {/* Chat Container */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full max-w-2xl mx-auto rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl px-0 py-0 flex flex-col items-center"
        >
          {/* Messages Area */}
          <div className="flex-1 w-full overflow-y-auto px-6 pt-8 pb-32 space-y-4" style={{ minHeight: '400px', maxHeight: '60vh' }}>
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-md text-base md:text-lg font-medium transition-all
                      ${message.sender === 'user'
                        ? 'bg-gradient-to-br from-blue-500/90 to-blue-600/80 text-white rounded-br-md'
                        : 'bg-white/10 text-blue-100 border border-blue-400/10 rounded-bl-md backdrop-blur-sm'}
                    `}
                  >
                    {message.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white/10 text-blue-100 rounded-2xl px-5 py-3 border border-blue-400/10 shadow-md flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            className="absolute left-0 right-0 bottom-0 px-6 pb-8"
            onSubmit={e => { e.preventDefault(); handleSendMessage(); }}
            autoComplete="off"
          >
            <div className="flex items-center w-full bg-white/10 backdrop-blur-xl border border-white/10 rounded-full shadow-lg px-4 py-3 space-x-4">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 bg-transparent outline-none border-none text-white placeholder-gray-300 text-lg px-2"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                disabled={isLoading || !inputText.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-full shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Send</span>
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
} 