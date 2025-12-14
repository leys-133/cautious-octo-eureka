import React, { useState } from 'react';
import { getNameReflection } from '../services/geminiService';
import { Search, Sparkles, X, Loader2, Star, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const NAMES_DATA = [
    { id: 1, ar: "الله", en: "Allah", meaning: "لفظ الجلالة، الجامع لصفات الألوهية" },
    { id: 2, ar: "الرحمن", en: "Ar-Rahman", meaning: "ذو الرحمة الواسعة التي وسعت كل شيء" },
    { id: 3, ar: "الرحيم", en: "Ar-Raheem", meaning: "الواصل رحمته إلى عباده المؤمنين" },
    { id: 4, ar: "الملك", en: "Al-Malik", meaning: "المالك لجميع الأشياء، المتصرف فيها بلا ممانع" },
    { id: 5, ar: "القدوس", en: "Al-Quddus", meaning: "المنزه عن كل نقص وعيب" },
    { id: 6, ar: "السلام", en: "As-Salam", meaning: "السالم من النقص، والمانح للسلامة" },
    { id: 7, ar: "المؤمن", en: "Al-Mu'min", meaning: "المصدق لرسله، والذي يأمن عباده من عذابه" },
    { id: 8, ar: "المهيمن", en: "Al-Muhaymin", meaning: "الرقيب الحافظ لكل شيء" },
    { id: 9, ar: "العزيز", en: "Al-Aziz", meaning: "القوي الغالب الذي لا يُغلب" },
    { id: 10, ar: "الجبار", en: "Al-Jabbar", meaning: "الذي يجبر الكسير، ويقهر الجبابرة" },
    { id: 11, ar: "المتكبر", en: "Al-Mutakabbir", meaning: "المنفرد بالعظمة والكبرياء" },
    { id: 12, ar: "الخالق", en: "Al-Khaliq", meaning: "الموجد للأشياء من العدم" },
    { id: 13, ar: "البارئ", en: "Al-Bari", meaning: "الذي خلق الخلق لا عن مثال سابق" },
    { id: 14, ar: "المصور", en: "Al-Musawwir", meaning: "الذي صور المخلوقات في أحسن صورة" },
    { id: 15, ar: "الغفار", en: "Al-Ghaffar", meaning: "الكثير المغفرة لذنوب عباده" },
    { id: 16, ar: "القهار", en: "Al-Qahhar", meaning: "الذي خضعت له الرقاب وذلت له الجبابرة" },
    { id: 17, ar: "الوهاب", en: "Al-Wahhab", meaning: "الكثير العطايا بلا عوض" },
    { id: 18, ar: "الرزاق", en: "Ar-Razzaq", meaning: "المتكفل بأرزاق جميع الخلائق" },
    { id: 19, ar: "الفتاح", en: "Al-Fattah", meaning: "الذي يفتح أبواب الرحمة والرزق لعباده" },
    { id: 20, ar: "العليم", en: "Al-Alim", meaning: "الذي أحاط علمه بكل شيء" },
    { id: 21, ar: "القابض", en: "Al-Qabid", meaning: "الذي يقبض الأرزاق والأرواح بحكمته" },
    { id: 22, ar: "الباسط", en: "Al-Basit", meaning: "الذي يبسط الرزق لمن يشاء بجوده" },
    { id: 23, ar: "الخافض", en: "Al-Khafid", meaning: "الذي يخفض الجبارين ويذل الطغاة" },
    { id: 24, ar: "الرافع", en: "Ar-Rafi", meaning: "الذي يرفع أولياءه درجات" },
    { id: 25, ar: "المعز", en: "Al-Mu'izz", meaning: "الذي يهب العزة لمن يشاء" },
    { id: 26, ar: "المذل", en: "Al-Mudhill", meaning: "الذي يذل من يشاء من أعدائه" },
    { id: 27, ar: "السميع", en: "As-Sami", meaning: "الذي لا يخفى عليه شيء من المسموعات" },
    { id: 28, ar: "البصير", en: "Al-Basir", meaning: "الذي يشاهد جميع المبصرات" },
    { id: 29, ar: "الحكم", en: "Al-Hakam", meaning: "الذي يفصل بين الحق والباطل" },
    { id: 30, ar: "العدل", en: "Al-Adl", meaning: "المنزه عن الظلم والجور" },
    { id: 31, ar: "اللطيف", en: "Al-Latif", meaning: "الرفيق بعباده، العالم بدقائق الأمور" },
    { id: 32, ar: "الخبير", en: "Al-Khabir", meaning: "العالم ببواطن الأمور وحقائقها" },
    { id: 33, ar: "الحليم", en: "Al-Halim", meaning: "الذي لا يعاجل بالعقوبة" },
    { id: 34, ar: "العظيم", en: "Al-Azim", meaning: "الذي لا عظمة تداني عظمته" },
    { id: 35, ar: "الغفور", en: "Al-Ghafur", meaning: "الذي يكثر من ستر الذنوب والتجاوز عنها" },
    { id: 36, ar: "الشكور", en: "Ash-Shakur", meaning: "الذي يجازي بالكثير على العمل القليل" },
    { id: 37, ar: "العلي", en: "Al-Ali", meaning: "الذي علا بذاته وصفاته على كل شيء" },
    { id: 38, ar: "الكبير", en: "Al-Kabir", meaning: "الذي هو أكبر من كل شيء" },
    { id: 39, ar: "الحفيظ", en: "Al-Hafiz", meaning: "الذي يحفظ كل شيء ولا يغيب عنه شيء" },
    { id: 40, ar: "المقيت", en: "Al-Muqit", meaning: "المقتدر على كل شيء، وخالق الأقوات" },
    { id: 41, ar: "الحسيب", en: "Al-Hasib", meaning: "الكافي لعباده" },
    { id: 42, ar: "الجليل", en: "Al-Jalil", meaning: "المتصف بصفات الجلال والعظمة" },
    { id: 43, ar: "الكريم", en: "Al-Karim", meaning: "الكثير الخير، الدائم الإحسان" },
    { id: 44, ar: "الرقيب", en: "Ar-Raqib", meaning: "الذي لا يغيب عنه شيء" },
    { id: 45, ar: "المجيب", en: "Al-Mujib", meaning: "الذي يقابل الدعاء والسؤال بالعطاء" },
    { id: 46, ar: "الواسع", en: "Al-Wasi", meaning: "الذي وسعت رحمته وعلمه كل شيء" },
    { id: 47, ar: "الحكيم", en: "Al-Hakim", meaning: "الذي يضع الأشياء في مواضعها" },
    { id: 48, ar: "الودود", en: "Al-Wadud", meaning: "المحب لعباده الصالحين" },
    { id: 49, ar: "المجيد", en: "Al-Majid", meaning: "البالغ النهاية في المجد والكرم" },
    { id: 50, ar: "الباعث", en: "Al-Ba'ith", meaning: "الذي يبعث الخلق بعد الموت" },
    { id: 51, ar: "الشهيد", en: "Ash-Shahid", meaning: "المطلع على جميع الأشياء" },
    { id: 52, ar: "الحق", en: "Al-Haqq", meaning: "الثابت الذي لا يزول" },
    { id: 53, ar: "الوكيل", en: "Al-Wakil", meaning: "الكفيل بأرزاق العباد ومصالحهم" },
    { id: 54, ar: "القوي", en: "Al-Qawiyy", meaning: "الذي لا يعجزه شيء" },
    { id: 55, ar: "المتين", en: "Al-Matin", meaning: "الشديد القوة الذي لا تلحقه مشقة" },
    { id: 56, ar: "الولي", en: "Al-Waliyy", meaning: "المحب الناصر لأوليائه" },
    { id: 57, ar: "الحميد", en: "Al-Hamid", meaning: "المستحق للحمد والثناء" },
    { id: 58, ar: "المحصي", en: "Al-Muhsi", meaning: "الذي أحصى كل شيء بعلمه" },
    { id: 59, ar: "المبدئ", en: "Al-Mubdi", meaning: "الذي بدأ الخلق من العدم" },
    { id: 60, ar: "المعيد", en: "Al-Mu'id", meaning: "الذي يعيد الخلق بعد الموت" },
    { id: 61, ar: "المحيي", en: "Al-Muhyi", meaning: "الذي يحيي العظام وهي رميم" },
    { id: 62, ar: "المميت", en: "Al-Mumit", meaning: "الذي يميت الأحياء ويقدر الموت" },
    { id: 63, ar: "الحي", en: "Al-Hayy", meaning: "الدائم الحياة بلا زوال" },
    { id: 64, ar: "القيوم", en: "Al-Qayyum", meaning: "القائم بنفسه، المقيم لغيره" },
    { id: 65, ar: "الواجد", en: "Al-Wajid", meaning: "الذي يجد ما يطلب، لا يعوزه شيء" },
    { id: 66, ar: "الماجد", en: "Al-Majid", meaning: "الكثير المجد والشرف" },
    { id: 67, ar: "الواحد", en: "Al-Wahid", meaning: "المنفرد بالذات والصفات" },
    { id: 68, ar: "الصمد", en: "As-Samad", meaning: "السيد المقصود في الحوائج" },
    { id: 69, ar: "القادر", en: "Al-Qadir", meaning: "المقدر على كل شيء" },
    { id: 70, ar: "المقتدر", en: "Al-Muqtadir", meaning: "المبالغ في القدرة والتمكن" },
    { id: 71, ar: "المقدم", en: "Al-Muqaddim", meaning: "الذي يقدم من يشاء" },
    { id: 72, ar: "المؤخر", en: "Al-Mu'akhkhir", meaning: "الذي يؤخر من يشاء" },
    { id: 73, ar: "الأول", en: "Al-Awwal", meaning: "السابق للأشياء كلها" },
    { id: 74, ar: "الآخر", en: "Al-Akhir", meaning: "الباقي بعد فناء خلقه" },
    { id: 75, ar: "الظاهر", en: "Az-Zahir", meaning: "الظاهر بآياته ودلائله" },
    { id: 76, ar: "الباطن", en: "Al-Batin", meaning: "المحتجب عن الأبصار" },
    { id: 77, ar: "الوالي", en: "Al-Wali", meaning: "المالك للأشياء المتصرف فيها" },
    { id: 78, ar: "المتعالي", en: "Al-Muta'ali", meaning: "المنزه عن صفات المخلوقين" },
    { id: 79, ar: "البر", en: "Al-Barr", meaning: "المحسن العطوف على عباده" },
    { id: 80, ar: "التواب", en: "At-Tawwab", meaning: "الذي يقبل التوبة عن عباده" },
    { id: 81, ar: "المنتقم", en: "Al-Muntaqim", meaning: "الذي يعاقب العصاة" },
    { id: 82, ar: "العفو", en: "Al-Afu", meaning: "الذي يمحو السيئات ويتجاوز عنها" },
    { id: 83, ar: "الرؤوف", en: "Ar-Ra'uf", meaning: "الشديد الرحمة والرأفة" },
    { id: 84, ar: "مالك الملك", en: "Malik-ul-Mulk", meaning: "الذي يؤتي الملك من يشاء" },
    { id: 85, ar: "ذو الجلال والإكرام", en: "Dhul-Jalali wal-Ikram", meaning: "المستحق للتعظيم والإكرام" },
    { id: 86, ar: "المقسط", en: "Al-Muqsit", meaning: "العادل في حكمه" },
    { id: 87, ar: "الجامع", en: "Al-Jami", meaning: "الذي يجمع الخلائق ليوم لا ريب فيه" },
    { id: 88, ar: "الغني", en: "Al-Ghani", meaning: "المستغني عن كل ما سواه" },
    { id: 89, ar: "المغني", en: "Al-Mughni", meaning: "الذي يغني من يشاء من خلقه" },
    { id: 90, ar: "المانع", en: "Al-Mani", meaning: "الذي يمنع العطاء عمن يشاء ابتلاءً أو حماية" },
    { id: 91, ar: "الضار", en: "Ad-Darr", meaning: "الذي يقدر الضرر على من يشاء بحكمته" },
    { id: 92, ar: "النافع", en: "An-Nafi", meaning: "الذي يقدر النفع لمن يشاء" },
    { id: 93, ar: "النور", en: "An-Nur", meaning: "الذي نور السماوات والأرض" },
    { id: 94, ar: "الهادي", en: "Al-Hadi", meaning: "الذي يهدي من يشاء إلى صراطه المستقيم" },
    { id: 95, ar: "البديع", en: "Al-Badi", meaning: "الذي خلق الخلق على غير مثال سابق" },
    { id: 96, ar: "الباقي", en: "Al-Baqi", meaning: "الدائم الوجود بلا فناء" },
    { id: 97, ar: "الوارث", en: "Al-Warith", meaning: "الذي يرث الأرض ومن عليها" },
    { id: 98, ar: "الرشيد", en: "Ar-Rashid", meaning: "المرشد لأسباب الصلاح" },
    { id: 99, ar: "الصبور", en: "As-Sabur", meaning: "الذي لا يعاجل العصاة بالعقوبة" },
];

const NamesOfAllah: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedName, setSelectedName] = useState<typeof NAMES_DATA[0] | null>(null);
    const [reflection, setReflection] = useState<string | null>(null);
    const [loadingReflection, setLoadingReflection] = useState(false);

    const filteredNames = NAMES_DATA.filter(n => 
        n.ar.includes(searchTerm) || n.en.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectName = (name: typeof NAMES_DATA[0]) => {
        setSelectedName(name);
        setReflection(null);
    };

    const handleGetReflection = async () => {
        if (!selectedName) return;
        setLoadingReflection(true);
        const text = await getNameReflection(selectedName.ar);
        setReflection(text);
        setLoadingReflection(false);
    };

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header with Card of the Day look */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-xl p-8 mb-8 border border-yellow-400">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-200 opacity-20 rounded-full blur-3xl -ml-10 -mb-10"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-right">
                        <div className="flex items-center gap-2 justify-center md:justify-start mb-2 text-yellow-100">
                            <Sparkles size={18} />
                            <span className="text-sm font-bold tracking-wider uppercase">أسماء الله الحسنى</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">ولله الأسماء الحسنى فادعوه بها</h2>
                        <p className="opacity-90 max-w-lg text-lg leading-relaxed">
                            تعرف على أسماء الله، استشعر معانيها، واجعلها نوراً يضيء حياتك وقلبك.
                        </p>
                    </div>
                    {/* Search */}
                    <div className="w-full md:w-auto relative">
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="ابحث عن اسم..." 
                            className="w-full md:w-64 py-3 pl-10 pr-4 rounded-full text-gray-800 focus:outline-none focus:ring-4 focus:ring-yellow-300/50 shadow-lg"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredNames.map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => handleSelectName(item)}
                        className="group relative bg-white rounded-2xl p-4 shadow-sm border border-emerald-50 hover:border-amber-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center h-40 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <span className="text-xs text-amber-600/60 font-mono mb-2">#{item.id}</span>
                        <h3 className="font-serif font-bold text-3xl text-emerald-900 group-hover:text-amber-600 transition-colors mb-1">{item.ar}</h3>
                        <p className="text-xs text-gray-400 font-sans tracking-wide">{item.en}</p>
                        
                        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 text-[10px] text-center text-gray-500 line-clamp-2 px-1">
                            {item.meaning}
                        </div>
                    </button>
                ))}
            </div>

            {filteredNames.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    لا توجد نتائج مطابقة
                </div>
            )}

            {/* Modal */}
            {selectedName && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-slide-up border border-white/20">
                        <button 
                            onClick={() => setSelectedName(null)}
                            className="absolute top-4 left-4 p-2 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center p-10 pb-6 bg-gradient-to-b from-amber-50 to-white">
                            <div className="inline-block p-4 rounded-full bg-white shadow-lg shadow-amber-100 mb-4 border border-amber-100">
                                <h2 className="text-6xl font-serif font-bold text-emerald-900 drop-shadow-sm">{selectedName.ar}</h2>
                            </div>
                            <h3 className="text-xl text-amber-600 font-serif font-medium">{selectedName.en}</h3>
                        </div>

                        <div className="px-8 pb-8 space-y-6">
                            <div className="text-center">
                                <p className="text-gray-600 text-lg leading-relaxed font-medium">
                                    {selectedName.meaning}
                                </p>
                            </div>

                            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 relative overflow-hidden min-h-[120px] flex flex-col justify-center">
                                {!reflection ? (
                                    <div className="text-center space-y-3 relative z-10">
                                        <Sparkles className="mx-auto text-emerald-400" size={32} />
                                        <p className="text-sm text-emerald-800/70">
                                            هل تود قراءة تأمل روحاني حول كيف تعيش بهذا الاسم اليوم؟
                                        </p>
                                        <button 
                                            onClick={handleGetReflection}
                                            disabled={loadingReflection}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2 mx-auto"
                                        >
                                            {loadingReflection ? <Loader2 className="animate-spin" size={16} /> : <Star size={16} fill="currentColor" />}
                                            {loadingReflection ? 'جاري التأمل...' : 'تأمل في هذا الاسم'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="prose prose-sm prose-emerald text-right font-serif leading-loose animate-fade-in">
                                        <div className="flex items-center gap-2 mb-2 text-emerald-700 font-bold border-b border-emerald-200 pb-2">
                                            <BookOpen size={16} />
                                            <span>ومضة روحانية</span>
                                        </div>
                                        <ReactMarkdown>{reflection}</ReactMarkdown>
                                    </div>
                                )}
                                {/* Decorative BG */}
                                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-200/30 rounded-full blur-2xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NamesOfAllah;
