'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

type Category = {
  id: string
  name: string
  description: string
  icon: string
  default_image_url: string | null
}

// 从数据库获取分类信息
const getCategoryById = async (id: string): Promise<Category | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      console.error('获取分类信息失败:', error)
      return null
    }

    // 定义分类默认图片映射
    const categoryDefaultImages: Record<string, string> = {
      '垃圾分类': 'https://picsum.photos/id/20/800/600',
      '家庭园艺': 'https://picsum.photos/id/15/800/600',
      '废物利用': 'https://picsum.photos/id/10/800/600',
      '废物回收': 'https://picsum.photos/id/30/800/600',
      '环保家居': 'https://picsum.photos/id/40/800/600',
      '环保知识': 'https://picsum.photos/id/50/800/600',
      '环保饮食': 'https://picsum.photos/id/60/800/600',
      '社区参与': 'https://picsum.photos/id/70/800/600',
      '社区活动': 'https://picsum.photos/id/80/800/600',
      '绿色出行': 'https://picsum.photos/id/90/800/600',
      '绿色消费': 'https://picsum.photos/id/100/800/600',
      '绿色科技': 'https://picsum.photos/id/110/800/600',
      '绿色饮食': 'https://picsum.photos/id/120/800/600',
      '自然保护': 'https://picsum.photos/id/130/800/600',
      '节能减排': 'https://picsum.photos/id/140/800/600',
      '节水节水': 'https://picsum.photos/id/150/800/600'
    }

    return {
      id: data.id,
      name: data.name || '未命名分类',
      description: data.description || '分类描述',
      icon: data.icon || '📁',
      default_image_url: categoryDefaultImages[data.name] || `https://picsum.photos/id/${parseInt(data.id, 36) % 200 + 1}/800/600`
    }
  } catch (error) {
    console.error('获取分类信息异常:', error)
    return null
  }
}

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params.id as string
  
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<Category | null>(null)

  useEffect(() => {
    if (categoryId) {
      fetchCategoryPosts()
    }
  }, [categoryId])

  async function fetchCategoryPosts() {
    try {
      // 并行获取分类信息和帖子数据
      const [categoryData, postsData] = await Promise.all([
        getCategoryById(categoryId),
        fetchPostsByCategory(categoryId)
      ])
      
      if (!categoryData) {
        router.push('/')
        return
      }
      
      setCategory(categoryData)
      setPosts(postsData)
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // 从数据库获取指定分类的帖子
  async function fetchPostsByCategory(categoryId: string): Promise<Post[]> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (username, avatar_url)
        `)
        .eq('category_id', categoryId)
        .eq('is_published', true) // 只获取已发布的帖子
        .order('created_at', { ascending: false })

      if (error) {
        console.error('获取帖子失败:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('获取帖子异常:', error)
      return []
    }
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">分类不存在</h2>
          <Link href="/" className="text-green-600 hover:underline mt-4 inline-block">
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* 头部 */}
      <header className="bg-gradient-to-r from-green-500 to-green-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🌱</span>
              <h1 className="text-2xl font-bold">绿色生活助手</h1>
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
        {/* 分类标题 */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">{category.name}</h1>
          <p className="text-lg text-gray-600">{category.description}</p>
          <div className="mt-4 flex items-center justify-center space-x-4">
            <Link href="/" className="text-green-600 hover:underline">
              返回首页
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/create" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
              发布新内容
            </Link>
          </div>
        </div>

        {/* 内容列表 */}
        <section>
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
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无内容</h3>
              <p className="text-gray-500 mb-4">这个分类还没有内容，快来发布第一个帖子吧！</p>
              <Link href="/create" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors inline-block">
                发布新内容
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/post/${post.id}`} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                  <img
                    src={post.image_url || category.default_image_url || '/api/placeholder/400/300'}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-4">
                    {/* 直接显示当前页面的分类信息，因为这里只显示该分类下的帖子 */}
                    <div className="flex items-center mb-2">
                      <span className="text-xs mr-1">{category.icon}</span>
                      <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                        {category.name}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.content}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{post.profiles.username || '匿名用户'}</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
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