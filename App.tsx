import React, { useState, useEffect } from 'react';
import { AppTab, PrayerData } from './types';
import PrayerTimes from './components/PrayerTimes';
import QuranReader from './components/QuranReader';
import HadithSearch from './components/HadithSearch';
import AIAssistant from './components/AIAssistant';
import Tasbih from './components/Tasbih';
import IslamicCalendar from './components/IslamicCalendar';
import NamesOfAllah from './components/NamesOfAllah';
import { fetchPrayerTimes } from './services/islamicData';
import { Moon, Book, Sparkles, HeartHandshake, Fingerprint, CalendarDays, Star, Loader2, MapPinOff } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.Prayer);
  
  // Centralized State
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [loadingPrayer, setLoadingPrayer] = useState<boolean>(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Fetch Prayer Data Once on Mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const data = await fetchPrayerTimes(position.coords.latitude, position.coords.longitude);
          if (data) {
            setPrayerData(data);
            setLoadingPrayer(false);
          } else {
            setLocationError('تعذر جلب بيانات الصلاة من المصدر.');
            setLoadingPrayer(false);
          }
        },
        (err) => {
          console.error(err);
          setLocationError('يرجى تفعيل الموقع الجغرافي لحساب أوقات الصلاة.');
          setLoadingPrayer(false);
        }
      );
    } else {
      setLocationError('المتصفح لا يدعم تحديد الموقع.');
      setLoadingPrayer(false);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 glass transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-5xl">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab(AppTab.Prayer)}>
            <div className="relative w-11 h-11">
                <div className="absolute inset-0 bg-emerald-500 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300 opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 group-hover:scale-105 transition-transform duration-300">
                    <Moon fill="currentColor" size={22} className="text-emerald-50 drop-shadow-sm" />
                </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-kufi font-bold text-emerald-950 leading-none group-hover:text-emerald-700 transition-colors">نور</h1>
              <span className="text-[11px] font-bold text-gold-600 tracking-wider uppercase opacity-90">رفيق المسلم</span>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="hidden md:block text-xs font-serif text-emerald-800/60 bg-emerald-50/50 px-3 py-1 rounded-full border border-emerald-100/50">
            {prayerData?.date?.readable || new Date().toLocaleDateString('ar-SA')}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8 flex flex-col max-w-5xl">
        
        {/* Desktop Navigation Pills */}
        <div className="hidden md:flex justify-center mb-8 animate-fade-in">
           <div className="bg-white/60 backdrop-blur-xl p-1.5 rounded-2xl shadow-sm border border-white/60 flex gap-2">
             <NavTabDesktop active={activeTab === AppTab.Prayer} onClick={() => setActiveTab(AppTab.Prayer)} label="الرئيسية" icon={<Moon size={18} />} />
             <NavTabDesktop active={activeTab === AppTab.Quran} onClick={() => setActiveTab(AppTab.Quran)} label="القرآن" icon={<Book size={18} />} />
             <NavTabDesktop active={activeTab === AppTab.Tasbih} onClick={() => setActiveTab(AppTab.Tasbih)} label="المسبحة" icon={<Fingerprint size={18} />} />
             <NavTabDesktop active={activeTab === AppTab.Names} onClick={() => setActiveTab(AppTab.Names)} label="الأسماء" icon={<Star size={18} />} />
             <NavTabDesktop active={activeTab === AppTab.Calendar} onClick={() => setActiveTab(AppTab.Calendar)} label="التقويم" icon={<CalendarDays size={18} />} />
             <NavTabDesktop active={activeTab === AppTab.Hadith} onClick={() => setActiveTab(AppTab.Hadith)} label="الأحاديث" icon={<HeartHandshake size={18} />} />
             <NavTabDesktop active={activeTab === AppTab.AI} onClick={() => setActiveTab(AppTab.AI)} label="المساعد" icon={<Sparkles size={18} />} />
           </div>
        </div>

        <div className="flex-grow md:pb-0 pb-28 animate-slide-up relative">
          {/* 
            Persistent Views Strategy:
            We keep the AI Assistant mounted but hidden to preserve chat state.
            Other heavy components can be conditionally rendered.
          */}
          
          {activeTab === AppTab.Prayer && (
             <PrayerTimes data={prayerData} loading={loadingPrayer} error={locationError} />
          )}

          {activeTab === AppTab.Quran && <QuranReader />}
          {activeTab === AppTab.Hadith && <HadithSearch />}
          {activeTab === AppTab.Tasbih && <Tasbih />}
          {activeTab === AppTab.Calendar && <IslamicCalendar />}
          {activeTab === AppTab.Names && <NamesOfAllah />}

          {/* AI Assistant - Always mounted, hidden when inactive */}
          <div style={{ display: activeTab === AppTab.AI ? 'block' : 'none', height: '100%' }}>
              <AIAssistant prayerData={prayerData} />
          </div>

        </div>

        {/* Mobile Navigation - Floating Dock Style */}
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-50 flex justify-center">
           <nav className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 px-2 py-3 flex justify-between items-center w-full max-w-sm relative">
              <NavButton active={activeTab === AppTab.Prayer} onClick={() => setActiveTab(AppTab.Prayer)} icon={<Moon size={22} />} label="الصلاة" />
              <NavButton active={activeTab === AppTab.Quran} onClick={() => setActiveTab(AppTab.Quran)} icon={<Book size={22} />} label="القرآن" />
              <NavButton active={activeTab === AppTab.Tasbih} onClick={() => setActiveTab(AppTab.Tasbih)} icon={<Fingerprint size={22} />} label="تسبيح" />
              <div className="w-px h-8 bg-gray-200/50 mx-1"></div>
              <NavButton active={activeTab === AppTab.AI} onClick={() => setActiveTab(AppTab.AI)} icon={<Sparkles size={22} />} label="نور" isMain />
              <div className="w-px h-8 bg-gray-200/50 mx-1"></div>
              <NavButton active={activeTab === AppTab.Calendar} onClick={() => setActiveTab(AppTab.Calendar)} icon={<CalendarDays size={22} />} label="تقويم" />
              <NavButton active={activeTab === AppTab.Hadith} onClick={() => setActiveTab(AppTab.Hadith)} icon={<HeartHandshake size={22} />} label="حديث" />
           </nav>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center md:py-8 py-4 opacity-0 md:opacity-100 transition-opacity">
        <div className="font-serif text-emerald-900/40 text-sm">
          <p>تم التطوير بواسطة ليث – seven_code7</p>
        </div>
      </footer>
    </div>
  );
};

const NavButton: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string, isMain?: boolean}> = ({active, onClick, icon, label, isMain}) => (
  <button 
    onClick={onClick} 
    className={`relative flex flex-col items-center gap-1 transition-all duration-500 p-1 rounded-2xl min-w-[3rem] ${active ? '-translate-y-3' : 'hover:-translate-y-1'}`}
  >
    <div className={`transition-all duration-500 flex items-center justify-center ${
        active 
        ? (isMain ? 'bg-gradient-to-tr from-gold-400 to-amber-500 text-white shadow-lg shadow-gold-200 w-12 h-12 rounded-full ring-4 ring-white' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 w-10 h-10 rounded-2xl ring-4 ring-white') 
        : (isMain ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md w-11 h-11 rounded-full' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 w-10 h-10 rounded-xl')
    }`}>
        {icon}
    </div>
    <span className={`text-[10px] font-bold transition-all duration-300 absolute -bottom-4 ${active ? 'opacity-100 translate-y-0 text-emerald-700' : 'opacity-0 -translate-y-2'}`}>{label}</span>
  </button>
);

const NavTabDesktop: React.FC<{active: boolean, onClick: () => void, label: string, icon: React.ReactNode}> = ({active, onClick, label, icon}) => (
  <button 
    onClick={onClick}
    className={`px-5 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 font-bold text-sm ${
        active 
        ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-200/50 transform scale-105' 
        : 'text-gray-500 hover:bg-white hover:text-emerald-700 hover:shadow-sm'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default App;