import Link from "next/link"
import { ProblemCard } from "@/components/ProblemCard"
import { createClient } from "@/lib/supabase/browser"
import { useEffect, useState } from "react"
import { Trophy, Code, User } from "lucide-react"

export interface Problem {
  id: string
  title: string
  difficulty: string
  category: string
  acceptedRate: number
  description: string
  points: number
}

const MOCK_PROBLEMS: Problem[] = [
  {
    id: "p001",
    title: "A+B 問題",
    difficulty: "入門",
    category: "基礎語法",
    acceptedRate: 98.5,
    description: "讀入兩個整數 A 與 B，輸出它們的和。",
    points: 100,
  },
  {
    id: "p002",
    title: "最大公因數",
    difficulty: "基礎",
    category: "數學與遞迴",
    acceptedRate: 85.2,
    description: "讀入兩個正整數 A、B，輸出它們的最大公因數 (GCD)。",
    points: 150,
  },
  {
    id: "p003",
    title: "費波那契數列",
    difficulty: "基礎",
    category: "動態規劃",
    acceptedRate: 72.1,
    description: "讀入整數 n，輸出第 n 項費波那契數。",
    points: 150,
  },
  {
    id: "p004",
    title: "二分搜尋",
    difficulty: "進階",
    category: "搜尋與二分法",
    acceptedRate: 58.4,
    description: "在有序陣列中查找目標值的索引，找不到則輸出 -1。",
    points: 200,
  },
  {
    id: "p005",
    title: "最大子陣列和",
    difficulty: "進階",
    category: "動態規劃",
    acceptedRate: 45.6,
    description: "給定一個整數陣列，找出連續子陣列的最大和。",
    points: 200,
  },
]

export default function HomePage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [supabase])

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        setProfile(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const solvedCount = profile?.total_solved || 0
  const submissionCount = profile?.total_submissions || 0

  return (
    <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Hero / Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">APCS 訓練網站</h1>
          <p className="mt-2 text-muted-foreground">
            練習 APCS 程式設計題目，線上提交程式碼並即時評分。
          </p>
        </div>

        <div className="flex gap-4">
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col items-center gap-1">
            <Trophy size={24} className="text-primary" />
            <div className="text-2xl font-bold">{solvedCount}</div>
            <div className="text-xs text-muted-foreground">題目解決</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col items-center gap-1">
            <Code size={24} className="text-primary" />
            <div className="text-2xl font-bold">{submissionCount}</div>
            <div className="text-xs text-muted-foreground">總提交數</div>
          </div>
        </div>
      </div>

      {/* Login prompt */}
      {!profile && (
        <div className="mb-8 rounded-lg border border-border bg-secondary/50 p-4 flex items-center gap-3">
          <User size={18} strokeWidth={2} />
          <span className="text-sm">還沒有帳號嗎？</span>
          <a href="/register" className="text-sm text-primary underline">免費註冊</a>
          <span className="text-xs text-muted-foreground">以儲存解題紀錄與參與模擬考</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {MOCK_PROBLEMS.map((p) => (
          <ProblemCard key={p.id} problem={p} />
        ))}
      </div>

      <div className="mt-12 text-center text-muted-foreground text-sm">
        資料來源為範例題目。請至 Supabase 後台設定真實題庫與測資。
      </div>
    </main>
  )
}
