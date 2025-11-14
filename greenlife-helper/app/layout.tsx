import type { Metadata } from 'next'
// import { Inter } from 'next/font/google'
import './globals.css'
import RefreshWrapper from './RefreshWrapper'

// 临时注释掉字体加载，避免证书问题
// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '绿色生活助手 - GreenLife Helper',
  description: '专注于可持续生活方式的社区平台，记录、分享、发现环保生活技巧',
  keywords: '环保,可持续,绿色生活,社区,低碳,环保技巧',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans">
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
          <RefreshWrapper>
            {children}
          </RefreshWrapper>
        </div>
      </body>
    </html>
  )
}