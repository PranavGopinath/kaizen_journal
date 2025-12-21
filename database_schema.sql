-- Kaizen Journal Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_entries table for journal entries
CREATE TABLE IF NOT EXISTS daily_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    checklist_data JSONB DEFAULT '{}',
    reflection TEXT,
    mood TEXT CHECK (mood IN ('excellent', 'good', 'neutral', 'bad', 'terrible')),
    habits JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Create goals table for user goals and objectives
CREATE TABLE IF NOT EXISTS goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('personal', 'health', 'career', 'learning', 'financial')),
    deadline DATE,
    target_value TEXT,
    current_value TEXT DEFAULT '0',
    unit TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create master_checklist table for predefined checklist items
CREATE TABLE IF NOT EXISTS master_checklist (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    info TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_checklist ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Daily entries policies
CREATE POLICY "Users can view own entries" ON daily_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries" ON daily_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries" ON daily_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries" ON daily_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view own goals" ON goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON goals
    FOR DELETE USING (auth.uid() = user_id);

-- Master checklist policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view master checklist" ON master_checklist
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_entries_user_date ON daily_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_entries_date ON daily_entries(date);
CREATE INDEX IF NOT EXISTS idx_daily_entries_mood ON daily_entries(mood);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_category ON goals(category);
CREATE INDEX IF NOT EXISTS idx_goals_completed ON goals(completed);
CREATE INDEX IF NOT EXISTS idx_goals_deadline ON goals(deadline);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_entries_updated_at BEFORE UPDATE ON daily_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample master checklist items
INSERT INTO master_checklist (info, category) VALUES
    ('Exercise for 30 minutes', 'health'),
    ('Meditate for 10 minutes', 'wellness'),
    ('Read for 20 minutes', 'learning'),
    ('Drink 8 glasses of water', 'health'),
    ('Write in journal', 'personal'),
    ('Practice gratitude', 'wellness'),
    ('Connect with family/friends', 'social'),
    ('Learn something new', 'learning'),
    ('Get 8 hours of sleep', 'health'),
    ('Review daily goals', 'productivity')
ON CONFLICT DO NOTHING;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create views for common queries
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    COUNT(DISTINCT de.date) as total_entries,
    COUNT(DISTINCT g.id) as total_goals,
    COUNT(DISTINCT CASE WHEN g.completed THEN g.id END) as completed_goals,
    AVG(CASE 
        WHEN de.mood = 'excellent' THEN 5
        WHEN de.mood = 'good' THEN 4
        WHEN de.mood = 'neutral' THEN 3
        WHEN de.mood = 'bad' THEN 2
        WHEN de.mood = 'terrible' THEN 1
    END) as average_mood
FROM auth.users u
LEFT JOIN daily_entries de ON u.id = de.user_id
LEFT JOIN goals g ON u.id = g.user_id
GROUP BY u.id;

-- Create function to calculate user streak
CREATE OR REPLACE FUNCTION calculate_user_streak(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    streak_count INTEGER := 0;
    current_date DATE := CURRENT_DATE;
    entry_date DATE;
BEGIN
    -- Get the most recent entry date
    SELECT MAX(date) INTO entry_date
    FROM daily_entries
    WHERE user_id = user_uuid;
    
    -- If no entries, return 0
    IF entry_date IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Calculate streak backwards from most recent entry
    WHILE EXISTS (
        SELECT 1 FROM daily_entries 
        WHERE user_id = user_uuid AND date = entry_date
    ) LOOP
        streak_count := streak_count + 1;
        entry_date := entry_date - INTERVAL '1 day';
    END LOOP;
    
    RETURN streak_count;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE profiles IS 'User profile information';
COMMENT ON TABLE daily_entries IS 'Daily journal entries with mood, habits, and reflections';
COMMENT ON TABLE goals IS 'User goals and objectives with progress tracking';
COMMENT ON TABLE master_checklist IS 'Predefined checklist items for daily activities';
COMMENT ON FUNCTION calculate_user_streak IS 'Calculate consecutive days of journal entries for a user'; 