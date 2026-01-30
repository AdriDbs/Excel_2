import React from "react";
// Importation explicite de tous les composants Lucide utilisés
import {
  Check,
  Play,
  SkipForward,
  Clock,
  ChevronRight,
  Award,
} from "lucide-react";
import { ExcelFunction } from "../types";

interface FunctionCardProps {
  currentFunction: ExcelFunction;
  phase: string;
  answers: { [key: string]: string };
  validated: { [key: string]: boolean };
  handleAnswerChange: (field: string, value: string) => void;
  validateAnswer: (field: string, isCorrect: boolean) => void;
  startSession: () => void;
  skipVideo: () => void;
  nextFunction: () => void;
  completeFunction: () => void;
  functionsLength: number;
  currentFunctionIndex: number;
  togglePassport: () => void;
}

const FunctionCard = ({
  currentFunction,
  phase,
  answers,
  validated,
  handleAnswerChange,
  validateAnswer,
  startSession,
  skipVideo,
  nextFunction,
  completeFunction,
  functionsLength,
  currentFunctionIndex,
  togglePassport,
}: FunctionCardProps) => {
  return (
    <div className="bg-gray-50 rounded-xl p-6 mb-6 min-h-64">
      {phase === "intro" && (
        <div className="text-center">
          <p className="text-xl mb-8">{currentFunction.description}</p>

          <div className="flex flex-col items-center gap-4">
            <p className="font-medium">Prêt à découvrir cette fonction ?</p>
            <button
              onClick={startSession}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg flex items-center gap-2"
            >
              <Play size={24} />
              Commencer la session
            </button>
          </div>
        </div>
      )}

      {phase === "video" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                1
              </div>
              Vidéo de présentation
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-blue-700">
                <Clock size={20} />
                <span>1 minute</span>
              </div>
              <button
                onClick={skipVideo}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-blue-200"
              >
                <SkipForward size={16} />
                Passer
              </button>
            </div>
          </div>

          <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-white text-center p-4">
              <p className="mb-2">Vidéo de présentation pour</p>
              <p className="text-2xl font-bold">{currentFunction.name}</p>
              <p className="mt-4 text-gray-300 text-sm">
                (Interface de démonstration uniquement - vidéo à implémenter)
              </p>
            </div>
          </div>
        </div>
      )}

      {phase === "exercise" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                2
              </div>
              Exercice pratique
            </h3>
            <div className="flex items-center gap-2 text-green-700">
              <Clock size={20} />
              <span>3 minutes</span>
            </div>
          </div>

          <div className="bg-white border-2 border-green-200 rounded-lg p-6">
            <div className="mb-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                <p className="text-lg font-medium">
                  {currentFunction.exercise}
                </p>
              </div>

              <div className="text-sm text-gray-500 mb-2">
                Complétez les exercices dans Excel puis entrez vos réponses
                ci-dessous:
              </div>
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <label className="block font-medium mb-2">
                  {currentFunction.exercisePrompt1}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={answers.answer1}
                    onChange={(e) =>
                      handleAnswerChange("answer1", e.target.value)
                    }
                    disabled={validated.answer1}
                    placeholder="Votre réponse..."
                    className={`flex-1 border rounded-lg px-3 py-2 ${
                      validated.answer1 ? "bg-green-50 border-green-500" : ""
                    }`}
                  />
                  {validated.answer1 ? (
                    <div className="bg-green-500 text-white rounded-lg px-3 py-2 flex items-center">
                      <Check size={20} />
                    </div>
                  ) : (
                    <button
                      onClick={() => validateAnswer("answer1", answers.answer1.toLowerCase() === "bearingpoint")}
                      className="bg-blue-600 text-white rounded-lg px-3 py-2"
                    >
                      Valider
                    </button>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <label className="block font-medium mb-2">
                  {currentFunction.exercisePrompt2}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={answers.answer2}
                    onChange={(e) =>
                      handleAnswerChange("answer2", e.target.value)
                    }
                    disabled={validated.answer2}
                    placeholder="Votre réponse..."
                    className={`flex-1 border rounded-lg px-3 py-2 ${
                      validated.answer2 ? "bg-green-50 border-green-500" : ""
                    }`}
                  />
                  {validated.answer2 ? (
                    <div className="bg-green-500 text-white rounded-lg px-3 py-2 flex items-center">
                      <Check size={20} />
                    </div>
                  ) : (
                    <button
                      onClick={() => validateAnswer("answer2", answers.answer2.toLowerCase() === "bearingpoint")}
                      className="bg-blue-600 text-white rounded-lg px-3 py-2"
                    >
                      Valider
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              {validated.answer1 && validated.answer2 ? (
                <div className="text-green-600 font-medium">
                  Excellent ! Vous allez passer à l'astuce bonus...
                </div>
              ) : (
                <div className="text-gray-500 text-sm">
                  Pour cette version d'essai, entrez "BearingPoint" comme
                  réponse
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {phase === "trick" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                3
              </div>
              Astuce bonus
            </h3>
            <div className="flex items-center gap-2 text-purple-700">
              <Clock size={20} />
              <span>1 minute</span>
            </div>
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">💡</div>
              <div className="w-full">
                <p className="text-lg whitespace-pre-line">
                  {currentFunction.trick}
                </p>

                <div className="mt-6 flex justify-center">
                  <button
                    onClick={completeFunction}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg"
                  >
                    J'ai compris l'astuce
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === "complete" && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold mb-2">Félicitations!</h3>
          <p className="text-lg mb-6">
            Vous avez terminé la session sur{" "}
            <strong>{currentFunction.name}</strong>
          </p>

          <div className="flex gap-4 justify-center">
            {currentFunctionIndex < functionsLength - 1 ? (
              <button
                onClick={nextFunction}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2"
              >
                Fonction suivante
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={togglePassport}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2"
              >
                Voir mon passeport
                <Award size={20} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FunctionCard;
