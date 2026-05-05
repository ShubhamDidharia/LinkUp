import { GoogleGenerativeAI } from "@google/generative-ai";

// Retry logic with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`[AI] Attempt ${attempt + 1}/${maxRetries} - Calling Gemini API...`);
      return await fn();
    } catch (error) {
      lastError = error;
      const delay = baseDelay * Math.pow(2, attempt);
      
      console.error(`[AI] Attempt ${attempt + 1} failed:`, {
        message: error.message,
        status: error.status,
        code: error.code,
        statusText: error.statusText,
      });
      
      // Don't retry on last attempt
      if (attempt < maxRetries - 1) {
        console.log(`[AI] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

export const generatePostContent = async (req, res) => {
  try {
    const { description } = req.body;

    console.log("[AI] generatePostContent called with description:", description?.substring(0, 50));

    if (!description || description.trim().length === 0) {
      console.error("[AI] No description provided");
      return res.status(400).json({ error: "Description is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    console.log("[AI] GEMINI_API_KEY exists:", !!apiKey);
    console.log("[AI] API Key starts with:", apiKey?.substring(0, 10) + "...");

    if (!apiKey) {
      console.error("[AI] GEMINI_API_KEY not found in environment variables");
      return res.status(500).json({ error: "AI service not configured - missing API key" });
    }

    // Call Gemini with retry logic
    const postContent = await retryWithBackoff(async () => {
      console.log("[AI] Initializing GoogleGenerativeAI...");
      const genAI = new GoogleGenerativeAI(apiKey);
      
      const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
      let lastModelError;
      
      for (const modelName of models) {
        try {
          console.log(`[AI] Trying model: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });

          const prompt = `You are a creative social media post writer. Based on this description, generate engaging post content that feels natural and authentic.

User's description: "${description}"

Generate a single, compelling post (not a list). The post should:
- Be authentic and conversational
- Match the tone of what the user described
- Include relevant emojis naturally
- Be under 500 characters
- Feel like it's from a real person, not AI

Return ONLY the post content text, nothing else. No JSON, no formatting, just the raw post text.`;

          console.log("[AI] Calling model.generateContent...");
          const result = await model.generateContent(prompt);
          const text = result.response.text().trim();

          console.log("[AI] Got response from Gemini:", text?.substring(0, 50) + "...");

          if (!text) {
            throw new Error("Empty response from Gemini API");
          }

          return text;
        } catch (err) {
          console.warn(`[AI] Failed with model ${modelName}:`, err.message);
          lastModelError = err;
          continue;
        }
      }
      
      throw lastModelError || new Error("All AI models failed");
    }, 3, 1000);

    console.log("[AI] Successfully generated post content");

    res.status(200).json({ content: postContent });
  } catch (error) {
    console.error("[AI] FINAL ERROR after all retries:", {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
    });
    res.status(500).json({ 
      error: "Failed to generate post content after multiple attempts. Check server logs for details.",
      details: error.message 
    });
  }
};
