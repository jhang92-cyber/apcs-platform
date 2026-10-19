"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/browser"
import { MockExamTimer } from "@/components/MockExamTimer"
import { CodeEditor } from "@/components/CodeEditor"
import { Check, X, Clock, User, Save } from "lucide-react"
import { Problem, TestCase, Submission } from "@/types/index"

export default function MockExamPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [exams, setExams] = useState<any[]>([])
  const [selectedExam, setSelectedExam] = useState<any>(null)
  const [examProblems, setExamProblems] = useState<any[]>([])
  const [phase, setPhase] = useState<"select" | "exam" | "result">("select")
  const [timeLeft, setTimeLeft] = useState(0)
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, { code: string; language: string }>>({})
  const [languages, setLanguages] = useState<Record<string, "cpp" | "java" | "python" | "c">>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [examStartTime, setExamStartTime] = useState<number>(0)

  useEffect(() => {
    loadUser()
    loadExams()
  }, [supabase])

  async function loadUser() {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  async function loadExams() {
    try {
      const res = await fetch("https://example.com/api/mock-exams") // placeholder
      // 實際應從 Supabase 讀取，這裡用範例數據
      setExams([
        {
          id: "mock1",
          title: "APCS 模擬考 #1",
          description: "5 題，180 分鐘，涵蓋基礎語法、數學、動態規劃",
          durationMinutes: 180,
          problemCount: 5,
        },
      ])
    } catch (e) {
      console.error(e)
    }
  }

  // 範例題目（沒有 Supabase 時使用）
  const MOCK_PROBLEMS: Problem[] = [
    {
      id: "p001",
      title: "A+B 問題",
      description: "讀入兩個整數 A 與 B，輸出它們的和。",
      inputFormat: "第一行包含兩個整數 A 與 B，以空格分隔。",
      outputFormat: "輸出 A + B 的結果。",
      difficulty: "入門",
      category: "基礎語法",
      timeLimit: 1000,
      memoryLimit: 64,
      points: 100,
      isActive: true,
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "p002",
      title: "最大公因數",
      description: "讀入兩個正整數 A、B，輸出它們的最大公因數 (GCD)。",
      inputFormat: "第一行包含兩個正整數 A 與 B。",
      outputFormat: "輸出 A 與 B 的最大公因數。",
      difficulty: "基礎",
      category: "數學與遞迴",
      timeLimit: 1000,
      memoryLimit: 64,
      points: 150,
      isActive: true,
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "p003",
      title: "費波那契數列",
      description: "讀入整數 n，輸出第 n 項費波那契數 (F(0)=0, F(1)=1)。",
      inputFormat: "第一行包含一個整數 n。",
      outputFormat: "輸出第 n 項費波那契數。",
      difficulty: "基礎",
      category: "動態規劃",
      timeLimit: 1000,
      memoryLimit: 64,
      points: 150,
      isActive: true,
      createdAt: "",
      updatedAt: "",
    },
  ]

  const MOCK_TEST_CASES: Record<string, TestCase[]> = {
    p001: [
      { id: "tc1", problemId: "p001", inputText: "1 2", expectedOutput: "3", isSample: true, scoreWeight: 50, sortOrder: 1, createdAt: "" },
      { id: "tc2", problemId: "p001", inputText: "10 20", expectedOutput: "30", isSample: false, scoreWeight: 50, sortOrder: 2, createdAt: "" },
    ],
    p002: [
      { id: "tc1", problemId: "p002", inputText: "12 8", expectedOutput: "4", isSample: true, scoreWeight: 100, sortOrder: 1, createdAt: "" },
      { id: "tc2", problemId: "p002", inputText: "100 25", expectedOutput: "25", isSample: false, scoreWeight: 100, sortOrder: 2, createdAt: "" },
    ],
    p003: [
      { id: "tc1", problemId: "p003", inputText: "0", expectedOutput: "0", isSample: true, scoreWeight: 50, sortOrder: 1, createdAt: "" },
      { id: "tc2", problemId: "p003", inputText: "10", expectedOutput: "55", isSample: false, scoreWeight: 50, sortOrder: 2, createdAt: "" },
    ],
  }

  const startExam = useCallback((exam: any) => {
    setSelectedExam(exam)
    setTimeLeft(exam.durationMinutes * 60)
    setExamStartTime(Date.now())
    setPhase("exam")
    setCurrentProblemIndex(0)
    setAnswers({})
    setLanguages({})
    setResults([])
  }, [])

  const currentProblem = examProblems[currentProblemIndex] || MOCK_PROBLEMS[currentProblemIndex]
  const currentTestCases = currentProblem ? MOCK_TEST_CASES[currentProblem.id] : []
  const currentAnswer = answers[currentProblem?.id || ""]
  const currentLang = languages[currentProblem?.id || ""] || "cpp"

  if (phase === "select") {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">模擬考</h1>
        <p className="text-muted-foreground mb-8">
          選擇一場模擬考開始。考試期間將計時，無法暫停過久，請確保時間充足。
        </p>

        <div className="space-y-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              onClick={() => startExam(exam)}
              className="cursor-pointer rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold">{exam.title}</h2>
                <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                  {exam.durationMinutes} 分鐘
                </span>
              </div>
              <p className="text-muted-foreground mb-4">{exam.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User size={14} strokeWidth={2} />
                <span>{exam.problemCount} 題</span>
              </div>
            </div>
          ))}
        </div>

        {!user && (
          <div className="mt-8 rounded-lg border border-border bg-secondary/50 p-4 flex items-center gap-3">
            <Clock size={16} strokeWidth={2} />
            <span className="text-sm">請先登入才能開始模擬考，您的成績會被儲存</span>
          </div>
        )}
      </div>
    )
  }

  if (phase === "exam") {
    const hasExpired = timeLeft <= 0
    const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60)
      const s = seconds % 60
      return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    }

    const progress = currentProblemIndex / (examProblems.length || MOCK_PROBLEMS.length)

    return (
      <div className="max-w-6xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">{selectedExam?.title}</h1>
            <p className="text-sm text-muted-foreground">
              第 {currentProblemIndex + 1} / {examProblems.length || MOCK_PROBLEMS.length} 題
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium px-2 py-1 rounded ${hasExpired ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
              {hasExpired ? "時間到" : formatTime(timeLeft)}
            </span>
            <button
              onClick={() => setPhase("result")}
              disabled={!hasExpired && currentProblemIndex < (examProblems.length || MOCK_PROBLEMS.length) - 1}
              className="px-4 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              結束考試
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full bg-muted rounded-full h-2 mb-6 overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: progress * 100 }} />
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Problem description */}
          <div className="lg:col-span-7 space-y-6">
            {currentProblem && (
              <>
                <section className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <User size={18} strokeWidth={2} /> {currentProblem.title}
                  </h2>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${statusColors[currentProblem.difficulty]}`}>
                    {currentProblem.difficulty} · {currentProblem.points} 分
                  </span>
                  <div className="mt-3 text-muted-foreground whitespace-pre-line">
                    {currentProblem.description}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">輸入格式</p>
                      <p className="font-mono text-xs whitespace-pre-line">{currentProblem.inputFormat}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">輸出格式</p>
                      <p className="font-mono text-xs whitespace-pre-line">{currentProblem.outputFormat}</p>
                    </div>
                  </div>
                </section>

                {/* Sample */}
                {currentTestCases.filter((tc) => tc.isSample).length > 0 && (
                  <section className="rounded-xl border border-border bg-card p-6">
                    <h2 className="text-sm font-semibold text-muted-foreground mb-3">範例</h2>
                    <div className="grid gap-3">
                      {currentTestCases.filter((tc) => tc.isSample).map((tc) => (
                        <div key={tc.id} className="bg-muted p-3 rounded">
                          <div className="flex justify-between mb-1 text-[10px]">
                            <span className="text-primary">輸入</span>
                            <span className="text-muted-foreground">輸出</span>
                          </div>
                          <div className="flex gap-2">
                            <pre className="flex-1 text-xs font-mono whitespace-pre-line">{tc.inputText}</pre>
                            <pre className="flex-1 text-xs font-mono text-green-600 whitespace-pre-line">{tc.expectedOutput}</pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>

          {/* Editor */}
          <div className="lg:col-span-5 space-y-6">
            <section className="rounded-xl border border-border bg-card p-6 flex flex-col h-[calc(100vh-200px)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">作答</h2>
                <select
                  value={currentLang}
                  onChange={(e) => {
                    const lang = e.target.value as "cpp" | "java" | "python" | "c"
                    setLanguages({ ...languages, [currentProblem!.id]: lang })
                    if (!answers[currentProblem!.id]) {
                      setAnswers({ ...answers, [currentProblem!.id]: { code: "", language: lang } })
                    } else {
                      setAnswers({
                        ...answers,
                        [currentProblem!.id]: { ...answers[currentProblem!.id], language: lang },
                      })
                    }
                  }}
                  className="text-sm border rounded-md px-2 py-1.5 bg-background"
                >
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="c">C</option>
                </select>
              </div>
              <CodeEditor
                language={currentLang}
                value={currentAnswer?.code || ""}
                onChange={(val) => {
                  setAnswers({
                    ...answers,
                    [currentProblem!.id]: { code: val, language: currentLang },
                  })
                }}
                className="flex-1"
              />
              <div className="mt-3 text-xs text-muted-foreground">
                作答會自動儲存，結束考試後統一評分
              </div>
            </section>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => setCurrentProblemIndex((p) => Math.max(0, p - 1))}
            disabled={currentProblemIndex === 0}
            className="px-5 py-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            上一題
          </button>
          <button
            onClick={() => {
              if (currentProblemIndex < (examProblems.length || MOCK_PROBLEMS.length) - 1) {
                setCurrentProblemIndex((p) => p + 1)
              }
            }}
            className="px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {currentProblemIndex === (examProblems.length || MOCK_PROBLEMS.length) - 1 ? "全部作答完成" : "下一題"}
          </button>
        </div>
      </div>
    )
  }

  if (phase === "result") {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">考試結果</h1>
        <div className="rounded-xl border border-border bg-card p-8 text-center mb-8">
          <Check size={48} className="mx-auto mb-4 text-green-500" />
          <h2 className="text-3xl font-bold">考試已結束</h2>
          <p className="text-muted-foreground">感謝參與 {selectedExam?.title}</p>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">此為 MVP 版本，詳細評分結果請至各題目頁面查看您的提交紀錄。</p>
          <button
            onClick={() => {
              setPhase("select")
              setSelectedExam(null)
            }}
            className="px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            返回模擬考選單
          </button>
        </div>
      </div>
    )
  }

  return null
}

function statusColors(difficulty: string) {
  const colors: Record<string, string> = {
    入門: "bg-green-100 text-green-800",
    基礎: "bg-blue-100 text-blue-800",
    進階: "bg-orange-100 text-orange-800",
    挑戰: "bg-red-100 text-red-800",
  }
  return colors[difficulty] || colors.基礎
}
