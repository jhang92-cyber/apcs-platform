-- 在 Supabase SQL Editor 中執行，用於遞增使用者解題數
CREATE OR REPLACE FUNCTION increment_solved(uid uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET total_solved = total_solved + 1,
      total_submissions = total_submissions + 1,
      updated_at = NOW()
  WHERE id = uid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_submission(uid uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET total_submissions = total_submissions + 1,
      updated_at = NOW()
  WHERE id = uid;
END;
$$ LANGUAGE plpgsql;
