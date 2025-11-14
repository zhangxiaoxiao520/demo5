'use client';

import { useState } from 'react';

// 预定义的8个分类
const PREDEFINED_CATEGORIES = [
  { id: '1', name: '减塑技巧', icon: '♻️' },
  { id: '2', name: '节能妙招', icon: '💡' },
  { id: '3', name: '旧物改造', icon: '🔨' },
  { id: '4', name: '低碳饮食', icon: '🥗' },
  { id: '5', name: '绿色出行', icon: '🚲' },
  { id: '6', name: '垃圾分类', icon: '🗑️' },
  { id: '7', name: '生态种植', icon: '🌱' },
  { id: '8', name: '环保购物', icon: '🛒' },
];

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setLoading(true);
    
    // 模拟数据加载
    setTimeout(() => {
      const selectedCat = PREDEFINED_CATEGORIES.find(c => c.id === categoryId);
      const mockPosts = Array.from({ length: 3 }, (_, i) => ({
        id: `${categoryId}-${i + 1}`,
        title: `${selectedCat?.name} 相关内容 ${i + 1}`,
        content: `这是一篇关于${selectedCat?.name}的环保知识分享。`
      }));
      setPosts(mockPosts);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-center my-6">绿色生活助手 - 分类浏览</h1>
        
        {/* 分类选择 */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-bold mb-4 text-center">热门分类</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PREDEFINED_CATEGORIES.slice(0, 8).map(category => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`p-4 rounded-lg text-center transition-all hover:shadow-md ${selectedCategory === category.id ? 'bg-green-100 border-2 border-green-500' : 'bg-white border border-gray-200'}`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="text-sm font-medium">{category.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 选中的分类内容 */}
        {selectedCategory && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                {PREDEFINED_CATEGORIES.find(c => c.id === selectedCategory)?.name} 相关内容
              </h3>
              <button 
                onClick={() => {
                  setSelectedCategory(null);
                  setPosts([]);
                }}
                className="text-sm text-green-600 hover:underline"
              >
                清除选择
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <div key={post.id} className="p-4 border border-gray-100 rounded">
                    <h4 className="font-bold mb-1">{post.title}</h4>
                    <p className="text-gray-600 text-sm">{post.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}