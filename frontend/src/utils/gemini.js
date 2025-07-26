// src/utils/gemini.js
// Utility to call Gemini API from frontend (for dev/demo only)

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY;

export async function getGeminiCategories({ userData, dashboardData }) {
  const prompt = `You are a financial AI assistant.\n\nHere is the user's onboarding profile: ${JSON.stringify(userData)}\n\nHere is the user's dashboard data (net worth, savings, investments, etc.): ${JSON.stringify(dashboardData)}\n\nInstructions:\n1. Analyze what financial goals the user has.\n2. Based on the dashboard data, how much progress has the user made toward these goals?\n3. Give clear, actionable AI suggestions for how the user can improve their financial life.\n4. Point out what has gone wrong or is risky in their current financial situation.\n5. List things the user should avoid doing at all costs.\n\nRespond in a friendly, structured, and concise way. Use bullet points or sections for clarity.`;

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}
