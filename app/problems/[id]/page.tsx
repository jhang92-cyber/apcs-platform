"use client"

import { useState, useCallback, useEffect } from "react"
import { useParams } from "next/navigation"
import { CodeEditor } from "@/components/CodeEditor"
import { TestCaseResultItem } from "@/components/TestCaseResult"
import { SubmissionHistory } from "@/components/SubmissionHistory"
import { Play, RefreshCw, Check, X, Clock, Terminal, Code as CodeIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/browser"
import { Problem, TestCase, Submission, JudgeResult } from "@/types/index"

const DEFAULT_CODE: Record<string, string> = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    // 讀取輸入並處理
    
    return 0;
}`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // 讀取輸入並處理
        
    }
}`,
  python: `import sys

def solve():
    # 讀取輸入並處理
    pass

if __name__ == "__main__":
    solve()`,
  c: `#include <stdio.h>

int main() {
    // 讀取輸入並處理
    
    return 0;
}`,
}

export default function ProblemPage() {
  const params = useParams()
  const problemId = params.id as string
  const supabase = createClient()

  const [problem, setProblem] = useState<Problem | null>(null)
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [language, setLanguage] = useState<"cpp" | "java" | "python" | "c">("cpp")
  const [code, setCode] = useState("")
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null)
  const [isJudging, setIsJudging] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])

  // 載入題目
  useEffect(() => {
    loadProblem()
  }, [problemId, supabase])

  async function loadProblem() {
    try {
      const res = await fetch(`/api/problems`)
      const data: any[] = await res.json()
      const p = data.find((item: any) => item.id === problemId)
      if (p) {
        setProblem({
          id: p.id,
          title: p.title,
          description: p.description,
          inputFormat: p.input_format || "",
          outputFormat: p.output_format || "",
          difficulty: p.difficulty,
          category: p.category,
          timeLimit: p.time_limit || 1000,
          memoryLimit: p.memory_limit || 64,
          points: p.points || 100,
          isActive: p.is_active,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        })
        setTestCases(
          (p.test_cases || []).map((tc: any) => ({
            id: tc.id,
            problemId: tc.problem_id,
            inputText: tc.input_text,
            expectedOutput: tc.expected_output,
            isSample: tc.is_sample,
            scoreWeight: tc.score_weight,
            sortOrder: tc.sort_order,
            createdAt: tc.created_at,
          }))
        )
      }
    } catch (e) {
      console.error(e)
    }
  }

  // 載入提交紀錄
  useEffect(() => {
    loadSubmissions()
  }, [supabase])

  async function loadSubmissions() {
    try {
      const res = await fetch("/api/submissions")
      const data: Submission[] = await res.json()
      setSubmissions(data.filter((s) => s.problemId === problemId))
    } catch (e) {
      console.error(e)
    }
  }

  const handleSubmit = async () => {
    if (!code.trim()) return
    setIsJudging(true)
    setJudgeResult(null)

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId,
          language,
          code,
        }),
      })

      const data = await res.json()
      setJudgeResult({
        accepted: data.accepted,
        score: data.score,
        totalTestCases: data.totalTestCases,
        passedTestCases: data.passedTestCases,
        maxTimeMs: data.maxTimeMs,
        results: data.results?.map((r: any) => ({
          testCaseId: r.testCaseId,
          input: r.input,
          expected: r.expected,
          actual: r.actual,
          passed: r.passed,
          timeMs: r.timeMs,
          status: r.status,
        })) || [],
        compileError: data.compileError,
      })

      loadSubmissions()
    } catch (err) {
      console.error(err)
    } finally {
      setIsJudging(false)
    }
  }

  const handleLoadDefault = () => {
    setCode(DEFAULT_CODE[language])
  }

  if (!problem) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="text-center py-20">
          <Clock size={32} className="mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold">載入題目中...</h2>
        </div>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    accepted: "bg-green-100 text-green-800 border-green-200",
    wrong_answer: "bg-orange-100 text-orange-800 border-orange-200",
    runtime_error: "bg-red-100 text-red-800 border-red-200",
    compile_error: "bg-red-100 text-red-800 border-red-200",
    time_limit_exceeded: "bg-yellow-100 text-yellow-800 border-yellow-200",
    pending: "bg-gray-100 text-gray-600 border-gray-200",
    judging: "bg-blue-100 text-blue-800 border-blue-200",
  }

  const statusLabels: Record<string, string> = {
    accepted: "正確答案 (Accepted)",
    wrong_answer: "答案錯誤 (Wrong Answer)",
    runtime_error: "執行錯誤 (Runtime Error)",
    compile_error: "編譯錯誤 (Compile Error)",
    time_limit_exceeded: "超時 (Time Limit Exceeded)",
    pending: "評分中",
    judging: "評分中",
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusColors[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
            <h1 className="mt-2 text-2xl font-bold">{problem.title}</h1>
            <p className="text-muted-foreground">{problem.category} · {problem.points} 分</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isJudging}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isJudging ? (
              <Clock size={16} strokeWidth={2.5} className="animate-spin" />
            ) : (
              <Play size={16} strokeWidth={2.5} />
            )}
            {isJudging ? "評分中..." : "提交評分"}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
              <Terminal size={16} strokeWidth={2} /> 輸入格式
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{problem.inputFormat}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
              <Terminal size={16} strokeWidth={2} /> 輸出格式
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{problem.outputFormat}</p>
          </div>
        </div>

        {/* Sample Test Cases */}
        const sampleCases = testCases.filter((tc) => tc.isSample)
        if (sampleCases.length > 0) {
          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <CodeIcon size={16} strokeWidth={2} /> 範例輸入輸出
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {sampleCases.map((tc) => (
                <div key={tc.id} className="rounded-lg border border-border bg-muted p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-medium text-primary">輸入</span>
                    <span className="text-[10px] text-muted-foreground">測資 #{tc.sortOrder}</span>
                  </div>
                  <pre className="text-xs font-mono mb-2 whitespace-pre-line">{tc.inputText}</pre>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-medium text-primary">預期輸出</span>
                  </div>
                  <pre className="text-xs font-mono text-green-600 whitespace-pre-line">{tc.expectedOutput}</pre>
                </div>
              ))}
            </div>
          </div>
        }
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left: Description */}
        <div className="lg:col-span-7 space-y-6">
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CodeIcon size={20} strokeWidth={2} /> 題目描述
            </h2>
            <div className="text-muted-foreground whitespace-pre-line">{problem.description}</div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock size={20} strokeWidth={2} /> 限制條件
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">時間限制</p>
                <p className="font-medium">{problem.timeLimit} ms</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">記憶體限制</p>
                <p className="font-medium">{problem.memoryLimit} MB</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right: Editor + Results */}
        <div className="lg:col-span-5 space-y-6">
          {/* Editor */}
          <section className="rounded-xl border border-border bg-card p-6 flex flex-col h-[600px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">程式編輯器</h2>
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value as any)
                  setCode(DEFAULT_CODE[e.target.value as keyof typeof DEFAULT_CODE] || "")
                }}
                className="text-sm border rounded-md px-2 py-1.5 bg-background"
              >
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="c">C</option>
              </select>
            </div>
            <CodeEditor language={language} value={code} onChange={setCode} className="flex-1" />
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleLoadDefault}
                className="text-xs text-primary underline underline-offset-4 hover:text-primary/80"
              >
                <RefreshCw size={12} strokeWidth={2} /> 重載範例
              </button>
            </div>
          </section>

          {/* Judge Result */}
          {judgeResult && (
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                {judgeResult.accepted ? (
                  <Check size={18} strokeWidth={2.5} className="text-green-600" />
                ) : (
                  <X size={18} strokeWidth={2.5} className="text-red-600" />
                )}
                評分結果
              </h2>

              <div className={`mb-4 p-3 rounded-lg border ${statusColors[judgeResult.results?.[0]?.status || "pending"]}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {judgeResult.accepted ? "全部通過" : "部分通過 / 未通過"}
                  </span>
                  <span className="text-xl font-bold">
                    {judgeResult.score} 分
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {judgeResult.passedTestCases} / {judgeResult.totalTestCases} 組測資通過 ·
                  最大耗時 {judgeResult.maxTimeMs} ms
                </div>
              </div>

              {judgeResult.compileError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-xs">
                  編譯錯誤：{judgeResult.compileError}
                </div>
              )}

              <div className="space-y-1">
                {judgeResult.results.map((r) => (
                  <TestCaseResultItem key={r.testCaseId} result={r} />
                ))}
              </div>
            </section>
          )}

          {/* History */}
          <SubmissionHistory submissions={submissions} />
        </div>
      </div>
    </div>
  )
}
