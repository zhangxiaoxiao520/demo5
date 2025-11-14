'use client'

import { useState } from 'react';
import { Save, AlertCircle, CheckCircle, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export default function LogsManagementPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSaveLogs() {
    setStatus('loading');
    setMessage('正在保存日志...');

    try {
      const response = await fetch('/api/logs/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setMessage('日志保存成功！');
      } else {
        setStatus('error');
        setMessage(`保存失败: ${result.message || '未知错误'}`);
      }
    } catch (error) {
      setStatus('error');
      setMessage('保存过程中发生错误');
      console.error('Error saving logs:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-gradient-to-r from-green-500 to-green-600 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">绿色生活助手</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">日志管理</h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">当前日志信息</h2>
            <p className="text-gray-600 mb-4">
              系统检测到4条错误日志需要保存到Supabase数据库中。
              这些日志包含网络连接错误和数据获取失败的信息。
            </p>
          </div>

          {/* 状态消息 */}
          {status !== 'idle' && (
            <div 
              className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
                status === 'success' ? 'bg-green-100 text-green-800' :
                status === 'error' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}
            >
              {status === 'success' && <CheckCircle className="h-5 w-5" />}
              {status === 'error' && <AlertCircle className="h-5 w-5" />}
              {status === 'loading' && <RefreshCcw className="h-5 w-5 animate-spin" />}
              <span>{message}</span>
            </div>
          )}

          {/* 保存按钮 */}
          <div className="flex justify-center">
            <button
              onClick={handleSaveLogs}
              disabled={status === 'loading'}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <>
                  <RefreshCcw className="h-5 w-5 animate-spin" />
                  <span>保存中...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>保存日志到Supabase</span>
                </>
              )}
            </button>
          </div>

          {/* 说明信息 */}
          <div className="mt-8 text-sm text-gray-500 border-t pt-6">
            <p>
              注意：保存日志需要Supabase数据库连接正常。
              如果您看到数据库连接错误，请检查环境变量配置或Supabase项目状态。
            </p>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="mt-10 py-6 bg-gray-100 text-center text-gray-600">
        <div className="container mx-auto px-4">
          <p>&copy; 2025 绿色生活助手 - 可持续生活方式社区平台</p>
        </div>
      </footer>
    </div>
  );
}