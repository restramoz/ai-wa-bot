// services/ollama.js
const { Ollama } = require("ollama")

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || "https://ollama.com",
  headers: {
    "Authorization": `Bearer ${process.env.OLLAMA_API_KEY}`
  }
})

const MODEL = process.env.OLLAMA_MODEL
async function generateAIResponse(systemPrompt, userMessage, options = {}) {
  try {
    const response = await ollama.chat({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      options: {
        temperature: 0.6,
      },
      stream: false
    })

    return response.message?.content?.trim() || "Maaf, saya tidak bisa memproses permintaan ini."

  } catch (error) {
    console.error("❌ Ollama Cloud Error:", error.message)
    if (error.response?.status === 401) {
      return "❌ API Key tidak valid. Periksa OLLAMA_API_KEY."
    }
    return "Mohon maaf Kak, sistem sedang sibuk. Bisa coba kirim ulang? 🙏"
  }
}

async function checkModelHealth() {
  try {
    await ollama.chat({
      model: MODEL,
      messages: [{ role: "user", content: "test" }],
      stream: false
    })
    return { ok: true, model: MODEL }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

module.exports = { generateAIResponse, checkModelHealth, MODEL }