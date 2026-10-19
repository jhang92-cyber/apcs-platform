import { Submission } from "@/types/index"
import { Clock, CheckCircle2, X } from "lucide-react"

export function SubmissionHistory({ submissions }: { submissions: Submission[] }) {
  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock size={32} className="mx-auto mb-2 opacity-50" />
        <p>尚無提交紀錄</p>
      </div>
    )
  }

  const statusLabels: Record<string, string> = {
    accepted: "正確答案",
    wrong_answer: "答案錯誤",
    runtime_error: "執行錯誤",
    compile_error: "編譯錯誤",
    time_limit_exceeded: "超時",
    pending: "評分中",
    judging: "評分中",
  }

  const statusColors: Record<string, string> = {
    accepted: "bg-green-100 text-green-800",
    wrong_answer: "bg-orange-100 text-orange-800",
    runtime_error: "bg-red-100 text-red-800",
    compile_error: "bg-red-100 text-red-800",
    time_limit_exceeded: "bg-yellow-100 text-yellow-800",
    pending: "bg-gray-100 text-gray-600",
    judging: "bg-blue-100 text-blue-800",
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold mb-3">提交紀錄</h3>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-3 py-2 text-muted-foreground">時間</th>
              <th className="px-3 py-2 text-muted-foreground">語言</th>
              <th className="px-3 py-2 text-muted-foreground">狀態</th>
              <th className="px-3 py-2 text-muted-foreground">分數</th>
              <th className="px-3 py-2 text-muted-foreground text-right">耗時</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {submissions.map((s) => (
              <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2 text-muted-foreground">
                  {new Date(s.createdAt).toLocaleString("zh-TW", {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-3 py-2">
                  {s.language === "cpp" ? "C++" : s.language === "java" ? "Java" : s.language === "python" ? "Python" : "C"}
                </td>
                <td className="px-3 py-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusColors[s.status]}`}>
                    {statusLabels[s.status]}
                  </span>
                </td>
                <td className="px-3 py-2 font-medium">
                  {s.score} / 100
                </td>
                <td className="px-3 py-2 text-muted-foreground text-right">
                  {s.maxTimeMs} ms
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
