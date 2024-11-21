"use client"

import { motion } from "framer-motion"

export function Logo() {
    return (
        <div className="flex items-center space-x-2">
            <motion.svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                initial={{ rotate: -45 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <motion.path
                    d="M16 2L2 16L16 30L30 16L16 2Z"
                    fill="url(#gradient)"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                />
                <motion.path
                    d="M16 6L6 16L16 26L26 16L16 6Z"
                    fill="white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
                />
                <defs>
                    <linearGradient id="gradient" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FF00EA" />
                        <stop offset="1" stopColor="#00FFFF" />
                    </linearGradient>
                </defs>
            </motion.svg>
            <span className="font-brand text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF00EA] to-[#00FFFF] tracking-widest">
                Flyra<span className="text-primary font-thin tracking-widest">.link</span>
            </span>
        </div>
    )
}

