import React from 'react';
import { QuizHistory } from '../types';
import { History } from 'lucide-react';

interface QuizHistoryProps {
  history: QuizHistory[];
  userName: string;
}

export const QuizHistoryView: React.FC<QuizHistoryProps> = ({ history, userName }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-bold">{userName} - Quiz Geçmişi</h2>
      </div>
      <div className="space-y-4">
        {history.map((quiz) => (
          <div
            key={quiz.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{quiz.category}</p>
                <p className="text-sm text-gray-600">
                  {new Date(quiz.date).toLocaleDateString('tr-TR')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">
                  {Math.round((quiz.score / quiz.totalQuestions) * 100)}%
                </p>
                <p className="text-sm text-gray-600">
                  {quiz.score}/{quiz.totalQuestions} doğru
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};