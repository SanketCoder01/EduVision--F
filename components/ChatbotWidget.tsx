"use client"

import { useEffect, useState } from "react"
import { Bot } from "lucide-react"

export default function ChatbotWidget() {
  const [isLoaded, setIsLoaded] = useState(false)

  // Detect pre-existing script (e.g., hot reload)
  useEffect(() => {
    const existing = document.getElementById("yourgpt-chatbot") as HTMLScriptElement | null
    if (existing) {
      // If script exists but didn't mark loaded earlier (hot reload), mark it and try open
      setIsLoaded(true)
      setTimeout(() => tryOpen(), 300)
    }
  }, [])

  const tryOpen = () => {
    try {
      const YGC: any = (window as any).YGC || (window as any).YourGPT || (window as any).yourgpt
      if (YGC && typeof YGC.open === "function") {
        YGC.open()
        return true
      }
    } catch {}
    return false
  }

  const loadChatbot = () => {
    // If already loaded, try to open
    if (isLoaded) {
      if (!tryOpen()) {
        // Fallback: wait a bit in case it’s still initializing
        setTimeout(() => tryOpen(), 500)
      }
      return
    }

    // Set widget ID before loading script
    ;(window as any).YGC_WIDGET_ID = "9a13a34d-9f76-409b-b3e5-80f411e891e8"
    // Attempt to hide default launcher if the widget supports config flags
    ;(window as any).YGC_HIDE_LAUNCHER = true

    const script = (document.getElementById("yourgpt-chatbot") as HTMLScriptElement) || document.createElement("script")
    script.src = "https://widget.yourgpt.ai/script.js"
    script.id = "yourgpt-chatbot"
    script.async = true
    script.onload = () => {
      setIsLoaded(true)
      // Give the widget a moment to mount, then attempt to open
      setTimeout(() => tryOpen(), 300)
    }
    if (!script.parentElement) document.body.appendChild(script)

    // Inject CSS to hide any default launcher/button the script might render
    const styleId = "yourgpt-hide-launcher-style"
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style")
      style.id = styleId
      style.innerHTML = `
        /* Best-effort selectors to hide default launchers */
        #ygc-launcher, .ygc-launcher, [class*="ygc-launcher"], [id*="ygc-launcher"],
        [data-ygc-launcher], [data-yourgpt-launcher] { display: none !important; opacity: 0 !important; pointer-events: none !important; }
      `
      document.head.appendChild(style)
    }
  }

  return (
    <div className="fixed right-4 md:right-6 z-[9999]" style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
      <button
        onClick={loadChatbot}
        className="h-14 w-14 rounded-full bg-white hover:bg-gray-50 text-blue-600 shadow-xl border border-gray-200 flex items-center justify-center transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label="Open Chatbot"
      >
        <Bot className="h-7 w-7" />
      </button>
    </div>
  )
}
