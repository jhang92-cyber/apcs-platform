"use client"

import { useState, useCallback } from "react"
import { CodeEditor } from "@/components/CodeEditor"
import { Play, RefreshCw, Check, X } from "lucide-react"

interface ProblemData {
  id: string
  title: string
  difficulty: string
  category: string
  description: string
  inputFormat: string
  outputFormat: string
  sampleInput: string
  sampleOutput: string
  constraints: string
  timeLimit: number
  memoryLimit: number
}

const defaultProblem: ProblemData = {
  id: "p001",
  title: "A+B 問題",
  difficulty: "入門",
  category: "基礎語法",
  description:
    "讀入兩個整數 A 與 B，輸出它們的和。這是最基礎的輸入輸出練習題。",
  inputFormat: "第一行包含兩個整數 A 與 B，以空格分隔。",
  outputFormat: "輸出 A + B 的結果。",
  sampleInput: "1 2",
  sampleOutput: "3",
  constraints: "-1000 <= A, B <= 1000",
  timeLimit: 1000,
  memoryLimit: 64,
}

export default function ProblemPage() {
  const [problem, setProblem] = useState<ProblemData>(defaultProblem)
  const [language, setLanguage] = useState<"cpp" | "java" | "python" | "c">("cpp")
  const [code, setCode] = useState("")
  const [result, setResult] = useState<{ status: "idle" | "running" | "accepted" | "wrong" | "error"; message: string; time?: number }>({ status: "idle", message: "" })

  const defaultCode: Record<string, string> = {
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    int A, B;
    cin >> A >> B;
    cout << A + B << endl;
    
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int A = sc.nextInt();
        int B = sc.nextInt();
        System.out.println(A + B);
    }
}`,
    python: `import sys

def solve():
    line = sys.stdin.readline()
    if not line:
        return
    A, B = map(int, line.split())
    print(A + B)

if __name__ == "__main__":
    solve()`,
    c: `#include <stdio.h>

int main() {
    int A, B;
    scanf("%d %d", &A, &B);
    printf("%d\n", A + B);
    return 0;
}`,
  }

  const handleSubmit = async () => {
    setResult({ status: "running", message: "評分中..." })

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          language,
          code,
          sampleInput: problem.sampleInput,
          expectedOutput: problem.sampleOutput,
        }),
      })

      const data = await res.json()
      setResult({
        status: data.accepted ? "accepted" : "wrong",
        message: data.accepted ? "正確答案 (Accepted)" : "答案錯誤 (Wrong Answer)",
        time: data.timeMs,
      })
    } catch (err) {
      setResult({ status: "error", message: "評分發生錯誤，請稍後再試" })
    }
  }

  const statusColors: Record<string, string> = {
    idle: "bg-muted text-muted-foreground",
    running: "bg-blue-100 text-blue-800",
    accepted: "bg-green-100 text-green-800",
    wrong: "bg-orange-100 text-orange-800",
    error: "bg-red-100 text-red-800",
  }

  const statusIcons: Record<string, React.ElementType> = {
    idle: RefreshCw,
    running: RefreshCw,
    accepted: Check,
    wrong: X,
    error: X,
  }

  const StatusIcon = statusIcons[result.status]

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
        <div>
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${result.status === "accepted" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
            {problem.difficulty}
          </span>
          <h1 className="mt-2 text-2xl font-bold">{problem.title}</h1>
          <p className="text-muted-foreground">{problem.category}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={result.status === "running"}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            <Play size={16} strokeWidth={2.5} />
            提交評分
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="mb-6 rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <StatusIcon size={16} strokeWidth={2.5} />
          <span className={`font-medium ${statusColors[result.status]}`}>
            {result.message}
          </span>
          {result.time !== undefined && (
            <span className="text-xs text-muted-foreground ml-2">耗時 {result.time} ms</span>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left: Problem Description */}
        <div className="lg:col-span-7 space-y-6">
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <span className="h-5 w-5">📝</span> 題目描述
            </h2>
            <p className="text-muted-foreground whitespace-pre-line">{problem.description}</p>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <span className="h-5 w-5">📥</span> 輸入格式
            </h2>
            <p className="text-muted-foreground whitespace-pre-line">{problem.inputFormat}</p>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <span className="h-5 w-5">📤</span> 輸出格式
            </h2>
            <p className="text-muted-foreground whitespace-pre-line">{problem.outputFormat}</p>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <span className="h-5 w-5">⚡</span> 範例輸入輸出
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-muted p-4">
                <h3 className="text-sm font-medium mb-2">範例輸入</h3>
                <pre className="text-sm font-mono text-foreground overflow-x-auto whitespace-pre">{problem.sampleInput}</pre>
              </div>
              <div className="rounded-lg border border-border bg-muted p-4">
                <h3 className="text-sm font-medium mb-2">範例輸出</h3>
                <pre className="text-sm font-mono text-foreground overflow-x-auto whitespace-pre">{problem.sampleOutput}</pre>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <span className="h-5 w-5">📏</span> 限制條件
            </h2>
            <p className="text-muted-foreground whitespace-pre-line">{problem.constraints}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              時間限制：{problem.timeLimit} ms｜記憶體限制：{problem.memoryLimit} MB
            </p>
          </section>
        </div>

        {/* Right: Editor */}
        <div className="lg:col-span-5 space-y-6">
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">程式編輯器</h2>
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value as any)
                  setCode(defaultCode[e.target.value as keyof typeof defaultCode] || "")
                }}
                className="text-sm border rounded-md px-2 py-1.5 bg-background"
              >
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="c">C</option>
              </select>
            </div>
            <CodeEditor language={language} value={code} onChange={setCode} />
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">預設程式碼</h2>
            <p className="text-sm text-muted-foreground mb-3">
              選擇不同語言會自動載入對應的範例程式碼。
            </p>
            <button
              onClick={() => setCode(defaultCode[language])}
              className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
            >
            <RefreshCw size={14} strokeWidth={2} /> 重載預設程式碼
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}
