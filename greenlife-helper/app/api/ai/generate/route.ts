import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.DEEPSEEK_API_KEY
      if (!apiKey || apiKey.trim() === '') {
        // 当API密钥未配置或为空时，返回一个友好的默认响应
        return NextResponse.json({
          response: '感谢您的提问！作为环保助手，我很乐意为您提供一些基础环保建议。\n\n1. 减少塑料使用：携带可重复使用的购物袋、水瓶和餐具\n2. 节约能源：关闭不使用的电器，使用节能灯泡\n3. 绿色出行：尽量选择步行、骑行或公共交通\n4. 垃圾分类：正确分类垃圾以提高回收利用率\n5. 节约用水：修复漏水设施，缩短淋浴时间\n\n如需更详细的环保建议，请提供具体问题，我会尽力帮助您！',
          success: true
        })
      }

    // 优化prompt，增加环保相关的上下文
    const enhancedPrompt = `你是一个环保专家和内容创作助手。请用中文回答以下问题或完成以下任务。

用户输入：${prompt}

请以环保专家的角度，提供专业、实用、积极向上的回答。如果用户需要创作内容，请创作一篇结构完整、有吸引力的环保文章或帖子。`

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的环保专家，擅长创作环保内容、解答环保问题、提供可持续生活建议。请用中文回答，保持专业、实用、积极向上的风格。'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('DeepSeek API error:', response.status, errorData)
      return NextResponse.json(
        { error: 'AI service temporarily unavailable' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'No response from AI service' },
        { status: 500 }
      )
    }

    // 返回格式化后的响应
    return NextResponse.json({ 
      response: aiResponse,
      success: true 
    })

  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}