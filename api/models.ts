import type { VercelRequest, VercelResponse } from '@vercel/node';

// Available AI models
const MODELS = {
    'deepseek-r1t-chimera': {
        id: 'tngtech/deepseek-r1t-chimera:free',
        name: 'DeepSeek Chimera (Roleplay)',
        description: 'Best for creative roleplay and personality chat',
    },
    'mimo-v2-flash': {
        id: 'xiaomi/mimo-v2-flash:free',
        name: 'Mimo V2 (Academia)',
        description: 'Optimized for academic and educational content',
    },
    'deepseek-r1-0528': {
        id: 'deepseek/deepseek-r1-0528:free',
        name: 'DeepSeek R1 (Reasoning)',
        description: 'Advanced reasoning and problem-solving',
    },
    'qwen3-coder': {
        id: 'qwen/qwen3-coder:free',
        name: 'Qwen 3 (Coding)',
        description: 'Specialized for code generation and debugging',
    },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    return res.status(200).json(MODELS);
}
