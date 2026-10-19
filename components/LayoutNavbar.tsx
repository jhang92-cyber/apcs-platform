"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/browser"
import { LogIn, LogOut, User, Code, Timer, ShieldAlert } from "lucide-react"

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [supabase])

  if (loading) {
    return (
      <nav className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-muted" />
            <div className="h-5 w-24 rounded bg-muted" />
          </div>
          <div className="flex gap-4">
            <div className="h-6 w-8 rounded bg-muted" />
            <div className="h-6 w-8 rounded bg-muted" />
            <div className="h-6 w-8 rounded bg-muted" />
          </div>
        </div>
      </nav>
    }
  }

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
          <ShieldAlert size={20} strokeWidth={2} />
          <span className="text-xl font-bold tracking-tight">APCS 訓練</span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className={`text-foreground transition-colors ${pathname === "/" ? "text-primary" : ""}`}>
            題目列表
          </Link>
          <Link href="/mock-exam" className={`text-foreground transition-colors ${pathname.startsWith("/mock-exam") ? "text-primary" : ""}`}>
            <Timer size={14} strokeWidth={2} className="mr-1" /> 模擬考
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={() => {
                  supabase.auth.signOut()
                  router.push("/login")
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                <LogOut size={16} strokeWidth={2} />
                登出
              </button>
              <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary hover:bg-secondary/50 rounded-lg transition-colors border border-primary/20">
                <User size={16} strokeWidth={2} />
                {user.user_metadata?.user_name || user.email?.split("@")[0] || "使用者"}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
                登入
              </Link>
              <Link href="/register" className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm">
                註冊
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
