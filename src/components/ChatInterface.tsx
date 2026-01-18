import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Cpu } from 'lucide-react';
import SpaceBackground from './SpaceBackground';
import { AVAILABLE_MODELS, getRecommendedModels } from '../config/models';

type Personality = 'spiderman' | 'ironman' | 'captain' | 'thor' | 'hulk' | 'deadpool';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  content: string;
}

export default function ChatInterface() {
  const [personality, setPersonality] = useState<Personality>('spiderman');
  const [selectedModel, setSelectedModel] = useState('deepseek-r1t-chimera');
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentModel = AVAILABLE_MODELS[selectedModel];
  const recommendedModels = getRecommendedModels();

  const personalityConfig = {
    spiderman: { accent: 'bg-red-500', label: 'Spider-Man' },
    ironman: { accent: 'bg-yellow-500', label: 'Iron Man' },
    captain: { accent: 'bg-blue-500', label: 'Captain America' },
    thor: { accent: 'bg-blue-400', label: 'Thor' },
    hulk: { accent: 'bg-green-500', label: 'Hulk' },
    deadpool: { accent: 'bg-red-700', label: 'Deadpool' },
  };

  const currentConfig = personalityConfig[personality];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          personality,
          modelId: currentModel.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let botResponse = '';
      const botMessageId = Date.now().toString() + '-bot';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data:')) continue;

          const data = line.replace(/^data:\s*/, '');
          try {
            const parsed = JSON.parse(data);
            if (parsed.response) {
              botResponse += parsed.response;
              setMessages((prev) => {
                const existingIndex = prev.findIndex((m) => m.id === botMessageId);
                if (existingIndex !== -1) {
                  const updated = [...prev];
                  updated[existingIndex] = { ...updated[existingIndex], content: botResponse };
                  return updated;
                } else {
                  return [...prev, { id: botMessageId, sender: 'bot', content: botResponse }];
                }
              });
            }
          } catch {}
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), sender: 'bot', content: 'Sorry, an error occurred.' },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-transparent text-slate-100 relative overflow-hidden">
      {/* Space Background */}
      <SpaceBackground />
      
      {/* Header */}
      <header className="border-b border-indigo-500/20 glass-effect relative z-10 shadow-lg shadow-indigo-500/10">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-11 h-11 rounded-2xl ${currentConfig.accent} flex items-center justify-center shadow-lg glow-border`}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white glow-text">COSMIC CHAT <span className="opacity-60 font-light text-sm">PRO</span></h1>
              <p className="text-[11px] text-indigo-300 uppercase tracking-wider">{currentConfig.label}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Model Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowModelMenu(!showModelMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-950/40 border border-indigo-400/30 hover:border-indigo-400/50 hover:bg-indigo-950/60 transition-all backdrop-blur-md shadow-lg hover:shadow-indigo-500/20"
              >
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span className="text-xs text-indigo-200 font-medium">{currentModel.name.split('(')[0].trim()}</span>
              </button>

              {/* Model Dropdown */}
              {showModelMenu && (
                <div className="absolute top-full right-0 mt-3 w-80 glass-effect border border-indigo-400/20 rounded-2xl shadow-2xl shadow-indigo-500/20 overflow-hidden z-50">
                  <div className="p-4 border-b border-indigo-400/10 bg-indigo-950/20">
                    <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Select AI Model</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {Object.entries(recommendedModels).map(([key, model]) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          // Map the recommendedModels keys to actual AVAILABLE_MODELS keys
                          const modelKeyMap: Record<string, string> = {
                            'bestRoleplay': 'deepseek-r1t-chimera',
                            'bestAcademia': 'mimo-v2-flash',
                            'bestReasoning': 'deepseek-r1-0528',
                            'bestCoding': 'qwen3-coder',
                          };
                          setSelectedModel(modelKeyMap[key]);
                          setShowModelMenu(false);
                        }}
                        className={`w-full px-5 py-4 text-left hover:bg-indigo-500/10 transition-all border-b border-indigo-400/5 last:border-0 ${
                          currentModel.id === model.id ? 'bg-indigo-500/20 border-l-2 border-l-indigo-400' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">{model.name}</span>
                              {currentModel.id === model.id && (
                                <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-500/30 text-indigo-300 font-semibold glow-border">Active</span>
                              )}
                            </div>
                            <p className="text-[11px] text-indigo-300/70 mt-1">{model.description}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                                {model.performance.speed}
                              </span>
                              <span className="text-[10px] text-indigo-400">•</span>
                              <span className="text-[10px] text-indigo-400/70">{model.contextLength.toLocaleString()} ctx</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Personality Switcher */}
            <div className="flex -space-x-2">
              {(Object.keys(personalityConfig) as Personality[]).slice(0, 6).map((key) => (
                <button
                  key={key}
                onClick={() => setPersonality(key)}
                className={`w-9 h-9 rounded-full ring-2 ring-indigo-950 transition-all hover:scale-110 ${
                  personality === key ? 'opacity-100 scale-110 z-10 glow-border' : 'opacity-50 hover:opacity-80'
                }`}
                title={personalityConfig[key].label}
              >
                <div className={`w-full h-full rounded-full ${personalityConfig[key].accent} flex items-center justify-center shadow-lg`}>
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              </button>
            ))}
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 items-start ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'bot' && (
                <div className="w-10 h-10 flex-shrink-0 ring-2 ring-indigo-400/30 shadow-xl mt-1 rounded-2xl overflow-hidden glow-border">
                  <div className={`w-full h-full ${currentConfig.accent} flex items-center justify-center`}>
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}

              <div
                className={`max-w-[70%] rounded-2xl px-6 py-4 shadow-2xl ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-br from-indigo-600/80 to-purple-600/80 text-white backdrop-blur-xl border border-indigo-400/30 shadow-indigo-500/30'
                    : 'glass-effect border border-indigo-400/20 text-slate-100 shadow-indigo-500/10'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>

              {message.sender === 'user' && (
                <div className="w-10 h-10 flex-shrink-0 ring-2 ring-indigo-400/30 shadow-xl mt-1 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center glow-border">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {isStreaming && (
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 ring-2 ring-indigo-400/30 mt-1 rounded-2xl overflow-hidden glow-border">
                <div className={`w-full h-full ${currentConfig.accent} flex items-center justify-center`}>
                  <Bot className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="glass-effect border border-indigo-400/20 rounded-2xl px-6 py-5 shadow-lg">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="glass-effect border border-indigo-400/20 rounded-3xl shadow-2xl shadow-indigo-500/10 p-3 flex items-end gap-3 focus-within:border-indigo-400/40 focus-within:shadow-indigo-500/20 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${currentConfig.label}...`}
              className="flex-1 bg-transparent border-none resize-none text-white placeholder-indigo-300/40 focus:outline-none px-3 py-4 min-h-[48px] max-h-[200px] text-sm"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isStreaming}
              className={`p-3.5 rounded-2xl transition-all shadow-lg ${
                input.trim() && !isStreaming
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 hover:scale-105 glow-border'
                  : 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
