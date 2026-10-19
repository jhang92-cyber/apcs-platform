"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/browser"
import { Mail, Lock, User, ArrowRight } from "lucide-react"
import { z } from "zod"

const registerSchema = z.object({
  username: z.string().min(2, "使用者名稱至少需要 2 個字元").max(20),
  email: z.string().email("請輸入有效的電子郵件"),
  password: z.string().min(6, "密碼至少需要 6 個字元"),
})

export default function RegisterPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const parsed = registerSchema.safeParse({ username, email, password })
    if (!parsed.success) {
      setError(parsed.error.errors[0].message)
      setLoading(false)
      return
    }

    const { error: authError, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_name: username,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // 建立 profile
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        username,
        full_name: username,
      })
      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }
    }

    router.push("/login")
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="mx-auto mb-8">
          <div className="flex justify-center">
            <div className="h-10 w-10 rounded bg-primary flex items-center justify-center">
              <User size={20} strokeWidth={2.5} className="text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-center">建立帳號</h2>
          <p className="mt-2 text-center text-muted-foreground">
            開始您的 APCS 訓練之旅，儲存解題紀錄與參與模擬考
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">使用者名稱</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
              <input
                name="username"
                type="text"
                required
                maxLength={20}
                className="w-full pl-9 pr-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="apcs_learner"
              />
            </div>
          </div>

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
                minLength={6}
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
            {loading ? "註冊中..." : "建立帳號"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          已經有帳號了嗎？{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            登入
          </Link>
        </p>
      </div>
    </div>
  )
}
