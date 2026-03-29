import { sendToGemini } from './gemini.js'

export async function invokeLLM({ prompt, response_json_schema }) {
  try {
    const isJsonMode = !!response_json_schema
    
    const fullPrompt = response_json_schema
      ? prompt +
        '\n\nIMPORTANT: Respond ONLY with a valid JSON object. No markdown, no code blocks. Just pure JSON matching this structure:\n' +
        JSON.stringify(response_json_schema, null, 2)
      : prompt

    // Call OpenRouter API directly from frontend
    const reply = await sendToGemini(fullPrompt, isJsonMode)

    if (response_json_schema) {
      try {
        const parsed = JSON.parse(reply)
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed
        }
        return { summary: 'Invalid JSON from model', error: true }
      } catch (e) {
        return { summary: 'Failed to parse JSON response from LLM', error: true }
      }
    }

    return reply

  } catch (error) {
    console.error('Network error:', error)

    return response_json_schema
      ? {
          summary: 'Cannot connect to OpenRouter. Check your API key.',
          error: true,
        }
      : 'Cannot connect to OpenRouter.'
  }
}
