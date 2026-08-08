import { GoogleGenerativeAI } from '@google/generative-ai'

const MEDICAL_DISCLAIMER =
  'This is AI-generated information for educational purposes only. It does not replace professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.'

function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })
}

export async function chatWithMedicalAssistant(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[] = [],
  context?: { recordCount?: number; recentTypes?: string[] }
): Promise<string> {
  const model = getGeminiModel()
  if (!model) {
    return `AI assistant is unavailable (GEMINI_API_KEY not configured).\n\n${MEDICAL_DISCLAIMER}`
  }

  const contextBlock = context
    ? `\nPatient vault context: ${context.recordCount ?? 0} records stored. Recent types: ${context.recentTypes?.join(', ') || 'none'}.`
    : ''

  const systemPrompt = `You are VaultMedics AI Medical Assistant — a helpful, empathetic health literacy companion.
Your role is to:
- Explain medical terminology in plain language
- Summarize and clarify medical concepts
- Suggest questions to ask doctors at appointments
- Highlight when lab values might be abnormal (with caveats)
- Provide general health education

You must NEVER:
- Diagnose conditions
- Prescribe medications or treatments
- Replace a doctor's judgment

Always be warm, clear, and cautious. Use bullet points when helpful.${contextBlock}`

  const conversationHistory = history
    .slice(-8)
    .map((m) => `${m.role === 'user' ? 'Patient' : 'Assistant'}: ${m.content}`)
    .join('\n')

  const fullPrompt = `${systemPrompt}

Previous conversation:
${conversationHistory || '(New conversation)'}

Patient: ${message}

Assistant (include practical guidance, end with the disclaimer):`

  try {
    const result = await model.generateContent(fullPrompt)
    const text = result.response.text()
    if (!text.includes('consult') && !text.includes('healthcare provider')) {
      return `${text.trim()}\n\n---\n${MEDICAL_DISCLAIMER}`
    }
    return text.trim()
  } catch (error) {
    console.error('[VaultMedics] Chat error:', error)
    return `I'm having trouble responding right now. Please try again.\n\n${MEDICAL_DISCLAIMER}`
  }
}
