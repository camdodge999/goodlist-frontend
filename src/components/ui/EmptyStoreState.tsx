"use client";

import { motion } from "@/lib/motion";

interface EmptyStoreStateProps {
  readonly message?: string;
  readonly className?: string;
}

export default function EmptyStoreState({
  message = "คุณเป็นร้านแรกที่ได้รับการตรวจสอบ!",
  className = ""
}: EmptyStoreStateProps) {
  return (
    <div className={`relative isolate overflow-hidden ${className}`}>
      {/* Animated background elements */}

      {/* Main content */}
      <div className="relative z-10 text-center py-16 px-8">
        {/* Animated icon cluster */}
        <motion.div
          className="mb-8 flex justify-center relative"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >

        </motion.div>

        {/* Animated title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            ✨ เป็นผู้นำแนวหน้า! ✨
          </h3>
          <motion.p
            className="text-lg font-medium bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-[length:200%_100%] bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {message}
          </motion.p>
        </motion.div>

        {/* Animated description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <p className="text-gray-500 text-base max-w-md mx-auto leading-relaxed">
            เริ่มต้นการเดินทางสู่การเป็นร้านค้าที่ผ่านการตรวจสอบและน่าเชื่อถือ
            <span className="font-semibold text-blue-600"> เป็นคนแรก</span> 
            <span className="font-semibold text-blue-600"> ที่เข้าร่วมและได้รับการตรวจสอบ</span>
          </p>
        </motion.div>


        {/* Sparkle effects */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 bg-yellow-400 rounded-full left-[${20 + (i * 12)}%] top-[${30 + (i % 2) * 20}%]`}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 