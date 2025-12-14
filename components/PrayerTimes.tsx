import React, { useEffect, useState, useRef } from 'react';
import { PrayerData } from '../types';
import { MapPin, Loader2, Calendar, Sun, Moon, Sunrise, Sunset, CloudSun, Clock, Star, Bell, BellRing, Settings2, Play, CheckCircle2, AlertCircle } from 'lucide-react';

interface PrayerTimesProps {
    data: PrayerData | null;
    loading: boolean;
    error: string | null;
}

const PRAYER_CONFIG: Record<string, {name: string, icon: React.ElementType}> = {
  Fajr: { name: 'الفجر', icon: CloudSun },
  Sunrise: { name: 'الشروق', icon: Sunrise },
  Dhuhr: { name: 'الظهر', icon: Sun },
  Asr: { name: 'العصر', icon: Sun },
  Maghrib: { name: 'المغرب', icon: Sunset },
  Isha: { name: 'العشاء', icon: Moon },
};

const PrayerTimes: React.FC<PrayerTimesProps> = ({ data, loading, error }) => {
  const [nextPrayer, setNextPrayer] = useState<string>('');
  const [prevPrayer, setPrevPrayer] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [specialTimes, setSpecialTimes] = useState<{midnight: string, lastThird: string} | null>(null);
  
  // Audio & Notification State
  const [isReminderActive, setIsReminderActive] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  const lastNotifiedRef = useRef<string | null>(null);

  useEffect(() => {
    const savedState = localStorage.getItem('reminder_active');
    if (savedState === 'true') setIsReminderActive(true);
  }, []);

  useEffect(() => {
    if (!data) return;

    calculateNightTimes(data.timings);

    // Timer Logic
    const interval = setInterval(() => {
      const now = new Date();
      calculateNextPrayer(data.timings, now);
      
      if (isReminderActive) {
          checkReminders(data.timings, now);
      }
    }, 1000); 

    calculateNextPrayer(data.timings, new Date());

    return () => clearInterval(interval);
  }, [data, isReminderActive]);

  // --- Reminder Logic ---

  const checkReminders = (timings: any, now: Date) => {
      const todayKey = `${now.getDate()}-${now.getMonth()}`;
      
      ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].forEach(prayerKey => {
          const prayerTimeStr = timings[prayerKey]; 
          const prayerDate = timeStringToDate(prayerTimeStr);
          const diffMs = now.getTime() - prayerDate.getTime();
          const diffMinutes = diffMs / (1000 * 60);

          if (diffMinutes >= 0 && diffMinutes < 2) {
              const notificationKey = `${prayerKey}-${todayKey}`;
              if (lastNotifiedRef.current !== notificationKey) {
                  lastNotifiedRef.current = notificationKey;
                  triggerAlert(prayerKey);
              }
          }
      });
  };

  const triggerAlert = (prayerKey: string) => {
      const prayerName = PRAYER_CONFIG[prayerKey]?.name || prayerKey;
      const title = "حان وقت الصلاة";
      const body = `اقتربت صلاة ${prayerName}، حان الآن موعد الأذان.`;

      if (Notification.permission === 'granted') {
          try {
            new Notification(title, {
                body: body,
                icon: 'https://cdn-icons-png.flaticon.com/512/5141/5141686.png',
                tag: 'prayer-reminder',
                requireInteraction: true,
                silent: true 
            });
          } catch (e) {
              console.error("Notification trigger failed", e);
          }
      }
      speakPrayerName(prayerName);
  };

  const speakPrayerName = (prayerName: string) => {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const text = `اقتربت صلاة ${prayerName}. اقتربت صلاة ${prayerName}.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85; 
      utterance.volume = 1;
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find(v => v.lang.includes('ar'));
      if (arabicVoice) utterance.voice = arabicVoice;
      window.speechSynthesis.speak(utterance);
  };

  const handleToggleReminder = async () => {
      if (!isReminderActive) {
          if ('Notification' in window && Notification.permission === 'default') {
              const perm = await Notification.requestPermission();
              if (perm === 'granted') {
                  setIsReminderActive(true);
                  localStorage.setItem('reminder_active', 'true');
                  triggerTest("تم تفعيل التنبيهات بنجاح");
              } else {
                  alert("يجب السماح بالإشعارات لكي تعمل التنبيهات وأنت خارج التطبيق.");
              }
          } else {
              setIsReminderActive(true);
              localStorage.setItem('reminder_active', 'true');
          }
      } else {
          setIsReminderActive(false);
          localStorage.setItem('reminder_active', 'false');
      }
  };

  const triggerTest = (customMsg?: string) => {
      const msg = customMsg || "هذه تجربة لصوت التنبيه: اقتربت صلاة المغرب";
      if (Notification.permission === 'granted') {
          new Notification("تجربة التنبيه", { body: msg });
      }
      if ('speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance(msg);
          u.lang = 'ar-SA';
          window.speechSynthesis.speak(u);
      }
  };

  // --- Time Helpers ---
  const timeStringToDate = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
  }

  const calculateNightTimes = (timings: any) => {
      const maghrib = timeStringToDate(timings.Maghrib);
      const fajr = timeStringToDate(timings.Fajr);
      if (fajr < maghrib) fajr.setDate(fajr.getDate() + 1);
      const diff = fajr.getTime() - maghrib.getTime();
      setSpecialTimes({
          midnight: formatTime(new Date(maghrib.getTime() + (diff / 2))),
          lastThird: formatTime(new Date(maghrib.getTime() + (diff * (2/3))))
      });
  };

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false});

  const calculateNextPrayer = (timings: any, now: Date) => {
    const prayerOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    let foundNext = false;
    let nextP = '';
    let prevP = '';

    for (let i = 0; i < prayerOrder.length; i++) {
      const prayer = prayerOrder[i];
      const prayerTime = timeStringToDate(timings[prayer]);

      if (prayerTime > now) {
        nextP = prayer;
        prevP = i === 0 ? 'Isha' : prayerOrder[i - 1];
        setNextPrayer(nextP);
        setPrevPrayer(prevP);
        
        const diff = prayerTime.getTime() - now.getTime();
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        
        let prevTime = timeStringToDate(timings[prevP]);
        if (prevTime > now) prevTime.setDate(prevTime.getDate() - 1);
        
        const total = prayerTime.getTime() - prevTime.getTime();
        const elapsed = now.getTime() - prevTime.getTime();
        setProgressPercentage(Math.min(100, Math.max(0, (elapsed / total) * 100)));

        foundNext = true;
        break;
      }
    }

    if (!foundNext) {
      setNextPrayer('Fajr');
      setPrevPrayer('Isha');
      setTimeRemaining('غداً');
      setProgressPercentage(100);
    }
  };

  if (loading) return <div className="flex flex-col justify-center items-center h-64 gap-4"><Loader2 className="animate-spin text-emerald-600 w-10 h-10" /><span className="text-emerald-800 font-medium">جاري تحديد الموقع وحساب الأوقات...</span></div>;
  if (error) return <div className="text-center text-red-500 p-8 bg-red-50 rounded-3xl border border-red-100 shadow-sm mx-4 my-10">{error}</div>;
  if (!data) return null;

  const NextPrayerIcon = PRAYER_CONFIG[nextPrayer]?.icon || Moon;
  
  // Circular Progress Calculation
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="space-y-6">

      {/* Modern Dashboard Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl bg-[#0f172a] text-white p-6 md:p-8 min-h-[380px] flex flex-col justify-between border border-white/10 group">
        
        {/* Dynamic Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 z-0"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full blur-[80px]"></div>

        {/* Header Row */}
        <div className="relative z-10 flex justify-between items-start">
            <div className="flex flex-col">
                <div className="flex items-center gap-2 text-emerald-300 mb-1">
                    <MapPin size={16} />
                    <span className="text-xs font-bold tracking-wide uppercase opacity-80">الموقع الحالي</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <h2 className="text-2xl font-serif font-bold text-white">اليوم {data.date.hijri.day}</h2>
                    <span className="text-lg font-serif text-emerald-200">{data.date.hijri.month.ar}</span>
                </div>
                <span className="text-xs text-white/40 font-sans mt-1">{data.date.readable}</span>
            </div>

            <div className="flex gap-2">
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-all text-white border border-white/10"
                >
                    <Settings2 size={18} />
                </button>
                <button 
                    onClick={handleToggleReminder}
                    className={`h-10 px-3 rounded-full flex items-center gap-2 backdrop-blur-md border transition-all ${isReminderActive ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}
                >
                    {isReminderActive ? <BellRing size={16} /> : <Bell size={16} />}
                </button>
            </div>
        </div>

        {/* Main Center Display (Circular Timer) */}
        <div className="relative z-10 flex-grow flex items-center justify-center py-6">
            <div className="relative w-64 h-64 flex items-center justify-center">
                {/* SVG Progress Ring */}
                <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <circle cx="50%" cy="50%" r="48%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                    <circle 
                        cx="50%" cy="50%" r="48%" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray={circumference} 
                        strokeDashoffset={strokeDashoffset} 
                        strokeLinecap="round" 
                        className="text-emerald-400 transition-all duration-1000 ease-linear"
                        style={{ strokeDasharray: '301.59', r: '48%' }} // Approximate for 48% of w-64
                    />
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-emerald-300 text-sm font-medium mb-1">الصلاة القادمة</span>
                    <h1 className="text-4xl md:text-5xl font-bold font-serif text-white mb-2 drop-shadow-md">{PRAYER_CONFIG[nextPrayer]?.name || nextPrayer}</h1>
                    <div className="flex items-center gap-2 bg-black/30 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-2xl font-mono font-bold tracking-widest tabular-nums text-white">{timeRemaining}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Row */}
        <div className="relative z-10 grid grid-cols-3 divide-x divide-x-reverse divide-white/10 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 p-3">
             <div className="text-center">
                 <span className="text-[10px] text-emerald-200 block uppercase tracking-wider mb-1">الفجر</span>
                 <span className="text-lg font-bold font-sans text-white">{data.timings.Fajr}</span>
             </div>
             <div className="text-center">
                 <span className="text-[10px] text-emerald-200 block uppercase tracking-wider mb-1">الشروق</span>
                 <span className="text-lg font-bold font-sans text-white">{data.timings.Sunrise}</span>
             </div>
             <div className="text-center">
                 <span className="text-[10px] text-emerald-200 block uppercase tracking-wider mb-1">المغرب</span>
                 <span className="text-lg font-bold font-sans text-white">{data.timings.Maghrib}</span>
             </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-xl animate-slide-up relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-[4rem]"></div>
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 relative z-10">
                  <Settings2 size={20} className="text-emerald-600"/>
                  إعدادات التنبيهات
              </h3>
              
              <div className="space-y-4 relative z-10">
                  <button 
                    onClick={handleToggleReminder}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isReminderActive ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'}`}
                  >
                      <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${isReminderActive ? 'bg-emerald-500 text-white' : 'bg-white text-gray-400'}`}>
                              {isReminderActive ? <CheckCircle2 size={24}/> : <AlertCircle size={24} />}
                          </div>
                          <div className="text-right">
                              <div className="font-bold text-base">{isReminderActive ? 'التنبيهات مفعلة' : 'التنبيهات متوقفة'}</div>
                              <div className="text-xs opacity-70 mt-1">إشعارات صوتية عند كل صلاة (يعمل في الخلفية)</div>
                          </div>
                      </div>
                      <div className={`w-14 h-8 rounded-full relative transition-colors ${isReminderActive ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                          <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-md ${isReminderActive ? 'left-1' : 'right-1'}`}></div>
                      </div>
                  </button>

                  <button 
                    onClick={() => triggerTest()}
                    disabled={!isReminderActive}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 rounded-2xl border border-dashed border-gray-300 hover:border-emerald-300 transition-all disabled:opacity-50"
                  >
                      <Play size={18} fill="currentColor" />
                      <span className="font-bold">تجربة صوت التنبيه</span>
                  </button>
              </div>
          </div>
      )}

      {/* Grid of Prayers (Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(PRAYER_CONFIG).map(([key, config]) => {
            const isNext = nextPrayer === key;
            const Icon = config.icon;
            return (
              <div 
                key={key} 
                className={`relative p-5 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 cursor-default group overflow-hidden ${
                    isNext 
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200 transform scale-[1.03]' 
                    : 'bg-white border border-emerald-50/50 hover:border-emerald-200 hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                {/* Hover Glow Effect */}
                {!isNext && <div className="absolute inset-0 bg-gradient-to-tr from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                
                <div className={`p-3 rounded-2xl mb-3 transition-all duration-300 relative z-10 ${isNext ? 'bg-white/20 text-white backdrop-blur-sm' : 'bg-emerald-50 text-emerald-600 group-hover:scale-110'}`}>
                    <Icon size={24} />
                </div>
                <span className={`text-sm font-bold mb-1 relative z-10 ${isNext ? 'text-emerald-50' : 'text-gray-500'}`}>{config.name}</span>
                <span className={`text-2xl font-bold font-sans relative z-10 ${isNext ? 'text-white' : 'text-gray-800'}`}>{data.timings[key]}</span>
              </div>
            );
        })}
      </div>

      {/* Night Times */}
      {specialTimes && (
          <div className="glass-dark rounded-3xl p-6 text-emerald-50 shadow-lg relative overflow-hidden group">
             <div className="absolute -right-10 -top-10 opacity-10 group-hover:opacity-20 transition-opacity duration-700 bg-emerald-400 w-40 h-40 rounded-full blur-3xl"></div>
             <div className="relative z-10 flex justify-around items-center text-center divide-x divide-x-reverse divide-white/10">
                 <div className="flex-1">
                     <div className="flex items-center gap-2 text-emerald-300/80 text-xs font-bold uppercase tracking-wider mb-2 justify-center">
                         <Clock size={14} />
                         <span>منتصف الليل</span>
                     </div>
                     <div className="text-2xl font-bold font-mono text-white">{specialTimes.midnight}</div>
                 </div>
                 <div className="flex-1">
                     <div className="flex items-center gap-2 text-emerald-300/80 text-xs font-bold uppercase tracking-wider mb-2 justify-center">
                         <Star size={14} />
                         <span>الثلث الأخير</span>
                     </div>
                     <div className="text-2xl font-bold font-mono text-white">{specialTimes.lastThird}</div>
                 </div>
             </div>
          </div>
      )}
    </div>
  );
};

export default PrayerTimes;