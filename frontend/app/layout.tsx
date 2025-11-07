import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "skill swap - Find Your Perfect Study Partner",
  description: "Connect with peers, collaborate on projects, and achieve academic excellence together",
  generator: "v0.app",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  let backendOrigin: string | null = null
  try {
    if (apiUrl) backendOrigin = new URL(apiUrl).origin
  } catch {}
  if (!backendOrigin && process.env.BACKEND_URL) {
    backendOrigin = process.env.BACKEND_URL
  }

  return (
    <html lang="en">
      <head>
        {backendOrigin ? (
          <>
            <link rel="preconnect" href={backendOrigin} />
            <link rel="dns-prefetch" href={backendOrigin} />
          </>
        ) : null}
      </head>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
