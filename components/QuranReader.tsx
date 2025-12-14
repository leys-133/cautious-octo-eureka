import React, { useState, useEffect, useRef } from 'react';
import { fetchSurahList, fetchSurahDetails } from '../services/islamicData';
import { explainAyah } from '../services/geminiService';
import { Surah, FullSurah, Ayah } from '../types';
import { Play, Pause, ChevronLeft, Info, Loader2, BookOpen, Search, Volume2, X, ChevronRight } from 'lucide-react';

const QuranReader: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSurah, setSelectedSurah] = useState<FullSurah | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(-1);
  const [explanation, setExplanation] = useState<{id: number, text: string} | null>(null);
  const [explainingId, setExplainingId] = useState<number | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahRefs = useRef<{[key: number]: HTMLDivElement | null}>({});

  useEffect(() => {
    loadSurahs();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
        setFilteredSurahs(surahs);
    } else {
        setFilteredSurahs(surahs.filter(s => 
            s.name.includes(searchTerm) || 
            s.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.number.toString().includes(searchTerm)
        ));
    }
  }, [searchTerm, surahs]);

  useEffect(() => {
      if (currentAyahIndex >= 0 && selectedSurah) {
          const ayahNumber = selectedSurah.ayahs[currentAyahIndex].number;
          const element = ayahRefs.current[ayahNumber];
          if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      }
  }, [currentAyahIndex, selectedSurah]);

  const loadSurahs = async () => {
    const list = await fetchSurahList();
    setSurahs(list);
    setFilteredSurahs(list);
    setLoading(false);
  };

  const handleSelectSurah = async (number: number) => {
    setLoadingDetails(true);
    setExplanation(null);
    setIsPlaying(false);
    setCurrentAyahIndex(-1);
    const details = await fetchSurahDetails(number);
    setSelectedSurah(details);
    setLoadingDetails(false);
  };

  const togglePlay = (index: number) => {
    if (currentAyahIndex === index && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (selectedSurah && selectedSurah.ayahs[index]) {
        setCurrentAyahIndex(index);
        setIsPlaying(true);
      }
    }
  };

  const stopAudio = () => {
      audioRef.current?.pause();
      setIsPlaying(false);
      setCurrentAyahIndex(-1);
  };

  useEffect(() => {
    if (selectedSurah && currentAyahIndex >= 0 && audioRef.current) {
        audioRef.current.src = selectedSurah.ayahs[currentAyahIndex].audio;
        audioRef.current.play().catch(e => console.error("Audio play error", e));
        setIsPlaying(true);
    }
  }, [currentAyahIndex, selectedSurah]);

  const handleAudioEnded = () => {
    if (selectedSurah && currentAyahIndex < selectedSurah.ayahs.length - 1) {
      setCurrentAyahIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
      setCurrentAyahIndex(-1);
    }
  };

  const handleExplain = async (ayah: Ayah) => {
    if (!selectedSurah) return;
    if (explanation?.id === ayah.numberInSurah) {
        setExplanation(null); 
        return;
    }
    setExplainingId(ayah.numberInSurah);
    const text = await explainAyah(selectedSurah.name, ayah.numberInSurah, ayah.text);
    setExplanation({ id: ayah.numberInSurah, text });
    setExplainingId(null);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-600 w-10 h-10" /></div>;

  return (
    <div className="space-y-4 h-full flex flex-col relative">
      {!selectedSurah ? (
        <>
            <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-3xl p-8 mb-6 text-white relative overflow-hidden shadow-lg">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-serif font-bold mb-2">القرآن الكريم</h2>
                        <p className="text-emerald-100 opacity-80 text-sm">اقرأ واستمع وتدبر في آيات الله</p>
                    </div>
                    <div className="relative w-full md:w-72 group">
                        <input 
                            type="text" 
                            placeholder="ابحث باسم السورة أو رقمها..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-white/10 border border-white/20 focus:bg-white/20 focus:border-white/40 focus:ring-0 text-white placeholder:text-white/50 backdrop-blur-md outline-none transition-all"
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20 md:pb-0">
            {filteredSurahs.map(surah => (
                <button
                key={surah.number}
                onClick={() => handleSelectSurah(surah.number)}
                className="group relative flex justify-between items-center p-5 bg-white rounded-2xl shadow-sm border border-emerald-50 hover:border-emerald-300 hover:shadow-xl hover:-translate-y-1 active:scale-[0.99] transition-all duration-300 text-right overflow-hidden"
                >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-300 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-center gap-5">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                        {/* Decorative Star/Number Shape */}
                        <svg viewBox="0 0 44 44" className="absolute inset-0 w-full h-full text-emerald-100 group-hover:text-emerald-200 transition-colors fill-current">
                             <path d="M22 0L27 17L44 22L27 27L22 44L17 27L0 22L17 17L22 0Z" />
                        </svg>
                        <span className="relative z-10 font-bold font-mono text-emerald-800 text-sm">{surah.number}</span>
                    </div>
                    <div>
                    <h3 className="font-serif font-bold text-2xl text-gray-800 group-hover:text-emerald-800 transition-colors">{surah.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 font-medium">{surah.englishName}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                     <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wide ${surah.revelationType === 'Meccan' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                        {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{surah.numberOfAyahs} آية</span>
                </div>
                </button>
            ))}
            {filteredSurahs.length === 0 && (
                <div className="col-span-full text-center py-20">
                    <BookOpen size={48} className="mx-auto text-gray-200 mb-4"/>
                    <p className="text-gray-400">لا توجد سورة بهذا الاسم</p>
                </div>
            )}
            </div>
        </>
      ) : (
        <div className="flex flex-col h-full animate-slide-up relative">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 sticky top-0 z-30 pt-2 pb-4 bg-gradient-to-b from-slate-50 to-transparent">
            <button 
                onClick={() => { setSelectedSurah(null); setIsPlaying(false); audioRef.current?.pause(); }}
                className="flex items-center gap-2 text-gray-600 hover:text-emerald-700 transition-all px-4 py-2 rounded-xl hover:bg-white bg-white/50 backdrop-blur-sm shadow-sm border border-white/60 group"
            >
                <ChevronRight size={20} className="group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
                <span className="font-bold">الفهرس</span>
            </button>
            
            {!loadingDetails && selectedSurah && (
                 <div className="text-center">
                    <h2 className="font-serif font-bold text-xl text-emerald-900">{selectedSurah.name}</h2>
                 </div>
            )}
            <div className="w-20"></div> {/* Spacer for balance */}
          </div>

          {loadingDetails ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-emerald-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <Loader2 className="animate-spin text-emerald-600 w-12 h-12 relative z-10" />
                </div>
                <p className="text-emerald-800 font-serif text-lg">جاري فتح السورة...</p>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] shadow-xl flex-grow overflow-hidden flex flex-col border border-white/60 relative pb-24 ring-1 ring-emerald-50">
              {/* Surah Banner */}
              <div className="bg-[#fffbf0] p-10 text-center border-b border-amber-100 relative overflow-hidden pattern-grid-lg">
                <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
                <h2 className="text-5xl font-serif font-bold text-emerald-950 mb-4 drop-shadow-sm relative z-10">{selectedSurah.name}</h2>
                <div className="flex justify-center gap-3 text-sm font-medium text-amber-700/80 mb-6 relative z-10">
                    <span className="bg-amber-100/50 px-3 py-1 rounded-full border border-amber-200/50">{selectedSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                    <span className="bg-amber-100/50 px-3 py-1 rounded-full border border-amber-200/50">{selectedSurah.numberOfAyahs} آية</span>
                </div>
                <div className="flex justify-center mt-4 relative z-10">
                   {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                       <p className="font-serif text-3xl text-emerald-800 leading-relaxed">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
                   )}
                </div>
              </div>

              {/* Ayahs List */}
              <div className="p-4 md:p-8 overflow-y-auto space-y-8 flex-grow scroll-smooth bg-[#fdfdfd]">
                {selectedSurah.ayahs.map((ayah, index) => (
                  <div 
                    key={ayah.number} 
                    ref={(el) => { ayahRefs.current[ayah.number] = el; }}
                    className={`relative transition-all duration-700 p-6 md:p-8 rounded-3xl group ${currentAyahIndex === index ? 'bg-emerald-50/60 ring-1 ring-emerald-200 shadow-sm' : 'hover:bg-gray-50'}`}
                  >
                    {/* Controls Row */}
                    <div className="flex justify-between items-center mb-6 opacity-40 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex gap-2">
                            <button 
                                onClick={() => togglePlay(index)}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${currentAyahIndex === index && isPlaying ? 'bg-emerald-600 text-white shadow-lg scale-110' : 'bg-white border border-gray-200 text-gray-500 hover:bg-emerald-100 hover:text-emerald-600 hover:border-emerald-200'}`}
                            >
                                {currentAyahIndex === index && isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                            </button>
                            <button
                                onClick={() => handleExplain(ayah)}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${explanation?.id === ayah.numberInSurah ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-white border border-gray-200 text-gray-400 hover:bg-amber-50 hover:text-amber-500 hover:border-amber-200'}`}
                                title="تفسير"
                            >
                                {explainingId === ayah.numberInSurah ? <Loader2 className="animate-spin" size={14}/> : <Info size={14} />}
                            </button>
                        </div>
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-emerald-100 bg-emerald-50 text-emerald-800 text-xs font-bold font-mono">
                            {ayah.numberInSurah}
                        </div>
                    </div>
                    
                    {/* Arabic Text */}
                    <p className={`text-right font-serif text-[2rem] md:text-[2.5rem] leading-[2.2] md:leading-[2.4] text-gray-800 mb-4 dir-rtl ${currentAyahIndex === index ? 'text-emerald-950 font-medium' : ''}`}>
                      {ayah.text} 
                      <span className="inline-flex items-center justify-center w-10 h-10 mx-2 align-middle text-xl text-emerald-600 font-kufi border-2 border-emerald-100 rounded-full bg-emerald-50/50 number-flower">
                          {ayah.numberInSurah}
                      </span>
                    </p>

                    {/* Explanation Card */}
                    {explanation?.id === ayah.numberInSurah && (
                        <div className="mt-6 bg-gradient-to-r from-amber-50 to-white p-6 rounded-2xl text-amber-900 border border-amber-100 shadow-sm animate-slide-up relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-1 h-full bg-amber-400"></div>
                            <h4 className="font-bold mb-3 flex items-center gap-2 text-amber-700">
                                <Info size={18} />
                                التفسير الميسر
                            </h4>
                            <p className="text-lg leading-loose opacity-90 font-serif">{explanation.text}</p>
                        </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Floating Audio Player */}
              {currentAyahIndex >= 0 && (
                  <div className="absolute bottom-6 left-6 right-6 z-40 animate-slide-up">
                      <div className="bg-gray-900/95 backdrop-blur-xl text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-4 ring-1 ring-black/50">
                          <div className="flex items-center gap-4 overflow-hidden">
                              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse-slow">
                                  <Volume2 size={24} className="text-white" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">مشغل التلاوة</span>
                                  <span className="font-serif truncate text-lg">الآية {selectedSurah.ayahs[currentAyahIndex].numberInSurah} • {selectedSurah.name}</span>
                              </div>
                          </div>
                          <div className="flex items-center gap-3">
                              <button onClick={() => togglePlay(currentAyahIndex)} className="w-12 h-12 bg-white text-emerald-950 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10">
                                  {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                              </button>
                              <button onClick={stopAudio} className="w-10 h-10 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all flex items-center justify-center">
                                  <X size={20} />
                              </button>
                          </div>
                      </div>
                  </div>
              )}
              
              <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuranReader;