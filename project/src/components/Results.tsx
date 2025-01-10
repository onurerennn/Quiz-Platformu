import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Trophy } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ResultsProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
}

export const Results: React.FC<ResultsProps> = ({
  score,
  totalQuestions,
  onRestart,
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);

  const data = {
    labels: ['Doğru', 'Yanlış'],
    datasets: [
      {
        data: [score, totalQuestions - score],
        backgroundColor: ['#4ade80', '#f87171'],
        borderColor: ['#22c55e', '#ef4444'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
      <div className="flex items-center justify-center mb-6">
        <Trophy className="w-12 h-12 text-yellow-500" />
      </div>
      <h2 className="text-2xl font-bold text-center mb-6">Quiz Sonuçları</h2>
      <div className="mb-8 w-64 mx-auto">
        <Pie data={data} />
      </div>
      <div className="text-center">
        <p className="text-4xl font-bold text-gray-800 mb-2">{percentage}%</p>
        <p className="text-gray-600 mb-6">
          {totalQuestions} sorudan {score} tanesini doğru cevapladınız
        </p>
        <button
          onClick={onRestart}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  );
};