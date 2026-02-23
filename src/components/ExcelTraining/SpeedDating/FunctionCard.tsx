import React, { memo } from "react";
import {
  Check,
  Play,
  SkipForward,
  Clock,
  ChevronRight,
  Award,
  BookOpen,
  CheckCircle,
  Lock,
  Trophy,
} from "lucide-react";
import { ExcelFunction } from "../types";
import { getExpectedAnswer, validateSpeedDatingAnswer } from "./utils";

interface FunctionCardProps {
  currentFunction: ExcelFunction;
  phase: string;
  answers: { [key: string]: string };
  validated: { [key: string]: boolean };
  handleAnswerChange: (field: string, value: string) => void;
  validateAnswer: (field: string, isCorrect: boolean) => void;
  startSession: () => void;
  skipVideo: () => void;
  goToTrick: () => void;
  nextFunction: () => void;
  completeFunction: () => void;
  functionsLength: number;
  currentFunctionIndex: number;
  togglePassport: () => void;
  isCompleted?: boolean;
  completedScore?: number;
}

const FunctionCard: React.FC<FunctionCardProps> = memo(({
  currentFunction,
  phase,
  answers,
  validated,
  handleAnswerChange,
  validateAnswer,
  startSession,
  skipVideo,
  goToTrick,
  nextFunction,
  completeFunction,
  functionsLength,
  currentFunctionIndex,
  togglePassport,
  isCompleted = false,
  completedScore,
}) => {
  const renderAlreadyCompletedPhase = () => (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
        <CheckCircle size={40} className="text-green-500" />
      </div>
      <h3 className="text-2xl font-bold mb-2 text-green-700">Fonction deja maitrisee !</h3>
      <p className="text-lg text-bp-gray-500 mb-2">
        Vous avez deja complete la session sur <strong>{currentFunction.name}</strong>
      </p>
      {completedScore !== undefined && (
        <div className="inline-flex items-center gap-2 bg-bp-red-50 px-4 py-2 rounded-full mb-6">
          <Trophy size={20} className="text-bp-red-500" />
          <span className="font-bold text-bp-red-600">{completedScore} points</span>
        </div>
      )}
      <div className="flex items-center justify-center gap-2 text-bp-gray-400 mb-6">
        <Lock size={16} />
        <span className="text-sm">Cette fonction ne peut pas etre refaite</span>
      </div>

      <div className="flex gap-4 justify-center">
        {currentFunctionIndex < functionsLength - 1 ? (
          <button
            onClick={nextFunction}
            className="bg-bp-red-400 hover:bg-bp-red-500 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 shadow-bp transition-all duration-300"
          >
            Fonction suivante
            <ChevronRight size={20} />
          </button>
        ) : (
          <button
            onClick={togglePassport}
            className="bg-bp-red-500 hover:bg-bp-red-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 shadow-bp transition-all duration-300"
          >
            Voir mon passeport
            <Award size={20} />
          </button>
        )}
      </div>
    </div>
  );

  const renderIntroPhase = () => (
    <div className="text-center">
      <p className="text-xl mb-8">{currentFunction.description}</p>
      <div className="flex flex-col items-center gap-4">
        <p className="font-medium">Pret a decouvrir cette fonction ?</p>
        <button
          onClick={startSession}
          className="bg-bp-red-400 hover:bg-bp-red-500 text-white font-bold py-3 px-8 rounded-full text-lg flex items-center gap-2 shadow-bp transition-all duration-300"
        >
          <Play size={24} />
          Commencer la session
        </button>
      </div>
    </div>
  );

  const renderVideoPhase = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <div className="bg-bp-red-400 text-white rounded-full w-8 h-8 flex items-center justify-center">
            1
          </div>
          Decouverte de la fonction
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-bp-red-500">
            <Clock size={20} />
            <span>1 minute</span>
          </div>
          <button
            onClick={skipVideo}
            className="bg-bp-red-50 text-bp-red-500 px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-bp-red-100 transition-colors"
          >
            <SkipForward size={16} />
            Passer
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-bp-gray-50 to-white rounded-lg border-2 border-bp-red-100 p-6 max-h-[60vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen size={24} className="text-bp-red-400" />
          <h4 className="text-lg font-bold text-bp-red-600">
            Fiche fonction : {currentFunction.name}
          </h4>
        </div>
        <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
          {currentFunction.presentation}
        </div>
      </div>
    </div>
  );

  const renderExercisePhase = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <div className="bg-bp-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
            2
          </div>
          Exercice pratique
        </h3>
        <div className="flex items-center gap-2 text-bp-red-500">
          <Clock size={20} />
          <span>3 minutes</span>
        </div>
      </div>

      <div className="bg-white border-2 border-bp-red-100 rounded-lg p-6">
        <div className="mb-6">
          <div className="bg-bp-red-50 p-4 rounded-lg border border-bp-red-100 mb-4">
            <p className="text-lg font-medium">{currentFunction.exercise}</p>
          </div>
          <div className="text-sm text-bp-gray-400 mb-2">
            Completez les exercices dans Excel puis entrez vos reponses ci-dessous:
          </div>
        </div>

        <div className="space-y-4">
          {["answer1", "answer2"].map((field, index) => (
            <div key={field} className="border border-bp-gray-200 rounded-lg p-4 bg-bp-gray-50">
              <label className="block font-medium mb-2">
                {index === 0
                  ? "Veuillez renseigner la réponse à la question 1"
                  : "Veuillez renseigner la réponse à la question 2"}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={answers[field]}
                  onChange={(e) => handleAnswerChange(field, e.target.value)}
                  disabled={validated[field]}
                  placeholder="Votre reponse..."
                  className={`flex-1 border rounded-lg px-3 py-2 transition-colors ${
                    validated[field]
                      ? "bg-green-50 border-green-500"
                      : "border-bp-gray-200 focus:border-bp-red-400 focus:ring-1 focus:ring-bp-red-400"
                  }`}
                />
                {validated[field] ? (
                  <div className="bg-green-500 text-white rounded-lg px-3 py-2 flex items-center">
                    <Check size={20} />
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      const exerciseNum = (index + 1) as 1 | 2;
                      const expected = getExpectedAnswer(currentFunction.name, exerciseNum);
                      const isCorrect = expected
                        ? validateSpeedDatingAnswer(answers[field], expected)
                        : false;
                      validateAnswer(field, isCorrect);
                    }}
                    className="bg-bp-red-400 hover:bg-bp-red-500 text-white rounded-lg px-3 py-2 transition-colors"
                  >
                    Valider
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          {validated.answer1 && validated.answer2 ? (
            <div className="flex flex-col items-center gap-3">
              <div className="text-green-600 font-medium">
                Excellent ! Les 2 reponses sont correctes !
              </div>
              <button
                onClick={goToTrick}
                className="bg-bp-red-500 hover:bg-bp-red-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 shadow-bp transition-all duration-300"
              >
                Decouvrir l'astuce bonus
                <ChevronRight size={20} />
              </button>
            </div>
          ) : (
            <div className="text-bp-gray-400 text-sm">
              Validez vos deux reponses pour continuer
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTrickPhase = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <div className="bg-bp-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
            3
          </div>
          Astuce bonus
        </h3>
        <div className="flex items-center gap-2 text-bp-red-600">
          <Clock size={20} />
          <span>1 minute</span>
        </div>
      </div>

      <div className="bg-bp-red-50 border-2 border-bp-red-100 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">💡</div>
          <div className="w-full">
            <p className="text-lg whitespace-pre-line">{currentFunction.trick}</p>
            <div className="mt-6 flex justify-center">
              <button
                onClick={completeFunction}
                className="bg-bp-red-600 hover:bg-bp-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-bp transition-all duration-300"
              >
                J'ai compris l'astuce
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompletePhase = () => (
    <div className="text-center py-8">
      <div className="text-6xl mb-4">🎉</div>
      <h3 className="text-2xl font-bold mb-2">Felicitations!</h3>
      <p className="text-lg mb-6">
        Vous avez termine la session sur <strong>{currentFunction.name}</strong>
      </p>

      <div className="flex gap-4 justify-center">
        {currentFunctionIndex < functionsLength - 1 ? (
          <button
            onClick={nextFunction}
            className="bg-bp-red-400 hover:bg-bp-red-500 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 shadow-bp transition-all duration-300"
          >
            Fonction suivante
            <ChevronRight size={20} />
          </button>
        ) : (
          <button
            onClick={togglePassport}
            className="bg-bp-red-500 hover:bg-bp-red-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 shadow-bp transition-all duration-300"
          >
            Voir mon passeport
            <Award size={20} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-bp-gray-50 rounded-xl p-6 mb-6 min-h-64">
      {isCompleted ? (
        renderAlreadyCompletedPhase()
      ) : (
        <>
          {phase === "intro" && renderIntroPhase()}
          {phase === "video" && renderVideoPhase()}
          {phase === "exercise" && renderExercisePhase()}
          {phase === "trick" && renderTrickPhase()}
          {phase === "complete" && renderCompletePhase()}
        </>
      )}
    </div>
  );
});

FunctionCard.displayName = "FunctionCard";

export default FunctionCard;
