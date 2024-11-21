"use client"

import { motion } from "framer-motion"
import { Github, Send } from 'lucide-react'
import { Logo } from "@/components/ui/logo"

export function Footer() {
    return (
        <motion.footer
            className="bg-background border-t border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center mb-4 md:mb-0">
                        <Logo />
                        <p className="text-sm text-foreground/60 mx-auto md:ml-8">© 2023 FlyraLink. All rights reserved.</p>
                    </div>
                    <div className="flex space-x-6">
                        <motion.a
                            href="https://github.com/hemanth0525/flyralink"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground/60 hover:text-foreground transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Github className="h-6 w-6" />
                            <span className="sr-only">GitHub</span>
                        </motion.a>
                        <motion.a
                            href="https://t.me/flyralink"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground/60 hover:text-foreground transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Send className="h-6 w-6" />
                            <span className="sr-only">Telegram</span>
                        </motion.a>
                    </div>
                </div>
            </div>
        </motion.footer>
    )
}

