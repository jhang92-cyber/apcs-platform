"use client"

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { SessionProvider } from "@/lib/supabase/browser"
import { Navbar } from "@/components/LayoutNavbar"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "APCS 訓練網站",
  description: "APCS 資訊學科學能力檢定線上練習平台",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <html lang="zh-TW">
        <body className={inter.className}>
          <Navbar />
          <main>{children}</main>
        </body>
      </html>
    </SessionProvider>
  )
}
