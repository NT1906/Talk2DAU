/*Main Page*/

'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';


export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181c24] via-[#23283a] to-[#101014] flex flex-col relative overflow-x-hidden">
      {/* Soft background gradient overlays */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-900/40 to-purple-900/10 blur-3xl" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-orange-900/30 to-orange-500/10 blur-2xl" />
        <div className="absolute bottom-0 left-1/2 w-[500px] h-[300px] rounded-full bg-gradient-to-tl from-blue-900/30 to-indigo-900/10 blur-2xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between max-w-7xl mx-auto w-full px-6 py-6">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative w-14 h-14">
            <Image src="/image.png" alt="DAU Logo" fill className="object-contain" priority />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Talk 2 DAU</span>
        </div>
        {/* Nav links */}
        <div className="hidden md:flex space-x-8">
          

        </div>
        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Link href="https://github.com/NT1906/Talk2DAU.git" target="_blank" rel="noopener noreferrer">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="text-gray-300 hover:text-orange-400 transition-colors">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </motion.div>
          </Link>
           
        </div>
      </nav>

      {/* Main Hero Section */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full max-w-3xl mx-auto rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl px-8 py-16 flex flex-col items-center text-center"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Everything You Need.<br />
            <span className="text-orange-400">Before You Ask.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
            Talk 2 DAU is your AI assistant for Dhirubhai Ambani University. Get instant answers about courses, campus life, and more — in real time.
          </p>
          <Link href="/chat">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-full shadow-lg text-lg transition-all"
            >
              Start Chatting
            </motion.button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
