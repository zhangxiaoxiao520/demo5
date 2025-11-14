import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // 从请求体中获取日志数据
    const { logs } = await request.json();
    
    if (!logs || !Array.isArray(logs)) {
      return NextResponse.json(
        { success: false, message: 'Invalid request body: logs array is required' },
        { status: 400 }
      );
    }
    
    // 将日志保存到Supabase
    const { error } = await supabase
      .from('logs')
      .insert(logs.map(log => ({
        ...log,
        details: log.details ? JSON.stringify(log.details) : null
      })));
    
    if (error) {
      console.error('Failed to save logs to Supabase:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to save logs', error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Logs saved successfully' },
      { status: 200 }
    );
  } catch (error) {
    const errorObj = error as Error;
    console.error('Error in logs API:', errorObj);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: errorObj.message },
      { status: 500 }
    );
  }
}

// 添加GET方法，用于检查API是否正常工作
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Logs API is running',
    timestamp: new Date().toISOString()
  });
}