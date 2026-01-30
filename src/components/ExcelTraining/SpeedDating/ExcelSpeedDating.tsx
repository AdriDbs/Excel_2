import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Home,
  Award,
  Clock,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Target,
  CheckCircle,
} from "lucide-react";
import {
  ExtendedNavigationProps,
  AnswersState,
  ValidatedState,
} from "../types";
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
import { BRAND } from "../../../constants/brand";

type Phase = "intro" | "video" | "exercise" | "trick" | "complete";

const ExcelSpeedDating: React.FC<ExtendedNavigationProps> = ({
  navigateTo,
  currentUser,
  onProgressUpdate,
}) => {
  const [currentFunctionIndex, setCurrentFunctionIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [completedFunctions, setCompletedFunctions] = useState<number[]>([]);
  const [showPassport, setShowPassport] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [answers, setAnswers] = useState<AnswersState>({ answer1: "", answer2: "" });
  const [validated, setValidated] = useState<ValidatedState>({ answer1: false, answer2: false });
  const [globalTimer, setGlobalTimer] = useState(0);
  const [globalTimerRunning, setGlobalTimerRunning] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  const userName = useMemo(() => currentUser?.name ?? "Vous", [currentUser]);

  const progressManager = useMemo(() => {
    if (currentUser?.role === "student") {
      return null; // Will be initialized in useEffect
    }
    return null;
  }, [currentUser]);

  const progressManagerInstance = currentUser?.role === "student"
    ? useProgressManager({ userId: currentUser.id })
    : null;

  const { notifications, addNotification } = useProgressNotifications();

  useEffect(() => {
    if (progressManagerInstance) {
      const completedIds = Object.keys(progressManagerInstance.speedDatingProgress)
        .filter((id) => progressManagerInstance.speedDatingProgress[parseInt(id)]?.completed)
        .map((id) => parseInt(id) - 1);
      setCompletedFunctions(completedIds);
    }
  }, [progressManagerInstance]);

  // Phase timer effect
  useEffect(() => {
    if (!timerRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((time) => {
        if (time <= 1) {
          setTimerRunning(false);
          if (phase === "video") {
            setPhase("exercise");
            return 180;
          } else if (phase === "exercise") {
            setPhase("trick");
            return 60;
          }
          return 0;
        }
        return time - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning, phase, timeLeft]);

  // Global timer effect
  useEffect(() => {
    if (!globalTimerRunning) return;

    const interval = setInterval(() => {
      setGlobalTimer((time) => time + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [globalTimerRunning]);

  const currentFunction = excelFunctions[currentFunctionIndex];

  const handleFunctionComplete = useCallback(async (
    functionId: number,
    score: number,
    timeSpent: number
  ) => {
    if (!progressManagerInstance) {
      setCompletedFunctions((prev) => Array.from(new Set([...prev, currentFunctionIndex])));
      return;
    }

    const success = await progressManagerInstance.updateSpeedDatingProgress(functionId + 1, {
      completed: true,
      score,
      timeSpent,
      completedAt: new Date().toISOString(),
    });

    if (success) {
      setCompletedFunctions((prev) => Array.from(new Set([...prev, currentFunctionIndex])));

      addNotification(`Fonction ${currentFunction.name} maitrisee ! +${score} points`, "achievement");

      onProgressUpdate?.("speedDating", {
        [functionId + 1]: {
          completed: true,
          score,
          timeSpent,
          completedAt: new Date().toISOString(),
        },
      });

      const completion = progressManagerInstance.getSpeedDatingCompletion();
      if (completion.completed === 5) {
        addNotification("Milestone atteint : 5 fonctions maitrisees !", "milestone");
      } else if (completion.completed === 10) {
        addNotification("Excellent ! 10 fonctions maitrisees !", "milestone");
      } else if (completion.completed === 12) {
        addNotification("Felicitations ! Toutes les fonctions maitrisees !", "milestone");
      }
    }
  }, [progressManagerInstance, currentFunctionIndex, currentFunction.name, addNotification, onProgressUpdate]);

  const toggleTimer = useCallback(() => setTimerRunning((prev) => !prev), []);

  const resetTimer = useCallback(() => {
    setTimerRunning(false);
    const timeMap: Record<Phase, number> = { video: 60, exercise: 180, trick: 60, intro: 60, complete: 0 };
    setTimeLeft(timeMap[phase]);
  }, [phase]);

  const navigateFunction = useCallback((direction: 1 | -1) => {
    const newIndex = currentFunctionIndex + direction;
    if (newIndex >= 0 && newIndex < excelFunctions.length) {
      setCurrentFunctionIndex(newIndex);
      setPhase("intro");
      setTimeLeft(60);
      setTimerRunning(false);
      setAnswers({ answer1: "", answer2: "" });
      setValidated({ answer1: false, answer2: false });
    }
  }, [currentFunctionIndex]);

  const startSession = useCallback(() => {
    if (!sessionStarted) {
      setSessionStarted(true);
      setGlobalTimerRunning(true);
    }
    setPhase("video");
    setTimeLeft(60);
    setTimerRunning(true);
  }, [sessionStarted]);

  const skipVideo = useCallback(() => {
    setPhase("exercise");
    setTimeLeft(180);
  }, []);

  const completeFunction = useCallback(() => {
    const baseScore = 100;
    const timeBonus = Math.max(0, 50 - Math.floor((180 - timeLeft) / 10) * 5);
    const finalScore = baseScore + timeBonus;
    const totalTimeSpent = 240 - timeLeft;

    handleFunctionComplete(currentFunctionIndex, finalScore, totalTimeSpent);
    setPhase("complete");
    setTimerRunning(false);
  }, [timeLeft, currentFunctionIndex, handleFunctionComplete]);

  const handleAnswerChange = useCallback((field: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  }, []);

  const validateAnswer = useCallback((field: string, isCorrect: boolean) => {
    setValidated((prev) => ({ ...prev, [field]: isCorrect }));
    if (isCorrect) addNotification("Bonne reponse !", "success");
  }, [addNotification]);

  const progressStats = useMemo(() => {
    if (!progressManagerInstance) {
      return {
        completed: completedFunctions.length,
        total: 12,
        percentage: (completedFunctions.length / 12) * 100,
        totalScore: 0,
      };
    }

    const completion = progressManagerInstance.getSpeedDatingCompletion();
    return { ...completion, totalScore: progressManagerInstance.getTotalScore() };
  }, [progressManagerInstance, completedFunctions.length]);

  const phaseProgress = useMemo(() => {
    const progressMap: Record<Phase, string> = {
      intro: "0%",
      video: "25%",
      exercise: "50%",
      trick: "75%",
      complete: "100%",
    };
    return progressMap[phase];
  }, [phase]);

  return (
    <div className="min-h-screen bg-bp-gradient text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 rounded-lg shadow-bp backdrop-blur-md transition-all duration-300 animate-fade-in ${
                  notification.type === "achievement"
                    ? "bg-bp-red-400/90 border-l-4 border-bp-red-200"
                    : notification.type === "milestone"
                    ? "bg-bp-red-500/90 border-l-4 border-bp-red-300"
                    : notification.type === "warning"
                    ? "bg-bp-gray-500/90 border-l-4 border-bp-gray-300"
                    : "bg-bp-red-600/90 border-l-4 border-bp-red-400"
                }`}
              >
                <p className="text-white font-medium text-sm">{notification.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Global Timer */}
        <div className="absolute top-4 right-4 bg-bp-red-600 rounded-full px-4 py-2 flex items-center gap-2 shadow-bp">
          <Clock size={20} />
          <span className="font-mono text-lg">
            {sessionStarted ? formatGlobalTime(globalTimer) : "00:00"}
          </span>
        </div>

        <header className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo("menu")}
              className="bg-bp-red-500 hover:bg-bp-red-600 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-all duration-300 hover:shadow-bp"
            >
              <Home size={20} />
              Menu
            </button>

            <div>
              <h1 className="text-3xl font-bold mb-2">
                Excel Avance <span className="text-bp-red-400">Speed Dating</span>
              </h1>
              {currentUser && (
                <p className="text-bp-red-100">
                  Bienvenue {currentUser.name} ! Maitrisez les fonctions Excel avancees.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4 md:mt-0 flex-wrap">
            <button
              onClick={() => setShowLeaderboard(true)}
              className="bg-bp-red-500 hover:bg-bp-red-600 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-all duration-300 hover:shadow-bp"
            >
              <Award size={20} />
              Leaderboard
            </button>

            <button
              onClick={() => setShowPassport(true)}
              className="bg-bp-red-400 hover:bg-bp-red-500 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-all duration-300 hover:shadow-bp"
            >
              <Award size={20} />
              Passeport
            </button>

            {currentUser && (
              <div className="flex gap-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 flex items-center gap-2">
                  <Trophy className="text-bp-red-400" size={16} />
                  <span className="text-sm font-medium">{progressStats.totalScore}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 flex items-center gap-2">
                  <Target className="text-bp-red-200" size={16} />
                  <span className="text-sm font-medium">
                    {progressStats.completed}/{progressStats.total}
                  </span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Progress Bar */}
        {currentUser && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progression globale</span>
              <span className="text-sm text-bp-red-200">
                {progressStats.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-bp-gray-500/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-bp-red-500 to-bp-red-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressStats.percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-bp-red-100 mt-1">
              <span>Score: {progressStats.totalScore} pts</span>
              <span>{progressStats.completed} fonctions maitrisees</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white text-gray-900 rounded-xl shadow-bp-lg overflow-hidden">
          {/* Function Navigation */}
          <div className="bg-bp-gray-50 p-4 flex justify-between items-center">
            <button
              onClick={() => navigateFunction(-1)}
              disabled={currentFunctionIndex === 0}
              className={`flex items-center gap-1 px-3 py-1 rounded transition-all ${
                currentFunctionIndex === 0
                  ? "bg-bp-gray-100 text-bp-gray-400 cursor-not-allowed"
                  : "bg-bp-red-50 text-bp-red-500 hover:bg-bp-red-100"
              }`}
            >
              <ChevronLeft size={20} />
              Precedent
            </button>

            <div className="flex items-center gap-2">
              {excelFunctions.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentFunctionIndex
                      ? "bg-bp-red-400 scale-125"
                      : completedFunctions.includes(index)
                      ? "bg-bp-red-500"
                      : "bg-bp-gray-200"
                  }`}
                  title={`Fonction ${index + 1}: ${excelFunctions[index].name} ${
                    completedFunctions.includes(index) ? "✓" : ""
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => navigateFunction(1)}
              disabled={currentFunctionIndex === excelFunctions.length - 1}
              className={`flex items-center gap-1 px-3 py-1 rounded transition-all ${
                currentFunctionIndex === excelFunctions.length - 1
                  ? "bg-bp-gray-100 text-bp-gray-400 cursor-not-allowed"
                  : "bg-bp-red-50 text-bp-red-500 hover:bg-bp-red-100"
              }`}
            >
              Suivant
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Function Content */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="text-6xl">{currentFunction.avatar}</div>
                <div>
                  <h2 className="text-3xl font-bold">{currentFunction.name}</h2>
                  <p className="text-xl text-bp-red-400 font-medium">
                    {currentFunction.superpower}
                  </p>
                  {completedFunctions.includes(currentFunctionIndex) && (
                    <div className="flex items-center gap-1 text-bp-red-500 mt-1">
                      <CheckCircle size={16} />
                      <span className="text-sm font-medium">Maitrisee</span>
                    </div>
                  )}
                </div>
              </div>

              <Timer
                timeLeft={timeLeft}
                timerRunning={timerRunning}
                toggleTimer={toggleTimer}
                resetTimer={resetTimer}
              />
            </div>

            <FunctionCard
              currentFunction={currentFunction}
              phase={phase}
              answers={answers}
              validated={validated}
              handleAnswerChange={handleAnswerChange}
              validateAnswer={validateAnswer}
              startSession={startSession}
              skipVideo={skipVideo}
              nextFunction={() => navigateFunction(1)}
              completeFunction={completeFunction}
              functionsLength={excelFunctions.length}
              currentFunctionIndex={currentFunctionIndex}
              togglePassport={() => setShowPassport(true)}
            />

            <div className="h-2 bg-bp-gray-100 rounded-full">
              <div
                className="h-2 bg-bp-red-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: phaseProgress }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Overlays */}
      {showPassport && (
        <Passport
          completedFunctions={completedFunctions}
          excelFunctions={excelFunctions}
          onClose={() => setShowPassport(false)}
          userName={userName}
        />
      )}

      {showLeaderboard && (
        <Leaderboard
          leaderboardData={leaderboardData}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
};

export default ExcelSpeedDating;
