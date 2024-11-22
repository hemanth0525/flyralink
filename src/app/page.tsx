"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Copy, Download, Share2, RefreshCwIcon as Refresh, Lock, X, Check, Sparkles, Globe, PencilLine, TimerOff, QrCode, Smile, Eye, Network, Shuffle } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function Home() {
  const [url, setUrl] = useState("")
  const [customSlug, setCustomSlug] = useState("")
  const [expirationOption, setExpirationOption] = useState("never")
  const [expirationValue, setExpirationValue] = useState("")
  const [qrCode, setQrCode] = useState("")
  const [shortenedUrl, setShortenedUrl] = useState("")
  const [isPasswordProtected, setIsPasswordProtected] = useState(false)
  const [password, setPassword] = useState("")
  const [isOneTimeUse, setIsOneTimeUse] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDynamicLink, setIsDynamicLink] = useState(false)
  const [dynamicLinkOptions, setDynamicLinkOptions] = useState({ day: "", night: "" })
  const [isAppStoreLink, setIsAppStoreLink] = useState(false)
  const [appStoreLinks, setAppStoreLinks] = useState({ ios: "", android: "" })
  const [customLogo, setCustomLogo] = useState<File | null>(null)
  const [qrCodeColor, setQrCodeColor] = useState("#000000")
  const [batchUrls, setBatchUrls] = useState("")
  const [batchResults, setBatchResults] = useState<{ original: string; shortened: string }[]>([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (customSlug && !validateCustomSlug(customSlug)) {
      return;
    }
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('url', url)
      formData.append('customSlug', customSlug)
      formData.append('expirationOption', expirationOption)
      formData.append('expirationValue', expirationValue)
      formData.append('isPasswordProtected', String(isPasswordProtected))
      if (isPasswordProtected) formData.append('password', password)
      formData.append('isOneTimeUse', String(isOneTimeUse))
      formData.append('isDynamicLink', String(isDynamicLink))
      if (isDynamicLink) formData.append('dynamicLinkOptions', JSON.stringify(dynamicLinkOptions))
      formData.append('isAppStoreLink', String(isAppStoreLink))
      if (isAppStoreLink) formData.append('appStoreLinks', JSON.stringify(appStoreLinks))
      if (customLogo) formData.append('customLogo', customLogo)
      formData.append('qrCodeColor', qrCodeColor)

      const response = await fetch('/api/shorten', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to shorten URL')
      }

      const data = await response.json()
      setShortenedUrl(data.shortUrl)
      setQrCode(data.qrCode)
      toast({
        title: "URL Shortened",
        description: "Your URL has been successfully shortened!",
      })
    } catch (error) {
      console.error('Error shortening URL:', error)
      toast({
        title: "Error",
        description: "Custom slug already exists. Please try again with a different one.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  interface BatchShortenResult {
    shortUrl: string;
    qrCode?: string;
  }

  const handleBatchShorten = async () => {
    setIsLoading(true)
    const urls = batchUrls.split('\n').filter(url => url.trim() !== '')
    const batchData = urls.map(url => {
      const [originalUrl, customSlug] = url.split(',').map(item => item.trim())
      return { url: originalUrl, customSlug }
    })

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchData),
      })

      if (!response.ok) {
        throw new Error('Failed to shorten URLs')
      }

      const results = await response.json() as BatchShortenResult[]
      setBatchResults(results.map((result: BatchShortenResult, index: number) => ({
        original: batchData[index].url,
        shortened: result.shortUrl,
      })))
      toast({
        title: "Batch URLs Shortened",
        description: `Successfully shortened ${results.length} URLs.`,
      })
    } catch (error) {
      console.error('Error shortening URLs:', error)
      toast({
        title: "Error",
        description: "Failed to shorten batch URLs or one of the slugs already exists. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmojiSelect = (emoji: { emoji: string }) => {
    setCustomSlug(prevSlug => prevSlug + emoji.emoji)
    setShowEmojiPicker(false)
  }

  const validateCustomSlug = (slug: string) => {
    if (slug.length < 4) {
      toast({
        title: "Invalid Custom Slug",
        description: "Custom slug must be at least 4 characters long.",
        variant: "destructive",
      })
      return false
    }
    if (!/^[\p{L}\p{N}\p{Emoji}_-]+$/u.test(slug)) {
      toast({
        title: "Invalid Custom Slug",
        description: "Custom slug can only contain letters, numbers, emojis, underscores, and hyphens.",
        variant: "destructive",
      })
      return false
    }
    if (/^\p{Emoji}+$/u.test(slug)) {
      toast({
        title: "Invalid Custom Slug",
        description: "Custom slug cannot contain only emojis.",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  const generateRandomSlug = () => {
    const adjectives = ['happy', 'sunny', 'clever', 'brave', 'mighty', 'zesty', 'quirky', 'fluffy']
    const nouns = ['tiger', 'mountain', 'river', 'forest', 'star', 'cookie', 'ninja', 'unicorn']
    const emojis = ['🚀', '🌈', '🎉', '🦄', '🍕', '🌟', '🐱', '🦋']
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
    setCustomSlug(`${randomAdjective}-${randomNoun}-${randomEmoji}`)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shortenedUrl)
    toast({
      title: "Copied!",
      description: "The shortened URL has been copied to your clipboard.",
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this link',
          text: 'I shortened this URL with FlyraLink',
          url: shortenedUrl,
        })
        toast({
          title: "Shared!",
          description: "The shortened URL has been shared.",
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      handleCopy()
    }
  }

  const handleDownloadQR = () => {
    const link = document.createElement('a')
    link.href = qrCode
    link.download = 'qrcode.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({
      title: "Downloaded!",
      description: "The QR code has been downloaded.",
    })
  }

  const handleRedirect = async () => {
    try {
      const shortCode = shortenedUrl.split('/').pop();
      const baseUrl = "https://flyra.link";
      window.open(`${baseUrl}/${shortCode}`, '_blank');
    } catch (error) {
      console.error('Error redirecting:', error)
      toast({
        title: "Error",
        description: "Failed to open link. Please try again.",
        variant: "destructive",
      })
    }
  }

  const features = [
    {
      title: "Customizable Slugs",
      description: "Create memorable, branded short links with custom slugs. Use alphanumeric characters, hyphens, and even emojis!",
      icon: <PencilLine className="h-6 w-6" />,
    },
    {
      title: "Self-Destructing Links",
      description: "Set links to expire after a certain number of clicks or a specific time period. Perfect for time-sensitive content!",
      icon: <TimerOff className="h-6 w-6" />,
    },
    {
      title: "QR Code Generation",
      description: "Automatically generate QR codes for your shortened URLs. Great for print materials and contactless information sharing!",
      icon: <QrCode className="h-6 w-6" />,
    },
    {
      title: "Password Protection",
      description: "Secure your shortened URLs with password protection. Only users with the correct password can access the link.",
      icon: <Lock className="h-6 w-6" />,
    },
    {
      title: "Dynamic App Store Links",
      description: "Create smart links that redirect users to the appropriate app store based on their device platform.",
      icon: <Sparkles className="h-6 w-6" />,
    },
    {
      title: "Open Source",
      description: "FlyraLink is completely open source. Inspect the code, contribute, or self-host your own instance.",
      icon: <Globe className="h-6 w-6" />,
    },
    {
      title: "One-Time View Links",
      description: "Create links that self-destruct after a single view. Perfect for sharing sensitive information securely.",
      icon: <Eye className="h-6 w-6" />,
    },
    {
      title: "Dynamic Short Links",
      description: "Configure links to redirect to different destinations based on time or user location.",
      icon: <Network className="h-6 w-6" />,
    },
    {
      title: "Emoji Slugs",
      description: "Spice up your links with emoji slugs! Combine text and emojis for fun, expressive short links.",
      icon: <Smile className="h-6 w-6" />,
    },
    {
      title: "Random Funny Slugs",
      description: "Generate quirky, creative slugs using a word bank for fun and memorable links.",
      icon: <Shuffle className="h-6 w-6" />,
    },
    {
      title: "URL Caching",
      description: "Cache shortened URLs for faster redirection and improved performance.",
      icon: <Refresh className="h-6 w-6" />,
    }
  ]

  const comparisonData = [
    { feature: "Customizable Slugs", flyra: true, bitly: true, tiny: false, rebrandly: true },
    { feature: "Self-Destructing Links", flyra: "Time & Click Based", bitly: false, tiny: false, rebrandly: false },
    { feature: "QR Code with Custom Logo", flyra: true, bitly: "Logo Extra Cost", tiny: false, rebrandly: "Logo Extra Cost" },
    { feature: "Emoji Slugs", flyra: "Words + Emojis", bitly: false, tiny: false, rebrandly: false },
    { feature: "Anonymous Usage", flyra: true, bitly: "Requires Account", tiny: true, rebrandly: "Requires Account" },
    { feature: "One-Time View Links", flyra: true, bitly: false, tiny: false, rebrandly: false },
    { feature: "Instant Sharing Buttons", flyra: true, bitly: false, tiny: false, rebrandly: "Limited" },
    { feature: "Batch Shortening", flyra: true, bitly: "Paid Only", tiny: false, rebrandly: "Paid Only" },
    { feature: "Dynamic Short Links", flyra: "Time / Location", bitly: false, tiny: false, rebrandly: "Paid Feature" },
    { feature: "Dark Mode Option", flyra: true, bitly: false, tiny: false, rebrandly: false },
    { feature: "Password-Protected Links", flyra: "Yes (Free)", bitly: "Paid Only", tiny: false, rebrandly: "Paid Feature" },
    { feature: "Random Funny Slugs", flyra: true, bitly: false, tiny: false, rebrandly: false },
    { feature: "Open Source", flyra: true, bitly: false, tiny: false, rebrandly: false },
    { feature: "Dynamic App Store Links", flyra: "Android / iOS", bitly: false, tiny: false, rebrandly: false },
    { feature: "URL Caching", flyra: "In-memory and Redis (for fast access)", bitly: "Caches Links", tiny: "Caches Links", rebrandly: "Caches Links" }
  ]

  return (
    <div className="container mt-4 mx-auto py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 sm:mb-12"
      >
        <h1 className="font-brand text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#FF00EA] to-[#00FFFF] animate-gradient">
          Shorten. Customize. Share.
        </h1>
        <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-foreground/80 max-w-2xl mx-auto">
          Create powerful, customizable short links with FlyraLink.
          Emoji slugs, self-destructing links, and more - all for free!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-accent rounded-lg p-4 sm:p-6 mb-8 sm:mb-12 shadow-lg relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF00EA] to-[#00FFFF] opacity-10 animate-gradient"></div>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 relative z-10">
          <div>
            <Label htmlFor="url">Enter your long URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com/your-long-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <Label htmlFor="customSlug">Custom slug (optional)</Label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <Input
                  id="customSlug"
                  type="text"
                  placeholder="your-custom-slug"
                  value={customSlug}
                  onChange={(e) => {
                    setCustomSlug(e.target.value)
                  }}
                  className="flex-1 rounded-none rounded-l-md"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="rounded-none"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add emoji to custom slug</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  type="button"
                  onClick={generateRandomSlug}
                  className="rounded-none rounded-r-md"
                >
                  <Refresh className="h-4 w-4" />
                </Button>
              </div>
              {showEmojiPicker && (
                <div className="absolute z-10 mt-1 bg-popover border rounded-md shadow-lg p-4 grid grid-cols-8 gap-2 max-h-[200px] overflow-y-auto">
                  {[
                    // Smileys & Emotion
                    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
                    '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐',
                    // Gestures & People
                    '👍', '👎', '👊', '✊', '🤛', '🤜', '🤝', '👏', '🙌', '👐', '🤲', '🙏', '✌️', '🤘', '🤟',
                    '🤙', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '✍️', '🤳', '💪', '🦾',
                    // Animals & Nature
                    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
                    '🦄', '🦓', '🦒', '🦘', '🦬', '🐽', '🐗', '🦝', '🦡', '🦫', '🦦', '🦥', '🐘', '🦏',
                    // Food & Drink
                    '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥',
                    '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯',
                    // Travel & Places
                    '✈️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '🚢', '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️',
                    '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚔', '🚍', '🚘',
                    // Activities & Sports
                    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍',
                    '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '⛳', '🎯', '🏌️', '🏂', '🪂',
                    // Objects
                    '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼',
                    '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭',
                    // Symbols
                    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
                    '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈'
                  ].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={(e) => {
                        e.preventDefault();
                        handleEmojiSelect({ emoji });
                      }}
                      className="hover:bg-accent rounded p-1 text-xl transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Tabs defaultValue="expiration" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="expiration">Expiration</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="batch">Batch</TabsTrigger>
            </TabsList>
            <TabsContent value="expiration">
              <div className="space-y-4">
                <Label>Link Expiration</Label>
                <Select onValueChange={(value: 'never' | 'clicks' | 'time') => setExpirationOption(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select expiration option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="clicks">After number of clicks</SelectItem>
                    <SelectItem value="time">After specific time</SelectItem>
                  </SelectContent>
                </Select>
                {expirationOption !== "never" && (
                  <Input
                    type={expirationOption === "clicks" ? "number" : "datetime-local"}
                    value={expirationValue}
                    onChange={(e) => setExpirationValue(e.target.value)}
                    placeholder={expirationOption === "clicks" ? "Number of clicks" : "Expiration date and time"}
                  />
                )}
              </div>
            </TabsContent>
            <TabsContent value="security">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="password-protect"
                    checked={isPasswordProtected}
                    onCheckedChange={setIsPasswordProtected}
                  />
                  <Label htmlFor="password-protect">Password protect</Label>
                </div>
                {isPasswordProtected && (
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                )}
              </div>
            </TabsContent>
            <TabsContent value="advanced">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="one-time-view"
                    checked={isOneTimeUse}
                    onCheckedChange={setIsOneTimeUse}
                  />
                  <Label htmlFor="one-time-view">One-time view</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="dynamic-link"
                    checked={isDynamicLink}
                    onCheckedChange={setIsDynamicLink}
                  />
                  <Label htmlFor="dynamic-link">Dynamic link</Label>
                </div>
                {isDynamicLink && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Day URL"
                      value={dynamicLinkOptions.day}
                      onChange={(e) => setDynamicLinkOptions({ ...dynamicLinkOptions, day: e.target.value })}
                    />
                    <Input
                      placeholder="Night URL"
                      value={dynamicLinkOptions.night}
                      onChange={(e) => setDynamicLinkOptions({ ...dynamicLinkOptions, night: e.target.value })}
                    />
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="app-store-link"
                    checked={isAppStoreLink}
                    onCheckedChange={setIsAppStoreLink}
                  />
                  <Label htmlFor="app-store-link">App Store link</Label>
                </div>
                {isAppStoreLink && (
                  <div className="space-y-2">
                    <Input
                      placeholder="iOS App Store URL"
                      value={appStoreLinks.ios}
                      onChange={(e) => setAppStoreLinks({ ...appStoreLinks, ios: e.target.value })}
                    />
                    <Input
                      placeholder="Android Play Store URL"
                      value={appStoreLinks.android}
                      onChange={(e) => setAppStoreLinks({ ...appStoreLinks, android: e.target.value })}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="custom-logo">Custom QR Code Logo</Label>
                  <Input
                    id="custom-logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCustomLogo(e.target.files ? e.target.files[0] : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="qr-color">QR Code Color</Label>
                  <Input
                    id="qr-color"
                    type="color"
                    value={qrCodeColor}
                    onChange={(e) => setQrCodeColor(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="batch">
              <div className="space-y-4">
                <Label htmlFor="batch-urls">Enter multiple URLs (one per line, optionally followed by a comma and custom slug)</Label>
                <Textarea
                  id="batch-urls"
                  placeholder={`https://example1.com, custom-slug-1
https://example2.com
https://example3.com, my-slug-3`}
                  value={batchUrls}
                  onChange={(e) => setBatchUrls(e.target.value)}
                  rows={5}
                />
                <Button onClick={handleBatchShorten} disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Shorten Batch'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Shortening...' : 'Shorten URL'}
          </Button>
        </form>
      </motion.div>

      {shortenedUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-accent rounded-lg p-4 sm:p-6 mb-8 sm:mb-12 shadow-lg"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Your Shortened URL</h2>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
            <Input value={shortenedUrl} readOnly className="flex-grow" />
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" onClick={handleCopy}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy to clipboard</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button onClick={handleRedirect}>Open Link</Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" onClick={handleDownloadQR}>
                <Download className="h-4 w-4 mr-2" />
                Download QR
              </Button>
            </div>
            {qrCode && <Image src={qrCode} alt="QR Code" width={96} height={96} />}
          </div>
        </motion.div>
      )}

      {batchResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-accent rounded-lg p-4 sm:p-6 mb-8 sm:mb-12 shadow-lg"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Batch Results</h2>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {batchResults.map((result, index) => (
              <div key={index} className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <span className="truncate w-full sm:w-1/3">{result.original}</span>
                <span className="truncate w-full sm:w-1/3">{result.shortened}</span>
                <Button size="sm" onClick={() => navigator.clipboard.writeText(result.shortened)}>
                  Copy
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-8 sm:mb-12"
        id="features"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="feature-card bg-card text-card-foreground rounded-lg p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF00EA] to-[#00FFFF]"></div>
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="mr-3 sm:mr-4 p-2 rounded-full bg-primary/10">
                  <div className="text-primary">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold">{feature.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Comparison Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mb-8 sm:mb-12"
        id="compare"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">How We Compare</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-primary text-primary-foreground">
              <tr>
                <th scope="col" className="px-4 sm:px-6 py-3 rounded-tl-lg">Features</th>
                <th scope="col" className="px-4 sm:px-6 py-3">FlyraLink</th>
                <th scope="col" className="px-4 sm:px-6 py-3">Bitly</th>
                <th scope="col" className="px-4 sm:px-6 py-3">TinyURL</th>
                <th scope="col" className="px-4 sm:px-6 py-3 rounded-tr-lg">Rebrandly</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <motion.tr
                  key={row.feature}
                  className={index % 2 === 0 ? "bg-background" : "bg-muted"}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <th scope="row" className="px-4 sm:px-6 py-4 font-medium">
                    {row.feature}
                  </th>
                  <td className="px-4 sm:px-6 py-4">
                    <ComparisonCell value={row.flyra} />
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <ComparisonCell value={row.bitly} />
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <ComparisonCell value={row.tiny} />
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <ComparisonCell value={row.rebrandly} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-center text-xs sm:text-sm text-muted-foreground">
          FlyraLink offers a comprehensive set of features for free, including self-destructing links, custom QR codes, and more. No sign-up required!
        </p>
      </motion.section>
    </div>
  )
}

function ComparisonCell({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <motion.div
        className="flex items-center justify-start text-start"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <Check className="text-green-500 h-5 w-5 sm:h-6 sm:w-6" />
        <span className="sr-only">Yes</span>
      </motion.div>
    ) : (
      <motion.div
        className="flex items-center justify-start text-start"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <X className="text-red-500 h-5 w-5 sm:h-6 sm:w-6" />
        <span className="sr-only">No</span>
      </motion.div>
    )
  }
  return (
    <motion.div
      className="flex items-center justify-start text-start w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <span className="text-xs sm:text-sm">{value}</span>
    </motion.div>
  )
}
