'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Settings, Bookmark, Award, Clock, TrendingUp, LogOut, Edit, Plus, Heart, MessageSquare, MapPin, Calendar, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Profile = {
  id: string
  username: string
  email: string
  avatar_url: string | null
  bio: string | null
  location: string | null
  eco_points: number
  posts_count: number
  likes_count: number
  comments_count: number
  created_at: string
}

type Post = {
  id: string
  title: string
  content: string
  like_count: number
  comment_count: number
  created_at: string
  user_id: string
  categories: {
    name: string
    icon: string
    color: string
  }
}

// 重新编写整个ProfilePage组件，确保语法正确
export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('posts')
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    location: ''
  })
  const router = useRouter()

  // 删除帖子函数
  const handleDeletePost = async (postId: string) => {
    try {
      // 显示确认对话框
      if (!confirm('确定要删除这个帖子吗？相关的评论和点赞也将被删除。')) {
        return
      }

      // 开始事务操作
      // 1. 删除相关的评论
      await supabase.from('comments').delete().eq('post_id', postId)
      
      // 2. 删除相关的点赞
      await supabase.from('likes').delete().eq('post_id', postId)
      
      // 3. 删除相关的收藏
      await supabase.from('bookmarks').delete().eq('post_id', postId)
      
      // 4. 删除帖子本身
      const { error } = await supabase.from('posts').delete().eq('id', postId)
      
      if (error) {
        throw new Error(error.message)
      }
      
      // 更新本地状态，从posts数组中移除删除的帖子
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId))
      
      // 更新用户统计数据
      if (profile) {
        setProfile(prev => ({
          ...prev,
          posts_count: prev.posts_count - 1
        }))
      }
      
      // 显示成功消息
      alert('帖子删除成功！')
      
      // 触发全局刷新事件
      window.dispatchEvent(new CustomEvent('refreshData'))
    } catch (error) {
      console.error('删除帖子失败:', error)
      alert('删除帖子失败，请稍后重试。')
    }
  }

  useEffect(() => {
    fetchProfile()
    fetchUserPosts()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push('/auth/login')
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('获取用户资料失败:', profileError)
        return
      }

      // 获取用户统计信息
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_published', true)

      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      setProfile({
        ...profileData,
        email: user.email || '',
        posts_count: postsCount || 0,
        likes_count: likesCount || 0,
        comments_count: commentsCount || 0
      })

      setEditForm({
        username: profileData.username || '',
        bio: profileData.bio || '',
        location: profileData.location || ''
      })
    } catch (error) {
      console.error('获取用户资料失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories (name, icon, color)
        `)
        .eq('user_id', user.id)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(postsData || [])
    } catch (error) {
      console.error('获取用户帖子失败:', error)
    }
  }

  const handleEditProfile = async () => {
    if (!profile) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editForm.username,
          bio: editForm.bio,
          location: editForm.location
        })
        .eq('id', profile.id)

      if (error) throw error

      setProfile(prev => prev ? { ...prev, ...editForm } : null)
      setEditMode(false)
      alert('资料更新成功！')
    } catch (error) {
      console.error('更新资料失败:', error)
      alert('更新失败，请重试')
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/')
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">请先登录</h2>
          <Link 
            href="/auth/login" 
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            前往登录
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* 头部导航 */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full p-3 shadow-lg">
                <User className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  个人中心
                </h1>
                <p className="text-gray-500 text-sm font-medium">管理您的绿色生活</p>
              </div>
            </div>
            
            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-105 font-medium hover:bg-blue-50 px-4 py-2 rounded-xl">
                首页
              </Link>
              <Link href="/explore" className="text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-105 font-medium hover:bg-blue-50 px-4 py-2 rounded-xl">
                探索
              </Link>
              <Link href="/create" className="text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-105 font-medium hover:bg-blue-50 px-4 py-2 rounded-xl">
                发布
              </Link>
              <Link href="/ai-assistant" className="text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-105 font-medium hover:bg-blue-50 px-4 py-2 rounded-xl">
                AI助手
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* 用户信息卡片 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 lg:mb-0">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profile.username ? profile.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  Lv.{Math.floor(profile.eco_points / 100) + 1}
                </div>
              </div>
              <div>
                {editMode ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm(prev => ({...prev, username: e.target.value}))}
                      className="text-2xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none"
                      placeholder="用户名"
                    />
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm(prev => ({...prev, location: e.target.value}))}
                      className="text-gray-600 bg-transparent border-b border-gray-300 focus:outline-none"
                      placeholder="所在地"
                    />
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({...prev, bio: e.target.value}))}
                      className="text-gray-500 bg-transparent border border-gray-300 rounded-lg p-2 focus:outline-none w-full"
                      placeholder="个人简介"
                      rows={2}
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">{profile.username}</h2>
                    <p className="text-gray-600 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profile.location || '未设置'}
                    </p>
                    <p className="text-gray-500 mt-2 max-w-md">{profile.bio || '这个用户还没有个人简介'}</p>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex space-x-4">
              {editMode ? (
                <>
                  <button
                    onClick={handleEditProfile}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false)
                      setEditForm({
                        username: profile.username || '',
                        bio: profile.bio || '',
                        location: profile.location || ''
                      })
                    }}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                  >
                    取消
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    编辑资料
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    退出登录
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 侧边栏统计 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 环保积分 */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white text-center shadow-lg">
              <div className="text-4xl font-bold mb-2">{profile.eco_points}</div>
              <div className="text-sm opacity-90">环保积分</div>
              <div className="text-xs opacity-75 mt-1">累积贡献</div>
            </div>

            {/* 统计数据 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                我的统计
              </h3>
              <div className="space-y-4">
                {[
                  { icon: Bookmark, label: '发布内容', value: profile.posts_count, color: 'text-green-600' },
                  { icon: Heart, label: '获得点赞', value: profile.likes_count, color: 'text-red-600' },
                  { icon: MessageSquare, label: '评论', value: profile.comments_count, color: 'text-blue-600' },
                  { icon: Calendar, label: '加入天数', value: Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)), color: 'text-purple-600' }
                ].map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      <span className="text-gray-700">{stat.label}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 快速操作 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-gray-600" />
                快速操作
              </h3>
              <div className="space-y-2">
                <Link 
                  href="/create"
                  className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>发布新内容</span>
                </Link>
                <Link 
                  href="/ai-assistant"
                  className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                >
                  <Award className="h-5 w-5" />
                  <span>咨询AI助手</span>
                </Link>
                <Link 
                  href="/explore"
                  className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                >
                  <Clock className="h-5 w-5" />
                  <span>浏览内容</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 主要内容区域 */}
          <div className="lg:col-span-3">
            {/* 标签页 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 mb-6">
              <div className="flex border-b border-gray-100">
                {[
                  { id: 'posts', label: '我的发布', icon: Bookmark },
                  { id: 'likes', label: '我的点赞', icon: Heart },
                  { id: 'achievements', label: '环保成就', icon: Award }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 text-center flex items-center justify-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* 标签内容 */}
              <div className="p-6">
                {activeTab === 'posts' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold">我的发布</h3>
                      <span className="text-gray-500">{posts.length} 篇内容</span>
                    </div>
                    
                    {posts.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📝</div>
                        <h4 className="text-lg font-semibold text-gray-600 mb-2">还没有发布内容</h4>
                        <p className="text-gray-500 mb-4">分享您的环保经验，让更多人受益！</p>
                        <Link 
                          href="/create"
                          className="inline-flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          立即发布
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {posts.map((post) => (
                          <div key={post.id} className="relative">
                            <Link 
                              href={`/post/${post.id}`}
                              className="block bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-lg line-clamp-1">{post.title}</h4>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                  {post.categories?.name}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm line-clamp-2 mb-3">{post.content}</p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center space-x-4">
                                  <span className="flex items-center">
                                    <Heart className="h-3 w-3 mr-1" />
                                    {post.like_count}
                                  </span>
                                  <span className="flex items-center">
                                    <MessageSquare className="h-3 w-3 mr-1" />
                                    {post.comment_count}
                                  </span>
                                </div>
                                <span>{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
                              </div>
                            </Link>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="absolute top-10 right-3 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors z-10"
                              aria-label="删除帖子"
                            >
                  <Trash2 className="h-4 w-4" />
                </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'likes' && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">❤️</div>
                    <h4 className="text-lg font-semibold text-gray-600 mb-2">点赞的内容</h4>
                    <p className="text-gray-500">这里将显示您点赞过的所有内容</p>
                  </div>
                )}

                {activeTab === 'achievements' && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏆</div>
                    <h4 className="text-lg font-semibold text-gray-600 mb-2">环保成就</h4>
                    <p className="text-gray-500">完成环保任务，解锁更多成就！</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-gradient-to-br from-gray-900 to-black text-white py-12 mt-16">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <User className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold">个人中心</span>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            管理您的绿色生活足迹，记录每一次环保行动
          </p>
          <div className="border-t border-gray-800 mt-8 pt-8 text-gray-400">
            <p>&copy; 2025 绿色生活助手. 让环保生活更简单.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}