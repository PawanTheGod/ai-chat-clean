export interface ModelConfig {
    id: string;
    name: string;
    provider: 'openrouter';
    type: 'chat' | 'vision' | 'multimodal';
    capabilities: {
        chat: boolean;
        vision: boolean;
        code: boolean;
        streaming: boolean;
    };
    performance: {
        speed: 'fast' | 'medium' | 'slow';
        quality: 'basic' | 'good' | 'excellent';
        resourceUsage: 'low' | 'medium' | 'high';
    };
    requirements: {
        vram?: string;
        ram?: string;
        internetRequired: boolean;
        apiKey?: boolean;
    };
    contextLength: number;
    maxTokens: number;
    description: string;
    isAvailable?: boolean;
}

export const AVAILABLE_MODELS: Record<string, ModelConfig> = {
    // Roleplay Model
    'deepseek-r1t-chimera': {
        id: 'tngtech/deepseek-r1t-chimera:free',
        name: 'DeepSeek Chimera (Roleplay)',
        provider: 'openrouter',
        type: 'chat',
        capabilities: {
            chat: true,
            vision: false,
            code: false,
            streaming: true,
        },
        performance: {
            speed: 'fast',
            quality: 'excellent',
            resourceUsage: 'low',
        },
        requirements: {
            internetRequired: true,
            apiKey: true,
        },
        contextLength: 32768,
        maxTokens: 8192,
        description: 'Best for Roleplay - DeepSeek R1T Chimera',
    },

    // Academia / Finance / Translation
    'mimo-v2-flash': {
        id: 'xiaomi/mimo-v2-flash:free',
        name: 'Mimo V2 Flash (Academia/Finance)',
        provider: 'openrouter',
        type: 'chat',
        capabilities: {
            chat: true,
            vision: false,
            code: false,
            streaming: true,
        },
        performance: {
            speed: 'fast',
            quality: 'excellent',
            resourceUsage: 'low',
        },
        requirements: {
            internetRequired: true,
            apiKey: true,
        },
        contextLength: 32768,
        maxTokens: 8192,
        description: 'Best for Academia, Translation, and Finance',
    },

    // Reasoning (o1-like)
    'deepseek-r1-0528': {
        id: 'deepseek/deepseek-r1:free',
        name: 'DeepSeek R1 (Reasoning)',
        provider: 'openrouter',
        type: 'chat',
        capabilities: {
            chat: true,
            vision: false,
            code: true,
            streaming: true,
        },
        performance: {
            speed: 'medium',
            quality: 'excellent',
            resourceUsage: 'low',
        },
        requirements: {
            internetRequired: true,
            apiKey: true,
        },
        contextLength: 65536,
        maxTokens: 8192,
        description: 'Reasoning model (like OpenAI o1)',
    },

    // Coding
    'qwen3-coder': {
        id: 'qwen/qwen3-coder:free',
        name: 'Qwen 3 Coder (Coding)',
        provider: 'openrouter',
        type: 'chat',
        capabilities: {
            chat: true,
            vision: true,
            code: true,
            streaming: true,
        },
        performance: {
            speed: 'fast',
            quality: 'excellent',
            resourceUsage: 'low',
        },
        requirements: {
            internetRequired: true,
            apiKey: true,
        },
        contextLength: 32768,
        maxTokens: 8192,
        description: 'Best for Coding tasks',
    },
};

export const MODEL_CATEGORIES = {
    multimodal: {
        name: 'Multimodal (Chat + Vision)',
        description: 'Models that can handle both text and images',
        models: Object.values(AVAILABLE_MODELS).filter(m => m.type === 'multimodal'),
    },
    chat: {
        name: 'Chat Only',
        description: 'Text-only models optimized for conversations and coding',
        models: Object.values(AVAILABLE_MODELS).filter(m => m.type === 'chat'),
    },
    vision: {
        name: 'Vision Only',
        description: 'Specialized models for image analysis and captioning',
        models: Object.values(AVAILABLE_MODELS).filter(m => m.type === 'vision'),
    },
};

export const PROVIDER_INFO = {
    openrouter: {
        name: 'OpenRouter',
        description: 'Access to various AI models via OpenRouter API',
        pros: ['Free tier available', 'Multiple specialized models', 'No local resources needed', 'Fast responses'],
        cons: ['Requires API key', 'Internet required', 'Rate limits on free tier'],
    },
};

// Helper functions
export function getModelsByCapability(capability: keyof ModelConfig['capabilities']): ModelConfig[] {
    return Object.values(AVAILABLE_MODELS).filter(model => model.capabilities[capability]);
}

export function getModelsByProvider(provider: ModelConfig['provider']): ModelConfig[] {
    return Object.values(AVAILABLE_MODELS).filter(model => model.provider === provider);
}

export function getRecommendedModels(): {
    bestRoleplay: ModelConfig;
    bestAcademia: ModelConfig;
    bestReasoning: ModelConfig;
    bestCoding: ModelConfig;
} {
    return {
        bestRoleplay: AVAILABLE_MODELS['deepseek-r1t-chimera'],
        bestAcademia: AVAILABLE_MODELS['mimo-v2-flash'],
        bestReasoning: AVAILABLE_MODELS['deepseek-r1-0528'],
        bestCoding: AVAILABLE_MODELS['qwen3-coder'],
    };
}

export function isModelCompatible(modelId: string, requiredCapabilities: string[]): boolean {
    const model = AVAILABLE_MODELS[modelId];
    if (!model) return false;

    return requiredCapabilities.every(capability => {
        return model.capabilities[capability as keyof ModelConfig['capabilities']];
    });
}

export default AVAILABLE_MODELS;
