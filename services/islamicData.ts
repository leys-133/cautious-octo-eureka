import { PrayerData, Surah, FullSurah } from '../types';

// Aladhan API for Prayer Times
export const fetchPrayerTimes = async (lat: number, lng: number): Promise<PrayerData | null> => {
  try {
    const date = new Date();
    const timestamp = Math.floor(date.getTime() / 1000);
    // Method 4 is Umm al-Qura, Makkah (often standard). Can be configurable.
    const response = await fetch(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=4`);
    const data = await response.json();
    if (data.code === 200 && data.data) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    return null;
  }
};

// Al Quran Cloud API
export const fetchSurahList = async (): Promise<Surah[]> => {
  try {
    const response = await fetch('https://api.alquran.cloud/v1/surah');
    const data = await response.json();
    if (data.code === 200 && data.data) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching surah list:", error);
    return [];
  }
};

export const fetchSurahDetails = async (surahNumber: number): Promise<FullSurah | null> => {
  try {
    // Fetching with audio (Alafasy)
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`);
    const data = await response.json();
    if (data.code === 200 && data.data) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching surah details:", error);
    return null;
  }
};

// --- Calendar Services ---

export const getHijriDate = async (adjustment: number = 0) => {
    try {
        const date = new Date();
        const d = date.getDate();
        const m = date.getMonth() + 1;
        const y = date.getFullYear();
        // adjustment param in Aladhan API shifts the Hijri day
        const response = await fetch(`https://api.aladhan.com/v1/gToH/${d}-${m}-${y}?adjustment=${adjustment}`);
        const data = await response.json();
        if (data.code === 200) {
            return data.data.hijri;
        }
        return null;
    } catch (e) {
        console.error("Error getting Hijri date", e);
        return null;
    }
};

export const getGregorianDateForHijri = async (hDay: number, hMonth: number, hYear: number) => {
    try {
        const response = await fetch(`https://api.aladhan.com/v1/hToG/${hDay}-${hMonth}-${hYear}`);
        const data = await response.json();
        if (data.code === 200) {
            return data.data.gregorian;
        }
        return null;
    } catch (e) {
        console.error("Error converting H to G", e);
        return null;
    }
};
