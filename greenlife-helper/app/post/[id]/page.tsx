'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Leaf, Heart, MessageCircle, Bookmark, Share, Calendar, User, Trash2 } from 'lucide-react'
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
  user_id: string
  categories: {
    name: string
  }
  profiles: {
    username: string | null
    avatar_url: string | null
  }
}

type Comment = {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: {
    username: string | null
    avatar_url: string | null
  }
}

// 热门分类数据，与探索页面保持一致
const categories = [
  { id: '1', name: '减塑技巧', description: '减少塑料使用的实用方法', icon: '🔄' },
  { id: '2', name: '节能妙招', description: '家庭节能的有效策略', icon: '⚡' },
  { id: '3', name: '旧物改造', description: '创意改造废旧物品', icon: '♻️' },
  { id: '4', name: '低碳美食', description: '环保健康的饮食选择', icon: '🥗' },
  { id: '5', name: '绿色出行', description: '环保的交通方式', icon: '🚲' },
]

const getCategoryById = (id: string) => categories.find(c => c.id === id)

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [user, setUser] = useState<any>(null)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [commenting, setCommenting] = useState(false)
  const [deletingComment, setDeletingComment] = useState<string | null>(null)

  useEffect(() => {
    if (postId) {
      getCurrentUser()
      fetchPost()
      fetchComments()
      checkLikeStatus()
      checkBookmarkStatus()
    }
  }, [postId])

  // 监听全局刷新事件
  useEffect(() => {
    const handleGlobalRefresh = (event: CustomEvent) => {
      const { type, data } = event.detail
      
      if (type === 'commentDeleted' && data?.postId === postId) {
        fetchComments()
      }
      
      if (type === 'postDeleted') {
        // 如果当前帖子被删除，可能需要重定向到首页
        window.location.href = '/'
      }
    }

    window.addEventListener('appRefresh', handleGlobalRefresh as EventListener)

    return () => {
      window.removeEventListener('appRefresh', handleGlobalRefresh as EventListener)
    }
  }, [postId])

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const handleDeletePost = async () => {
    if (!user || post?.user_id !== user.id) return
    
    if (!confirm('确定要删除这个帖子吗？此操作无法撤销。')) {
      return
    }

    try {
      // 首先删除相关的评论
      await supabase
        .from('comments')
        .delete()
        .eq('post_id', postId)

      // 然后删除点赞记录
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)

      // 然后删除收藏记录
      await supabase
        .from('bookmarks')
        .delete()
        .eq('post_id', postId)

      // 最后删除帖子
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) throw error

      // 触发全局刷新事件
      const event = new CustomEvent('appRefresh', {
        detail: { type: 'postDeleted' }
      })
      window.dispatchEvent(event)

      // 重定向到首页
      router.push('/')
    } catch (error) {
      console.error('删除帖子失败:', error)
      alert('删除帖子失败，请重试')
    }
  }

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        categories (name),
        profiles (username, avatar_url)
      `)
      .eq('id', postId)
      .single()

    if (error) {
      console.error('Error fetching post:', error)
      return
    }

    setPost(data)
    setLoading(false)

    // 增加浏览量
    await supabase
      .from('posts')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', postId)
  }

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (username, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setComments(data)
    }
  }

  const checkLikeStatus = async () => {
    if (!user) return

    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    setLiked(!!data)
  }

  const checkBookmarkStatus = async () => {
    if (!user) return

    const { data } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    setBookmarked(!!data)
  }

  const handleLike = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (liked) {
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
      setLiked(false)
    } else {
      await supabase
        .from('likes')
        .insert({
          post_id: postId,
          user_id: user.id,
        })
      setLiked(true)
    }
  }

  const handleBookmark = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (bookmarked) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
      setBookmarked(false)
    } else {
      await supabase
        .from('bookmarks')
        .insert({
          post_id: postId,
          user_id: user.id,
        })
      setBookmarked(true)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setCommenting(true)

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim(),
        })

      if (error) throw error

      setNewComment('')
      await fetchComments()
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setCommenting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('确定要删除这条评论吗？此操作无法撤销。')) {
      return
    }

    setDeletingComment(commentId)

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      // 重新加载评论列表
      await fetchComments()
      
      // 触发全局刷新事件，通知其他页面
      const event = new CustomEvent('appRefresh', {
        detail: { 
          type: 'commentDeleted',
          data: { postId: postId }
        }
      })
      window.dispatchEvent(event)
      
      // 显示成功消息
      alert('评论删除成功')
    } catch (error) {
      console.error('删除评论失败:', error)
      alert('删除评论失败，请重试')
    } finally {
      setDeletingComment(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">帖子不存在</h2>
          <Link href="/" className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* 头部 */}
      <header className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <Leaf className="h-6 w-6" />
              <h1 className="text-xl font-bold">绿色生活助手</h1>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="hover:text-green-200 transition-colors">
                首页
              </Link>
              <Link href="/explore" className="hover:text-green-200 transition-colors">
                探索
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

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 帖子内容 */}
          <article className="bg-white rounded-lg shadow-md mb-8">
            {post.image_url && (
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-t-lg"
              />
            )}
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                {post.category_id && (() => {
                  const category = getCategoryById(post.category_id);
                  return (
                    <Link 
                      href={`/category/${post.category_id}`} 
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center hover:bg-green-200 transition-colors"
                    >
                      <span className="mr-1">{category?.icon || '🌱'}</span>
                      {category?.name || post.categories?.name}
                    </Link>
                  );
                })()}
                <div className="text-gray-500 text-sm flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(post.created_at).toLocaleDateString()}
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
              
              <div className="flex items-center mb-6 text-gray-600">
                <div className="flex items-center mr-4">
                  <User className="h-5 w-5 mr-2" />
                  <span>{post.profiles?.username || '匿名用户'}</span>
                </div>
                <div className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  <span>{post.like_count} 点赞</span>
                </div>
              </div>

              <div className="prose max-w-none mb-6">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{post.content}</p>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex space-x-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                      liked 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                    <span>{liked ? '已点赞' : '点赞'}</span>
                  </button>
                  
                  <button
                    onClick={handleBookmark}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                      bookmarked 
                        ? 'bg-yellow-100 text-yellow-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Bookmark className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
                    <span>{bookmarked ? '已收藏' : '收藏'}</span>
                  </button>
                </div>

                <div className="flex space-x-4">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                    <Share className="h-5 w-5" />
                    <span>分享</span>
                  </button>
                  
                  {/* 删除按钮（仅帖子作者可见） */}
                  {user && user.id && post?.user_id === user.id && (
                    <button 
                      onClick={handleDeletePost}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span>删除</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </article>

          {/* 评论区域 */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                评论 ({comments.length})
              </h3>
            </div>

            {/* 评论表单 */}
            {user ? (
              <div className="p-6 border-b">
                <form onSubmit={handleAddComment}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="写下您的评论..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      disabled={!newComment.trim() || commenting}
                      className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      {commenting ? '发布中...' : '发布评论'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-6 border-b text-center">
                <p className="text-gray-600 mb-4">请登录后发表评论</p>
                <Link href="/auth/login" className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  立即登录
                </Link>
              </div>
            )}

            {/* 评论列表 */}
            <div className="p-6">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>还没有评论，快来抢沙发吧～</p>
                </div>
                ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-4 relative group">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        {comment.profiles?.avatar_url ? (
                          <img 
                            src={comment.profiles.avatar_url} 
                            alt="头像" 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium">{comment.profiles?.username || '匿名用户'}</span>
                          <span className="text-gray-500 text-sm">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                      
                      {/* 删除按钮（仅评论作者可见） */}
                      {user && user.id && comment.user_id === user.id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deletingComment === comment.id}
                          className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          title="删除评论"
                        >
                          {deletingComment === comment.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}