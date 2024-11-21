'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, RefreshCw } from 'lucide-react'

export default function NotFound() {
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isHovering, setIsHovering] = useState(false)
    const [countdown, setCountdown] = useState(5)
    const router = useRouter()
    const reason = 'Page not found OR URL not found OR URL data not found OR URL has expired OR URL has no clicks remaining'

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isHovering) {
                setPosition({ x: e.clientX, y: e.clientY })
            }
        }

        window.addEventListener('mousemove', handleMouseMove)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [isHovering])

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prevCount) => prevCount - 1)
        }, 1000)

        if (countdown === 0) {
            router.push('/')
        }

        return () => clearInterval(timer)
    }, [countdown, router])

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex flex-col items-center justify-center p-4 text-white relative overflow-hidden">
            {/* Animated background shapes */}
            <motion.div
                className="absolute w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                animate={{
                    scale: [1, 2, 2, 1, 1],
                    rotate: [0, 0, 270, 270, 0],
                    borderRadius: ["20%", "20%", "50%", "50%", "20%"],
                }}
                transition={{
                    duration: 12,
                    ease: "easeInOut",
                    times: [0, 0.2, 0.5, 0.8, 1],
                    repeat: Infinity,
                    repeatType: "reverse"
                }}
            />
            <motion.div
                className="absolute w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                animate={{
                    scale: [1, 2, 2, 1, 1],
                    rotate: [0, 270, 270, 0, 0],
                    borderRadius: ["20%", "20%", "50%", "50%", "20%"],
                }}
                transition={{
                    duration: 12,
                    ease: "easeInOut",
                    times: [0, 0.2, 0.5, 0.8, 1],
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 1
                }}
            />

            <motion.h1
                className="text-6xl md:text-8xl font-bold mb-8 text-center"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                404
            </motion.h1>
            <motion.p
                className="text-2xl md:text-3xl mb-4 text-center"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                Oops! This link seems to have vanished into thin air.
            </motion.p>
            <motion.p
                className="text-xl mb-8 text-center"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                Reason: {reason}
            </motion.p>
            <motion.p
                className="text-lg mb-12 text-center"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                Redirecting in {countdown} seconds...
            </motion.p>

            {/* Interactive 404 text */}
            <motion.div
                className="text-[200px] font-bold absolute pointer-events-none select-none"
                animate={{ x: position.x - 100, y: position.y - 100 }}
                transition={{ type: "spring", stiffness: 150, damping: 15 }}
                style={{ zIndex: -1 }}
            >
                404
            </motion.div>

            <div className="z-50 flex flex-col sm:flex-row gap-4">
                <Link href="/" passHref>
                    <motion.button
                        className="z-50 bg-white text-purple-600 px-6 py-3 rounded-full font-semibold flex items-center justify-center hover:bg-purple-100 transition-colors duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        <ArrowLeft className="mr-2" size={20} />
                        Go Home
                    </motion.button>
                </Link>
                <motion.button
                    className="z-50 bg-white text-purple-600 px-6 py-3 rounded-full font-semibold flex items-center justify-center hover:bg-purple-100 transition-colors duration-300"
                    onClick={() => window.location.reload()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    <RefreshCw className="mr-2" size={20} />
                    Try Again
                </motion.button>
            </div>
        </div>
    )
}

