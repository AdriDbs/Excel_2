import React, { useState, useEffect, useRef } from "react";
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Lock,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Award,
} from "lucide-react";
import { Level, Team } from "../types";
import { useHackathon } from "../context/HackathonContext";
import { validateAnswer } from "../data/hackathonAnswers";
import { updateStudentAnswerInFirebase } from "../../../../config/firebase";

interface StudentExerciseProps {
  teamData: Team;
  getLevelIcon: (levelId: number) => React.FC<React.ComponentProps<typeof CheckCircle>>;
  hackathonLevels: Level[];
  sessionId?: string;
  userId?: string;
  onLevelComplete?: (levelId: number, points: number, timeSpent: number) => void;
}

const StudentExercise: React.FC<StudentExerciseProps> = ({
  teamData,
  getLevelIcon,
  hackathonLevels,
  sessionId,
  userId,
  onLevelComplete,
}) => {
  const {
    updateTeamScore,
    completeLevel,
    updateLevelProgress,
    setNotification,
  } = useHackathon();

  // État pour l'exercice
  const [currentLevel, setCurrentLevel] = useState(teamData.currentLevel || 0);
  const [answer, setAnswer] = useState("");
  // Deux indices séparés : indice 1 (-25 pts, aide générale) et indice 2 (-50 pts, aide technique)
  const [hint1Shown, setHint1Shown] = useState(false);
  const [hint2Shown, setHint2Shown] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [exerciseDuration, setExerciseDuration] = useState(0);
  // Suivi du niveau affiché pour éviter les sauvegardes multiples
  const lastSyncedLevelRef = useRef<number>(teamData.currentLevel || 0);

  // Obtenir le niveau actuel (borné à la taille du tableau)
  const safeCurrentLevel = Math.min(currentLevel, hackathonLevels.length - 1);
  const currentLevelData = hackathonLevels[safeCurrentLevel];

  // Réinitialiser le timer et les indices lors du changement de niveau
  useEffect(() => {
    setExerciseDuration(0);
    setTimerRunning(false);
    setHint1Shown(false);
    setHint2Shown(false);
  }, [currentLevel]);

  // Synchronisation automatique quand le niveau de l'équipe avance (coéquipier qui valide)
  // Dépend uniquement de teamData.currentLevel (pas de l'objet entier) pour éviter des resets intempestifs
  useEffect(() => {
    const teamLevel = teamData.currentLevel || 0;
    // Avancer uniquement si l'équipe a progressé au-delà du niveau local
    if (teamLevel > currentLevel) {
      setCurrentLevel(teamLevel);
      setAnswer("");
      setHint1Shown(false);
      setHint2Shown(false);
      lastSyncedLevelRef.current = teamLevel;
    }
  }, [teamData.currentLevel]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Démarrer un timer local pour le niveau actuel
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerRunning) {
      interval = setInterval(() => {
        setExerciseDuration((prev) => prev + 1);

        // Mise à jour de la progression du niveau actuel
        if (teamData.id) {
          // Simule une progression qui augmente avec le temps
          const currentProgress = Math.min(
            Math.floor(
              (exerciseDuration / (currentLevelData.timeAllocation * 60)) * 100
            ),
            99
          ); // Limite à 99% - on attend la réponse pour 100%

          if (currentProgress > 0) {
            updateLevelProgress(teamData.id, currentLevel, currentProgress);
          }
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, exerciseDuration, teamData.id, currentLevel, currentLevelData.timeAllocation, updateLevelProgress]);

  // Contrôle du timer
  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const resetExerciseTimer = () => {
    setExerciseDuration(0);
    setTimerRunning(false);
  };

  // Gérer la soumission de réponse
  const handleSubmitAnswer = () => {
    if (!teamData.id) return;

    const exerciseId = currentLevelData.exerciseId;
    if (!exerciseId) {
      setNotification("Exercice non configuré.", "error");
      return;
    }

    if (validateAnswer(exerciseId, answer)) {
      const pointsEarned = currentLevelData.pointsValue || 0;

      // 1. Mettre à jour le niveau et les niveaux complétés de l'équipe (sync Firebase immédiate)
      completeLevel(teamData.id, safeCurrentLevel);

      // 2. Mettre à jour le score de l'équipe (sync Firebase immédiate)
      updateTeamScore(teamData.id, "success", pointsEarned);

      // 3. Marquer la progression à 100%
      updateLevelProgress(teamData.id, safeCurrentLevel, 100);

      // 4. Sauvegarder la réponse de l'étudiant dans Firebase
      if (sessionId && userId && exerciseId) {
        updateStudentAnswerInFirebase(sessionId, userId, exerciseId, answer);
      }

      // 5. Notifier la progression individuelle si callback fourni
      if (onLevelComplete) {
        onLevelComplete(safeCurrentLevel, pointsEarned, exerciseDuration);
      }

      setTimerRunning(false);
      setNotification(`Exercice complété ! +${pointsEarned} points`, "success");

      // 6. Avancer automatiquement à l'exercice suivant après 2 secondes
      if (safeCurrentLevel < hackathonLevels.length - 1) {
        setTimeout(() => {
          setCurrentLevel(safeCurrentLevel + 1);
          setAnswer("");
          setHint1Shown(false);
          setHint2Shown(false);
          lastSyncedLevelRef.current = safeCurrentLevel + 1;
        }, 2000);
      }
    } else {
      setNotification("Réponse incorrecte. Essayez encore !", "error");
    }
  };

  // Indice 1 : aide générale (-25 pts)
  const handleRequestHint1 = () => {
    if (!teamData.id || hint1Shown) return;
    updateTeamScore(teamData.id, "hint", 25);
    setHint1Shown(true);
    setNotification("Indice 1 débloqué. -25 points", "hint");
  };

  // Indice 2 : aide technique détaillée (-50 pts)
  const handleRequestHint2 = () => {
    if (!teamData.id || hint2Shown) return;
    updateTeamScore(teamData.id, "hint", 50);
    setHint2Shown(true);
    setNotification("Indice 2 débloqué. -50 points supplémentaires", "hint");
  };

  // Passer au niveau précédent si possible
  const goToPreviousLevel = () => {
    if (safeCurrentLevel > 0) {
      setCurrentLevel(safeCurrentLevel - 1);
      setAnswer("");
      setHint1Shown(false);
      setHint2Shown(false);
    }
  };

  // Passer au niveau suivant si possible
  const goToNextLevel = () => {
    if (
      safeCurrentLevel < hackathonLevels.length - 1 &&
      teamData.completedLevels?.includes(safeCurrentLevel)
    ) {
      setCurrentLevel(safeCurrentLevel + 1);
      setAnswer("");
      setHint1Shown(false);
      setHint2Shown(false);
    }
  };

  // Vérifier si le niveau est complété
  const isLevelCompleted = (levelId: number) => {
    return teamData.completedLevels?.includes(levelId) || false;
  };

  // Formatter le temps d'exercice
  const formatExerciseTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const overallProgressPercentage = 
    ((teamData.completedLevels?.length || 0) / hackathonLevels.length) * 100;

  return (
    <>
      {/* Navigation entre niveaux */}
      <div className="mb-4 bg-gray-800 rounded-lg p-3 flex flex-wrap justify-center gap-2">
        {hackathonLevels.map((level, index) => {
          const LevelIcon = getLevelIcon(index);
          return (
            <div
              key={level.id}
              className={`
                relative p-2 rounded-lg cursor-pointer transition-all duration-300
                ${
                  safeCurrentLevel === index
                    ? "bg-indigo-700 ring-2 ring-indigo-300"
                    : isLevelCompleted(index)
                    ? "bg-green-700"
                    : index <=
                      Math.max(
                        0,
                        ...(teamData.completedLevels || []),
                        teamData.currentLevel || 0
                      )
                    ? "bg-gray-700"
                    : "bg-gray-700 opacity-50 cursor-not-allowed"
                }
                ${
                  isLevelCompleted(index)
                    ? "hover:bg-green-600"
                    : "hover:bg-gray-600"
                }
              `}
              onClick={() => {
                if (
                  isLevelCompleted(index) ||
                  index <=
                    Math.max(
                      ...(teamData.completedLevels || [0]),
                      teamData.currentLevel || 0
                    )
                ) {
                  setCurrentLevel(index);
                  setAnswer("");
                  setHint1Shown(false);
                  setHint2Shown(false);
                }
              }}
            >
              <div className="w-10 h-10 flex items-center justify-center">
                {isLevelCompleted(index) ? (
                  <CheckCircle className="text-green-300" size={24} />
                ) : (
                  <LevelIcon
                    size={24}
                    className={
                      safeCurrentLevel === index
                        ? "text-indigo-300"
                        : "text-gray-400"
                    }
                  />
                )}
              </div>
              {safeCurrentLevel === index && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-indigo-300 rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progrès global */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1 text-sm text-gray-400">
          <span>Progression totale</span>
          <span>
            {teamData.completedLevels?.length || 0}/{hackathonLevels.length}{" "}
            niveaux complétés
          </span>
        </div>
        <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
            style={{ width: `${overallProgressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Contenu principal du niveau actuel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Colonne de gauche - Description du niveau */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 h-full">
            <div className="bg-gray-700 p-4 flex justify-between items-center border-b border-gray-600">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-700 p-2 rounded-lg">
                  {(() => {
                    const LevelIcon = getLevelIcon(safeCurrentLevel);
                    return <LevelIcon className="text-indigo-300" size={24} />;
                  })()}
                </div>
                <h2 className="text-xl font-bold">{currentLevelData.name}</h2>
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Clock size={16} />
                <span>{currentLevelData.timeAllocation} min</span>
              </div>
            </div>

            <div className="p-4">
              <p className="text-lg mb-4">{currentLevelData.description}</p>

              {/* Zone de consigne */}
              <div className="mt-4 bg-indigo-900/30 border border-indigo-700/50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-medium mb-2 text-indigo-200 flex items-center gap-2">
                  <Award size={18} />
                  Consigne
                </h3>
                <p className="text-gray-200">{currentLevelData.instruction}</p>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2 text-indigo-300">
                  Fonctions requises:
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentLevelData.functionRequired.map((func, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-700 rounded-md text-sm text-indigo-200"
                    >
                      {func}
                    </span>
                  ))}
                </div>
              </div>

              {/* Timer d'exercice */}
              <div className="mt-6 bg-gray-700/50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-blue-300">
                    Temps d'exercice
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={toggleTimer}
                      className="bg-gray-600 hover:bg-gray-500 rounded-full p-1"
                    >
                      {timerRunning ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                      onClick={resetExerciseTimer}
                      className="bg-gray-600 hover:bg-gray-500 rounded-full p-1"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-xl font-mono text-center">
                  {formatExerciseTime(exerciseDuration)}
                </div>
              </div>

              <div className="mt-6 bg-gray-700/50 p-4 rounded-lg">
                <h3 className="font-medium text-bp-red-200 flex items-center gap-2 mb-2">
                  <Lightbulb size={18} />
                  Indices disponibles
                </h3>
                <div className="text-gray-300 text-sm space-y-1">
                  <p>• <span className="text-yellow-400">Indice 1</span> : aide générale — <strong>-25 pts</strong></p>
                  <p>• <span className="text-orange-400">Indice 2</span> : formule technique — <strong>-50 pts</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne centrale et droite - Exercice et soumission */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700">
            <div className="bg-gray-700 p-4 flex justify-between items-center border-b border-gray-600">
              <h2 className="text-xl font-bold">Exercice</h2>

              <div className="flex gap-2">
                <button
                  onClick={goToPreviousLevel}
                  disabled={safeCurrentLevel === 0}
                  className={`p-2 rounded-lg ${
                    safeCurrentLevel === 0
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-gray-600 hover:bg-gray-500 text-white"
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  onClick={goToNextLevel}
                  disabled={
                    safeCurrentLevel === hackathonLevels.length - 1 ||
                    !isLevelCompleted(safeCurrentLevel)
                  }
                  className={`p-2 rounded-lg ${
                    safeCurrentLevel === hackathonLevels.length - 1 ||
                    !isLevelCompleted(safeCurrentLevel)
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-gray-600 hover:bg-gray-500 text-white"
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-bp-red-600/30 border border-indigo-800/50 rounded-lg p-4 mb-6">
                <p className="text-indigo-100">
                  {currentLevelData.exerciseDescription}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-300">
                  Question:
                </h3>
                <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                  <p className="text-white">
                    {currentLevelData.exerciseQuestion}
                  </p>
                  {currentLevelData.answerFormat && (
                    <p className="text-gray-400 text-sm mt-2">
                      Format de réponse attendu: {currentLevelData.answerFormat}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="answer"
                    className="block text-sm font-medium text-gray-400 mb-2"
                  >
                    Votre réponse:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="answer"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !isLevelCompleted(safeCurrentLevel)) handleSubmitAnswer(); }}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Saisissez votre réponse..."
                      disabled={isLevelCompleted(safeCurrentLevel)}
                    />
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={isLevelCompleted(safeCurrentLevel)}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                        isLevelCompleted(safeCurrentLevel)
                          ? "bg-green-700 text-white cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                    >
                      {isLevelCompleted(safeCurrentLevel) ? (
                        <>
                          <CheckCircle size={18} />
                          Complété
                        </>
                      ) : (
                        "Soumettre"
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Section Indices — deux niveaux d'aide avec pénalités différentes */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-bp-red-400 flex items-center gap-2 mb-3">
                  <Lightbulb size={20} />
                  Indices
                </h3>

                {/* Indice n°1 — aide générale (-25 pts) */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-yellow-300">Indice n°1</span>
                    {!hint1Shown && !isLevelCompleted(safeCurrentLevel) && (
                      <button
                        onClick={handleRequestHint1}
                        className="px-3 py-1 bg-yellow-700/50 hover:bg-yellow-700 text-yellow-200 rounded-lg text-sm flex items-center gap-1 transition-colors"
                      >
                        <Lightbulb size={14} />
                        Débloquer (-25 pts)
                      </button>
                    )}
                    {hint1Shown && (
                      <span className="text-xs text-yellow-500 italic">-25 pts appliqués</span>
                    )}
                  </div>
                  <div
                    className={`bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-3 transition-all ${
                      hint1Shown ? "opacity-100" : "opacity-40 blur-sm select-none"
                    }`}
                  >
                    {hint1Shown ? (
                      <p className="text-yellow-200 text-sm">
                        Fonctions utiles pour cet exercice :{" "}
                        <strong>{currentLevelData.functionRequired.join(", ")}</strong>.{" "}
                        Relisez la consigne et vérifiez l'ordre des arguments.
                      </p>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-yellow-600/50">
                        <Lock size={14} />
                        <span className="text-sm">Indice 1 verrouillé</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Indice n°2 — aide technique avec formule (-50 pts) */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-orange-300">Indice n°2</span>
                    {!hint2Shown && !isLevelCompleted(safeCurrentLevel) && (
                      <button
                        onClick={handleRequestHint2}
                        className="px-3 py-1 bg-orange-700/50 hover:bg-orange-700 text-orange-200 rounded-lg text-sm flex items-center gap-1 transition-colors"
                      >
                        <Lightbulb size={14} />
                        Débloquer (-50 pts)
                      </button>
                    )}
                    {hint2Shown && (
                      <span className="text-xs text-orange-500 italic">-50 pts appliqués</span>
                    )}
                  </div>
                  <div
                    className={`bg-orange-900/20 border border-orange-800/50 rounded-lg p-3 transition-all ${
                      hint2Shown ? "opacity-100" : "opacity-40 blur-sm select-none"
                    }`}
                  >
                    {hint2Shown ? (
                      <p className="text-orange-200 text-sm">{currentLevelData.hint}</p>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-orange-600/50">
                        <Lock size={14} />
                        <span className="text-sm">Indice 2 verrouillé</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentExercise;