import Link from "next/link"
import { Problem } from "@/types/index"
import { Clock, CheckCircle2, GraduationCap } from "lucide-react"

export function ProblemCard({ problem }: { problem: Problem }) {
  const difficultyColors: Record<string, string> = {
    入門: "bg-green-100 text-green-800",
    基礎: "bg-blue-100 text-blue-800",
    進階: "bg-orange-100 text-orange-800",
    挑戰: "bg-red-100 text-red-800",
  }

  return (
    <Link href={`/problems/${problem.id}`} className="group block">
      <div className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded ${difficultyColors[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
          <div className="flex items-center gap-1">
            <GraduationCap className="text-xs text-muted-foreground h-3 w-3" />
            <span className="text-xs text-muted-foreground">{problem.points} 分</span>
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
          {problem.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{problem.description}</p>
        <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
          <span className="text-muted-foreground">{problem.category}</span>
          <span className="text-primary font-medium">開始作答 →</span>
        </div>
      </div>
    </Link>
  )
}
