export const sendToGemini = async (prompt, isJsonMode = false) => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured. Check your .env file.')
  
  try {
    const res = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Healthcare-Aether-Vitalis"
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 0.9
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`API Error (${res.status}): ${errorData?.error?.message || 'Unknown error'}`);
    }

    const data = await res.json();

    if (data.error) {
      throw new Error(`OpenRouter error: ${data.error.message}`);
    }

    return data?.choices?.[0]?.message?.content || "No response from API";
  } catch (error) {
    console.error('OpenRouter API call failed:', error);
    throw error;
  }
};
