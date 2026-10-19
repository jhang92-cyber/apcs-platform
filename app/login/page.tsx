"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/browser"
import { Mail, Lock, ArrowRight } from "lucide-react"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("請輸入有效的電子郵件"),
  password: z.string().min(6, "密碼至少需要 6 個字元"),
})

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.errors[0].message)
      setLoading(false)
      return
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="mx-auto mb-8">
          <div className="flex justify-center">
            <div className="h-10 w-10 rounded bg-primary flex items-center justify-center">
              <ArrowRight size={20} strokeWidth={2.5} className="text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-center">歡迎回來</h2>
          <p className="mt-2 text-center text-muted-foreground">
            請登入以儲存您的解題紀錄與參與模擬考
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">電子郵件</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
              <input
                name="email"
                type="email"
                required
                className="w-full pl-9 pr-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">密碼</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
              <input
                name="password"
                type="password"
                required
                className="w-full pl-9 pr-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "登入中..." : "登入"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          還沒有帳號？{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            立即註冊
          </Link>
        </p>
      </div>
    </div>
  )
}
