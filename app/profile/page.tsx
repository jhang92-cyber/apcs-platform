"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/browser"
import { Trophy, Code, Clock, User, LogOut, ArrowLeft } from "lucide-react"

export default function ProfilePage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [supabase])

  async function loadData() {
    const { data: { user: u } } = await supabase.auth.getUser()
    setUser(u)

    if (u) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.id)
        .single()
      setProfile(data)
    }
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Clock size={32} className="mx-auto animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">未登入</h2>
          <p className="text-muted-foreground">請先登入以查看個人頁面</p>
        </div>
      </div>
    )
  }

  const solved = profile?.total_solved || 0
  const submissions = profile?.total_submissions || 0

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => window.history.back()}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={2} />
        </button>
        <h1 className="text-xl font-bold">個人頁面</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
            {user.user_metadata?.user_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {profile?.username || user.user_metadata?.user_name || "使用者"}
            </h2>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-auto p-2 hover:bg-secondary rounded-lg transition-colors text-red-600"
          >
            <LogOut size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg border border-border p-4">
            <Trophy size={24} className="text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{solved}</div>
            <div className="text-xs text-muted-foreground">題目解決</div>
          </div>
          <div className="rounded-lg border border-border p-4">
            <Code size={24} className="text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{submissions}</div>
            <div className="text-xs text-muted-foreground">總提交數</div>
          </div>
          <div className="rounded-lg border border-border p-4">
            <Clock size={24} className="text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {submissions > 0 ? Math.round((solved / submissions) * 100) : 0}%
            </div>
            <div className="text-xs text-muted-foreground">正確率</div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">說明</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• 解題紀錄會自動儲存至您的帳號</li>
          <li>• 模擬考成績會記錄在個人檔案中</li>
          <li>• 若資料庫未設定，部分功能會使用範例資料顯示</li>
        </ul>
      </div>
    </div>
  )
}
