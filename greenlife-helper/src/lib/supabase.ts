import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ubdyfpjtlioxtxllmpvq.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZHlmcGp0bGlveHR4bGxtcHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTQzMjMsImV4cCI6MjA3NzA5MDMyM30.J_IZ2C8xa4Fsf1JVTYSfOnAVSHwaKylz1Oc1_WsgQ-0'

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 实用函数
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }
  
  return data
}

export const createProfile = async (userId: string, username: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: userId,
        username: username,
        eco_points: 0,
        bio: '欢迎来到绿色生活助手！'
      }
    ])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating profile:', error)
    return null
  }
  
  return data
}