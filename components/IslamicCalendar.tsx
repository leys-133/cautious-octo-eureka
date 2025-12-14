import React, { useState, useEffect } from 'react';
import { getHijriDate, getGregorianDateForHijri } from '../services/islamicData';
import { Calendar as CalendarIcon, Moon, Gift, PartyPopper, Settings, ChevronLeft, ChevronRight, Loader2, Info } from 'lucide-react';

const IslamicCalendar: React.FC = () => {
    const [hijriDate, setHijriDate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [adjustment, setAdjustment] = useState<number>(() => {
        return parseInt(localStorage.getItem('hijri_adjustment') || '0');
    });
    
    const [events, setEvents] = useState<{name: string, daysLeft: number, date: string, icon: any}[]>([]);
    const [whiteDaysMessage, setWhiteDaysMessage] = useState<string>('');

    // Events Configuration
    const TARGET_EVENTS = [
        { key: 'ramadan', name: 'شهر رمضان', icon: Moon, month: 9, day: 1 },
        { key: 'eid_fitr', name: 'عيد الفطر', icon: Gift, month: 10, day: 1 },
        { key: 'eid_adha', name: 'عيد الأضحى', icon: PartyPopper, month: 12, day: 10 },
    ];

    useEffect(() => {
        localStorage.setItem('hijri_adjustment', adjustment.toString());
        loadCalendarData();
    }, [adjustment]);

    const loadCalendarData = async () => {
        setLoading(true);
        // 1. Fetch Today's Hijri Date with adjustment
        const hDate = await getHijriDate(adjustment);
        
        if (hDate) {
            setHijriDate(hDate);
            
            // 2. Calculate Countdowns based on the fetched Hijri Year
            const currentHYear = parseInt(hDate.year);
            const currentHMonth = hDate.month.number;
            const currentHDay = parseInt(hDate.day);

            // Determine White Days status
            checkWhiteDays(currentHDay);

            const calculatedEvents = [];

            for (const event of TARGET_EVENTS) {
                let targetYear = currentHYear;
                
                // If the event month has passed (or is today), calculate for next year
                if (currentHMonth > event.month || (currentHMonth === event.month && currentHDay >= event.day)) {
                    targetYear = currentHYear + 1;
                }

                // Convert target Hijri date to Gregorian to find accurate diff
                const gData = await getGregorianDateForHijri(event.day, event.month, targetYear);
                
                if (gData) {
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    
                    // Parse API date DD-MM-YYYY
                    const [d, m, y] = gData.date.split('-').map(Number);
                    const targetDate = new Date(y, m - 1, d);
                    
                    const diffTime = targetDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    calculatedEvents.push({
                        name: event.name,
                        daysLeft: diffDays,
                        date: targetDate.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }),
                        icon: event.icon
                    });
                }
            }
            
            setEvents(calculatedEvents.sort((a, b) => a.daysLeft - b.daysLeft));
        }
        setLoading(false);
    };

    const checkWhiteDays = (day: number) => {
        if (day >= 13 && day <= 15) {
            setWhiteDaysMessage('اليوم من الأيام البيض، تقبل الله صيامكم.');
        } else if (day < 13) {
            setWhiteDaysMessage(`باقي ${13 - day} أيام على الأيام البيض.`);
        } else {
            setWhiteDaysMessage('انقضت الأيام البيض لهذا الشهر.');
        }
    };

    const handleAdjustment = (val: number) => {
        setAdjustment(prev => prev + val);
    };

    if (loading && !hijriDate) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-600 w-10 h-10" /></div>;

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Hero Card */}
            <div className="relative overflow-hidden rounded-3xl shadow-xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-6 md:p-8 border border-emerald-700">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400 opacity-10 rounded-full blur-3xl -ml-10 -mb-10"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                    
                    {/* Date Display */}
                    <div className="flex flex-col items-center mt-2">
                        <div className="text-xl md:text-2xl text-emerald-200 font-serif mb-1">
                            {hijriDate?.weekday?.ar}
                        </div>
                        <div className="text-7xl md:text-8xl font-mono font-bold text-white mb-2 drop-shadow-lg tracking-tighter">
                           {hijriDate?.day}
                        </div>
                        <div className="text-3xl md:text-4xl font-serif text-white font-bold mb-1">
                            {hijriDate?.month?.ar}
                        </div>
                        <div className="text-lg text-emerald-300/80 font-mono">
                            {hijriDate?.year} هـ
                        </div>
                    </div>

                    {/* Gregorian Equivalent */}
                    <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-1 rounded-lg text-sm text-emerald-100 mt-2 border border-white/10">
                        {new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>

                    {/* Adjustment Controls */}
                    <div className="flex items-center gap-4 mt-6 bg-black/20 p-2 rounded-full backdrop-blur-md">
                        <button onClick={() => handleAdjustment(-1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/30 text-white transition-all active:scale-90 hover:shadow-lg">
                            <ChevronRight size={16} />
                        </button>
                        <div className="flex flex-col items-center w-24">
                            <span className="text-[10px] text-emerald-300 uppercase tracking-widest">تعديل التاريخ</span>
                            <span className="text-xs font-bold font-mono dir-ltr">
                                {adjustment > 0 ? `+${adjustment}` : adjustment} يوم
                            </span>
                        </div>
                        <button onClick={() => handleAdjustment(1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/30 text-white transition-all active:scale-90 hover:shadow-lg">
                            <ChevronLeft size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* White Days Alert */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                    <Info size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-emerald-900 text-sm">الأيام البيض (13، 14، 15)</h4>
                    <p className="text-sm text-emerald-700 mt-1">{whiteDaysMessage}</p>
                </div>
            </div>

            {/* Upcoming Events */}
            <div>
                <h3 className="text-xl font-serif font-bold text-emerald-900 mb-4 flex items-center gap-2 px-2">
                    <Settings className="text-emerald-500" size={20} />
                    عداد المناسبات
                </h3>
                
                {loading ? (
                    <div className="text-center py-10 text-gray-400">جاري حساب التواريخ بدقة...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {events.map((event, index) => {
                            const Icon = event.icon;
                            const isNearest = index === 0;
                            return (
                                <div 
                                    key={event.name} 
                                    className={`relative p-6 rounded-2xl flex flex-col items-center text-center transition-all duration-300 ${
                                        isNearest 
                                        ? 'bg-gradient-to-b from-white to-emerald-50 shadow-lg border border-emerald-200 transform scale-[1.02]' 
                                        : 'bg-white shadow-sm border border-gray-100 hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]'
                                    }`}
                                >
                                    {isNearest && (
                                        <div className="absolute -top-3 px-3 py-1 bg-emerald-600 text-white text-[10px] rounded-full shadow-md font-bold animate-bounce">
                                            قريباً
                                        </div>
                                    )}

                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                                        isNearest ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-50 text-gray-400'
                                    }`}>
                                        <Icon size={28} />
                                    </div>

                                    <h4 className="text-lg font-bold text-gray-800 mb-1">{event.name}</h4>
                                    <span className="text-xs text-gray-400 mb-4 font-mono dir-ltr">{event.date}</span>

                                    <div className="flex items-baseline gap-1 mt-auto">
                                        <span className="text-xs text-gray-500">باقي</span>
                                        <span className={`text-4xl font-mono font-bold ${
                                            isNearest ? 'text-emerald-600' : 'text-gray-700'
                                        }`}>{event.daysLeft}</span>
                                        <span className="text-xs text-gray-500">يوم</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                
                <p className="text-center text-[10px] text-gray-400 mt-6 mx-auto max-w-md">
                    * يتم حساب الوقت المتبقي بناءً على تقويم أم القرى. قد تختلف بداية الأشهر الهجرية بيوم واحد حسب الرؤية الشرعية للهلال في منطقتك.
                </p>
            </div>
        </div>
    );
};

export default IslamicCalendar;