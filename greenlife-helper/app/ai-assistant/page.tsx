'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Bot, Send, Brain, Zap, Leaf, TrendingUp, Menu, X, Sparkles, Clock, Globe, Recycle } from 'lucide-react'
import Link from 'next/link'

type Message = {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

const quickPrompts = [
  "如何减少塑料使用？",
  "低碳饮食有哪些选择？",
  "家庭节能的小技巧",
  "旧物改造的好方法",
  "环保购物的建议"
]

const ecoTips = [
    {
      icon: <Recycle className="h-6 w-6 text-emerald-500" />,
      title: '垃圾分类',
      content: '正确分类垃圾可提高回收率，减少环境污染'
    },
    {
      icon: <Zap className="h-6 w-6 text-amber-500" />,
      title: '节能降耗',
      content: '使用节能电器，随手关灯，减少不必要的能源消耗'
    },
    {
      icon: <Zap className="h-6 w-6 text-cyan-500" />,
      title: '绿色出行',
      content: '选择步行、骑行或公共交通，减少碳排放'
    },
    {
      icon: <Leaf className="h-6 w-6 text-orange-500" />,
      title: '健康饮食',
      content: '选择本地时令食材，减少食物浪费和运输碳排放'
    }
  ]

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (content?: string) => {
    const messageContent = content || input.trim()
    if (!messageContent) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // 调用实际的AI API
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: messageContent })
      })

      if (!response.ok) {
        throw new Error('API请求失败')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || '抱歉，我无法理解您的问题。请尝试用不同方式提问。',
        role: 'assistant',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('AI API调用错误:', error)
      
      // 发生错误时的默认响应
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，我暂时无法提供回答。请稍后再试，或检查您的网络连接。',
        role: 'assistant',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
    handleSend(prompt)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
      {/* 头部导航 */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full p-3 shadow-lg border-2 border-white/20">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  AI环保助手
                </h1>
                <p className="text-gray-500 text-sm font-medium">智能问答，绿色生活</p>
              </div>
            </div>
            
            {/* 桌面导航 */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-purple-600 transition-all duration-300 hover:scale-105 font-medium hover:bg-purple-50 px-4 py-2 rounded-xl">
                首页
              </Link>
              <Link href="/explore" className="text-gray-700 hover:text-purple-600 transition-all duration-300 hover:scale-105 font-medium hover:bg-purple-50 px-4 py-2 rounded-xl">
                探索
              </Link>
              <Link href="/create" className="text-gray-700 hover:text-purple-600 transition-all duration-300 hover:scale-105 font-medium hover:bg-purple-50 px-4 py-2 rounded-xl">
                发布
              </Link>
              <Link href="/profile" className="text-gray-700 hover:text-purple-600 transition-all duration-300 hover:scale-105 font-medium hover:bg-purple-50 px-4 py-2 rounded-xl">
                我的
              </Link>
            </nav>
            
            {/* 移动菜单按钮 */}
            <button 
              className="lg:hidden text-gray-700 hover:text-purple-600 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          
          {/* 移动菜单 */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 py-6">
              <nav className="flex flex-col space-y-4">
                <Link href="/" className="text-gray-700 hover:text-purple-600 transition-colors font-medium hover:bg-purple-50 px-4 py-3 rounded-xl">
                  首页
                </Link>
                <Link href="/explore" className="text-gray-700 hover:text-purple-600 transition-colors font-medium hover:bg-purple-50 px-4 py-3 rounded-xl">
                  探索
                </Link>
                <Link href="/create" className="text-gray-700 hover:text-purple-600 transition-colors font-medium hover:bg-purple-50 px-4 py-3 rounded-xl">
                  发布
                </Link>
                <Link href="/profile" className="text-gray-700 hover:text-purple-600 transition-colors font-medium hover:bg-purple-50 px-4 py-3 rounded-xl">
                  我的
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-sm transform transition-all duration-300 hover:scale-105">
              <Zap className="h-4 w-4 mr-2" />
              智能环保助手
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
              您的专属环保顾问
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto text-base leading-relaxed">
              无论您对环保有任何疑问，我们的AI助手都会为您提供专业、实用的建议
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* 聊天界面 */}
            <div className="lg:col-span-8">
              <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-emerald-100/80 overflow-hidden transform transition-all duration-300 min-h-[600px] flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>
                {/* 聊天头部 */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white relative overflow-hidden">
                  {/* 装饰效果 */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl transform translate-x-20 -translate-y-20"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
                  <div className="flex items-center space-x-4 relative z-10">
                    <div className="bg-white/20 p-3 rounded-full">
                      <Bot className="h-8 w-8" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">绿色生活助手</h2>
                      <p className="text-purple-100 text-sm">随时为您提供环保建议</p>
                    </div>
                  </div>
                </div>

                {/* 消息区域 */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-3">🌱</div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        欢迎使用AI环保助手
                      </h3>
                      <p className="text-gray-500 text-sm">
                        请问我任何关于环保生活的问题，我会尽力帮助您！
                      </p>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}
                      >
                        {message.role === 'assistant' && (
                          <div className="hidden md:flex mr-3 items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        )}
                        <div
                          className={`max-w-xs md:max-w-md rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl p-4 shadow-lg transition-all duration-300 ${message.role === 'user' 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/20 rounded-bl-none' 
                            : 'bg-white border border-emerald-100 text-gray-800 shadow-sm group-hover:shadow-md'}`}
                        >
                          <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                          <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-emerald-100' : 'text-gray-500'} flex justify-end`}>
                            {message.timestamp.toLocaleTimeString('zh-CN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-emerald-100 text-gray-800 rounded-2xl p-4 max-w-xs md:max-w-md shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="animate-pulse flex space-x-1">
                            <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                            <div className="h-2 w-2 bg-teal-500 rounded-full"></div>
                            <div className="h-2 w-2 bg-cyan-500 rounded-full"></div>
                          </div>
                          <span className="text-sm text-emerald-700">AI正在思考环保方案...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* 输入区域 */}
                <div className="p-6 border-t border-emerald-100 bg-white/95 backdrop-blur-sm">
                  <div className="flex space-x-3">
                    <div className="flex-1 relative group">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="输入您的环保问题..."
                        className="flex-1 w-full px-4 py-3 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                        disabled={isLoading}
                      />
                      {input && (
                        <button
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          onClick={() => setInput('')}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => handleSend()}
                      disabled={isLoading || !input.trim()} 
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center justify-center"
                    >
                      <Send className="h-5 w-5 transition-transform duration-300 hover:rotate-45" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 flex justify-between">
                    <span>请输入环保相关问题</span>
                    <span>按Enter发送</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 侧边栏 */}
            <div className="lg:col-span-4 space-y-6">
              {/* 快速提问 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-emerald-100 p-5 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                  <TrendingUp className="h-4 w-4 mr-2 text-purple-500" />
                  快速提问
                </h3>
                <div className="space-y-2.5">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="w-full p-3 text-left bg-gradient-to-r from-purple-50 to-teal-50 border border-emerald-100 rounded-lg hover:shadow-sm hover:border-purple-200 transition-all duration-200 hover:translate-x-1 text-gray-700 text-sm"
                      disabled={isLoading}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 环保小贴士 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-emerald-100 p-5 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                  <Leaf className="h-4 w-4 mr-2 text-green-500" />
                  环保小贴士
                </h3>
                <div className="space-y-3">
                  {ecoTips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg hover:shadow-sm transition-all duration-200 hover:translate-x-1 group">
                      <div className="p-1.5 bg-white rounded-full group-hover:bg-emerald-100 transition-colors">
                        {tip.icon}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 text-sm">{tip.title}</div>
                        <div className="text-xs text-gray-600">{tip.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 统计信息 */}
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl p-4 shadow-md flex justify-between items-center transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
                  <div className="font-medium">环保问答记录</div>
                  <div className="text-2xl font-bold">500+</div>
                </div>
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl p-4 shadow-md flex justify-between items-center transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
                  <div className="font-medium">用户好评反馈</div>
                  <div className="text-2xl font-bold">2000+</div>
                </div>
              </div>
            </div>
          </div>

          {/* 功能特色区域 */}
          <div className="mt-12 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {
                [
                  {
                    icon: <Sparkles className="h-12 w-12 text-white" />,
                    title: '智能问答',
                    description: '基于最新环保知识，提供专业准确的建议',
                    color: 'from-emerald-500 to-teal-500'
                  },
                  {
                    icon: <Clock className="h-12 w-12 text-white" />,
                    title: '实时响应',
                    description: '快速回答您的环保问题，随时为您服务',
                    color: 'from-teal-500 to-cyan-500'
                  },
                  {
                    icon: <Globe className="h-12 w-12 text-white" />,
                    title: '全面覆盖',
                    description: '涵盖减塑、节能、饮食、出行等各个方面',
                    color: 'from-cyan-500 to-blue-500'
                  }
                ].map((feature, index) => (
                  <div key={index} className="bg-white/90 backdrop-blur-md rounded-2xl p-6 text-center border border-white shadow-lg overflow-hidden relative group transform transition-all duration-500 hover:shadow-xl">
                    {/* 卡片背景装饰 */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    
                    {/* 图标背景 */}
                    <div className={`mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-md transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                      {feature.icon}
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2 text-gray-800 group-hover:text-emerald-600 transition-colors duration-300">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                    
                    {/* 悬停效果：底部装饰条 */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} scale-x-0 transform origin-left group-hover:scale-x-100 transition-transform duration-500`}></div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="mt-16 py-12 bg-gradient-to-b from-white to-emerald-50 border-t border-emerald-100">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center items-center mb-4">
            <Bot className="h-8 w-8 text-emerald-500 mr-2" />
            <span className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">绿色生活助手</span>
          </div>
          <p className="text-gray-600 text-base mb-2">© 2025 绿色生活助手 - 让环保成为生活方式</p>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto">
            致力于提供专业、可靠的环保知识和建议，共同创造可持续的绿色未来
          </p>
          
          {/* 装饰元素 */}
          <div className="mt-6 flex justify-center space-x-6">
            {[<Leaf />, <Globe />, <Sparkles />].map((icon, index) => (
              <div key={index} className="w-8 h-8 rounded-full bg-white border border-emerald-100 flex items-center justify-center text-emerald-400 shadow-sm hover:text-emerald-600 transition-colors duration-300">
                {icon}
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}