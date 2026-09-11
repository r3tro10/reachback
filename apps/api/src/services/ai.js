const OpenAI = require('openai');
const { getKBEntriesByClient } = require('../db/models/kb');

let openai = null;

function getOpenAIClient() {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

async function generateResponse(contact, conversation, trigger, userMessage = null) {
  try {
    const client = getOpenAIClient();
    // Load KB for this client
    const kbEntries = await getKBEntriesByClient(conversation.client_id);
    const kbContext = kbEntries.map(e => `Q: ${e.question}\nA: ${e.answer}`).join('\n\n');

    // Build system prompt
    const systemPrompt = `You are an AI assistant for a roofing company. You respond to customer inquiries about roofing services.
You are helping to manage customer inquiries when the team cannot respond immediately.

KNOWLEDGE BASE:
${kbContext}

INSTRUCTIONS:
1. Answer questions based on the knowledge base above
2. Be helpful and professional
3. If the customer says "STOP" or "REMOVE", include action: opt_out
4. Keep responses to 1-2 SMS messages (under 160 chars each)
5. If you don't know the answer, suggest they call or mention you'll have someone contact them`;

    const messages = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history
    if (conversation.messages && conversation.messages.length > 0) {
      conversation.messages.forEach(msg => {
        messages.push({
          role: msg.direction === 'inbound' ? 'user' : 'assistant',
          content: msg.content,
        });
      });
    }

    // Add current message if exists
    if (userMessage) {
      messages.push({ role: 'user', content: userMessage });
    }

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 300,
    });

    const aiMessage = response.choices[0].message.content;

    return {
      message: aiMessage,
      action: aiMessage.toLowerCase().includes('stop') ? 'opt_out' : null,
      set_cooldown: trigger === 'missed_call',
      cooldown_duration: 3600, // 1 hour
    };
  } catch (error) {
    console.error('AI service error:', error);
    throw error;
  }
}

module.exports = { generateResponse };
