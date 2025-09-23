import React, { useState, useEffect } from "react";
import {
  Home,
  Award,
  Clock,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Target,
  User,
  CheckCircle,
} from "lucide-react";
import {
  ExtendedNavigationProps,
  AnswersState,
  ValidatedState,
} from "../types";
import { Student } from "../../../types/database";
import {
  useProgressManager,
  useProgressNotifications,
} from "../../../hooks/useProgressManager";
import { excelFunctions, leaderboardData } from "./excelFunctionsData";
import { formatGlobalTime } from "./utils";
import Timer from "./Timer";
import FunctionCard from "./FunctionCard";
import Passport from "./Passport";
import Leaderboard from "./Leaderboard";

const ExcelSpeedDating: React.FC<ExtendedNavigationProps> = ({
  navigateTo,
  currentUser,
  onProgressUpdate,
}) => {
  const [currentFunctionIndex, setCurrentFunctionIndex] = useState(0);
  const [phase, setPhase] = useState("intro"); // intro, video, exercise, trick, complete
  const [timeLeft, setTimeLeft] = useState(60); // seconds
  const [timerRunning, setTimerRunning] = useState(false);
  const [completedFunctions, setCompletedFunctions] = useState<number[]>([]);
  const [showPassport, setShowPassport] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [answers, setAnswers] = useState<AnswersState>({
    answer1: "",
    answer2: "",
  });
  const [validated, setValidated] = useState<ValidatedState>({
    answer1: false,
    answer2: false,
  });
  const [userName, setUserName] = useState("Vous");
  const [globalTimer, setGlobalTimer] = useState(0); // secondes
  const [globalTimerRunning, setGlobalTimerRunning] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  // Hooks pour la gestion de la progression (seulement si étudiant connecté)
  const progressManager =
    currentUser?.role === "student"
      ? useProgressManager({ userId: currentUser.id })
      : null;

  const { notifications, addNotification } = useProgressNotifications();

  // Charger la progression existante
  useEffect(() => {
    if (progressManager) {
      const completedIds = Object.keys(progressManager.speedDatingProgress)
        .filter(
          (id) => progressManager.speedDatingProgress[parseInt(id)]?.completed
        )
        .map((id) => parseInt(id) - 1); // Convertir en index 0-based

      setCompletedFunctions(completedIds);
    }

    // Définir le nom d'utilisateur
    if (currentUser) {
      setUserName(currentUser.name);
    }
  }, [progressManager, currentUser]);

  // Timer effect pour le timer de phase
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timerRunning && timeLeft === 0) {
      setTimerRunning(false);
      if (phase === "video") {
        setPhase("exercise");
        setTimeLeft(180); // 3 minutes for exercise
      } else if (phase === "exercise") {
        setPhase("trick");
        setTimeLeft(60); // 1 minute for trick
      } else if (phase === "trick") {
        completeFunction();
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timeLeft, phase]);

  // Global timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (globalTimerRunning) {
      interval = setInterval(() => {
        setGlobalTimer((time) => time + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [globalTimerRunning]);

  const currentFunction = excelFunctions[currentFunctionIndex];

  // Fonction pour gérer la completion d'une fonction avec progression
  const handleFunctionComplete = async (
    functionId: number,
    score: number,
    timeSpent: number
  ) => {
    if (!progressManager) {
      // Mode invité - juste marquer comme complété localement
      setCompletedFunctions((prev) => [
        ...new Set([...prev, currentFunctionIndex]),
      ]);
      return;
    }

    const success = await progressManager.updateSpeedDatingProgress(
      functionId + 1,
      {
        // +1 car les IDs commencent à 1
        completed: true,
        score: score,
        timeSpent: timeSpent,
        completedAt: new Date().toISOString(),
      }
    );

    if (success) {
      // Ajouter aux fonctions complétées
      setCompletedFunctions((prev) => [
        ...new Set([...prev, currentFunctionIndex]),
      ]);

      // Notification de réussite
      addNotification(
        `🎉 Fonction ${currentFunction.name} maîtrisée ! +${score} points`,
        "achievement"
      );

      // Notifier le parent pour mise à jour globale
      if (onProgressUpdate) {
        onProgressUpdate("speedDating", {
          [functionId + 1]: {
            completed: true,
            score: score,
            timeSpent: timeSpent,
            completedAt: new Date().toISOString(),
          },
        });
      }

      // Vérifier les milestones
      const completion = progressManager.getSpeedDatingCompletion();
      if (completion.completed === 5) {
        addNotification(
          "🏆 Milestone atteint : 5 fonctions maîtrisées !",
          "milestone"
        );
      } else if (completion.completed === 10) {
        addNotification(
          "🌟 Excellent ! 10 fonctions maîtrisées !",
          "milestone"
        );
      } else if (completion.completed === 12) {
        addNotification(
          "👑 Félicitations ! Toutes les fonctions maîtrisées !",
          "milestone"
        );
      }
    }
  };

  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    if (phase === "video") setTimeLeft(60);
    else if (phase === "exercise") setTimeLeft(180);
    else if (phase === "trick") setTimeLeft(60);
  };

  const nextFunction = () => {
    if (currentFunctionIndex < excelFunctions.length - 1) {
      setCurrentFunctionIndex(currentFunctionIndex + 1);
      setPhase("intro");
      setTimeLeft(60);
      setTimerRunning(false);
      setAnswers({ answer1: "", answer2: "" });
      setValidated({ answer1: false, answer2: false });
    }
  };

  const prevFunction = () => {
    if (currentFunctionIndex > 0) {
      setCurrentFunctionIndex(currentFunctionIndex - 1);
      setPhase("intro");
      setTimeLeft(60);
      setTimerRunning(false);
      setAnswers({ answer1: "", answer2: "" });
      setValidated({ answer1: false, answer2: false });
    }
  };

  const startSession = () => {
    if (!sessionStarted) {
      setSessionStarted(true);
      setGlobalTimerRunning(true);
    }
    setPhase("video");
    setTimeLeft(60);
    setTimerRunning(true);
  };

  const skipVideo = () => {
    setPhase("exercise");
    setTimeLeft(180);
  };

  const completeFunction = () => {
    // Calculer le score basé sur la performance
    const baseScore = 100;
    const timeBonus = Math.max(0, 50 - Math.floor((180 - timeLeft) / 10) * 5);
    const finalScore = baseScore + timeBonus;

    // Temps total passé sur cette fonction
    const totalTimeSpent = 240 - timeLeft; // 240 = 60 (video) + 180 (exercise) temps max

    // Appeler la gestion de progression
    handleFunctionComplete(currentFunctionIndex, finalScore, totalTimeSpent);

    setPhase("complete");
    setTimerRunning(false);
  };

  const handleAnswerChange = (field: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const validateAnswer = (field: string, isCorrect: boolean) => {
    setValidated((prev) => ({ ...prev, [field]: isCorrect }));

    if (isCorrect) {
      addNotification("✅ Bonne réponse !", "success");
    }
  };

  const togglePassport = () => setShowPassport(!showPassport);
  const toggleLeaderboard = () => setShowLeaderboard(!showLeaderboard);

  // Calculer les statistiques de progression
  const getProgressStats = () => {
    if (!progressManager) {
      return {
        completed: completedFunctions.length,
        total: 12,
        percentage: (completedFunctions.length / 12) * 100,
        totalScore: 0,
      };
    }

    const completion = progressManager.getSpeedDatingCompletion();
    const totalScore = progressManager.getTotalScore();

    return {
      ...completion,
      totalScore,
    };
  };

  const progressStats = getProgressStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Notifications de progression */}
        {notifications.length > 0 && (
          <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 rounded-lg shadow-lg backdrop-blur-md transition-all duration-300 animate-slide-in-right ${
                  notification.type === "achievement"
                    ? "bg-green-500 bg-opacity-90 border-l-4 border-green-300"
                    : notification.type === "milestone"
                    ? "bg-purple-500 bg-opacity-90 border-l-4 border-purple-300"
                    : notification.type === "warning"
                    ? "bg-yellow-500 bg-opacity-90 border-l-4 border-yellow-300"
                    : "bg-blue-500 bg-opacity-90 border-l-4 border-blue-300"
                }`}
              >
                <p className="text-white font-medium text-sm">
                  {notification.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Global Timer */}
        <div className="absolute top-4 right-4 bg-blue-800 rounded-full px-4 py-2 flex items-center gap-2">
          <Clock size={20} />
          <span className="font-mono text-lg">
            {sessionStarted ? formatGlobalTime(globalTimer) : "00:00"}
          </span>
        </div>

        <header className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo("menu")}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-all duration-300 hover:shadow-md"
            >
              <Home size={20} />
              Menu
            </button>

            <div>
              <h1 className="text-3xl font-bold mb-2">
                Excel Avancé{" "}
                <span className="text-yellow-400">Speed Dating</span>
              </h1>
              {currentUser && (
                <p className="text-purple-200">
                  Bienvenue {currentUser.name} ! Maîtrisez les fonctions Excel
                  avancées.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4 md:mt-0">
            <button
              onClick={toggleLeaderboard}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-all duration-300 hover:shadow-md"
            >
              <Award size={20} />
              Leaderboard
            </button>

            <button
              onClick={togglePassport}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-all duration-300 hover:shadow-md"
            >
              <Award size={20} />
              Passeport
            </button>

            {/* Statistiques utilisateur */}
            {currentUser && (
              <div className="flex gap-2">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-full px-3 py-2 flex items-center gap-2">
                  <Trophy className="text-yellow-400" size={16} />
                  <span className="text-sm font-medium">
                    {progressStats.totalScore}
                  </span>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-full px-3 py-2 flex items-center gap-2">
                  <Target className="text-green-400" size={16} />
                  <span className="text-sm font-medium">
                    {progressStats.completed}/{progressStats.total}
                  </span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Barre de progression utilisateur */}
        {currentUser && (
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progression globale</span>
              <span className="text-sm text-yellow-300">
                {progressStats.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressStats.percentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-300 mt-1">
              <span>Score: {progressStats.totalScore} pts</span>
              <span>{progressStats.completed} fonctions maîtrisées</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white text-gray-900 rounded-xl shadow-2xl overflow-hidden">
          {/* Function Navigation */}
          <div className="bg-gray-100 p-4 flex justify-between items-center">
            <button
              onClick={prevFunction}
              disabled={currentFunctionIndex === 0}
              className={`flex items-center gap-1 px-3 py-1 rounded ${
                currentFunctionIndex === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              <ChevronLeft size={20} />
              Précédent
            </button>

            <div className="flex items-center gap-2">
              {excelFunctions.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentFunctionIndex
                      ? "bg-blue-600 scale-125"
                      : completedFunctions.includes(index)
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                  title={`Fonction ${index + 1}: ${
                    excelFunctions[index].name
                  } ${completedFunctions.includes(index) ? "✓" : ""}`}
                ></div>
              ))}
            </div>

            <button
              onClick={nextFunction}
              disabled={currentFunctionIndex === excelFunctions.length - 1}
              className={`flex items-center gap-1 px-3 py-1 rounded ${
                currentFunctionIndex === excelFunctions.length - 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              Suivant
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Function Content */}
          <div className="p-6">
            {/* Function Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="text-6xl">{currentFunction.avatar}</div>
                <div>
                  <h2 className="text-3xl font-bold">{currentFunction.name}</h2>
                  <p className="text-xl text-blue-600 font-medium">
                    {currentFunction.superpower}
                  </p>
                  {completedFunctions.includes(currentFunctionIndex) && (
                    <div className="flex items-center gap-1 text-green-600 mt-1">
                      <CheckCircle size={16} />
                      <span className="text-sm font-medium">Maîtrisée</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Timer */}
              <Timer
                timeLeft={timeLeft}
                timerRunning={timerRunning}
                toggleTimer={toggleTimer}
                resetTimer={resetTimer}
              />
            </div>

            {/* Phase Content */}
            <FunctionCard
              currentFunction={currentFunction}
              phase={phase}
              answers={answers}
              validated={validated}
              handleAnswerChange={handleAnswerChange}
              validateAnswer={validateAnswer}
              startSession={startSession}
              skipVideo={skipVideo}
              nextFunction={nextFunction}
              completeFunction={completeFunction}
              functionsLength={excelFunctions.length}
              currentFunctionIndex={currentFunctionIndex}
              togglePassport={togglePassport}
            />

            {/* Progress Bar */}
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-blue-600 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${(() => {
                    if (phase === "intro") return "0%";
                    if (phase === "video") return "25%";
                    if (phase === "exercise") return "50%";
                    if (phase === "trick") return "75%";
                    if (phase === "complete") return "100%";
                    return "0%";
                  })()}`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlays */}
      {showPassport && (
        <Passport
          completedFunctions={completedFunctions}
          excelFunctions={excelFunctions}
          onClose={togglePassport}
          userName={userName}
        />
      )}

      {showLeaderboard && (
        <Leaderboard
          leaderboardData={leaderboardData}
          onClose={toggleLeaderboard}
        />
      )}

      {/* CSS pour les animations */}
      <style>
        {`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        `}
      </style>
    </div>
  );
};

export default ExcelSpeedDating;
