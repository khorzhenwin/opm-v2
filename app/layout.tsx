import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "OPM Payload Converter",
  description: "Convert TSV data to PP Toolkit JSON payload format",
  icons: {
    icon: '/file.svg',
    shortcut: '/file.svg',
    apple: '/file.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
