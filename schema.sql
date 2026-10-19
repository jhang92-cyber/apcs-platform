-- APCS 訓練網站資料庫結構
-- 在 Supabase SQL Editor 中執行

-- 啟用 UUID 擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 使用者個人資料
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  total_solved INTEGER DEFAULT 0,
  total_submissions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 題目資料庫
CREATE TABLE problems (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  input_format TEXT,
  output_format TEXT,
  difficulty TEXT CHECK (difficulty IN ('入門','基礎','進階','挑戰')) DEFAULT '基礎',
  category TEXT,
  time_limit INTEGER DEFAULT 1000, -- ms
  memory_limit INTEGER DEFAULT 64, -- MB
  points INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 測試資料（多組測資）
CREATE TABLE test_cases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE NOT NULL,
  input_text TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_sample BOOLEAN DEFAULT FALSE, -- 是否為對外顯示的範例
  score_weight INTEGER DEFAULT 100, -- 該組測資佔分數比例
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 提交紀錄
CREATE TABLE submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  problem_id UUID REFERENCES problems(id) NOT NULL,
  language TEXT CHECK (language IN ('cpp','java','python','c')) NOT NULL,
  code TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending','judging','accepted','wrong_answer','runtime_error','compile_error','time_limit_exceeded')) DEFAULT 'pending',
  score INTEGER DEFAULT 0, -- 0-100
  total_test_cases INTEGER DEFAULT 0,
  passed_test_cases INTEGER DEFAULT 0,
  max_time_ms INTEGER DEFAULT 0,
  max_memory_kb INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 模擬考場次
CREATE TABLE mock_exams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 180, -- 考試時間
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 模擬考題目關聯
CREATE TABLE mock_exam_problems (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mock_exam_id UUID REFERENCES mock_exams(id) ON DELETE CASCADE NOT NULL,
  problem_id UUID REFERENCES problems(id) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  points INTEGER DEFAULT 100
);

-- 模擬考作答紀錄
CREATE TABLE mock_exam_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mock_exam_id UUID REFERENCES mock_exams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  problem_id UUID REFERENCES problems(id) NOT NULL,
  language TEXT,
  code TEXT,
  score INTEGER DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX idx_test_cases_problem_id ON test_cases(problem_id);
CREATE INDEX idx_mock_exam_submissions_user ON mock_exam_submissions(user_id, mock_exam_id);

-- 啟用 RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_exam_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_exam_submissions ENABLE ROW LEVEL SECURITY;

-- RLS 政策：所有人可讀取公開資料
CREATE POLICY "Public read access" ON problems FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read test cases" ON test_cases FOR SELECT USING (true);
CREATE POLICY "Public read mock exams" ON mock_exams FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Public read mock exam problems" ON mock_exam_problems FOR SELECT USING (true);

-- RLS 政策：使用者只能操作自己的資料
CREATE POLICY "Users can manage own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own submissions" ON submissions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own mock exam submissions" ON mock_exam_submissions FOR ALL USING (auth.uid() = user_id);

-- 插入範例題目
INSERT INTO problems (title, description, input_format, output_format, difficulty, category, time_limit, memory_limit, points) VALUES
('A+B 問題', '讀入兩個整數 A 與 B，輸出它們的和。這是最基礎的輸入輸出練習題。', '第一行包含兩個整數 A 與 B，以空格分隔。', '輸出 A + B 的結果。', '入門', '基礎語法', 1000, 64, 100),
('最大公因數', '讀入兩個正整數 A、B，輸出它們的最大公因數 (GCD)。', '第一行包含兩個正整數 A 與 B。', '輸出 A 與 B 的最大公因數。', '基礎', '數學與遞迴', 1000, 64, 150),
('費波那契數列', '讀入整數 n，輸出第 n 項費波那契數 (F(0)=0, F(1)=1)。', '第一行包含一個整數 n。', '輸出第 n 項費波那契數。', '基礎', '動態規劃', 1000, 64, 150),
('二分搜尋', '在有序陣列中查找目標值的索引，找不到則輸出 -1。', '第一行包含兩個整數 n 與 target。第二行包含 n 個整數的有序陣列。', '輸出 target 在陣列中的索引（0-based），找不到則輸出 -1。', '進階', '搜尋與二分法', 1000, 64, 200),
('最大子陣列和', '給定一個整數陣列，找出連續子陣列的最大和。', '第一行包含一個整數 n。第二行包含 n 個整數。', '輸出連續子陣列的最大和。', '進階', '動態規劃', 1000, 64, 200);

-- 插入範例測資（A+B 問題）
INSERT INTO test_cases (problem_id, input_text, expected_output, is_sample, score_weight, sort_order) VALUES
-- 取得剛插入的第一個題目 id (p001 對應 uuid，這裡假設順序)
((SELECT id FROM problems WHERE title = 'A+B 問題'), '1 2', '3', true, 50, 1),
((SELECT id FROM problems WHERE title = 'A+B 問題'), '10 20', '30', false, 50, 2),
((SELECT id FROM problems WHERE title = 'A+B 問題'), '-5 5', '0', false, 50, 3),
((SELECT id FROM problems WHERE title = 'A+B 問題'), '-1000 -1000', '-2000', false, 50, 4);

-- 插入範例測資（最大公因數）
INSERT INTO test_cases (problem_id, input_text, expected_output, is_sample, score_weight, sort_order) VALUES
((SELECT id FROM problems WHERE title = '最大公因數'), '12 8', '4', true, 50, 1),
((SELECT id FROM problems WHERE title = '最大公因數'), '100 25', '25', false, 50, 2),
((SELECT id FROM problems WHERE title = '最大公因數'), '17 5', '1', false, 50, 3);

-- 插入範例測資（費波那契數列）
INSERT INTO test_cases (problem_id, input_text, expected_output, is_sample, score_weight, sort_order) VALUES
((SELECT id FROM problems WHERE title = '費波那契數列'), '0', '0', true, 34, 1),
((SELECT id FROM problems WHERE title = '費波那契數列'), '1', '1', false, 33, 2),
((SELECT id FROM problems WHERE title = '費波那契數列'), '10', '55', false, 33, 3);
