import { TestCaseResult } from "@/types/index"
import { CheckCircle2, X, AlertCircle, Clock } from "lucide-react"

export function TestCaseResultItem({ result }: { result: TestCaseResult }) {
  const statusIcons: Record<string, React.ElementType> = {
    accepted: CheckCircle2,
    wrong_answer: X,
    runtime_error: AlertCircle,
    compile_error: AlertCircle,
    time_limit_exceeded: Clock,
    pending: Clock,
  }

  const statusColors: Record<string, string> = {
    accepted: "bg-green-100 text-green-800 border-green-200",
    wrong_answer: "bg-orange-100 text-orange-800 border-orange-200",
    runtime_error: "bg-red-100 text-red-800 border-red-200",
    compile_error: "bg-red-100 text-red-800 border-red-200",
    time_limit_exceeded: "bg-yellow-100 text-yellow-800 border-yellow-200",
    pending: "bg-gray-100 text-gray-600 border-gray-200",
  }

  const StatusIcon = statusIcons[result.status] || Clock

  return (
    <div className={`border rounded-lg p-3 mb-2 ${statusColors[result.status] || statusColors.pending}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium flex items-center gap-1">
          <StatusIcon size={10} strokeWidth={2} />
          {result.passed ? "通過" : "失敗"}
        </span>
        <span className="text-xs text-muted-foreground">{result.timeMs} ms</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-muted/50 p-2 rounded">
          <div className="text-[10px] text-muted-foreground mb-1">輸入</div>
          <pre className="text-[10px] font-mono break-all">{result.input}</pre>
        </div>
        <div className="bg-muted/50 p-2 rounded">
          <div className="text-[10px] text-muted-foreground mb-1">預期輸出</div>
          <pre className="text-[10px] font-mono break-all">{result.expected}</pre>
        </div>
      </div>
      {!result.passed && (
        <div className="bg-muted/50 p-2 rounded mt-2">
          <div className="text-[10px] text-muted-foreground mb-1">實際輸出</div>
          <pre className="text-[10px] font-mono break-all text-orange-600">{result.actual}</pre>
        </div>
      )}
    </div>
  )
}
