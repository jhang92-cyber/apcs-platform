"use client"

import React, { useEffect, useRef, useState } from "react"
import Editor from "@monaco-editor/react"

export interface CodeEditorProps {
  language: "cpp" | "java" | "python" | "c"
  value: string
  onChange: (code: string) => void
  height?: string | number
  readOnly?: boolean
}

export function CodeEditor({
  language,
  value,
  onChange,
  height = "500px",
  readOnly = false,
}: CodeEditorProps) {
  const editorRef = useRef<any>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  const handleEditorDidMount = (editor: any, _monaco: any) => {
    editorRef.current = editor
    editor.focus()
    editor.updateOptions({ readOnly })
  }

  const handleValueChange = (value: string | undefined) => {
    if (value !== undefined) onChange(value)
  }

  return (
    <div className="w-full h-full border border-border rounded-lg bg-background shadow-sm">
      <Editor
        height={height}
        language={getMonacoLanguage(language)}
        theme="vs-dark"
        value={value}
        onChange={handleValueChange}
        onMount={handleEditorDidMount}
        options={{
          automaticLayout: true,
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: "on",
          wordWrap: "on",
          tabSize: 4,
          insertSpaces: true,
          scrollBeyondLastLine: false,
          readOnly,
        }}
      />
    </div>
  )
}

function getMonacoLanguage(lang: string) {
  const map: Record<string, string> = {
    cpp: "cpp",
    java: "java",
    python: "python",
    c: "c",
  }
  return map[lang] || "text"
}
