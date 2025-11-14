'use client'

import { useState, useEffect } from 'react'
import { Leaf, Search, Plus, TrendingUp, Users, Zap, Heart, Target, Clock, Award, Globe, Shield, Menu, X, Sparkles, ArrowRight, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'


type Post = {
  id: string
  title: string
  content: string
  image_url: string | null
  like_count: number
  created_at: string
  profiles: {
    username: string | null
    avatar_url: string | null
  }
  categories: {
    name: string | null
    icon: string | null
    color: string | null
  }
}

type Category = {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  default_image_url?: string
}

type Stats = {
  totalUsers: number
  ecoPoints: number
  savedTrees: number
  postsCount: number
}

const features = [
  {
    icon: Shield,
    title: '专业可靠',
    description: '基于科学研究的环保知识，确保信息的准确性和实用性',
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    icon: Globe,
    title: '社区互动', 
    description: '与志同道合的环保爱好者交流经验，共同成长进步',
    gradient: 'from-blue-500 to-cyan-600'
  },
  {
    icon: Zap,
    title: '便捷实用',
    description: '丰富的环保技巧和工具，让绿色生活变得简单易行',
    gradient: 'from-purple-500 to-pink-600'
  }
]

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    ecoPoints: 0,
    savedTrees: 0,
    postsCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetchPosts()
    fetchCategories()
    fetchStats()
    
    // 监听 Supabase 实时更新
    const postsSubscription = supabase
      .channel('posts')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'posts' 
        }, 
        () => {
          fetchPosts()
          fetchStats()
        }
      )
      .subscribe()

    const categoriesSubscription = supabase
      .channel('categories')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'categories' 
        }, 
        () => {
          fetchCategories()
        }
      )
      .subscribe()

    // 监听全局刷新事件
    const handleGlobalRefresh = (event: CustomEvent) => {
      const { type } = event.detail
      if (type === 'postDeleted' || type === 'postCreated' || type === 'postUpdated') {
        fetchPosts()
        fetchStats()
      }
      if (type === 'categoryChanged') {
        fetchCategories()
      }
    }

    window.addEventListener('appRefresh', handleGlobalRefresh as EventListener)

    return () => {
      postsSubscription.unsubscribe()
      categoriesSubscription.unsubscribe()
      window.removeEventListener('appRefresh', handleGlobalRefresh as EventListener)
    }
  }, [])

  async function fetchPosts() {
    try {
      console.log('开始从Supabase获取真实帖子数据...')
      
      // 首先获取简单的帖子数据
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(6)

      if (postsError) {
        console.error('从数据库获取帖子失败:', postsError)
        setPosts([])
        return
      }
      
      if (!postsData || postsData.length === 0) {
        console.log('没有找到已发布的帖子')
        setPosts([])
        return
      }
      
      // 为每个帖子获取用户和分类信息
      const postsWithDetails = await Promise.all(
        postsData.map(async (post) => {
          // 获取用户信息
          const { data: userData } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', post.user_id)
            .single()
            
          // 获取分类信息
          const { data: categoryData } = await supabase
            .from('categories')
            .select('name, icon, color')
            .eq('id', post.category_id)
            .single()
          
          return {
            ...post,
            profiles: userData || {
              username: post.user_id ? '用户' + post.user_id.substring(0, 8) : '匿名用户',
              avatar_url: null
            },
            categories: categoryData || {
              name: '未分类',
              icon: '🌱',
              color: 'from-gray-500 to-gray-600'
            },
            image_url: post.image_url || `/api/placeholder/400/300?text=${encodeURIComponent(post.title)}`
          }
        })
      )
      
      setPosts(postsWithDetails as Post[])
    } catch (error) {
      console.error('获取帖子失败:', error)
      setPosts([])
    }
  }

  async function fetchCategories() {
    try {
      console.log('开始从数据库获取分类数据...')
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) {
        console.error('获取分类数据失败:', error)
        setCategories([])
        return
      }

      // 分类默认图片映射表
      const categoryDefaultImages: Record<string, string> = {
        '垃圾分类': 'https://picsum.photos/id/1/800/400',
        '家庭园艺': 'https://picsum.photos/id/152/800/400',
        '废物利用': 'https://picsum.photos/id/118/800/400',
        '废物回收': 'https://picsum.photos/id/180/800/400',
        '环保家居': 'https://picsum.photos/id/164/800/400',
        '环保知识': 'https://picsum.photos/id/292/800/400',
        '环保饮食': 'https://picsum.photos/id/306/800/400',
        '社区参与': 'https://picsum.photos/id/325/800/400',
        '社区活动': 'https://picsum.photos/id/342/800/400',
        '绿色出行': 'https://picsum.photos/id/355/800/400',
        '绿色消费': 'https://picsum.photos/id/366/800/400',
        '绿色科技': 'https://picsum.photos/id/380/800/400',
        '自然保护': 'https://picsum.photos/id/429/800/400',
        '节能减排': 'https://picsum.photos/id/447/800/400',
        '节能节水': 'https://picsum.photos/id/463/800/400'
      };

      // 使用数据库中的真实分类数据
      const categoriesData = data ? data.map(category => ({
        ...category,
        // 确保使用数据库中的名称，如果为空则提供默认值
        name: category.name || '未命名分类',
        description: category.description || '环保知识分享',
        icon: category.icon || '🌱',
        color: category.color ? `from-[${category.color}] to-[${category.color.replace('#', '')}99]` : 'from-green-500 to-green-600',
        // 添加默认图片URL，如果分类名称在映射表中有对应图片，则使用映射表中的图片，否则使用基于ID的默认图片
        default_image_url: categoryDefaultImages[category.name || ''] || `https://picsum.photos/id/${parseInt(category.id || '100') % 500}/800/400`
      })) : []

      console.log('成功获取并处理分类数据:', categoriesData)
      setCategories(categoriesData)
      setLoading(false)
    } catch (error) {
      console.error('获取分类数据失败:', error)
      setCategories([])
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      console.log('开始从数据库获取统计信息...')
      
      // 获取用户总数
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // 获取帖子总数
      const { count: postsCount, error: postsError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)

      // 获取环保积分总数（从用户积分累计）
      const { data: ecoPointsData, error: ecoPointsError } = await supabase
        .from('profiles')
        .select('eco_points')

      if (usersError || postsError || ecoPointsError) {
        console.error('获取统计信息失败:', { usersError, postsError, ecoPointsError })
        setStats({
          totalUsers: 0,
          ecoPoints: 0,
          savedTrees: 0,
          postsCount: 0
        })
        return
      }

      // 计算环保积分总数
      const ecoPoints = ecoPointsData ? ecoPointsData.reduce((sum, profile) => sum + (profile.eco_points || 0), 0) : 0
      
      // 根据环保积分估算拯救树木数量（每1000积分拯救一棵树）
      const savedTrees = Math.floor(ecoPoints / 1000)

      setStats({
        totalUsers: totalUsers || 0,
        ecoPoints: ecoPoints,
        savedTrees: savedTrees,
        postsCount: postsCount || 0
      })
    } catch (error) {
      console.error('获取统计信息失败:', error)
      setStats({
        totalUsers: 0,
        ecoPoints: 0,
        savedTrees: 0,
        postsCount: 0
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
      {/* 头部导航 */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-full p-3 shadow-lg">
                <Leaf className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  绿色生活助手
                </h1>
                <p className="text-gray-500 text-sm font-medium">让环保生活更简单</p>
              </div>
            </div>
            
            {/* 桌面导航 */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="/explore" className="text-gray-700 hover:text-emerald-600 transition-all duration-300 hover:scale-105 font-medium hover:bg-emerald-50 px-4 py-2 rounded-xl">
                探索
              </Link>
              <Link href="/create" className="text-gray-700 hover:text-emerald-600 transition-all duration-300 hover:scale-105 font-medium hover:bg-emerald-50 px-4 py-2 rounded-xl">
                发布
              </Link>
              <Link href="/ai-assistant" className="text-gray-700 hover:text-emerald-600 transition-all duration-300 hover:scale-105 font-medium hover:bg-emerald-50 px-4 py-2 rounded-xl">
                AI助手
              </Link>
              <Link href="/video-share" className="text-gray-700 hover:text-emerald-600 transition-all duration-300 hover:scale-105 font-medium hover:bg-emerald-50 px-4 py-2 rounded-xl">
                视频分享
              </Link>
              <Link href="/profile" className="text-gray-700 hover:text-emerald-600 transition-all duration-300 hover:scale-105 font-medium hover:bg-emerald-50 px-4 py-2 rounded-xl">
                我的
              </Link>
              <Link href="/auth/register" className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-medium py-2.5 px-7 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                立即加入
              </Link>
            </nav>
            
            {/* 移动菜单按钮 */}
            <button 
              className="lg:hidden text-gray-700 hover:text-emerald-600 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          
          {/* 移动菜单 */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 py-6">
              <nav className="flex flex-col space-y-4">
                <Link href="/explore" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium hover:bg-emerald-50 px-4 py-3 rounded-xl">
                  探索
                </Link>
                <Link href="/create" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium hover:bg-emerald-50 px-4 py-3 rounded-xl">
                  发布
                </Link>
                <Link href="/ai-assistant" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium hover:bg-emerald-50 px-4 py-3 rounded-xl">
                  AI助手
                </Link>
                <Link href="/video-share" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium hover:bg-emerald-50 px-4 py-3 rounded-xl">
                  视频分享
                </Link>
                <Link href="/profile" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium hover:bg-emerald-50 px-4 py-3 rounded-xl">
                  我的
                </Link>
                <Link href="/auth/register" className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-medium py-3 px-6 rounded-xl text-center mt-4">
                  立即加入
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* 主要内容 */}
      <main className="container mx-auto px-6 py-12">
        {/* 英雄区域 */}
        <section className="text-center mb-20">
          <div className="relative bg-gradient-to-br from-white via-emerald-50 to-cyan-50 rounded-3xl p-12 md:p-16 mb-16 shadow-2xl border border-white/50 overflow-hidden">
            {/* 背景装饰 */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-r from-emerald-200 to-cyan-200 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-30"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-r from-cyan-200 to-blue-200 rounded-full translate-x-1/2 translate-y-1/2 opacity-40"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
                <Sparkles className="h-4 w-4 mr-2" />
                环保生活新选择
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                让环保生活<br />
                <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  简单又有趣
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                加入我们的绿色社区，与 <span className="font-semibold text-emerald-600">{stats.totalUsers.toLocaleString()}</span> 位环保爱好者一起分享技巧、
                学习知识，共同为地球贡献力量
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/auth/register" className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-semibold py-4 px-10 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center">
                  <span>立即加入</span>
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
                <Link href="/explore" className="bg-white text-emerald-600 hover:bg-emerald-50 font-semibold py-4 px-10 rounded-xl transition-all duration-300 border-2 border-emerald-500 hover:border-emerald-600 shadow-lg hover:shadow-xl">
                  探索内容
                </Link>
              </div>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[
              { icon: Users, value: stats.totalUsers, label: '活跃用户', color: 'from-emerald-500 to-emerald-600' },
              { icon: Award, value: stats.ecoPoints, label: '环保积分', color: 'from-amber-500 to-orange-500' },
              { icon: Heart, value: stats.savedTrees, label: '拯救树木', color: 'from-red-500 to-pink-500' },
              { icon: Target, value: stats.postsCount, label: '经验分享', color: 'from-blue-500 to-cyan-500' }
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center group border border-white/50 hover:transform hover:scale-105 backdrop-blur-sm">
                <div className={`bg-gradient-to-r ${stat.color} text-transparent bg-clip-text mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-14 w-14 mx-auto" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-3">{stat.value.toLocaleString()}</div>
                <div className="text-gray-600 font-medium text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 搜索栏 */}
        <div className="mb-16">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
            <input
              type="text"
              placeholder="搜索环保技巧、食谱、改造方法..."
              className="w-full pl-16 pr-6 py-5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white/80 backdrop-blur-sm shadow-xl text-lg"
            />
          </div>
        </div>

        {/* 功能特色 */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">为什么选择绿色生活助手？</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">我们致力于为您提供最优质的环保生活体验</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-white to-emerald-50 rounded-3xl shadow-lg transform group-hover:scale-105 transition-all duration-500 border border-white/50"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center border border-white/50 group-hover:shadow-2xl transition-all duration-500">
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 分类导航 */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold flex items-center text-gray-900 mb-2">
                <TrendingUp className="h-10 w-10 mr-4 text-emerald-600" />
                热门分类
              </h2>
              <p className="text-xl text-gray-600">探索不同领域的环保知识</p>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 animate-pulse border border-white/50 shadow-lg">
                  <div className="h-16 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl mb-4 mx-auto"></div>
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-3"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* 主要分类 - 4个特色分类 */}
              {/*<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">*/}
              {/*  {categories.slice(0, 4).map((category) => (*/}
              {/*    <Link*/}
              {/*      key={category.id}*/}
              {/*      href={`/category/${category.id}`}*/}
              {/*      className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105"*/}
              {/*    >*/}
              {/*      <div className={`absolute inset-0 bg-gradient-to-br ${category.color || 'from-emerald-500 to-cyan-600'} opacity-90 group-hover:opacity-100 transition-opacity duration-300`}></div>*/}
              {/*      <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center border border-white/20 min-h-[180px] flex flex-col justify-center items-center">*/}
              {/*        <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">{category.icon || '🌱'}</div>*/}
              {/*        <div className="text-white font-bold text-2xl mb-3 group-hover:scale-105 transition-transform duration-300">{category.name}</div>*/}
              {/*        <div className="text-white/90 text-base leading-relaxed">{category.description}</div>*/}
              {/*      </div>*/}
              {/*    </Link>*/}
              {/*  ))}*/}
              {/*</div>*/}
              
              {/* 更多分类 - 网格布局 */}
              {categories.length > 4 && (
                <>
                  {/*<h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">更多分类</h3>*/}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categories.slice(4).map((category) => (
                      <Link
                        key={category.id}
                        href={`/category/${category.id}`}
                        className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200 hover:transform hover:scale-105"
                      >
                        <div className="p-6 text-center">
                          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{category.icon || '🌱'}</div>
                          <div className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-emerald-600 transition-colors">{category.name}</div>
                          <div className="text-gray-600 text-sm line-clamp-2">{category.description}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </section>

        {/* 最新内容 */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold flex items-center text-gray-900 mb-2">
                <Clock className="h-10 w-10 mr-4 text-emerald-600" />
                最新分享
              </h2>
              <p className="text-xl text-gray-600">来自社区的精彩内容</p>
            </div>
            <Link href="/create" className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center">
              <Plus className="h-6 w-6 mr-2" />
              发布新内容
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 animate-pulse border border-white/50 shadow-lg">
                  <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl mb-6"></div>
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link 
                  key={post.id} 
                  href={`/post/${post.id}`} 
                  className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 hover:transform hover:scale-105"
                >
                  <div className="relative">
                    <img
                      src={post.image_url || (categories.find(cat => cat.id === (post.categories as any)?.id)?.default_image_url || '/api/placeholder/400/300')}
                      alt={post.title}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                      {post.like_count} 赞
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-xl mb-4 line-clamp-2 text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-base mb-6 line-clamp-3 leading-relaxed">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-full mr-3"></div>
                        <span className="font-medium">{post.profiles.username || '匿名用户'}</span>
                      </div>
                      <span className="text-gray-400">{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {/* 空状态处理 */}
          {!loading && posts.length === 0 && (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50">
              <div className="text-8xl mb-6">📝</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">暂无内容</h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">快来发布第一条环保分享，与大家分享您的绿色生活经验！</p>
              <Link href="/create" className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center">
                <Plus className="h-6 w-6 mr-2" />
                开始创作
              </Link>
            </div>
          )}
        </section>

        {/* 行动号召 */}
        <section className="relative bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 rounded-3xl p-12 md:p-16 text-center text-white mb-16 overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              <CheckCircle className="h-4 w-4 mr-2" />
              立即加入我们的环保行动
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">加入绿色生活运动</h2>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed opacity-95">
              每一天的小改变，都将为地球带来巨大的影响。
              从今天开始，让我们一起创造更美好的未来。
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/auth/register" className="bg-white text-emerald-600 hover:bg-emerald-50 font-semibold py-4 px-10 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
                立即注册
              </Link>
              <Link href="/explore" className="border-2 border-white text-white hover:bg-white/10 font-semibold py-4 px-10 rounded-xl transition-all duration-300">
                了解更多
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="bg-gradient-to-br from-gray-900 to-black text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <Leaf className="h-10 w-10 text-emerald-400" />
                <span className="text-3xl font-bold">绿色生活助手</span>
              </div>
              <p className="text-gray-400 text-lg max-w-lg leading-relaxed">
                致力于推广可持续生活方式，让环保成为每个人的生活习惯。
                加入我们，一起为地球的美好明天贡献力量。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-6">快速链接</h3>
              <ul className="space-y-4 text-gray-400">
                <li><Link href="/explore" className="hover:text-white transition-colors text-lg">探索内容</Link></li>
                <li><Link href="/create" className="hover:text-white transition-colors text-lg">发布分享</Link></li>
                <li><Link href="/ai-assistant" className="hover:text-white transition-colors text-lg">AI助手</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors text-lg">关于我们</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-6">联系我们</h3>
              <ul className="space-y-4 text-gray-400 text-lg">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                  邮箱: contact@greenlife.com
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                  电话: 400-123-4567
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                  地址: 石家庄裕华区南二环东路20号
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p className="text-lg">&copy; 2025 绿色生活助手. 让环保生活更简单.</p>
          </div>
        </div>
      </footer>

      {/* 添加必要的CSS类 */}
      <style jsx global>{`
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        .line-clamp-3 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }
      `}</style>
    </div>
  )
}