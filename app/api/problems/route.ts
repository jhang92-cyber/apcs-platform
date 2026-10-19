import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()

    const { data: problems, error } = await supabase
      .from("problems")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true })

    if (error) throw error

    // 若資料庫為空，回傳範例資料（讓沒設定 Supabase 的人也能預覽頁面）
    if (!problems || problems.length === 0) {
      return NextResponse.json([
        {
          id: "p001",
          title: "A+B 問題",
          description: "讀入兩個整數 A 與 B，輸出它們的和。",
          input_format: "第一行包含兩個整數 A 與 B，以空格分隔。",
          output_format: "輸出 A + B 的結果。",
          difficulty: "入門",
          category: "基礎語法",
          time_limit: 1000,
          memory_limit: 64,
          points: 100,
          test_cases: [
            { id: "tc1", input_text: "1 2", expected_output: "3", is_sample: true, score_weight: 100 },
          ],
        },
        {
          id: "p002",
          title: "最大公因數",
          description: "讀入兩個正整數 A、B，輸出它們的最大公因數 (GCD)。",
          input_format: "第一行包含兩個正整數 A 與 B。",
          output_format: "輸出 A 與 B 的最大公因數。",
          difficulty: "基礎",
          category: "數學與遞迴",
          time_limit: 1000,
          memory_limit: 64,
          points: 150,
          test_cases: [
            { id: "tc1", input_text: "12 8", expected_output: "4", is_sample: true, score_weight: 100 },
          ],
        },
      ])
    }

    // 載入每個題目的測資
    const problemsWithCases = await Promise.all(
      problems.map(async (p) => {
        const { data: testCases } = await supabase
          .from("test_cases")
          .select("*")
          .eq("problem_id", p.id)
          .order("sort_order", { ascending: true })

        return {
          ...p,
          inputFormat: p.input_format,
          outputFormat: p.output_format,
          testCases: testCases || [],
        }
      })
    )

    return NextResponse.json(problemsWithCases)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
