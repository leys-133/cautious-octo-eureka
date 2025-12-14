import React, { useState } from 'react';
import { searchHadith } from '../services/geminiService';
import { Search, BookOpen, Loader2, Sparkles, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SUGGESTIONS = [
    "الصدقة", "الصبر", "بر الوالدين", "حسن الخلق", "فضل الذكر", "الجار", "النية", "الرحمة"
];

const HadithSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = customQuery || query;
    if (!q.trim()) return;

    if (customQuery) setQuery(customQuery);

    setLoading(true);
    setResult(null);
    const data = await searchHadith(q);
    setResult(data);
    setLoading(false);
  };

  return (
    <div className={`max-w-3xl mx-auto transition-all duration-500 ${result ? 'pt-0' : 'pt-20'}`}>
      
      {!result && (
         <div className="text-center space-y-4 mb-10 animate-fade-in">
            <div className="inline-block p-4 bg-emerald-100 rounded-full text-emerald-600 mb-2">
                <BookOpen size={40} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-emerald-900">البحث في السنة النبوية</h2>
            <p className="text-emerald-600/80 max-w-md mx-auto">اكتشف الأحاديث الصحيحة وشروحها بسهولة باستخدام الذكاء الاصطناعي</p>
         </div>
      )}

      <form onSubmit={(e) => handleSearch(e)} className="relative group z-10 mb-6">
        <div className="absolute inset-0 bg-emerald-300 rounded-full blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن موضوع (مثلاً: الصدقة، حسن الخلق)..."
          className="relative w-full p-5 pr-14 rounded-full border border-emerald-100 bg-white shadow-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none text-lg transition-all placeholder:text-gray-400"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute left-2 top-2 bottom-2 aspect-square bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : <Search size={24} />}
        </button>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Sparkles size={20} className="text-emerald-200" />
        </div>
      </form>

      {/* Suggestions */}
      {!result && !loading && (
          <div className="flex flex-wrap justify-center gap-2 animate-slide-up">
              {SUGGESTIONS.map(s => (
                  <button 
                    key={s}
                    onClick={() => handleSearch(undefined, s)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-emerald-100 rounded-full text-sm text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md hover:scale-105 active:scale-95 transition-all shadow-sm"
                  >
                      <Tag size={14} />
                      {s}
                  </button>
              ))}
          </div>
      )}

      {result && (
        <div className="mt-8 glass-card p-8 rounded-3xl animate-slide-up border border-white/60">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-100">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                 <BookOpen size={24} />
            </div>
            <h3 className="font-bold text-xl text-emerald-900">النتائج والشرح</h3>
          </div>
          <div className="prose prose-lg prose-emerald max-w-none text-right font-serif leading-loose text-gray-700">
             <ReactMarkdown>{result}</ReactMarkdown>
          </div>
          <div className="mt-8 pt-4 border-t border-emerald-50 text-center">
              <button onClick={() => setResult(null)} className="text-emerald-600 font-medium hover:text-emerald-800 hover:underline transition-colors px-4 py-2 rounded-lg hover:bg-emerald-50">بحث جديد</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HadithSearch;