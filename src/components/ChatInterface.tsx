import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

type Personality = 'spiderman' | 'ironman' | 'captain' | 'thor' | 'hulk' | 'deadpool';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  content: string;
}

export default function ChatInterface() {
  const [personality, setPersonality] = useState<Personality>('spiderman');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-950/30 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${currentConfig.accent} flex items-center justify-center shadow-lg`}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">AI CHAT <span className="opacity-50 font-light">| PRO</span></h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">{currentConfig.label}</p>
            </div>
          </div>

          {/* Personality Switcher */}
          <div className="flex -space-x-2">
            {(Object.keys(personalityConfig) as Personality[]).slice(0, 6).map((key) => (
              <button
                key={key}
                onClick={() => setPersonality(key)}
                className={`w-7 h-7 rounded-full ring-2 ring-slate-950 transition-transform hover:scale-110 ${
                  personality === key ? 'opacity-100 scale-110 z-10' : 'opacity-60'
                }`}
                title={personalityConfig[key].label}
              >
                <div className={`w-full h-full rounded-full ${personalityConfig[key].accent} flex items-center justify-center`}>
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'bot' && (
                <div className="w-8 h-8 flex-shrink-0 ring-1 ring-white/10 shadow-lg mt-1 rounded-full">
                  <div className={`w-full h-full rounded-full ${currentConfig.accent} flex items-center justify-center`}>
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              <div
                className={`max-w-[75%] rounded-2xl px-5 py-3.5 backdrop-blur-md shadow-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-600/80 text-white rounded-tr-sm'
                    : 'bg-slate-900/40 border border-white/5 text-slate-200 rounded-tl-sm'
                }`}
              >
                {message.content}
              </div>

              {message.sender === 'user' && (
                <div className="w-8 h-8 flex-shrink-0 ring-1 ring-white/10 shadow-lg mt-1 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isStreaming && (
            <div className="flex gap-4">
              <div className="w-8 h-8 ring-1 ring-white/10 mt-1 rounded-full">
                <div className={`w-full h-full rounded-full ${currentConfig.accent} flex items-center justify-center`}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${currentConfig.label}...`}
              className="flex-1 bg-transparent border-none resize-none text-white placeholder-slate-500 focus:outline-none px-2 py-3 min-h-[44px] max-h-[200px]"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isStreaming}
              className={`p-3 rounded-xl transition-all ${
                input.trim() && !isStreaming
                  ? 'bg-blue-600 text-white shadow-lg hover:scale-105'
                  : 'bg-white/5 text-slate-600 cursor-not-allowed'
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
