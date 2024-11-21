"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Menu, X } from 'lucide-react'
import { Logo } from "@/components/ui/logo"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    const menuVariants = {
        open: { opacity: 1, x: 0 },
        closed: { opacity: 0, x: "100%" },
    }

    return (
        <motion.nav
            className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex-shrink-0">
                        <Logo />
                    </Link>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link href="/#features" className="text-foreground/60 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Features
                            </Link>
                            <Link href="/#compare" className="text-foreground/60 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Compare
                            </Link>
                            <ThemeToggle />
                        </div>
                    </div>
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        >
                            {isOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <motion.div
                className="md:hidden"
                initial="closed"
                animate={isOpen ? "open" : "closed"}
                variants={menuVariants}
            >
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <Link href="/#features" className="text-foreground hover:bg-accent hover:text-accent-foreground block px-3 py-2 rounded-md text-base font-medium">
                        Features
                    </Link>
                    <Link href="/#compare" className="text-foreground hover:bg-accent hover:text-accent-foreground block px-3 py-2 rounded-md text-base font-medium">
                        Compare
                    </Link>
                    <div className="px-3 py-2">
                        <ThemeToggle />
                    </div>
                </div>
            </motion.div>
        </motion.nav>
    )
}

