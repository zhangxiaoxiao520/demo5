import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('OAuth callback error:', error)
      return NextResponse.redirect(new URL('/auth/login?error=auth_failed', request.url))
    }

    // 确保用户资料存在
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          username: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'user',
        })
      }
    }

    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.redirect(new URL('/auth/login', request.url))
}