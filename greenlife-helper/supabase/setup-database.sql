-- 绿色生活助手 - 完整的Supabase数据库设置脚本
-- 在Supabase项目的SQL编辑器中执行此脚本

-- 1. 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. 创建 profiles 表（用户资料）
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  eco_points INTEGER DEFAULT 0, -- 环保积分
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建 categories 表（帖子分类）
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT '🌱',
  color TEXT DEFAULT '#10B981',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 插入默认分类
INSERT INTO categories (name, description, icon, color) VALUES
  ('可持续生活', '分享可持续生活方式和经验', '🌱', '#10B981'),
  ('环保饮食', '绿色饮食、素食、本地食材等', '🍽️', '#059669'),
  ('绿色消费', '环保购物、产品推荐等', '🛍️', '#047857'),
  ('节能减排', '能源节约、碳减排技巧', '⚡', '#065F46'),
  ('垃圾分类', '垃圾分类、回收利用知识', '🗑️', '#064E3B'),
  ('绿色出行', '公共交通、骑行、步行等', '🚲', '#022C22')
ON CONFLICT (name) DO NOTHING;

-- 5. 创建 posts 表（帖子）
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  category_id UUID REFERENCES categories(id) NOT NULL,
  like_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 创建 likes 表（点赞）
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  post_id UUID REFERENCES posts(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- 7. 创建 logs 表（日志记录）
CREATE TABLE IF NOT EXISTS logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  log_level TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 启用行级安全策略（RLS）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- 9. 创建 RLS 策略

-- profiles 表策略
CREATE POLICY "用户可以查看所有资料" ON profiles FOR SELECT USING (true);
CREATE POLICY "用户可以更新自己的资料" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "用户可以插入自己的资料" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- categories 表策略
CREATE POLICY "所有人可查看分类" ON categories FOR SELECT USING (true);

-- posts 表策略
CREATE POLICY "所有人可查看帖子" ON posts FOR SELECT USING (true);
CREATE POLICY "认证用户可创建帖子" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用户可更新自己的帖子" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "用户可删除自己的帖子" ON posts FOR DELETE USING (auth.uid() = user_id);

-- likes 表策略
CREATE POLICY "所有人可查看点赞" ON likes FOR SELECT USING (true);
CREATE POLICY "认证用户可点赞" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用户可取消自己的点赞" ON likes FOR DELETE USING (auth.uid() = user_id);

-- logs 表策略
CREATE POLICY "任何人可以查看日志" ON logs FOR SELECT USING (true);
CREATE POLICY "任何人可以插入日志" ON logs FOR INSERT WITH CHECK (true);

-- 10. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_user_post ON likes(user_id, post_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_logs_log_level ON logs(log_level);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_source ON logs(source);

-- 11. 创建触发器

-- 自动更新帖子的点赞数
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_like_count_trigger
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

-- 自动更新帖子的更新时间
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_timestamp 
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_posts_timestamp 
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 12. 存储过程

-- 获取帖子详情
CREATE OR REPLACE FUNCTION get_post_details(post_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  image_url TEXT,
  like_count INTEGER,
  view_count INTEGER,
  comment_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  author_username TEXT,
  author_avatar_url TEXT,
  category_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.content,
    p.image_url,
    p.like_count,
    p.view_count,
    p.comment_count,
    p.created_at,
    pr.username AS author_username,
    pr.avatar_url AS author_avatar_url,
    c.name AS category_name
  FROM posts p
  LEFT JOIN profiles pr ON p.user_id = pr.id
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.id = post_id;
END;
$$ LANGUAGE plpgsql;

-- 获取用户的所有帖子
CREATE OR REPLACE FUNCTION get_user_posts(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  image_url TEXT,
  like_count INTEGER,
  view_count INTEGER,
  comment_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  category_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.content,
    p.image_url,
    p.like_count,
    p.view_count,
    p.comment_count,
    p.created_at,
    c.name AS category_name
  FROM posts p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.user_id = user_uuid AND p.is_published = true
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 13. 注释：数据库设置完成！
-- 您现在可以在应用程序中正常使用所有功能了。