"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ServerStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "disconnected">("checking")
  const [retryCount, setRetryCount] = useState(0)

  const checkServer = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        setStatus("disconnected");
      }, 5000);
      
      // Use the debug endpoint for better diagnostics
      const response = await fetch("/api/debug", {
        method: "GET",
        signal: controller.signal,
        // Add cache busting to prevent cached responses
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        // If we get a successful response, check the actual data
        const data = await response.json();
        setStatus(data.status === 'ok' ? "connected" : "disconnected");
      } else {
        setStatus("disconnected");
      }
    } catch (error) {
      console.error("Server connection error:", error);
      setStatus("disconnected");
    }
  }

  useEffect(() => {
    checkServer()
    const interval = setInterval(checkServer, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [retryCount])

  if (status === "connected") {
    return null // Don't show anything when connected
  }

  return (
    <Card
      className={`mb-4 ${status === "disconnected" ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          {status === "checking" ? (
            <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <div className="flex-1">
            <p className={`font-medium ${status === "checking" ? "text-yellow-800" : "text-red-800"}`}>
              {status === "checking" ? "Checking server connection..." : "Server not connected"}
            </p>
            {status === "disconnected" && (
              <div className="space-y-2">
                <p className="text-sm text-red-700">
                  Please check your internet connection or try again later.
                </p>
                <a 
                  href="/debug" 
                  className="text-sm text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
                >
                  <span>View Diagnostics</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" x2="21" y1="14" y2="3" />
                  </svg>
                </a>
              </div>
            )}
          </div>
          {status === "disconnected" && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                setStatus("checking");
                setRetryCount(prev => prev + 1);
                checkServer();
              }}
              className="ml-auto"
            >
              Retry
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
