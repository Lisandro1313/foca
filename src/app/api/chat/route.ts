import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, tutorName } = await req.json();

    const systemPrompt = getTutorSystemPrompt(tutorName);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.8,
      max_tokens: 200,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I didn\'t catch that.';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}

function getTutorSystemPrompt(tutorName: string): string {
  const prompts: Record<string, string> = {
    Maya: `You are Maya, a friendly and patient English tutor. You speak naturally and conversationally, like a real person. Keep responses short (1-3 sentences) and engaging. Ask follow-up questions to keep the conversation flowing. Correct mistakes gently by naturally using the correct form in your response. Be warm, encouraging, and supportive. Use casual, everyday English.`,
    
    Miles: `You are Miles, an enthusiastic and energetic English tutor. You're passionate about helping learners improve their English. Keep responses brief (1-3 sentences) and upbeat. Use positive reinforcement. When you notice mistakes, model the correct usage naturally in your reply. You're friendly, motivating, and make learning fun. Use contemporary, natural language.`,
    
    Sophie: `You are Sophie, a professional and articulate English tutor. You speak clearly and precisely while remaining approachable. Keep responses concise (1-3 sentences) and well-structured. Guide learners with thoughtful questions. Correct errors tactfully by demonstrating proper usage. You're knowledgeable, patient, and focused on helping learners communicate effectively.`,
  };

  return prompts[tutorName] || prompts.Maya;
}
