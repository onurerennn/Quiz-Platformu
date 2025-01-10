import { Question } from '../types';

const API_BASE_URL = 'https://opentdb.com/api.php';
const TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

const decodeHtml = (html: string) => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

// Metni çeviren fonksiyon
async function translateText(text: string, targetLang: string = 'tr'): Promise<string> {
  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
    const data = await response.json();
    return data[0][0][0];
  } catch (error) {
    console.error('Çeviri hatası:', error);
    return text; // Hata durumunda orijinal metni döndür
  }
}

// Soru ve cevapları çeviren fonksiyon
async function translateQuestion(question: any, targetLang: string): Promise<Question> {
  try {
    // Soruyu çevir
    const translatedQuestion = await translateText(decodeHtml(question.question), targetLang);
    
    // Cevapları çevir
    const translatedOptions = await Promise.all([
      ...question.incorrect_answers,
      question.correct_answer
    ].map(answer => translateText(decodeHtml(answer), targetLang)));

    // Doğru cevabın çevirisini bul
    const translatedCorrectAnswer = await translateText(decodeHtml(question.correct_answer), targetLang);
    const correctAnswerIndex = translatedOptions.findIndex(
      option => option === translatedCorrectAnswer
    );

    return {
      id: Math.random(), // Benzersiz ID
      category: question.category.toLowerCase(),
      question: translatedQuestion,
      options: translatedOptions.sort(() => Math.random() - 0.5),
      correctAnswer: correctAnswerIndex
    };
  } catch (error) {
    console.error('Soru çeviri hatası:', error);
    return formatQuestion(question); // Hata durumunda orijinal soruyu formatla
  }
}

const formatQuestion = (q: any): Question => {
  const options = [...q.incorrect_answers, q.correct_answer]
    .map(answer => decodeHtml(answer))
    .sort(() => Math.random() - 0.5);

  return {
    id: Math.random(),
    category: q.category.toLowerCase(),
    question: decodeHtml(q.question),
    options,
    correctAnswer: options.findIndex(
      option => decodeHtml(q.correct_answer) === option
    )
  };
};

const categoryMapping: Record<string, number> = {
  history: 23,  // History
  science: 17,  // Science & Nature
  geography: 22 // Geography
};

export const fetchQuestions = async (
  category: string, 
  language: string = 'tr'
): Promise<Question[]> => {
  try {
    const amount = category === 'all' ? 10 : 5;
    const categoryId = category === 'all' ? '' : `&category=${categoryMapping[category]}`;
    
    const response = await fetch(
      `${API_BASE_URL}?amount=${amount}${categoryId}&type=multiple`
    );

    if (!response.ok) {
      throw new Error('API yanıt vermedi');
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return getBackupQuestions(category);
    }

    // Tüm soruları çevir
    const translatedQuestions = await Promise.all(
      data.results.map(q => translateQuestion(q, language))
    );

    return translatedQuestions;
  } catch (error) {
    console.error('Sorular yüklenirken hata oluştu:', error);
    return getBackupQuestions(category);
  }
};

// Yedek sorular aynı kalacak
const backupQuestions: Record<string, Question[]> = {
  // ... mevcut yedek sorular ...
};

const getBackupQuestions = (category: string): Question[] => {
  if (category === 'all') {
    return Object.values(backupQuestions)
      .flat()
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);
  }
  return backupQuestions[category] || [];
};