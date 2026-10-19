import { NextResponse } from "next/server"
import { execFileSync } from "child_process"
import fs from "fs"
import os from "os"
import path from "path"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const submitSchema = z.object({
  problemId: z.string(),
  language: z.enum(["cpp", "java", "python", "c"]),
  code: z.string().min(1, "程式碼不能為空"),
})

export const runtime = "nodejs"

interface TestCaseInput {
  id: string
  input_text: string
  expected_output: string
  is_sample: boolean
  score_weight: number
}

interface JudgeBody {
  problemId: string
  language: "cpp" | "java" | "python" | "c"
  code: string
  testCases: TestCaseInput[]
}

function runJudge(body: JudgeBody) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "apcs-judge-"))
  const results: Array<{
    testCaseId: string
    input: string
    expected: string
    actual: string
    passed: boolean
    timeMs: number
    status: "accepted" | "wrong_answer" | "runtime_error" | "compile_error" | "time_limit_exceeded"
  }> = []
  let compileError: string | undefined

  let totalScore = 0
  let totalWeight = 0
  let maxTimeMs = 0

  for (const tc of body.testCases) {
    totalWeight += tc.score_weight
    let actualOutput = ""
    let timeMs = 0
    let status: "accepted" | "wrong_answer" | "runtime_error" | "compile_error" | "time_limit_exceeded" = "accepted"

    try {
      const start = Date.now()

      if (body.language === "python") {
        const file = path.join(tmpDir, "main.py")
        fs.writeFileSync(file, body.code)
        actualOutput = execFileSync("python", [file], {
          input: tc.input_text,
          encoding: "utf-8",
          timeout: 5000,
          maxBuffer: 10 * 1024 * 1024,
        })
      } else if (body.language === "cpp") {
        const file = path.join(tmpDir, `main_${tc.id}.cpp`)
        const out = path.join(tmpDir, `main_${tc.id}.exe`)
        fs.writeFileSync(file, body.code)
        execFileSync("g++", [file, "-o", out, "-O2", "-std=c++17"], {
          timeout: 10000,
          maxBuffer: 10 * 1024 * 1024,
        })
        actualOutput = execFileSync(out, {
          input: tc.input_text,
          encoding: "utf-8",
          timeout: 5000,
          maxBuffer: 10 * 1024 * 1024,
        })
      } else if (body.language === "c") {
        const file = path.join(tmpDir, `main_${tc.id}.c`)
        const out = path.join(tmpDir, `main_${tc.id}.exe`)
        fs.writeFileSync(file, body.code)
        execFileSync("gcc", [file, "-o", out, "-O2", "-std=c11"], {
          timeout: 10000,
          maxBuffer: 10 * 1024 * 1024,
        })
        actualOutput = execFileSync(out, {
          input: tc.input_text,
          encoding: "utf-8",
          timeout: 5000,
          maxBuffer: 10 * 1024 * 1024,
        })
      } else if (body.language === "java") {
        const file = path.join(tmpDir, `Main_${tc.id}.java`)
        fs.writeFileSync(file, body.code.replace(/public class Main/g, `public class Main_${tc.id}`))
        execFileSync("javac", [file], {
          timeout: 15000,
          maxBuffer: 10 * 1024 * 1024,
        })
        actualOutput = execFileSync("java", ["-cp", tmpDir, `Main_${tc.id}`], {
          input: tc.input_text,
          encoding: "utf-8",
          timeout: 5000,
          maxBuffer: 10 * 1024 * 1024,
        })
      }

      timeMs = Date.now() - start
      maxTimeMs = Math.max(maxTimeMs, timeMs)

      const normalizedActual = actualOutput.trim().replace(/\r\n/g, "\n")
      const normalizedExpected = tc.expected_output.trim().replace(/\r\n/g, "\n")

      if (normalizedActual !== normalizedExpected) {
        status = "wrong_answer"
      }
    } catch (err: any) {
      timeMs = Date.now() - (Date.now() - 0) // placeholder
      maxTimeMs = Math.max(maxTimeMs, timeMs)

      const msg = err.stderr?.toString() || err.message || "評分失敗"
      if (msg.includes("compile") || msg.includes("error") || err.status === 1) {
        status = "compile_error"
        if (!compileError) compileError = msg
      } else if (msg.includes("timed out") || err.killed) {
        status = "time_limit_exceeded"
      } else {
        status = "runtime_error"
      }
      actualOutput = msg
    }

    const passed = status === "accepted"
    if (passed) totalScore += tc.score_weight

    results.push({
      testCaseId: tc.id,
      input: tc.input_text,
      expected: tc.expected_output,
      actual: actualOutput,
      passed,
      timeMs,
      status,
    })
  }

  const score = totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0
  const passedTestCases = results.filter(r => r.passed).length

  return {
    accepted: score === 100,
    score,
    totalTestCases: results.length,
    passedTestCases,
    maxTimeMs,
    results,
    compileError,
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = (await req.json()) as {
      problemId: string
      language: "cpp" | "java" | "python" | "c"
      code: string
    }

    const parsed = submitSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    // 取得題目與測資
    const { data: problem, error: probError } = await supabase
      .from("problems")
      .select("*, test_cases(*)")
      .eq("id", body.problemId)
      .single()

    if (probError || !problem) {
      return NextResponse.json({ error: "題目不存在" }, { status: 404 })
    }

    const testCases: TestCaseInput[] = problem.test_cases || []

    // 執行評分
    const judgeResult = runJudge({
      problemId: body.problemId,
      language: body.language,
      code: body.code,
      testCases,
    })

    // 插入提交紀錄
    const { data: submission, error: subError } = await supabase
      .from("submissions")
      .insert({
        user_id: user?.id,
        problem_id: body.problemId,
        language: body.language,
        code: body.code,
        status: judgeResult.accepted ? "accepted" : "wrong_answer",
        score: judgeResult.score,
        total_test_cases: judgeResult.totalTestCases,
        passed_test_cases: judgeResult.passedTestCases,
        max_time_ms: judgeResult.maxTimeMs,
        error_message: judgeResult.compileError,
      })
      .select()
      .single()

    if (subError) throw subError

    // 如果 AC，更新使用者解題數（只計首次 AC）
    if (user && judgeResult.accepted) {
      const { data: existingAC } = await supabase
        .from("submissions")
        .select("id")
        .eq("user_id", user.id)
        .eq("problem_id", body.problemId)
        .eq("status", "accepted")
        .order("created_at", { ascending: true })

      if (!existingAC || existingAC.length <= 1) {
        await supabase.rpc("increment_solved", { uid: user.id })
      }
    }

    return NextResponse.json({
      submissionId: submission?.id,
      accepted: judgeResult.accepted,
      score: judgeResult.score,
      totalTestCases: judgeResult.totalTestCases,
      passedTestCases: judgeResult.passedTestCases,
      maxTimeMs: judgeResult.maxTimeMs,
      results: judgeResult.results,
      compileError: judgeResult.compileError,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "伺服器錯誤" }, { status: 500 })
  }
}
