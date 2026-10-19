"use client"

import { useEffect, useState, useCallback } from "react"
import { Clock, Pause, Play } from "lucide-react"

export interface MockExamTimerProps {
  durationMinutes: number
  onTimeUp: () => void
  initialTimeLeft?: number // 秒，用於繼續上次的考試
}

export function MockExamTimer({ durationMinutes, onTimeUp, initialTimeLeft }: MockExamTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft ?? durationMinutes * 60)
  const [isRunning, setIsRunning] = useState(true)
  const [hasExpired, setHasExpired] = useState(false)

  useEffect(() => {
    if (!isRunning || hasExpired || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setHasExpired(true)
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, hasExpired, timeLeft, onTimeUp])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return [h, m, s]
      .map((v) => v.toString().padStart(2, "0"))
      .join(":")
  }

  const togglePause = useCallback(() => {
    setIsRunning((prev) => !prev)
  }, [])

  const progress = ((durationMinutes * 60 - timeLeft) / (durationMinutes * 60)) * 100

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={18} strokeWidth={2} className="text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">剩餘時間</span>
        </div>
        <button
          onClick={togglePause}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
          title={isRunning ? "暫停" : "繼續"}
        >
          {isRunning ? <Pause size={16} strokeWidth={2.5} /> : <Play size={16} strokeWidth={2.5} />}
        </button>
      </div>

      <div className="text-5xl font-mono font-bold tabular-nums mb-1">
        {formatTime(timeLeft)}
      </div>

      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={`h-full bg-primary transition-all duration-1000`}
          style={{ width: hasExpired ? 100 : Math.min(progress, 100) }}
        />
      </div>

      {hasExpired && (
        <div className="mt-3 text-center text-sm font-medium text-red-600">
          考試時間已到
        </div>
      )}
    </div>
  )
}
