// DeepSeek AI API 集成
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1'
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface DeepSeekResponse {
  choices: Array<{
    message: {
      role: string
      content: string
    }
  }>
}

// AI 创作助手
export async function generateContentPrompt(userInput: string): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key not configured')
  }

  const messages: DeepSeekMessage[] = [
    {
      role: 'system',
      content: `你是一个环保内容创作助手，帮助用户生成关于可持续生活方式的优质内容。
      请根据用户输入，提供内容创作的灵感、结构建议和关键要点。
      响应内容应该专业、实用、易于理解，突出环保价值和具体行动建议。`
    },
    {
      role: 'user',
      content: `我需要创作关于以下主题的环保内容：${userInput}`
    }
  ]

  try {
    const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data: DeepSeekResponse = await response.json()
    return data.choices[0]?.message?.content || '无法生成内容建议'
  } catch (error) {
    console.error('DeepSeek API error:', error)
    throw new Error('生成内容时发生错误')
  }
}

// AI 环保计算器
export async function calculateEcoImpact(description: string): Promise<{
  carbonReduction: number
  waterSaved: number
  wasteReduced: number
  explanation: string
}> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key not configured')
  }

  const messages: DeepSeekMessage[] = [
    {
      role: 'system',
      content: `你是一个环保影响计算专家。请根据用户描述的行为，估算以下环保指标：
      1. 碳减排量（kg CO2e）
      2. 节约水量（升）
      3. 减少垃圾量（kg）
      
      请基于科学数据提供合理的估算，并给出简要解释。
      响应格式必须是JSON：{"carbonReduction": 数字, "waterSaved": 数字, "wasteReduced": 数字, "explanation": "解释文本"}`
    },
    {
      role: 'user',
      content: `估算以下行为的环保影响：${description}`
    }
  ]

  try {
    const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        max_tokens: 500,
        temperature: 0.3
      })
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data: DeepSeekResponse = await response.json()
    const content = data.choices[0]?.message?.content
    
    try {
      return JSON.parse(content)
    } catch {
      return {
        carbonReduction: 0,
        waterSaved: 0,
        wasteReduced: 0,
        explanation: '无法计算环保影响'
      }
    }
  } catch (error) {
    console.error('DeepSeek API error:', error)
    throw new Error('计算环保影响时发生错误')
  }
}