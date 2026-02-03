import React from 'react';
import { PlayCircle, AlertCircle } from 'lucide-react';

interface TestLobbyProps {
    testTitle: string;
    attemptsLeft: number;
    contentViewed: boolean;
    onStart: () => void;
    passingScore: number;
}

export const TestLobby: React.FC<TestLobbyProps> = ({
    testTitle,
    attemptsLeft,
    contentViewed,
    onStart,
    passingScore
}) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center max-w-2xl mx-auto">
            <div className="mb-8">
                <div className="bg-blue-100 p-4 rounded-full inline-block mb-4">
                    <PlayCircle size={48} className="text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{testTitle}</h1>
                <p className="text-gray-600">
                    Weryfikacja wiedzy końcowej kursu.
                </p>
            </div>

            <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-8 w-full mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Zasady egzaminu</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <span className="block text-sm text-gray-500 mb-1">Próg zaliczenia</span>
                        <span className="text-xl font-bold text-gray-900">{passingScore}%</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <span className="block text-sm text-gray-500 mb-1">Czas na test</span>
                        <span className="text-xl font-bold text-gray-900">15 min</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <span className="block text-sm text-gray-500 mb-1">Pozostałe próby</span>
                        <span className={`text-xl font-bold ${attemptsLeft > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {attemptsLeft}
                        </span>
                    </div>
                </div>

                {!contentViewed ? (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3 text-left">
                        <AlertCircle className="text-orange-500 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="font-semibold text-orange-800">Materiał niezaliczony</h4>
                            <p className="text-sm text-orange-700 mt-1">
                                Musisz zapoznać się z  pełną treścią dokumentacji (100% slajdów) zanim przystąpisz do testu.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 text-left">
                        <AlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="font-semibold text-blue-800">Ważne ostrzeżenie</h4>
                            <p className="text-sm text-blue-700 mt-1">
                                Opuszczenie ekranu testu lub zamknięcie przeglądarki podczas trwania sesji spowoduje zakończenie próby z wynikiem 0%.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={onStart}
                disabled={!contentViewed || attemptsLeft <= 0}
                className={`
          flex items-center gap-2 px-10 py-4 rounded-full text-lg font-bold shadow-lg transition-all
          ${contentViewed && attemptsLeft > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
        `}
            >
                <span>Rozpocznij Test</span>
                <PlayCircle size={24} />
            </button>

            {attemptsLeft <= 0 && <p className="mt-4 text-red-500 font-semibold">Wykorzystano wszystkie dostępne próby.</p>}
        </div>
    );
};
