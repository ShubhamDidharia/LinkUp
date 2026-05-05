import { GoogleGenerativeAI } from "@google/generative-ai";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

// Helper to extract JSON from AI response
const extractJson = (text) => {
  try {
    // Try simple parse first
    return JSON.parse(text);
  } catch (e) {
    // Look for JSON block
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e2) {
        throw new Error("Could not parse extracted JSON block");
      }
    }
    throw new Error("No JSON found in response");
  }
};

// Internal helper for smart search logic
const getSmartSearchResults = async (query) => {
  const searchPatterns = query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 2);

  return await Post.find({
    $or: [
      { text: { $regex: query, $options: "i" } },
      {
        text: {
          $regex: searchPatterns.join("|"),
          $options: "i",
        },
      },
    ],
  })
    .sort({ createdAt: -1, likes: -1 })
    .limit(20)
    .populate({
      path: "user",
      select: "-password",
    })
    .populate({
      path: "comments.user",
      select: "-password -email -bio -link",
    });
};

export const aiSearchPosts = async (req, res) => {
  const { query } = req.query;

  if (!query || query.trim() === "") {
    return res.status(200).json([]);
  }

  try {
    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // List of models to try in order of preference
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    let result;
    let successfulModel = "";

    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt = `You are a search intent analyzer. Analyze this search query and extract the main topics, keywords, and content types the user is looking for.

Search Query: "${query}"

Return ONLY a JSON object with this structure:
{
  "topics": ["topic1", "topic2", "topic3"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "description": "brief description of what user is looking for"
}

Be specific and extract 3-5 relevant topics/keywords.`;

        result = await model.generateContent(prompt);
        successfulModel = modelName;
        break; // Stop if successful
      } catch (err) {
        console.warn(`Failed with model ${modelName}:`, err.message);
        continue;
      }
    }

    if (!result) {
      throw new Error("All AI models failed");
    }

    const responseText = result.response.text();
    
    // Parse the AI response using robust extractor
    let searchTerms = [];
    try {
      const parsed = extractJson(responseText);
      searchTerms = [
        ...(parsed.topics || []),
        ...(parsed.keywords || []),
        query.toLowerCase(),
      ];
    } catch (parseError) {
      console.warn("Failed to parse AI response, falling back to basic search terms", parseError);
      searchTerms = [query.toLowerCase()];
    }

    // Search posts
    const posts = await Post.find({
      $or: [
        { text: { $regex: searchTerms.join("|"), $options: "i" } },
        { text: { $regex: query, $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password -email -bio -link",
      });

    res.status(200).json({
      posts,
      searchContext: {
        originalQuery: query,
        topics: searchTerms.slice(0, 5),
        resultCount: posts.length,
        aiPowered: true,
        modelUsed: successfulModel
      },
    });

  } catch (error) {
    console.error("AI Search failed, falling back to Smart Search:", error.message);
    
    try {
      const posts = await getSmartSearchResults(query);
      res.status(200).json({
        posts,
        searchContext: {
          originalQuery: query,
          topics: [query.toLowerCase()],
          resultCount: posts.length,
          aiPowered: false,
          fallback: true,
          error: error.message
        },
      });
    } catch (fallbackError) {
      console.error("Critical: Smart Search fallback also failed:", fallbackError);
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const smartSearchPosts = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(200).json([]);
    }

    const posts = await getSmartSearchResults(query);
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in smart search:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
