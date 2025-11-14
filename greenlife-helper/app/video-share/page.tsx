'use client'

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

// 视频类型定义
type Video = {
  id: string;
  title: string;
  description: string;
  video_url: string;
  cover_url: string;
  user: {
    id: string;
    username: string;
    avatar_url: string;
    bio: string;
    followers: number;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  tags: string[];
  duration: string;
  created_at: string;
};

// 模拟视频数据
const mockVideos: Video[] = [
  {
    id: '1',
    title: '环保小贴士：如何正确分类垃圾',
    description: '学习垃圾分类的基本技巧，让我们一起为环保贡献力量！#环保 #垃圾分类 #可持续生活',
    video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    cover_url: 'https://picsum.photos/id/1015/800/1600',
    user: {
      id: '101',
      username: '绿色达人',
      avatar_url: 'https://picsum.photos/id/1005/100/100',
      bio: '环保博主 | 分享可持续生活技巧',
      followers: 12500
    },
    stats: {
      likes: 1254,
      comments: 89,
      shares: 34,
      views: 56000
    },
    tags: ['环保', '垃圾分类', '可持续生活'],
    duration: '2:30',
    created_at: '2024-01-15'
  },
  {
    id: '2',
    title: '自制天然清洁剂，安全又环保',
    description: '教你用简单的食材制作高效的天然清洁剂，远离化学物质！#环保家居 #DIY #天然清洁',
    video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    cover_url: 'https://picsum.photos/id/1025/800/1600',
    user: {
      id: '102',
      username: '环保厨房',
      avatar_url: 'https://picsum.photos/id/1012/100/100',
      bio: '美食博主 | 专注健康环保饮食',
      followers: 8900
    },
    stats: {
      likes: 2345,
      comments: 156,
      shares: 78,
      views: 89000
    },
    tags: ['环保家居', 'DIY', '天然清洁'],
    duration: '3:15',
    created_at: '2024-01-18'
  },
  {
    id: '3',
    title: '阳台小菜园种植指南',
    description: '即使住在城市里，也能拥有自己的小菜园！简单易学的阳台种植技巧分享。#阳台种菜 #家庭园艺 #自给自足',
    video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    cover_url: 'https://picsum.photos/id/1068/800/1600',
    user: {
      id: '103',
      username: '城市农夫',
      avatar_url: 'https://picsum.photos/id/1027/100/100',
      bio: '园艺爱好者 | 城市种植专家',
      followers: 15600
    },
    stats: {
      likes: 3456,
      comments: 234,
      shares: 123,
      views: 120000
    },
    tags: ['阳台种菜', '家庭园艺', '自给自足'],
    duration: '4:20',
    created_at: '2024-01-20'
  }
];

// 侧边栏推荐用户
type RecommendedUser = {
  id: string;
  username: string;
  avatar_url: string;
  isVerified: boolean;
  description: string;
};

const recommendedUsers: RecommendedUser[] = [
  {
    id: '201',
    username: '环保先锋',
    avatar_url: 'https://picsum.photos/id/1011/100/100',
    isVerified: true,
    description: '环保行动倡导者'
  },
  {
    id: '202',
    username: '绿色生活',
    avatar_url: 'https://picsum.photos/id/1013/100/100',
    isVerified: false,
    description: '分享日常环保小技巧'
  },
  {
    id: '203',
    username: '低碳达人',
    avatar_url: 'https://picsum.photos/id/1014/100/100',
    isVerified: true,
    description: '低碳生活实践者'
  }
];

export default function VideoSharePage() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [savedVideos, setSavedVideos] = useState<Set<string>>(new Set());
  const [userIsFollowing, setUserIsFollowing] = useState<Set<string>>(new Set());
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const currentVideo = mockVideos[currentVideoIndex];
  const isLiked = likedVideos.has(currentVideo.id);
  const isSaved = savedVideos.has(currentVideo.id);
  const isFollowing = userIsFollowing.has(currentVideo.user.id);

  // 视频控制
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoLoaded = () => {
    setIsLoading(false);
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // 点赞
  const handleLike = () => {
    const newLikedVideos = new Set(likedVideos);
    if (newLikedVideos.has(currentVideo.id)) {
      newLikedVideos.delete(currentVideo.id);
    } else {
      newLikedVideos.add(currentVideo.id);
    }
    setLikedVideos(newLikedVideos);
  };

  // 收藏
  const handleSave = () => {
    const newSavedVideos = new Set(savedVideos);
    if (newSavedVideos.has(currentVideo.id)) {
      newSavedVideos.delete(currentVideo.id);
    } else {
      newSavedVideos.add(currentVideo.id);
    }
    setSavedVideos(newSavedVideos);
  };

  // 关注
  const handleFollow = () => {
    const newFollowing = new Set(userIsFollowing);
    if (newFollowing.has(currentVideo.user.id)) {
      newFollowing.delete(currentVideo.user.id);
    } else {
      newFollowing.add(currentVideo.user.id);
    }
    setUserIsFollowing(newFollowing);
  };

  // 切换视频
  const goToNextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % mockVideos.length);
    setIsLoading(true);
    setIsPlaying(false);
  };

  const goToPrevVideo = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + mockVideos.length) % mockVideos.length);
    setIsLoading(true);
    setIsPlaying(false);
  };

  // 进度条点击
  const handleProgressClick = (e: React.MouseEvent) => {
    if (videoRef.current && videoRef.current.duration) {
      const progressBar = e.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const duration = videoRef.current.duration;
      
      videoRef.current.currentTime = (clickX / width) * duration;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* 左侧LOGO和导航 */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-emerald-500">小绿书</Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="hover:text-emerald-400 transition-colors">首页</Link>
                <Link href="/explore" className="hover:text-emerald-400 transition-colors">发现</Link>
                <Link href="/following" className="hover:text-emerald-400 transition-colors">关注</Link>
              </nav>
            </div>

            {/* 搜索框 */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="搜索环保内容..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
                <svg className="absolute right-3 top-2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* 右侧用户菜单 */}
            <div className="flex items-center space-x-4">
              <button className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-emerald-600 transition-colors">
                上传视频
              </button>
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 左侧视频播放区域 */}
            <div className="lg:col-span-3">
              <div className="bg-gray-900 rounded-2xl overflow-hidden">
                {/* 视频播放器 */}
                <div className="relative aspect-[9/16] max-h-[80vh] bg-black">
                  <video
                    ref={videoRef}
                    src={currentVideo.video_url}
                    className="w-full h-full object-cover"
                    poster={currentVideo.cover_url}
                    loop
                    muted={isMuted}
                    onLoadedData={handleVideoLoaded}
                    onTimeUpdate={handleTimeUpdate}
                    onClick={togglePlay}
                  />

                  {/* 加载指示器 */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {/* 播放/暂停按钮 */}
                  {!isLoading && !isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button 
                        onClick={togglePlay}
                        className="w-20 h-20 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M8 5v14l11-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* 视频控制条 */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    {/* 进度条 */}
                    <div 
                      className="relative w-full h-1 bg-gray-600 rounded-full mb-4 cursor-pointer"
                      onClick={handleProgressClick}
                    >
                      <div 
                        className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(currentTime / (videoRef.current?.duration || 1)) * 100}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={togglePlay}
                          className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                        >
                          {isPlaying ? (
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <rect x="6" y="4" width="4" height="16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <rect x="14" y="4" width="4" height="16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M8 5v14l11-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>

                        <button 
                          onClick={toggleMute}
                          className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                        >
                          {isMuted ? (
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M16.5 12a4.5 4.5 0 0 1-9 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M9 9v6m6-6v6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>

                        <span className="text-sm text-gray-300">
                          {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / {currentVideo.duration}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={goToPrevVideo}
                          className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>

                        <button 
                          onClick={goToNextVideo}
                          className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 视频信息区域 */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* 用户信息 */}
                      <div className="flex items-center space-x-3 mb-4">
                        <img 
                          src={currentVideo.user.avatar_url} 
                          alt={currentVideo.user.username}
                          className="w-12 h-12 rounded-full border-2 border-emerald-500"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-lg">{currentVideo.user.username}</h3>
                            <span className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-full">认证</span>
                          </div>
                          <p className="text-sm text-gray-400">{currentVideo.user.bio}</p>
                        </div>
                        <button 
                          onClick={handleFollow}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            isFollowing 
                              ? 'bg-gray-700 text-gray-300' 
                              : 'bg-emerald-500 text-white hover:bg-emerald-600'
                          }`}
                        >
                          {isFollowing ? '已关注' : '关注'}
                        </button>
                      </div>

                      {/* 视频标题和描述 */}
                      <h1 className="text-2xl font-bold mb-2">{currentVideo.title}</h1>
                      <p className="text-gray-300 mb-4">{currentVideo.description}</p>

                      {/* 标签 */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {currentVideo.tags.map((tag, index) => (
                          <span key={index} className="bg-gray-800 text-emerald-400 px-3 py-1 rounded-full text-sm">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* 统计数据 */}
                      <div className="flex items-center space-x-6 text-sm text-gray-400">
                        <span>{currentVideo.stats.views.toLocaleString()} 次观看</span>
                        <span>{currentVideo.created_at}</span>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex flex-col items-center space-y-4">
                      <button 
                        onClick={handleLike}
                        className="flex flex-col items-center space-y-1"
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                          isLiked ? 'bg-red-500/20' : 'bg-gray-800 hover:bg-gray-700'
                        }`}>
                          <svg 
                            className={`w-6 h-6 ${isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`} 
                            viewBox="0 0 24 24" 
                            fill={isLiked ? "currentColor" : "none"} 
                            stroke="currentColor"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span className="text-sm">{currentVideo.stats.likes.toLocaleString()}</span>
                      </button>

                      <button 
                        onClick={() => setShowComments(true)}
                        className="flex flex-col items-center space-y-1"
                      >
                        <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span className="text-sm">{currentVideo.stats.comments.toLocaleString()}</span>
                      </button>

                      <button 
                        onClick={handleSave}
                        className="flex flex-col items-center space-y-1"
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                          isSaved ? 'bg-yellow-500/20' : 'bg-gray-800 hover:bg-gray-700'
                        }`}>
                          <svg 
                            className={`w-6 h-6 ${isSaved ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`} 
                            viewBox="0 0 24 24" 
                            fill={isSaved ? "currentColor" : "none"} 
                            stroke="currentColor"
                          >
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span className="text-sm">收藏</span>
                      </button>

                      <button 
                        onClick={() => setShowShare(true)}
                        className="flex flex-col items-center space-y-1"
                      >
                        <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="18" cy="5" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="6" cy="12" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="18" cy="19" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span className="text-sm">{currentVideo.stats.shares.toLocaleString()}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧推荐栏 */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 rounded-2xl p-6 sticky top-24">
                <h3 className="font-bold text-lg mb-4">推荐关注</h3>
                <div className="space-y-4">
                  {recommendedUsers.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3 p-3 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
                      <img 
                        src={user.avatar_url} 
                        alt={user.username}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-1">
                          <span className="font-medium text-sm">{user.username}</span>
                          {user.isVerified && (
                            <svg className="w-3 h-3 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2a8 8 0 0 0-8 8v12l8-5 8 5V10a8 8 0 0 0-8-8z" />
                            </svg>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{user.description}</p>
                      </div>
                      <button className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs hover:bg-emerald-600 transition-colors">
                        关注
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-800">
                  <h4 className="font-medium text-sm mb-3">相关视频</h4>
                  <div className="space-y-3">
                    {mockVideos.filter(v => v.id !== currentVideo.id).slice(0, 3).map((video) => (
                      <div 
                        key={video.id}
                        className="flex space-x-3 p-2 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                        onClick={() => setCurrentVideoIndex(mockVideos.findIndex(v => v.id === video.id))}
                      >
                        <img 
                          src={video.cover_url} 
                          alt={video.title}
                          className="w-16 h-12 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{video.title}</p>
                          <p className="text-xs text-gray-400">{video.user.username}</p>
                          <p className="text-xs text-gray-500">{video.stats.views.toLocaleString()} 次观看</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}