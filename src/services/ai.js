import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

function getModel() {
  if (!API_KEY) {
    console.warn("Gemini API key not configured. AI features will use fallback mode.");
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }
  return model;
}

// ═══ DOCUMENT ANALYSIS ═══

/**
 * Analyze a medical document (PDF or image) using Gemini Vision.
 * Returns structured analysis with extracted data.
 */
export async function analyzeDocument(file, documentType) {
  const ai = getModel();
  if (!ai) return getFallbackAnalysis(documentType);

  try {
    const base64 = await fileToBase64(file);
    const mimeType = file.type;

    const prompt = `You are Laidy, the AI health assistant for Ledora AI. You are analyzing a medical document for the user.
Analyze this ${documentType || "medical"} document and extract key information.

Return a JSON object with this exact structure:
{
  "summary": "Brief 1-2 sentence summary of what this document is",
  "type": "The document type (Lab Results, X-Ray, MRI, Report, Prescription, etc.)",
  "date": "Date found on document or null",
  "keyFindings": ["Array of key findings or values extracted"],
  "labValues": [
    {"name": "Test name", "value": "Numeric value", "unit": "Unit", "status": "normal|low|high", "reference": "Reference range if shown"}
  ],
  "recommendations": ["Any recommendations or notes from the doctor"],
  "urgency": "low|medium|high based on findings"
}

If you cannot read the document clearly, still provide what you can extract.
Only return the JSON, no markdown or explanation.`;

    const result = await ai.generateContent([
      prompt,
      {
        inlineData: {
          data: base64,
          mimeType: mimeType,
        },
      },
    ]);

    const text = result.response.text();
    // Clean JSON from possible markdown code blocks
    const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI document analysis failed:", error);
    return getFallbackAnalysis(documentType);
  }
}

function getFallbackAnalysis(documentType) {
  return {
    summary: `${documentType || "Medical"} document uploaded successfully. AI analysis requires API configuration.`,
    type: documentType || "Document",
    date: null,
    keyFindings: ["Document uploaded — manual review recommended"],
    labValues: [],
    recommendations: [],
    urgency: "low",
  };
}

// ═══ AI CHAT ═══

/**
 * Send a message to the AI health assistant with user context.
 * Returns the AI response as a string.
 */
export async function chatWithAI(message, userContext) {
  const ai = getModel();
  if (!ai) return getFallbackChatResponse(message);

  try {
    const systemPrompt = `You are Laidy, the intelligent health assistant powering Ledora AI.
Your name is Laidy — the next generation of health intelligence, helping users navigate their health data across generations.
Your tagline is "Your health, across generations."

YOUR PERSONALITY:
- You are warm, empathetic, and encouraging
- You speak as a knowledgeable health companion, not a cold robot
- You celebrate progress ("Great job keeping up with your checkups!")
- You gently remind users about missing data ("I noticed you haven't uploaded recent lab results — would you like to do that now?")
- You proactively suggest next steps
- You use the user's first name when available
- Keep responses concise but caring (under 200 words)

IMPORTANT RULES:
- Always end responses with: "⚠️ *This is informational only. Always consult your doctor.*"
- If the user shares lab results or health data, analyze trends and explain clearly
- If asking about family/hereditary risks, provide evidence-based insights
- Respond in the same language the user writes in
- When you have user context, reference their specific data (e.g., "Your iron levels have been declining...")

USER HEALTH CONTEXT:
${userContext ? JSON.stringify(userContext, null, 2) : "No health data available yet."}

USER MESSAGE: ${message}`;

    const result = await ai.generateContent(systemPrompt);
    return result.response.text();
  } catch (error) {
    console.error("AI chat failed:", error);
    return getFallbackChatResponse(message);
  }
}

function getFallbackChatResponse(message) {
  return `I received your question about "${message}".

To provide personalized health insights, the AI assistant needs to be configured with an API key.

In the meantime, I recommend:
• Consulting with your healthcare provider
• Keeping your health records up to date in the app
• Uploading your latest lab results for tracking

⚠️ *This is informational only. Always consult your doctor.*`;
}

// ═══ HELPERS ═══

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Remove data URL prefix to get raw base64
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Check if AI features are available (API key configured)
 */
export function isAIAvailable() {
  return !!API_KEY;
}
