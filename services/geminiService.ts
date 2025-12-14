import { GoogleGenAI } from "@google/genai";

// Use process.env.API_KEY as per best practices, with a fallback for immediate utility if env is missing.
const apiKey = process.env.API_KEY || 'AIzaSyAT_DWo6R66ok7aki0HAkVyxr5A7ruSgFo';

// Initialize the client strictly according to guidelines
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash';

const BASE_SYSTEM_INSTRUCTION = `
أنت مساعد إسلامي ذكي، مهذب، وهادئ. اسمك "نور".
مهمتك مساعدة المستخدم في فهم القرآن، الأحاديث، والإجابة على الأسئلة الدينية العامة.
- استخدم اللغة العربية الفصحى المبسطة.
- كن محترمًا جدًا وتواضع.
- عند تفسير الآيات، اعتمد على التفاسير المعتمدة (مثل ابن كثير، السعدي) بشكل مبسط.
- عند شرح الأحاديث، تأكد من صحة الحديث أولاً.
- تنبيه هام: لا تصدر فتاوى شرعية قطعية في المسائل الخلافية أو المصيرية (مثل الطلاق، الميراث المعقد). وجه المستخدم دائمًا لاستشارة أهل العلم في هذه الحالات.
- اجعل إجاباتك منظمة وسهلة القراءة (استخدم النقاط والتنسيق).
`;

export const streamGeminiResponse = async function* (
  message: string, 
  history: {role: string, parts: {text: string}[]}[],
  contextData?: string
) {
  try {
    // Inject dynamic context into the system instruction
    const systemInstruction = contextData 
        ? `${BASE_SYSTEM_INSTRUCTION}\n\n[سياق التطبيق الحالي (استخدمه للإجابة بدقة عند الحاجة)]:\n${contextData}`
        : BASE_SYSTEM_INSTRUCTION;

    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
      history: history
    });

    const result = await chat.sendMessageStream({
      message: message
    });

    for await (const chunk of result) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Gemini Streaming Error:", error);
    yield "عذراً، حدث خطأ أثناء الاتصال بالمساعد الذكي. تأكد من الاتصال بالإنترنت.";
  }
};

export const sendMessageToGemini = async (message: string, history: {role: string, parts: {text: string}[]}[] = []): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: BASE_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
      history: history
    });

    const result = await chat.sendMessage({
      message: message
    });

    return result.text || "عذراً، لم أتمكن من الحصول على إجابة.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "حدث خطأ أثناء الاتصال بالمساعد الذكي.";
  }
};

export const explainAyah = async (surahName: string, ayahNumber: number, ayahText: string): Promise<string> => {
    const prompt = `اشرح الآية رقم ${ayahNumber} من سورة ${surahName}: "${ayahText}". قدم تفسيراً ميسراً ومختصراً.`;
    return sendMessageToGemini(prompt);
};

export const searchHadith = async (keyword: string): Promise<string> => {
    const prompt = `ابحث عن حديث صحيح يتعلق بـ "${keyword}". اذكر نص الحديث، الراوي/المصدر، وشرحاً مبسطاً لمعناه والدروس المستفادة منه.`;
    return sendMessageToGemini(prompt);
};

export const getNameReflection = async (name: string): Promise<string> => {
    const prompt = `اكتب تأملاً روحانيًا قصيرًا ودافئًا (حوالي 60-80 كلمة) عن اسم الله الحسنى "${name}". ركز على كيف يمكن للمسلم أن يتخلق بهذا الاسم أو يشعر به في حياته اليومية ومشاكله المعاصرة. اجعل الأسلوب يلمس القلب ويبعث على الطمأنينة.`;
    return sendMessageToGemini(prompt);
};