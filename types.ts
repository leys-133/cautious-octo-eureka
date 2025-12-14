export interface PrayerTiming {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

export interface HijriDate {
  day: string;
  month: {
    en: string;
    ar: string;
  };
  year: string;
  weekday: {
    en: string;
    ar: string;
  };
}

export interface PrayerData {
  timings: PrayerTiming;
  date: {
    readable: string;
    hijri: HijriDate;
  };
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  audio: string; // URL to audio
}

export interface FullSurah extends Surah {
  ayahs: Ayah[];
}

export enum ChatRole {
  User = 'user',
  Model = 'model',
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  timestamp: Date;
}

export enum AppTab {
  Prayer = 'prayer',
  Quran = 'quran',
  Hadith = 'hadith',
  AI = 'ai',
  Tasbih = 'tasbih',
  Calendar = 'calendar',
  Names = 'names',
}
