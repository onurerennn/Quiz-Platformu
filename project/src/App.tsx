import React, { useState, useEffect } from 'react';
import { Brain, BookOpen, Globe2 } from 'lucide-react';
import { QuizCard } from './components/QuizCard';
import { Timer } from './components/Timer';
import { Results } from './components/Results';
import { UserLogin } from './components/UserLogin';
import { QuizHistoryView } from './components/QuizHistory';
import { Category, QuizState, Question, User, QuizHistory } from './types';
import { fetchQuestions } from './services/api';

// Quiz kategorileri tanımlaması
const categories: Category[] = [
  { id: 'all', name: 'Tüm Kategoriler', icon: 'Brain' },
  { id: 'history', name: 'Tarih', icon: 'BookOpen' },
  { id: 'science', name: 'Bilim', icon: 'Brain' },
  { id: 'geography', name: 'Coğrafya', icon: 'Globe2' },
];

// Quiz süresi (saniye cinsinden)
const QUIZ_TIME = 300; // 5 dakika

// Kategori ikonlarını render eden yardımcı fonksiyon
const renderIcon = (iconName: string) => {
  switch (iconName) {
    case 'Brain':
      return <Brain className="w-6 h-6" />;
    case 'BookOpen':
      return <BookOpen className="w-6 h-6" />;
    case 'Globe2':
      return <Globe2 className="w-6 h-6" />;
    default:
      return <Brain className="w-6 h-6" />;
  }
};

export default function App() {
  // State tanımlamaları
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    score: 0,
    answers: [],
    timeRemaining: QUIZ_TIME,
    quizStarted: false,
    quizFinished: false,
  });

  // Timer efekti
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizState.quizStarted && !quizState.quizFinished && quizState.timeRemaining > 0) {
      timer = setInterval(() => {
        setQuizState(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;
          // Süre dolduğunda quizi bitir
          if (newTimeRemaining === 0) {
            return {
              ...prev,
              quizFinished: true,
              timeRemaining: 0
            };
          }
          return {
            ...prev,
            timeRemaining: newTimeRemaining
          };
        });
      }, 1000);
    }

    // Cleanup fonksiyonu
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [quizState.quizStarted, quizState.quizFinished, quizState.timeRemaining]);

  // Kullanıcı girişi işlemi
  const handleLogin = (newUser: User) => {
    setUser(newUser);
    // Kullanıcının geçmiş quiz sonuçlarını yükle
    const savedHistory = localStorage.getItem(`quizHistory_${newUser.name}`);
    if (savedHistory) {
      setQuizHistory(JSON.parse(savedHistory));
    }
  };

  // Quiz sonucunu kaydetme
  const saveQuizResult = () => {
    if (user) {
      const newQuizResult: QuizHistory = {
        id: Date.now(),
        userName: user.name,
        category: selectedCategory,
        score: quizState.score,
        totalQuestions: questions.length,
        date: new Date().toISOString(),
      };

      const updatedHistory = [...quizHistory, newQuizResult];
      setQuizHistory(updatedHistory);
      localStorage.setItem(`quizHistory_${user.name}`, JSON.stringify(updatedHistory));
    }
  };

  // Quiz başlatma
  const startQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedQuestions = await fetchQuestions(selectedCategory);
      setQuestions(fetchedQuestions);
      setQuizState({
        currentQuestion: 0,
        score: 0,
        answers: [],
        timeRemaining: QUIZ_TIME,
        quizStarted: true,
        quizFinished: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Cevap işleme
  const handleAnswer = (answerIndex: number) => {
    const currentQuestion = questions[quizState.currentQuestion];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    setQuizState(prev => {
      const newState = {
        ...prev,
        score: isCorrect ? prev.score + 1 : prev.score,
        answers: [...prev.answers, answerIndex],
        currentQuestion: prev.currentQuestion + 1,
        quizFinished: prev.currentQuestion + 1 >= questions.length,
      };

      if (newState.quizFinished) {
        saveQuizResult();
      }

      return newState;
    });
  };

  // Quiz'i yeniden başlatma
  const restartQuiz = () => {
    setQuizState({
      currentQuestion: 0,
      score: 0,
      answers: [],
      timeRemaining: QUIZ_TIME,
      quizStarted: false,
      quizFinished: false,
    });
    setSelectedCategory('all');
    setQuestions([]);
  };

  // Kullanıcı girişi yapılmamışsa login ekranını göster
  if (!user) {
    return <UserLogin onLogin={handleLogin} />;
  }

  // Quiz başlamamışsa kategori seçim ekranını göster
  if (!quizState.quizStarted) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h1 className="text-3xl font-bold text-center mb-8">Quiz Platformu</h1>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`p-4 rounded-lg flex items-center space-x-3 transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {renderIcon(category.icon)}
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={startQuiz}
                disabled={loading}
                className={`w-full py-3 rounded-lg transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {loading ? 'Yükleniyor...' : 'Quizi Başlat'}
              </button>
            </div>
            <QuizHistoryView history={quizHistory} userName={user.name} />
          </div>
        </div>
      </div>
    );
  }

  // Quiz bittiyse sonuç ekranını göster
  if (quizState.quizFinished) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Results
          score={quizState.score}
          totalQuestions={questions.length}
          onRestart={restartQuiz}
        />
      </div>
    );
  }

  // Sorular yükleniyorsa loading ekranını göster
  if (questions.length === 0 || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Sorular yükleniyor...</div>
      </div>
    );
  }

  // Quiz ekranını göster
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-2xl mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Soru {quizState.currentQuestion + 1}/{questions.length}
        </h1>
        <Timer timeRemaining={quizState.timeRemaining} />
      </div>
      <QuizCard
        question={questions[quizState.currentQuestion]}
        selectedAnswer={null}
        onSelectAnswer={handleAnswer}
      />
    </div>
  );
}