// ─────────────────────────────────────────────
// controllers/contentController.js
// Job: Call OpenAI API and return generated content
// ─────────────────────────────────────────────

const OpenAI = require('openai');

// Create an OpenAI client instance
// It automatically reads OPENAI_API_KEY from process.env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ── Content type prompts ──
// Different "system prompts" for different content types
// System prompt = instructions that shape how AI behaves
const systemPrompts = {
  blog: 'You are an expert blog writer. Write engaging, well-structured blog posts with clear headings and paragraphs.',
  social: 'You are a social media expert. Write punchy, engaging posts optimized for engagement. Keep it concise.',
  email: 'You are an email marketing specialist. Write compelling email copy with strong subject lines and clear CTAs.',
  general: 'You are a helpful AI content assistant. Generate high-quality content based on the user request.'
};

// ─────────────────────────────────────────────
// GENERATE CONTENT CONTROLLER
// Route: POST /api/content/generate
// Protected: must be logged in + pro/admin role
// ─────────────────────────────────────────────
const generateContent = async (req, res) => {
  try {
    // What the user wants to generate
    const { prompt, type = 'general' } = req.body;
    // type defaults to 'general' if not provided
    // = is destructuring default value

    // ── Validation ──
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    if (prompt.length > 500) {
      return res.status(400).json({ message: 'Prompt too long. Max 500 characters.' });
    }

    // Pick the right system prompt based on content type
    const systemPrompt = systemPrompts[type] || systemPrompts.general;

    // ── Call OpenAI API ──
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      // gpt-4o-mini = cheapest + fastest model, great for content generation
      // Other options: 'gpt-4o' (smarter but costs more)

      messages: [
        {
          role: 'system',
          content: systemPrompt
          // Sets the AI's "personality" and task for this request
        },
        {
          role: 'user',
          content: prompt
          // The actual user request
        }
      ],

      max_tokens: 1000,
      // max_tokens = maximum length of AI response
      // 1000 tokens ≈ 750 words
      // Prevents runaway expensive responses

      temperature: 0.7
      // temperature = creativity level (0 to 2)
      // 0   = very predictable, factual
      // 0.7 = balanced (recommended for content)
      // 2   = very creative/random
    });

    // ── Extract the generated text ──
    // completion.choices is an array (you can request multiple completions)
    // We only requested 1, so we take index [0]
    const generatedContent = completion.choices[0].message.content;

    // ── Token usage ──
    const tokensUsed = completion.usage.total_tokens;
    // This tells us how many tokens this request consumed
    // In Phase 8 (Stripe), we'll use this to deduct from user's monthly quota

    // ── Send response ──
    res.status(200).json({
      content: generatedContent,
      tokensUsed,
      type,
      model: 'gpt-4o-mini'
    });

  } catch (error) {
    console.error('OpenAI error:', error.message);

    // Handle specific OpenAI errors
    if (error.status === 401) {
      return res.status(500).json({ message: 'Invalid OpenAI API key' });
    }
    if (error.status === 429) {
      // 429 = Too Many Requests (rate limit or no credits)
      return res.status(429).json({ message: 'AI service rate limit reached. Try again later.' });
    }

    res.status(500).json({ message: 'Content generation failed' });
  }
};

module.exports = { generateContent };
