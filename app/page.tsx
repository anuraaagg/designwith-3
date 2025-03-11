"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

export default function WelcomePage() {
  return (
    <div
      className="min-h-screen w-full bg-blue-50 relative overflow-hidden"
      style={{
        backgroundImage: "url('/grid-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Clouds background effect */}
      <div className="absolute inset-0 bg-[url('/clouds.png')] bg-cover opacity-50 pointer-events-none"></div>

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
        {/* Stamp */}
        <motion.div
          className="mb-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Image 
            src="/duck.gif" 
            alt="Duck Animation" 
            width={120} 
            height={150} 
            className="mx-auto h-auto" 
            unoptimized 
          />
        </motion.div>

        {/* Main content */}
        <motion.div
          className="max-w-xl mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-5xl mb-6 font-garamond font-bold flex justify-center items-center">
            Hey You! <span className="ml-2 text-pink-500">❤️</span>
          </h1>

          <div className="space-y-4 font-geist-mono text-lg">
            <p>Since we have time, and I'd love to know more about you, I made this little space just for you. 💛</p>
            <p>
              Here, you can add the things you love—songs, movies, places, random little thoughts, and even cute
              selfies! Just update it anytime, and I'll get to know you a little more, piece by piece. 😊
            </p>
            <p>No rush, no rules—just a fun little scrapbook of you. ✨</p>
          </div>

          <motion.div
            className="mt-10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/scrapbook"
              className="inline-block px-8 py-3 font-geist-mono text-lg text-indigo-600 border-2 border-indigo-500 rounded-md hover:bg-indigo-100 transition-colors duration-300"
            >
              Get Inside
            </Link>
          </motion.div>
        </motion.div>

        {/* Footer notes */}
        <motion.div
          className="absolute bottom-4 left-4 font-geist-mono text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          IDK BUT I TRIED
        </motion.div>
        <motion.div
          className="absolute bottom-4 right-4 font-geist-mono text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          MADE BY A DUMB GUY
        </motion.div>
      </div>
    </div>
  )
}

