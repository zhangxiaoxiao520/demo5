'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function CreatePage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [image, setImage] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      
      if (user) {
        setUser(user)
      } else {
        // 要求用户必须先登录
        router.push('/auth/login')
        return
      }
    } catch (error) {
      console.error('获取用户失败:', error)
      router.push('/auth/login')
    }
  }

  // 热门分类显示数据
  const categories = [
    { name: '垃圾分类', icon: '🗑️' },
    { name: '家庭园艺', icon: '🌱' },
    { name: '废物利用', icon: '♻️' },
    { name: '废物回收', icon: '📦' },
    { name: '环保家居', icon: '🏠' },
    { name: '环保知识', icon: '📚' },
    { name: '环保饮食', icon: '🥗' },
    { name: '社区参与', icon: '👥' },
    { name: '社区活动', icon: '🎉' },
    { name: '绿色出行', icon: '🚲' },
    { name: '绿色消费', icon: '🛍️' },
    { name: '绿色科技', icon: '💡' },
    { name: '自然保护', icon: '🌿' },
    { name: '节能减排', icon: '⚡' },
    { name: '节能节水', icon: '💧' }
  ]

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
  }

  // 处理图片选择
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  // 清除图片
  const clearImage = () => {
    setImage(null)
    setPreviewImage('')
    const input = document.getElementById('image') as HTMLInputElement
    if (input) input.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (!title.trim() || !content.trim() || !category) {
      alert('请填写完整信息')
      return
    }

    setLoading(true)

    try {
      // 确保用户已登录
      if (!user.id) {
        alert('请先登录账号')
        router.push('/auth/login')
        return
      }

      // 检查数据库中是否有用户资料
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        // 创建用户资料
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.email?.split('@')[0] || 'user'
          })

        if (profileError) {
          console.error('创建用户资料失败:', profileError)
          throw new Error('创建用户资料失败')
        }
      }

      // 确保分类存在
      let categoryId: string
      
      // 检查分类是否已存在
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category)
        .single()
      
      if (existingCategory) {
        categoryId = existingCategory.id
      } else {
        // 如果分类不存在，创建新的分类
        const { data: newCategory, error: categoryError } = await supabase
          .from('categories')
          .insert({ name: category })
          .select()
          .single()
        
        if (categoryError) {
          console.error('创建分类失败:', categoryError)
          throw new Error('分类创建失败，请选择其他分类')
        }
        
        if (!newCategory) {
          throw new Error('分类创建失败')
        }
        
        categoryId = newCategory.id
      }

      // 确定图片URL - 如果用户未上传图片，则使用分类默认图片
      let imageUrl = ''
      
      if (image) {
        // 这里将来可以添加图片上传逻辑，目前先使用占位符
        // 实际项目中应该上传图片到存储服务并获取URL
        imageUrl = `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/800/400`
      } else {
        // 获取分类默认图片
        imageUrl = categoryDefaultImages[category] || `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/800/400`
      }

      // 创建帖子（保存到Supabase）
      const { data: newPost, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          title: title.trim(),
          content: content.trim(),
          category_id: categoryId,
          image_url: imageUrl,
          is_published: true
        })
        .select()
        .single()

      if (postError) {
        console.error('创建帖子失败:', postError)
        throw new Error('发布失败：' + postError.message)
      }

      alert('发布成功！数据已保存到Supabase数据库。')
      router.push(`/post/${newPost.id}`)
      
    } catch (error) {
      console.error('发布错误:', error)
      alert(error instanceof Error ? error.message : '发布失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
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
      <header className="bg-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <span className="text-2xl">🌱</span>
              <h1 className="text-xl font-bold">绿色生活助手</h1>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="hover:text-green-200 transition-colors">
                首页
              </Link>
              <Link href="/explore" className="hover:text-green-200 transition-colors">
                探索
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

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-3">
              分享环保心得
            </h1>
            <p className="text-lg text-gray-600">
              分享您的可持续生活方式，让更多人加入环保行动
            </p>
          </div>

          {/* 创建表单 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 标题 */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  标题 *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="请输入一个吸引人的环保主题标题..."
                  required
                />
              </div>

              {/* 分类 */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                  分类 *
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  required
                >
                  <option value="">请选择分类</option>
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      <span className="mr-2">{cat.icon}</span>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 图片上传 */}
              <div>
                <label htmlFor="image" className="block text-sm font-semibold text-gray-700 mb-2">
                  图片（可选，未上传将使用分类默认图片）
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                  {previewImage ? (
                    <div className="relative">
                      <img 
                        src={previewImage} 
                        alt="预览" 
                        className="max-h-48 object-cover rounded-lg mx-auto"
                      />
                      <button 
                        type="button" 
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-white text-red-500 rounded-full p-1 hover:bg-red-50 transition-colors"
                      >
                        ✕
                      </button>
                      <input 
                        id="image"
                        type="file" 
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <button 
                        type="button" 
                        onClick={() => document.getElementById('image')?.click()}
                        className="mt-3 bg-green-100 text-green-700 py-1 px-3 rounded text-sm hover:bg-green-200 transition-colors"
                      >
                        更换图片
                      </button>
                    </div>
                  ) : (
                    <>
                      <input 
                        id="image"
                        type="file" 
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <button 
                        type="button" 
                        onClick={() => document.getElementById('image')?.click()}
                        className="w-full py-4 bg-green-50 text-green-700 rounded-lg border border-dashed border-green-200 hover:bg-green-100 transition-colors"
                      >
                        <span className="text-xl mb-2 block">📷</span>
                        <span>点击上传图片或拖拽图片到此处</span>
                        <span className="text-xs text-gray-500 block mt-1">支持 JPG、PNG 格式，最大 10MB</span>
                      </button>
                      <p className="mt-3 text-sm text-gray-500">
                        提示：未上传图片时，将自动使用对应分类的默认配图
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* 内容 */}
              <div>
                <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
                  内容 *
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
                  placeholder="详细描述您的环保心得、技巧或经验分享..."
                  required
                />
                <div className="text-sm text-gray-500 mt-1">
                  已输入 {content.length} 个字符
                </div>
              </div>

              {/* 提示信息 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-blue-500 mr-2">💡</span>
                  <p className="text-blue-800 text-sm">
                    分享真实的环保经验更容易获得关注和共鸣！
                  </p>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-4 pt-4">
                <Link 
                  href="/" 
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
                >
                  取消
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      发布中...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">📝</span>
                      发布帖子
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* 页面底部提示 */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>需要更多帮助？试试我们的 <Link href="/ai-assistant" className="text-green-600 hover:underline">AI环保助手</Link></p>
          </div>
        </div>
      </main>
    </div>
  )
}