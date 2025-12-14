import React, { useState, useRef, useEffect } from 'react';
import { streamGeminiResponse } from '../services/geminiService';
import { ChatMessage, ChatRole, PrayerData } from '../types';
import { Bot, User, Loader2, Sparkles, Lightbulb, ArrowUp, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAssistantProps {
    prayerData: PrayerData | null;
}

const STARTER_PROMPTS = [
    "فسر لي سورة العصر",
    "ما فضل صلاة الفجر؟",
    "دعاء للهم والحزن",
    "قصة أصحاب الكهف باختصار",
    "كيف أخشع في الصلاة؟",
    "أذكار الصباح والمساء"
];

const AIAssistant: React.FC<AIAssistantProps> = ({ prayerData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: ChatRole.Model,
      text: 'السلام عليكم ورحمة الله وبركاته 👋\n\nأنا "نور"، رفيقك الذكي. يمكنني مساعدتك في:\n- تفسير الآيات القرآنية\n- شرح الأحاديث\n- الإجابة على الأسئلة الدينية العامة\n\nكيف يمكنني خدمتك اليوم؟',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const getContextString = (): string => {
      let contextString = `التاريخ الميلادي: ${new Date().toLocaleDateString('ar-SA')}\n`;
      if (prayerData) {
          contextString += `التاريخ الهجري: ${prayerData.date.hijri.day} ${prayerData.date.hijri.month.ar} ${prayerData.date.hijri.year}\n`;
          const timings = prayerData.timings;
          contextString += `أوقات الصلاة لليوم في موقع المستخدم:\nالفجر: ${timings.Fajr}, الشروق: ${timings.Sunrise}, الظهر: ${timings.Dhuhr}, العصر: ${timings.Asr}, المغرب: ${timings.Maghrib}, العشاء: ${timings.Isha}\n`;
      }
      return contextString;
  };

  const handleSend = async (e?: React.FormEvent, customInput?: string) => {
    if (e) e.preventDefault();
    const textToSend = customInput || input;
    
    if (!textToSend.trim() || loading) return;

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: ChatRole.User,
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // 2. Prepare History
    const history = messages.map(m => ({
        role: m.role === ChatRole.User ? 'user' : 'model',
        parts: [{ text: m.text }]
    }));

    // 3. Create Placeholder for AI Response
    const responseId = (Date.now() + 1).toString();
    const modelMsg: ChatMessage = {
      id: responseId,
      role: ChatRole.Model,
      text: '', // Start empty for streaming
      timestamp: new Date()
    };
    setMessages(prev => [...prev, modelMsg]);

    try {
        // 4. Start Stream with Fresh Context
        const stream = streamGeminiResponse(textToSend, history, getContextString());
        let fullText = '';

        for await (const chunk of stream) {
            fullText += chunk;
            setMessages(prev => 
                prev.map(m => m.id === responseId ? { ...m, text: fullText } : m)
            );
        }
    } catch (err) {
        setMessages(prev => 
            prev.map(m => m.id === responseId ? { ...m, text: "عذراً، حدث خطأ في الاتصال." } : m)
        );
    } finally {
        setLoading(false);
    }
  };

  const clearChat = () => {
      if(confirm('هل تريد مسح المحادثة؟')) {
          setMessages([messages[0]]);
      }
  };

  return (
    <div className="flex flex-col h-[75vh] min-h-[600px] bg-white rounded-[2.5rem] shadow-2xl border border-emerald-100 overflow-hidden relative ring-4 ring-emerald-50/50">
      
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md p-4 px-6 border-b border-gray-100 flex items-center justify-between z-20 absolute top-0 w-full shadow-sm">
        <div className="flex items-center gap-4">
            <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <Sparkles size={24} className="text-yellow-200" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
                <h2 className="font-bold text-lg text-gray-800">المساعد "نور"</h2>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>متصل الآن</span>
                    {prayerData && <span className="text-gray-300 px-1">•</span>}
                    {prayerData && <span className="text-gray-500">{prayerData.date.hijri.month.ar}</span>}
                </div>
            </div>
        </div>
        {messages.length > 1 && (
            <button onClick={clearChat} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="مسح المحادثة">
                <Trash2 size={20} />
            </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto pt-24 pb-32 px-4 md:px-6 space-y-6 scroll-smooth bg-gray-50/50" style={{ backgroundImage: 'radial-gradient(#10b981 0.5px, transparent 0.5px)', backgroundSize: '20px 20px', backgroundPosition: '0 0' }}>
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === ChatRole.User ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${msg.role === ChatRole.User ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm border mt-1 ${msg.role === ChatRole.User ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                {msg.role === ChatRole.User ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Bubble */}
              <div className={`flex flex-col ${msg.role === ChatRole.User ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 md:p-5 text-sm md:text-base leading-relaxed shadow-sm relative transition-all ${
                    msg.role === ChatRole.User 
                      ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl rounded-tr-none shadow-indigo-200' 
                      : 'bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-100 shadow-gray-200'
                  }`}>
                    <div className={`markdown-content font-sans ${msg.role === ChatRole.Model ? 'prose prose-sm prose-emerald max-w-none' : ''}`}>
                         {msg.role === ChatRole.Model && msg.text === '' && loading ? (
                             <div className="flex gap-1 py-2 px-1">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                             </div>
                         ) : (
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                         )}
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-4 z-20">
        
        {/* Suggestions */}
        {messages.length < 3 && !loading && (
            <div className="flex gap-2 overflow-x-auto pb-3 mb-1 scrollbar-hide snap-x px-1">
                {STARTER_PROMPTS.map(prompt => (
                    <button
                        key={prompt}
                        onClick={() => handleSend(undefined, prompt)}
                        className="snap-start flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all whitespace-nowrap active:scale-95 shadow-sm"
                    >
                        <Lightbulb size={12} className="text-amber-500" />
                        {prompt}
                    </button>
                ))}
            </div>
        )}

        <form onSubmit={(e) => handleSend(e)} className="flex gap-2 items-end bg-gray-50 p-1.5 rounded-[2rem] border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-emerald-100 focus-within:border-emerald-400 transition-all">
          <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اسأل نور عن أي شيء ديني..."
              rows={1}
              className="flex-grow bg-transparent border-none focus:ring-0 text-gray-700 placeholder:text-gray-400 px-4 py-3 min-h-[48px] max-h-32 resize-none"
              onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                  }
              }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-11 h-11 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg active:scale-90 flex-shrink-0 mb-0.5 mr-0.5"
          >
             {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowUp size={22} />}
          </button>
        </form>
        <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400">نور مساعد ذكي قد يخطئ. لا تعتمد عليه في الفتاوى المصيرية.</p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;