'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SeedDataPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const seedCategories = async () => {
    setLoading(true)
    setMessage('正在添加分类数据...')
    
    const categories = [
      { id: '1', name: '减塑技巧', description: '学习如何减少塑料使用，保护地球' },
      { id: '2', name: '节能妙招', description: '节能环保的生活小技巧' },
      { id: '3', name: '旧物改造', description: '创意改造旧物，变废为宝' },
      { id: '4', name: '低碳美食', description: '环保健康的饮食方案' },
      { id: '5', name: '绿色出行', description: '环保出行方式推荐' }
    ]

    try {
      for (const category of categories) {
        const { error } = await supabase
          .from('categories')
          .upsert(category)
        
        if (error) {
          console.error('添加分类错误:', error)
        }
      }
      setMessage('分类数据添加完成！')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      setMessage('添加分类数据失败: ' + errorMessage)
    }
    setLoading(false)
  }

  const seedPosts = async () => {
    setLoading(true)
    setMessage('正在添加帖子数据...')
    
    // 创建一个演示用户ID
    const demoUserId = 'demo-user-123'
    
    const posts = [
      {
        id: 'post-1',
        user_id: demoUserId,
        title: '5个简单实用的减塑小技巧',
        content: '1. 使用可重复使用的购物袋\n2. 拒绝一次性塑料吸管\n3. 选择玻璃或不锈钢水瓶\n4. 购买散装食品减少包装\n5. 使用可重复使用的餐具',
        category_id: '1',
        like_count: 15,
        image_url: null
      },
      {
        id: 'post-2',
        user_id: demoUserId,
        title: '家庭节能实用指南',
        content: '1. 使用LED节能灯泡\n2. 合理设置空调温度\n3. 及时关闭待机电器\n4. 选择节能家电\n5. 善用自然光照',
        category_id: '2',
        like_count: 23,
        image_url: null
      },
      {
        id: 'post-3',
        user_id: demoUserId,
        title: '旧T恤改造创意',
        content: '将旧T恤改造成布包、杯垫、宠物玩具等实用的物品，既环保又有创意！',
        category_id: '3',
        like_count: 8,
        image_url: null
      },
      {
        id: 'post-4',
        user_id: demoUserId,
        title: '素食低碳食谱分享',
        content: '尝试植物性饮食，减少碳足迹。推荐美味又环保的素食菜谱。',
        category_id: '4',
        like_count: 12,
        image_url: null
      },
      {
        id: 'post-5',
        user_id: demoUserId,
        title: '城市骑行指南',
        content: '选择自行车出行，既锻炼身体又保护环境。推荐几条优美的骑行路线。',
        category_id: '5',
        like_count: 18,
        image_url: null
      }
    ]

    try {
      for (const post of posts) {
        const { error } = await supabase
          .from('posts')
          .upsert(post)
        
        if (error) {
          console.error('添加帖子错误:', error)
        }
      }
      setMessage('帖子数据添加完成！')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      setMessage('添加帖子数据失败: ' + errorMessage)
    }
    setLoading(false)
  }

  const seedDemoUser = async () => {
    setLoading(true)
    setMessage('正在添加演示用户...')
    
    const demoUser = {
      id: 'demo-user-123',
      username: '环保小助手',
      avatar_url: null,
      updated_at: new Date().toISOString()
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert(demoUser)
      
      if (error) {
        console.error('添加用户错误:', error)
      }
      setMessage('演示用户添加完成！')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      setMessage('添加用户数据失败: ' + errorMessage)
    }
    setLoading(false)
  }

  const seedAllData = async () => {
    setLoading(true)
    setMessage('正在添加所有示例数据...')
    
    try {
      await seedDemoUser()
      await new Promise(resolve => setTimeout(resolve, 1000))
      await seedCategories()
      await new Promise(resolve => setTimeout(resolve, 1000))
      await seedPosts()
      setMessage('所有示例数据添加完成！')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      setMessage('添加数据失败: ' + errorMessage)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">数据初始化工具</h1>
        
        <div className="space-y-4">
          <button
            onClick={seedDemoUser}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            添加演示用户
          </button>
          
          <button
            onClick={seedCategories}
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            添加分类数据
          </button>
          
          <button
            onClick={seedPosts}
            disabled={loading}
            className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 disabled:bg-gray-400"
          >
            添加帖子数据
          </button>
          
          <button
            onClick={seedAllData}
            disabled={loading}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:bg-gray-400"
          >
            一键添加所有数据
          </button>
        </div>
        
        {message && (
          <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded">
            <p className="text-blue-800">{message}</p>
          </div>
        )}
        
        {loading && (
          <div className="mt-4 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  )
}