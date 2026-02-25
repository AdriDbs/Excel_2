import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
import { excelFunctions } from "./excelFunctionsData";
import { formatGlobalTime } from "./utils";
import Timer from "./Timer";
import FunctionCard from "./FunctionCard";
import Passport from "./Passport";
import Leaderboard from "./Leaderboard";
import { BRAND } from "../../../constants/brand";
import { firebaseDataService } from "../../../services/firebaseDataService";
import {
  saveSpeedDatingLeaderboardToFirebase,
  subscribeToSpeedDatingLeaderboard,
  setSpeedDatingSessionStartTime,
  getSpeedDatingSessionStartTime,
} from "../../../config/firebase";
import { LeaderboardParticipant } from "../types";

type Phase = "intro" | "video" | "exercise" | "expired" | "complete";

const ExcelSpeedDating: React.FC<ExtendedNavigationProps> = ({
  navigateTo,
  currentUser,
  onProgressUpdate,
}) => {
  const [currentFunctionIndex, setCurrentFunctionIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [timeLeft, setTimeLeft] = useState(420);
  const [timerRunning, setTimerRunning] = useState(false);
  const [completedFunctions, setCompletedFunctions] = useState<number[]>([]);
  const [showPassport, setShowPassport] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [answers, setAnswers] = useState<AnswersState>({ answer1: "", answer2: "" });
  const [validated, setValidated] = useState<ValidatedState>({ answer1: false, answer2: false });
  const [globalTimer, setGlobalTimer] = useState(0);
  const [globalTimerRunning, setGlobalTimerRunning] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [liveLeaderboardData, setLiveLeaderboardData] = useState<LeaderboardParticipant[]>([]);
  const [functionStates, setFunctionStates] = useState<Record<number, {
    timeLeft: number;
    phase: Phase;
    answers: AnswersState;
    validated: ValidatedState;
    timerRunning: boolean;
    departureTime?: number;
  }>>({});
  const [restoredFromStorage, setRestoredFromStorage] = useState(false);

  const userName = useMemo(() => currentUser?.name ?? "Vous", [currentUser]);

  const isStudent = currentUser?.role === "student";
  const progressManagerInstance = useProgressManager({ userId: currentUser?.id ?? "" });

  const { notifications, addNotification } = useProgressNotifications();

  // Ref to always capture latest state values for the unmount cleanup
  const latestStateRef = useRef({
    functionStates,
    currentFunctionIndex,
    timeLeft,
    phase,
    answers,
    validated,
    timerRunning,
  });
  useEffect(() => {
    latestStateRef.current = {
      functionStates,
      currentFunctionIndex,
      timeLeft,
      phase,
      answers,
      validated,
      timerRunning,
    };
  });

  // Restore timer state from localStorage on mount
  useEffect(() => {
    if (!currentUser?.id) return;

    const saved = localStorage.getItem(`speedDating_state_${currentUser.id}`);
    if (saved) {
      try {
        const { functionStates: savedStates, currentFunctionIndex: savedIndex } = JSON.parse(saved);

        setFunctionStates(savedStates || {});
        const idx = savedIndex ?? 0;
        setCurrentFunctionIndex(idx);

        const currentState = savedStates?.[idx];
        if (currentState) {
          let restoredTime = currentState.timeLeft;
          // Recalculate elapsed time for students whose timer was running
          if (isStudent && currentState.timerRunning && currentState.departureTime) {
            const elapsed = Math.floor((Date.now() - currentState.departureTime) / 1000);
            restoredTime = Math.max(0, currentState.timeLeft - elapsed);
          }
          // If time ran out while away and not already in a terminal phase, expire it
          const restoredPhase: Phase =
            isStudent && restoredTime <= 0 &&
            currentState.phase !== "complete" &&
            currentState.phase !== "intro"
              ? "expired"
              : (currentState.phase as Phase);
          setTimeLeft(restoredTime);
          setPhase(restoredPhase);
          setTimerRunning(isStudent && currentState.timerRunning && restoredTime > 0);
          setAnswers(currentState.answers || { answer1: "", answer2: "" });
          setValidated(currentState.validated || { answer1: false, answer2: false });
        }

        setRestoredFromStorage(true);
      } catch {
        // Ignore parse errors — start fresh
      }
    }
  }, [currentUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save timer state to localStorage on unmount
  useEffect(() => {
    if (!currentUser?.id) return;
    const userId = currentUser.id;
    return () => {
      const state = latestStateRef.current;
      const now = Date.now();
      const toSave = {
        functionStates: {
          ...state.functionStates,
          [state.currentFunctionIndex]: {
            timeLeft: state.timeLeft,
            phase: state.phase,
            answers: state.answers,
            validated: state.validated,
            timerRunning: state.timerRunning,
            departureTime: state.timerRunning ? now : undefined,
          },
        },
        currentFunctionIndex: state.currentFunctionIndex,
      };
      localStorage.setItem(`speedDating_state_${userId}`, JSON.stringify(toSave));
    };
  }, [currentUser?.id]);

  // Construire le leaderboard à partir de firebaseDataService et synchroniser avec Firebase
  const buildLeaderboardData = useCallback(async (): Promise<LeaderboardParticipant[]> => {
    const students = await firebaseDataService.getStudents();
    const participants = students.map((student) => {
      const completedFunctionIds: number[] = [];
      let totalTime = 0;

      Object.entries(student.speedDatingProgress || {}).forEach(([key, progress]) => {
        if (progress && typeof progress === "object" && progress.completed) {
          completedFunctionIds.push(parseInt(key) - 1);
          totalTime += progress.timeSpent || 0;
        }
      });

      const totalScore = Object.values(student.speedDatingProgress || {})
        .filter((p) => p && typeof p === "object")
        .reduce((sum, p) => sum + (p.score || 0), 0);

      const minutes = Math.floor(totalTime / 60);
      const secs = totalTime % 60;

      return {
        name: student.name,
        completed: completedFunctionIds.length,
        completedFunctions: completedFunctionIds,
        totalTime: `${minutes}:${secs < 10 ? "0" : ""}${secs}`,
        totalScore,
      };
    }).sort((a, b) => b.completed - a.completed);

    // Toujours inclure l'utilisateur courant dans le leaderboard
    if (currentUser && !participants.some((p) => p.name.toLowerCase() === currentUser.name.toLowerCase())) {
      participants.push({
        name: currentUser.name,
        completed: 0,
        completedFunctions: [],
        totalTime: "0:00",
        totalScore: 0,
      });
    }

    return participants;
  }, [currentUser]);

  // Mise à jour du leaderboard et sync Firebase
  useEffect(() => {
    let isMounted = true;

    // Construire le leaderboard initial
    const initLeaderboard = async () => {
      try {
        const data = await buildLeaderboardData();
        if (!isMounted) return;
        setLiveLeaderboardData(data);
        if (data.length > 0) {
          saveSpeedDatingLeaderboardToFirebase(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du leaderboard:", error);
      }
    };

    initLeaderboard();

    // Écouter les mises à jour du leaderboard via Firebase
    const unsubscribe = subscribeToSpeedDatingLeaderboard((firebaseData) => {
      if (!isMounted) return;
      if (firebaseData?.participants && Array.isArray(firebaseData.participants)) {
        // Firebase supprime les tableaux vides, il faut s'assurer que completedFunctions est toujours un tableau
        const normalized = firebaseData.participants.map((p: any) => ({
          ...p,
          completedFunctions: p.completedFunctions || [],
        }));
        setLiveLeaderboardData(normalized);
      }
    });

    // Rafraîchir le leaderboard toutes les 10 secondes
    const refreshInterval = setInterval(async () => {
      try {
        const freshData = await buildLeaderboardData();
        if (!isMounted) return;
        setLiveLeaderboardData(freshData);
        if (freshData.length > 0) {
          saveSpeedDatingLeaderboardToFirebase(freshData);
        }
      } catch (error) {
        console.error("Erreur lors du rafraîchissement du leaderboard:", error);
      }
    }, 10000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [buildLeaderboardData]);

  // Restaurer le timer global depuis Firebase au montage
  useEffect(() => {
    if (!currentUser?.id) return;

    const restoreTimer = async () => {
      const startTime = await getSpeedDatingSessionStartTime(currentUser.id);
      if (startTime) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setGlobalTimer(elapsed);
        setSessionStarted(true);
        setGlobalTimerRunning(true);
      }
    };

    restoreTimer();
  }, [currentUser?.id]);

  // Charger la progression et naviguer vers la premiere fonction non completee
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    if (isStudent && progressManagerInstance.speedDatingProgress) {
      const completedIds = Object.keys(progressManagerInstance.speedDatingProgress)
        .filter((id) => {
          const progress = progressManagerInstance.speedDatingProgress[parseInt(id)];
          return progress && typeof progress === "object" && progress.completed;
        })
        .map((id) => parseInt(id) - 1);
      setCompletedFunctions(completedIds);

      // Skip auto-navigation if we already restored position from localStorage
      if (restoredFromStorage) return;

      // Au premier chargement, naviguer vers la premiere fonction non completee
      if (!initialLoadDone && completedIds.length > 0) {
        setInitialLoadDone(true);
        const firstUncompleted = excelFunctions.findIndex(
          (_, index) => !completedIds.includes(index)
        );
        if (firstUncompleted !== -1) {
          setCurrentFunctionIndex(firstUncompleted);
          setPhase("intro");
        } else {
          // Toutes les fonctions sont completees, rester sur la premiere
          setPhase("complete");
        }
      } else if (completedIds.includes(currentFunctionIndex)) {
        setPhase("complete");
      }
    }
  }, [isStudent, progressManagerInstance.speedDatingProgress, restoredFromStorage]);

  // Phase timer effect — single shared timer per function, always expires to "expired"
  useEffect(() => {
    if (!timerRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((time) => {
        if (time <= 1) {
          setTimerRunning(false);
          setPhase("expired");
          return 0;
        }
        return time - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  // Global timer effect
  useEffect(() => {
    if (!globalTimerRunning) return;

    const interval = setInterval(() => {
      setGlobalTimer((time) => time + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [globalTimerRunning]);

  const currentFunction = excelFunctions[currentFunctionIndex] ?? excelFunctions[0];

  // A function is "finished" if it is completed (validated) or its timer has expired
  const finishedFunctions = useMemo(() => {
    const finished = new Set<number>(completedFunctions);
    // Add functions whose saved state is "expired"
    Object.entries(functionStates).forEach(([index, state]) => {
      if (state.phase === "expired") {
        finished.add(parseInt(index));
      }
    });
    // Add current function if currently expired
    if (phase === "expired") {
      finished.add(currentFunctionIndex);
    }
    return finished;
  }, [completedFunctions, functionStates, phase, currentFunctionIndex]);

  // All functions are done when every function is either completed or expired
  const allFunctionsDone = finishedFunctions.size === excelFunctions.length;

  const handleFunctionComplete = useCallback(async (
    functionId: number,
    score: number,
    timeSpent: number
  ) => {
    if (!isStudent) {
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

      // Mettre à jour le leaderboard après validation
      setTimeout(async () => {
        try {
          const freshData = await buildLeaderboardData();
          setLiveLeaderboardData(freshData);
          if (freshData.length > 0) {
            saveSpeedDatingLeaderboardToFirebase(freshData);
          }
        } catch (error) {
          console.error("Erreur lors de la mise à jour du leaderboard:", error);
        }
      }, 500);

      const completion = progressManagerInstance.getSpeedDatingCompletion();
      if (completion.completed === 5) {
        addNotification("Milestone atteint : 5 fonctions maitrisees !", "milestone");
      } else if (completion.completed === 10) {
        addNotification("Excellent ! 10 fonctions maitrisees !", "milestone");
      } else if (completion.completed === excelFunctions.length) {
        addNotification("Felicitations ! Toutes les fonctions maitrisees !", "milestone");
      }
    }
  }, [isStudent, progressManagerInstance, currentFunctionIndex, currentFunction.name, addNotification, onProgressUpdate]);

  const toggleTimer = useCallback(() => setTimerRunning((prev) => !prev), []);

  const resetTimer = useCallback(() => {
    setTimerRunning(false);
    const timeMap: Record<Phase, number> = { video: 420, exercise: 420, expired: 0, intro: 420, complete: 0 };
    setTimeLeft(timeMap[phase]);
  }, [phase]);

  const navigateFunction = useCallback((direction: 1 | -1) => {
    const newIndex = currentFunctionIndex + direction;
    if (newIndex >= 0 && newIndex < excelFunctions.length) {
      const now = Date.now();

      // Save current function's state, including timer running status and departure time
      setFunctionStates(prev => ({
        ...prev,
        [currentFunctionIndex]: {
          timeLeft,
          phase,
          answers,
          validated,
          timerRunning,
          departureTime: timerRunning ? now : undefined,
        },
      }));

      setCurrentFunctionIndex(newIndex);

      // When all functions are done, allow free navigation (no lock on completed functions)
      if (completedFunctions.includes(newIndex) && !allFunctionsDone) {
        setPhase("complete");
        setTimeLeft(0);
        setTimerRunning(false);
        setAnswers({ answer1: "", answer2: "" });
        setValidated({ answer1: false, answer2: false });
      } else {
        const savedState = functionStates[newIndex];
        if (savedState) {
          // Compute remaining time accounting for elapsed time if timer was running
          let restoredTime = savedState.timeLeft;
          if (savedState.timerRunning && savedState.departureTime) {
            const elapsed = Math.floor((now - savedState.departureTime) / 1000);
            restoredTime = Math.max(0, savedState.timeLeft - elapsed);
          }
          const restoredPhase = restoredTime <= 0 ? "expired" : savedState.phase;
          setTimeLeft(restoredTime);
          setPhase(restoredPhase);
          // In review mode (allFunctionsDone) or for instructors, don't restart the timer
          setTimerRunning(savedState.timerRunning && restoredTime > 0 && isStudent && !allFunctionsDone);
          setAnswers(savedState.answers);
          setValidated(savedState.validated);
        } else if (completedFunctions.includes(newIndex)) {
          // Completed but no saved state (completed in a previous session) — review mode
          setPhase("complete");
          setTimeLeft(0);
          setTimerRunning(false);
          setAnswers({ answer1: "", answer2: "" });
          setValidated({ answer1: false, answer2: false });
        } else {
          setPhase("intro");
          setTimeLeft(420);
          setTimerRunning(false);
          setAnswers({ answer1: "", answer2: "" });
          setValidated({ answer1: false, answer2: false });
        }
      }
    }
  }, [currentFunctionIndex, completedFunctions, timeLeft, phase, answers, validated, functionStates, timerRunning, isStudent, allFunctionsDone]);

  const startSession = useCallback(() => {
    // Students cannot redo a completed function unless all functions are done (review mode)
    if (isStudent && !allFunctionsDone && completedFunctions.includes(currentFunctionIndex)) {
      return;
    }
    if (!sessionStarted) {
      setSessionStarted(true);
      setGlobalTimerRunning(true);
      // Persister le timestamp de démarrage dans Firebase
      if (currentUser?.id) {
        setSpeedDatingSessionStartTime(currentUser.id, Date.now());
      }
    }
    setPhase("video");
    setTimeLeft(420);
    // Only start the countdown for students (instructors have no timer).
    // In review mode (allFunctionsDone), the timer does not run either.
    if (isStudent && !allFunctionsDone) {
      setTimerRunning(true);
    }
  }, [sessionStarted, completedFunctions, currentFunctionIndex, currentUser?.id, isStudent, allFunctionsDone]);

  const skipVideo = useCallback(() => {
    setPhase("exercise");
    // Timer continues without reset — single shared timer per function
  }, []);

  const completeFunction = useCallback(() => {
    // If the countdown has expired, points cannot be awarded
    if (timeLeft <= 0) {
      setPhase("expired");
      setTimerRunning(false);
      return;
    }

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
    if (isCorrect) {
      addNotification("Bonne reponse !", "success");
    } else {
      addNotification("Mauvaise reponse, reessayez !", "warning");
    }
  }, [addNotification]);

  const progressStats = useMemo(() => {
    if (!isStudent) {
      return {
        completed: completedFunctions.length,
        total: excelFunctions.length,
        percentage: (completedFunctions.length / excelFunctions.length) * 100,
        totalScore: 0,
      };
    }

    const completion = progressManagerInstance.getSpeedDatingCompletion();
    return { ...completion, totalScore: progressManagerInstance.getTotalScore() };
  }, [isStudent, progressManagerInstance, completedFunctions.length]);

  const phaseProgress = useMemo(() => {
    const progressMap: Record<Phase, string> = {
      intro: "0%",
      video: "25%",
      exercise: "50%",
      expired: "50%",
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

              {/* Timer: only shown for students (instructors have no timer) */}
              {isStudent && (
                <Timer
                  timeLeft={timeLeft}
                  timerRunning={timerRunning}
                  toggleTimer={toggleTimer}
                  resetTimer={resetTimer}
                  showControls={false}
                />
              )}
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
              isCompleted={isStudent && completedFunctions.includes(currentFunctionIndex) && !allFunctionsDone}
              completedScore={
                progressManagerInstance.speedDatingProgress[currentFunctionIndex + 1]?.score
              }
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
          leaderboardData={liveLeaderboardData}
          onClose={() => setShowLeaderboard(false)}
          excelFunctions={excelFunctions}
          userName={userName}
        />
      )}
    </div>
  );
};

export default ExcelSpeedDating;
