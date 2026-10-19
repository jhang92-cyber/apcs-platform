export type Difficulty = "入門" | "基礎" | "進階" | "挑戰";
export type Language = "cpp" | "java" | "python" | "c";
export type SubmissionStatus =
  | "pending"
  | "judging"
  | "accepted"
  | "wrong_answer"
  | "runtime_error"
  | "compile_error"
  | "time_limit_exceeded";

export interface Problem {
  id: string;
  title: string;
  description: string;
  inputFormat?: string;
  outputFormat?: string;
  difficulty: Difficulty;
  category: string;
  timeLimit: number;
  memoryLimit: number;
  points: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestCase {
  id: string;
  problemId: string;
  inputText: string;
  expectedOutput: string;
  isSample: boolean;
  scoreWeight: number;
  sortOrder: number;
  createdAt: string;
}

export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  language: Language;
  code: string;
  status: SubmissionStatus;
  score: number;
  totalTestCases: number;
  passedTestCases: number;
  maxTimeMs: number;
  maxMemoryKb: number;
  errorMessage?: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  totalSolved: number;
  totalSubmissions: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockExam {
  id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  startAt: string;
  endAt: string;
  isPublic: boolean;
  createdAt: string;
}

export interface MockExamProblem {
  id: string;
  mockExamId: string;
  problemId: string;
  sortOrder: number;
  points: number;
}

export interface MockExamSubmission {
  id: string;
  mockExamId: string;
  userId: string;
  problemId: string;
  language?: Language;
  code?: string;
  score: number;
  submittedAt: string;
}

export interface TestCaseResult {
  testCaseId: string;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  timeMs: number;
  status: SubmissionStatus;
}

export interface JudgeResult {
  accepted: boolean;
  score: number;
  totalTestCases: number;
  passedTestCases: number;
  maxTimeMs: number;
  results: TestCaseResult[];
  compileError?: string;
}
