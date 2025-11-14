'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Post = {
  id: string
  title: string
  content: string
  image_url: string | null
  like_count: number
  created_at: string
  category_id: string
  profiles: {
    username: string | null
    avatar_url: string | null
  }
}

const sortingOptions = [
  { id: 'latest', name: '最新发布' },
  { id: 'popular', name: '最受欢迎' },
  { id: 'trending', name: '热门趋势' },
]

export default function ExplorePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('latest')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchPosts()
  }, [selectedCategory, sortBy])

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }

  async function fetchPosts() {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles!inner (username, avatar_url)
        `)

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory)
      }

      if (sortBy === 'latest') {
        query = query.order('created_at', { ascending: false })
      } else if (sortBy === 'popular') {
        query = query.order('like_count', { ascending: false })
      }

      const { data, error } = await query

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen">
      {/* 头部 */}
      <header className="bg-gradient-to-r from-green-500 to-green-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🔍</span>
              <h1 className="text-2xl font-bold">探索环保内容</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="hover:text-green-200 transition-colors">
                首页
              </Link>
              <Link href="/create" className="hover:text-green-200 transition-colors">
                发布
              </Link>
              <Link href="/ai-assistant" className="hover:text-green-200 transition-colors">
                AI助手
              </Link>
              <Link href="/profile" className="hover:text-green-200 transition-colors">
                我的
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        {/* 搜索和筛选 */}
        <div className="mb-8 space-y-4">
          {/* 搜索框 */}
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="搜索环保技巧、食谱、改造方法..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>

          {/* 筛选选项 */}
          <div className="flex flex-wrap gap-4 justify-center">
            {/* 分类筛选 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">分类:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">全部</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 排序选项 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">排序:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {sortingOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 分类卡片 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">热门分类</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.length > 0 ? categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-4 text-center hover:scale-105"
              >
                <div className="text-3xl mb-2">{category.icon || '🌱'}</div>
                <div className="font-semibold text-gray-800 mb-1">{category.name}</div>
                <div className="text-sm text-gray-600">{category.description || '环保知识分享'}</div>
              </Link>
            )) : (
              <div className="text-center col-span-5 py-8">
                <div className="text-4xl mb-2">🌱</div>
                <p className="text-gray-600">加载分类中...</p>
              </div>
            )}
          </div>
        </section>

        {/* 内容列表 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              {selectedCategory === 'all' ? '全部内容' : 
               categories.find(c => c.id === selectedCategory)?.name + '内容'}
              <span className="text-sm text-gray-500 ml-2">({filteredPosts.length} 篇)</span>
            </h2>
            <Link href="/create" className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center">
              <span className="mr-2">✏️</span>
              发布新内容
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchQuery ? '没有找到相关内容' : '暂无内容'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery 
                  ? `没有找到包含 "${searchQuery}" 的内容，试试其他关键词`
                  : '快来发布第一个帖子，分享你的环保经验吧！'}
              </p>
              <Link href="/create" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors inline-block">
                发布新内容
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => {
                const category = categories.find(c => c.id === post.category_id);
                return (
                  <Link key={post.id} href={`/post/${post.id}`} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    )}
                    <div className="p-4">
                      {category && (
                        <div className="flex items-center mb-2">
                          <span className="text-xs mr-1">{category.icon}</span>
                          <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                            {category.name}
                          </span>
                        </div>
                      )}
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.content}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{post.profiles.username || '匿名用户'}</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 绿色生活助手. 让环保生活更简单.</p>
        </div>
      </footer>
    </div>
  )
}