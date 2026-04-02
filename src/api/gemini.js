export const sendToGemini = async (prompt, isJsonMode = false) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY not configured. Check your .env file.')
  
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000,
            topP: 0.9
          }
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`API Error (${res.status}): ${errorData?.error?.message || 'Unknown error'}`);
    }

    const data = await res.json();

    if (data.error) {
      throw new Error(`Gemini API error: ${data.error.message}`);
    }

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from API";
  } catch (error) {
    console.error('Gemini API call failed:', error);
    throw error;
  }
};
