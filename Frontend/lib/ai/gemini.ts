import { GoogleGenerativeAI } from '@google/generative-ai'

function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return null
  }
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
  })
}

export async function generateMedicalSummary(recordContent: string): Promise<{
  summary: string
  keyFindings: string
  recommendations: string
}> {
  const model = getGeminiModel()
  if (!model) {
    return {
      summary: 'AI summarization is unavailable because GEMINI_API_KEY is not configured.',
      keyFindings: '• Medical record uploaded successfully\n• Configure GEMINI_API_KEY to enable automated analysis',
      recommendations: '• Consult with your healthcare provider for detailed interpretation',
    }
  }

  const prompt = `You are a medical record analyst. Analyze the following medical record and provide:
1. A concise summary (2-3 sentences)
2. Key findings (bullet points)
3. Health recommendations (bullet points)

Medical Record:
${recordContent}

Format your response as JSON with keys: summary, keyFindings (array), recommendations (array)`

  try {
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse JSON response from Gemini')
    }

    const parsed = JSON.parse(jsonMatch[0])

    return {
      summary: parsed.summary || 'Unable to generate summary',
      keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings.join('\n') : String(parsed.keyFindings || ''),
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.join('\n') : String(parsed.recommendations || ''),
    }
  } catch (error) {
    console.error('[MediVault] Gemini API error:', error)
    return {
      summary: 'Summary generation encountered an error. Please try again later.',
      keyFindings: '• Record registered in vault\n• Summary temporarily unavailable',
      recommendations: '• Share this record directly with your clinician during your next visit',
    }
  }
}

export async function analyzeMedicalImage(imageUrl: string): Promise<string> {
  const model = getGeminiModel()
  if (!model) {
    return 'Image analysis unavailable: GEMINI_API_KEY environment variable is not set.'
  }

  const prompt = `Analyze this medical image and provide a detailed description of what you see. Include any visible findings or areas of concern.`

  try {
    const response = await fetch(imageUrl)
    const arrayBuffer = await response.arrayBuffer()
    const base64Data = Buffer.from(new Uint8Array(arrayBuffer)).toString('base64')

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data,
        },
      },
    ])

    return result.response.text()
  } catch (error) {
    console.error('[MediVault] Gemini image analysis error:', error)
    return 'Unable to analyze image at this time.'
  }
}
