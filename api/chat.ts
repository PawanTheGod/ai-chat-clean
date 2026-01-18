import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!OPENROUTER_API_KEY) {
        return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    const { message, personality = 'spiderman', modelId = 'tngtech/deepseek-r1t-chimera:free' } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const PERSONALITY_PROMPTS: Record<string, string> = {
        spiderman: "You are Spider-Man. You're witty, sarcastic, and always ready with a quip.",
        ironman: "You are Tony Stark. You're brilliant, confident, and sometimes arrogant.",
        captain: "You are Captain America. You're honorable, principled, with old-fashioned values.",
        thor: "You are Thor. You speak with regal, Shakespearean flair.",
        hulk: "You are the Hulk. When calm you're intelligent. When angry: HULK SMASH!",
        deadpool: "You are Deadpool. You're irreverent, break the fourth wall, and use dark humor.",
    };

    const systemPrompt = PERSONALITY_PROMPTS[personality] || `You are ${personality}.`;

    try {
        // Create abort controller with 25s timeout (Vercel limit is 30s)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
                model: modelId,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message },
                ],
                stream: true,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ error: errorText });
        }

        // Set headers for streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const reader = response.body?.getReader();
        if (!reader) {
            return res.status(500).json({ error: 'No response body' });
        }

        const decoder = new TextDecoder();
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.trim() || !line.startsWith('data:')) continue;

                    const data = line.replace(/^data:\s*/, '');
                    if (data === '[DONE]') {
                        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
                        return res.end();
                    }

                    try {
                        const parsed = JSON.parse(data);
                        const delta = parsed.choices?.[0]?.delta?.content;
                        if (delta) {
                            res.write(`data: ${JSON.stringify({ response: delta })}\n\n`);
                        }
                    } catch (e) {
                        // Ignore malformed JSON
                    }
                }
            }
        } finally {
            reader.releaseLock();
            res.end();
        }
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            return res.status(408).json({ error: 'Request timeout' });
        }
        console.error('Chat error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
