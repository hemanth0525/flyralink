"use client"

import * as React from "react"
import { Moon, Sun } from 'lucide-react'
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <motion.button
            className="relative w-12 h-6 rounded-full bg-muted flex items-center justify-start p-1 cursor-pointer"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            animate={{ justifyContent: theme === "light" ? "flex-start" : "flex-end" }}
        >
            <motion.div
                className="w-4 h-4 rounded-full bg-primary flex items-center justify-center"
                layout
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
            >
                {theme === "light" ? (
                    <Sun className="h-3 w-3 text-primary-foreground" />
                ) : (
                    <Moon className="h-3 w-3 text-primary-foreground" />
                )}
            </motion.div>
        </motion.button>
    )
}

