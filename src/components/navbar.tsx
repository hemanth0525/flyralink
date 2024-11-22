"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from 'lucide-react'
import { Logo } from "@/components/ui/logo"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const menuVariants = {
        open: { opacity: 1, height: "auto" },
        closed: { opacity: 0, height: 0 }
    }

    return (
        <motion.nav
            className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-300 ${scrolled ? "shadow-md" : ""
                }`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    <Link href="/" className="flex-shrink-0">
                        <Logo />
                    </Link>
                    <div className="hidden sm:flex sm:items-center sm:space-x-4">
                        <Link href="/#features" className="text-foreground/60 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                            Features
                        </Link>
                        <Link href="/#compare" className="text-foreground/60 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                            Compare
                        </Link>
                        <ThemeToggle />
                    </div>
                    <div className="sm:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            aria-expanded={isOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="sm:hidden overflow-hidden"
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={menuVariants}
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1">
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
                )}
            </AnimatePresence>
        </motion.nav>
    )
}

