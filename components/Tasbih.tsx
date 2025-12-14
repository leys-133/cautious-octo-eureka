import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, ChevronDown, Check, Fingerprint, Infinity } from 'lucide-react';

const DHIKR_OPTIONS = [
  { id: 1, text: 'سبحان الله', target: 33 },
  { id: 2, text: 'الحمد لله', target: 33 },
  { id: 3, text: 'الله أكبر', target: 33 },
  { id: 4, text: 'لا إله إلا الله', target: 100 },
  { id: 5, text: 'أستغفر الله', target: 100 },
  { id: 6, text: 'اللهم صلِّ على محمد', target: 10 },
  { id: 7, text: 'لا حول ولا قوة إلا بالله', target: 100 },
  { id: 99, text: 'تسبيح حر', target: 0 }, // Free mode
];

const Tasbih: React.FC = () => {
  // Load initial state from local storage
  const [count, setCount] = useState(() => parseInt(localStorage.getItem('tasbih_count') || '0'));
  const [selectedDhikr, setSelectedDhikr] = useState(() => {
      const savedId = parseInt(localStorage.getItem('tasbih_dhikr_id') || '1');
      return DHIKR_OPTIONS.find(d => d.id === savedId) || DHIKR_OPTIONS[0];
  });
  const [totalCount, setTotalCount] = useState(() => parseInt(localStorage.getItem('tasbih_total') || '0'));
  const [lapCount, setLapCount] = useState(() => parseInt(localStorage.getItem('tasbih_laps') || '0'));
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Persist state
  useEffect(() => {
      localStorage.setItem('tasbih_count', count.toString());
      localStorage.setItem('tasbih_total', totalCount.toString());
      localStorage.setItem('tasbih_laps', lapCount.toString());
      localStorage.setItem('tasbih_dhikr_id', selectedDhikr.id.toString());
  }, [count, totalCount, lapCount, selectedDhikr]);

  const handleCount = () => {
    const newCount = count + 1;
    setCount(newCount);
    setTotalCount(prev => prev + 1);

    // Vibration feedback
    if (navigator.vibrate) {
      navigator.vibrate(15); 
    }

    // Check target (only if not free mode)
    if (selectedDhikr.target > 0 && newCount === selectedDhikr.target) {
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        setLapCount(prev => prev + 1);
        setTimeout(() => setCount(0), 200); 
    }
  };

  const handleReset = () => {
    if (confirm('هل تريد تصفير العداد؟')) {
      setCount(0);
      setLapCount(0);
    }
  };

  const selectDhikr = (item: typeof DHIKR_OPTIONS[0]) => {
    setSelectedDhikr(item);
    setCount(0);
    setLapCount(0);
    setIsMenuOpen(false);
  };

  const isFreeMode = selectedDhikr.target === 0;
  const progress = isFreeMode ? 100 : Math.min((count / selectedDhikr.target) * 100, 100);
  const circumference = 2 * Math.PI * 120; // Radius 120
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-between h-[calc(100vh-180px)] md:h-[600px] animate-fade-in relative">
      
      {/* Top Controls */}
      <div className="w-full flex justify-between items-center px-2 relative z-20">
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-emerald-100 text-emerald-800 font-bold hover:bg-emerald-50 hover:shadow-md hover:border-emerald-200 transition-all active:scale-95"
          >
            <span>{selectedDhikr.text}</span>
            <ChevronDown size={16} className={`transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-emerald-100 overflow-hidden z-30 max-h-60 overflow-y-auto">
              {DHIKR_OPTIONS.map(item => (
                <button
                  key={item.id}
                  onClick={() => selectDhikr(item)}
                  className={`w-full text-right px-4 py-3 hover:bg-emerald-50 border-b border-gray-50 last:border-0 flex justify-between items-center transition-colors ${selectedDhikr.id === item.id ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700'}`}
                >
                  <span>{item.text}</span>
                  {selectedDhikr.id === item.id && <Check size={16} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={handleReset}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all hover:rotate-[-90deg] active:scale-90"
          title="تصفير"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Main Counter Area */}
      <div className="flex-grow flex flex-col items-center justify-center w-full relative">
        {/* Progress Ring */}
        <div className="relative flex items-center justify-center">
            {/* Background Circle */}
            <svg className="w-72 h-72 md:w-80 md:h-80 transform -rotate-90">
                <circle
                cx="50%"
                cy="50%"
                r="120"
                stroke="currentColor"
                strokeWidth="20"
                fill="transparent"
                className="text-emerald-100/50"
                />
                <circle
                cx="50%"
                cy="50%"
                r="120"
                stroke="currentColor"
                strokeWidth="20"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={isFreeMode ? 0 : strokeDashoffset}
                strokeLinecap="round"
                className={`text-emerald-500 transition-all duration-300 ease-out ${isFreeMode ? 'opacity-30' : ''}`}
                />
            </svg>

            {/* Click Button */}
            <button 
                onClick={handleCount}
                className="absolute inset-4 rounded-full bg-gradient-to-br from-white to-emerald-50 shadow-[inset_0_4px_10px_rgba(0,0,0,0.05),0_10px_30px_rgba(16,185,129,0.2)] flex flex-col items-center justify-center active:scale-95 transition-all duration-200 group border-4 border-white select-none touch-manipulation hover:scale-[1.02] hover:shadow-[inset_0_4px_15px_rgba(0,0,0,0.05),0_15px_40px_rgba(16,185,129,0.3)]"
                style={{ WebkitTapHighlightColor: 'transparent' }}
            >
                <div className="text-gray-400 text-xs font-serif mb-1">العدد</div>
                <div className="text-7xl font-mono font-bold text-emerald-800 tabular-nums">
                    {count}
                </div>
                <div className="text-emerald-400 text-xs mt-2 font-medium flex items-center gap-1">
                    {isFreeMode ? <><Infinity size={14} /> وضع حر</> : `الهدف: ${selectedDhikr.target}`}
                </div>
                
                {/* Fingerprint decoration */}
                <div className="absolute bottom-10 opacity-10 text-emerald-800">
                    <Fingerprint size={48} />
                </div>
            </button>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="w-full grid grid-cols-2 gap-4 mt-4">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-emerald-50 text-center">
            <span className="text-xs text-gray-500 block">المجموع الكلي</span>
            <span className="text-xl font-bold text-emerald-700 font-mono">{totalCount}</span>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-emerald-50 text-center">
            <span className="text-xs text-gray-500 block">عدد الدورات</span>
            <span className="text-xl font-bold text-emerald-700 font-mono">{lapCount}</span>
        </div>
      </div>

    </div>
  );
};

export default Tasbih;