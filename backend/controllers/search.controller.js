import { GoogleGenerativeAI } from "@google/generative-ai";
import Post from "../models/post.model.js";

export const aiSearchPosts = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(200).json([]);
    }

    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not found in environment variables");
      return res.status(500).json({ error: "AI service not configured. Please add GEMINI_API_KEY to .env" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a search intent analyzer. Analyze this search query and extract the main topics, keywords, and content types the user is looking for.

Search Query: "${query}"

Return ONLY a JSON object (no markdown, no code blocks) with this structure:
{
  "topics": ["topic1", "topic2", "topic3"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "description": "brief description of what user is looking for"
}

Be specific and extract 3-5 relevant topics/keywords.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse the AI response
    let searchTerms = [];
    try {
      // Clean the response - remove markdown code blocks if present
      const cleanedResponse = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const parsed = JSON.parse(cleanedResponse);
      searchTerms = [
        ...parsed.topics,
        ...parsed.keywords,
        query.toLowerCase(),
      ];
    } catch (parseError) {
      // If parsing fails, fall back to the original query
      console.warn("Failed to parse AI response, falling back to keyword matching", parseError);
      searchTerms = [query.toLowerCase()];
    }

    // Search posts by matching topics/keywords in text and hashtags
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

    // Add AI context to response
    res.status(200).json({
      posts,
      searchContext: {
        originalQuery: query,
        topics: searchTerms.slice(0, 5),
        resultCount: posts.length,
      },
    });
  } catch (error) {
    console.error("Error in AI search:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const smartSearchPosts = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(200).json([]);
    }

    // Simpler smart search using text indexing and regex patterns
    const searchPatterns = query
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 2);

    const posts = await Post.find({
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
      .sort({ createdAt: -1, likes: -1 }) // Sort by newest first, then by likes
      .limit(20)
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password -email -bio -link",
      });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in smart search:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
