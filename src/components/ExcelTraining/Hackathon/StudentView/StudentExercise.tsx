import React, { useState, useEffect, useRef } from "react";
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Lock,
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

// Phase boundaries: maps exercise indices to phases (0-6)
const PHASE_BOUNDARIES = [
  { id: 0, name: "Data Cleaning",   firstLevel: 0,  lastLevel: 0  },
  { id: 1, name: "Accès Serveur",   firstLevel: 1,  lastLevel: 3  },
  { id: 2, name: "Données Client",  firstLevel: 4,  lastLevel: 5  },
  { id: 3, name: "Tendances",       firstLevel: 6,  lastLevel: 8  },
  { id: 4, name: "Consolidation",   firstLevel: 9,  lastLevel: 11 },
  { id: 5, name: "Expert",          firstLevel: 12, lastLevel: 12 },
  { id: 6, name: "Visualisation",   firstLevel: 13, lastLevel: 15 },
];

const getCurrentPhaseInfo = (levelIndex: number) => {
  return (
    PHASE_BOUNDARIES.find(
      (p) => levelIndex >= p.firstLevel && levelIndex <= p.lastLevel
    ) || PHASE_BOUNDARIES[0]
  );
};

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

  const [currentLevel, setCurrentLevel] = useState(teamData.currentLevel || 0);
  const [answer, setAnswer] = useState("");
  const [hint1Shown, setHint1Shown] = useState(false);
  const [hint2Shown, setHint2Shown] = useState(false);
  // Timer runs silently for backend stats — no UI
  const [timerRunning, setTimerRunning] = useState(false);
  const [exerciseDuration, setExerciseDuration] = useState(0);
  const lastSyncedLevelRef = useRef<number>(teamData.currentLevel || 0);

  const safeCurrentLevel = Math.min(currentLevel, hackathonLevels.length - 1);
  const currentLevelData = hackathonLevels[safeCurrentLevel];
  const currentPhaseInfo = getCurrentPhaseInfo(safeCurrentLevel);

  // Vérifier si un niveau est complété
  const isLevelCompleted = (levelId: number) =>
    teamData.completedLevels?.includes(levelId) || false;

  // Réinitialiser et auto-démarrer le timer silencieux sur changement de niveau
  useEffect(() => {
    setExerciseDuration(0);
    setTimerRunning(!isLevelCompleted(currentLevel));
    setHint1Shown(false);
    setHint2Shown(false);
  }, [currentLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  // Synchronisation automatique quand le niveau de l'équipe avance (coéquipier qui valide)
  useEffect(() => {
    const teamLevel = teamData.currentLevel || 0;
    if (teamLevel > currentLevel) {
      setCurrentLevel(teamLevel);
      setAnswer("");
      setHint1Shown(false);
      setHint2Shown(false);
      lastSyncedLevelRef.current = teamLevel;
    }
  }, [teamData.currentLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer silencieux pour tracking backend
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerRunning) {
      interval = setInterval(() => {
        setExerciseDuration((prev) => {
          const next = prev + 1;
          // Mise à jour de la progression (limitée à 99% avant validation)
          if (teamData.id) {
            const currentProgress = Math.min(
              Math.floor((next / (currentLevelData.timeAllocation * 60)) * 100),
              99
            );
            if (currentProgress > 0) {
              updateLevelProgress(teamData.id, currentLevel, currentProgress);
            }
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, teamData.id, currentLevel, currentLevelData.timeAllocation, updateLevelProgress]);

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

      completeLevel(teamData.id, safeCurrentLevel);
      updateTeamScore(teamData.id, "success", pointsEarned);
      updateLevelProgress(teamData.id, safeCurrentLevel, 100);

      if (sessionId && userId && exerciseId) {
        updateStudentAnswerInFirebase(sessionId, userId, exerciseId, answer);
      }

      if (onLevelComplete) {
        onLevelComplete(safeCurrentLevel, pointsEarned, exerciseDuration);
      }

      setTimerRunning(false);
      setNotification(`Exercice complété ! +${pointsEarned} points`, "success");

      // Avancer automatiquement après 2 secondes
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
      // Pénalité de -10 pts par mauvaise réponse
      updateTeamScore(teamData.id, "wrong");
    }
  };

  // Indice 1 : aide générale (-25 pts)
  const handleRequestHint1 = () => {
    if (!teamData.id || hint1Shown) return;
    updateTeamScore(teamData.id, "hint", 25);
    setHint1Shown(true);
    setNotification("Indice 1 débloqué. -25 points", "hint");
  };

  // Indice 2 : aide technique (-50 pts) — nécessite l'indice 1
  const handleRequestHint2 = () => {
    if (!teamData.id || hint2Shown || !hint1Shown) return;
    updateTeamScore(teamData.id, "hint", 50);
    setHint2Shown(true);
    setNotification("Indice 2 débloqué. -50 points supplémentaires", "hint");
  };

  // Navigation par phase
  const goToPreviousPhase = () => {
    if (currentPhaseInfo.id > 0) {
      const prevPhase = PHASE_BOUNDARIES[currentPhaseInfo.id - 1];
      setCurrentLevel(prevPhase.firstLevel);
      setAnswer("");
      setHint1Shown(false);
      setHint2Shown(false);
    }
  };

  const goToNextPhase = () => {
    if (currentPhaseInfo.id < PHASE_BOUNDARIES.length - 1) {
      const nextPhase = PHASE_BOUNDARIES[currentPhaseInfo.id + 1];
      setCurrentLevel(nextPhase.firstLevel);
      setAnswer("");
      setHint1Shown(false);
      setHint2Shown(false);
    }
  };

  // Exercice courant dans la phase (ex: "Ex 2/3")
  const exerciseInPhase =
    safeCurrentLevel - currentPhaseInfo.firstLevel + 1;
  const totalInPhase =
    currentPhaseInfo.lastLevel - currentPhaseInfo.firstLevel + 1;

  return (
    <>
      {/* ── Indicateur compact de phase ─────────────────────────────────── */}
      <div className="mb-4 flex items-center justify-between bg-gray-800/70 rounded-lg px-4 py-2 border border-gray-700">
        <div className="text-sm font-semibold text-cyan-300">
          Phase {currentPhaseInfo.id}/6 — {currentPhaseInfo.name}
          {totalInPhase > 1 && (
            <span className="ml-2 text-gray-400 font-normal">
              (Ex {exerciseInPhase}/{totalInPhase})
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span>⏱️ {currentLevelData.timeAllocation} min</span>
          <span>🎯 {currentLevelData.pointsValue} pts</span>
        </div>
      </div>

      {/* ── Carte exercice (pleine largeur) ─────────────────────────────── */}
      <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700">
        {/* En-tête de la carte */}
        <div className="bg-gray-700 p-4 flex justify-between items-center border-b border-gray-600">
          <h2 className="text-xl font-bold text-white">{currentLevelData.name}</h2>
          {isLevelCompleted(safeCurrentLevel) && (
            <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
              <CheckCircle size={18} />
              Complété
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Description contextuelle */}
          <div className="bg-indigo-900/30 border border-indigo-700/50 rounded-lg p-4 mb-6">
            <p className="text-indigo-100">{currentLevelData.exerciseDescription}</p>
          </div>

          {/* Question */}
          <div className="mb-6">
            <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
              <p className="text-white font-medium">{currentLevelData.exerciseQuestion}</p>
              {currentLevelData.answerFormat && (
                <p className="text-gray-400 text-sm mt-2">
                  Format attendu : {currentLevelData.answerFormat}
                </p>
              )}
            </div>

            {/* Champ de réponse */}
            <label
              htmlFor="answer"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              📝 Votre réponse :
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLevelCompleted(safeCurrentLevel))
                    handleSubmitAnswer();
                }}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Saisissez votre réponse..."
                disabled={isLevelCompleted(safeCurrentLevel)}
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={isLevelCompleted(safeCurrentLevel)}
                className={`px-5 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors duration-200 ${
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
                  "Valider"
                )}
              </button>
            </div>
          </div>

          {/* ── Section Indices ────────────────────────────────────────── */}
          {!isLevelCompleted(safeCurrentLevel) && (
            <div className="mt-6 border-t border-gray-700 pt-5">
              <h3 className="text-base font-semibold text-gray-300 flex items-center gap-2 mb-4">
                <Lightbulb size={18} className="text-yellow-400" />
                Indices
              </h3>

              <div className="flex flex-wrap gap-3 mb-4">
                {/* Indice n°1 */}
                {!hint1Shown ? (
                  <button
                    onClick={handleRequestHint1}
                    className="px-4 py-2 bg-yellow-700/50 hover:bg-yellow-700 text-yellow-200 rounded-lg text-sm flex items-center gap-2 transition-colors duration-200"
                  >
                    <Lightbulb size={14} />
                    Indice n°1 (-25 pts)
                  </button>
                ) : (
                  <span className="px-4 py-2 bg-yellow-900/30 border border-yellow-800/50 text-yellow-400 rounded-lg text-sm">
                    Indice n°1 utilisé (-25 pts)
                  </span>
                )}

                {/* Indice n°2 — nécessite l'indice 1 */}
                {!hint2Shown ? (
                  <button
                    onClick={hint1Shown ? handleRequestHint2 : undefined}
                    disabled={!hint1Shown}
                    title={!hint1Shown ? "Utilisez d'abord l'indice n°1" : ""}
                    className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors duration-200 ${
                      hint1Shown
                        ? "bg-orange-700/50 hover:bg-orange-700 text-orange-200 cursor-pointer"
                        : "bg-gray-700/50 text-gray-500 cursor-not-allowed opacity-60"
                    }`}
                  >
                    {hint1Shown ? (
                      <Lightbulb size={14} />
                    ) : (
                      <Lock size={14} />
                    )}
                    Indice n°2 (-50 pts){!hint1Shown && " 🔒"}
                  </button>
                ) : (
                  <span className="px-4 py-2 bg-orange-900/30 border border-orange-800/50 text-orange-400 rounded-lg text-sm">
                    Indice n°2 utilisé (-50 pts)
                  </span>
                )}
              </div>

              {/* Contenu Indice 1 */}
              {hint1Shown && (
                <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-3 mb-3">
                  <p className="text-yellow-200 text-sm">
                    Fonctions utiles pour cet exercice :{" "}
                    <strong>{currentLevelData.functionRequired.join(", ")}</strong>.{" "}
                    Relisez la consigne et vérifiez l'ordre des arguments.
                  </p>
                </div>
              )}

              {/* Contenu Indice 2 */}
              {hint2Shown && (
                <div className="bg-orange-900/20 border border-orange-800/50 rounded-lg p-3">
                  <p className="text-orange-200 text-sm">{currentLevelData.hint}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation entre phases ──────────────────────────────────────── */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
        <button
          onClick={goToPreviousPhase}
          disabled={currentPhaseInfo.id === 0}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-colors duration-200 ${
            currentPhaseInfo.id === 0
              ? "bg-gray-700 text-gray-500 cursor-not-allowed opacity-50"
              : "bg-gray-700 hover:bg-gray-600 text-white"
          }`}
        >
          <ChevronLeft size={18} />
          Phase précédente
        </button>

        <span className="text-gray-500 text-sm">
          {currentPhaseInfo.id + 1} / {PHASE_BOUNDARIES.length}
        </span>

        <button
          onClick={goToNextPhase}
          disabled={currentPhaseInfo.id === PHASE_BOUNDARIES.length - 1}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-colors duration-200 ${
            currentPhaseInfo.id === PHASE_BOUNDARIES.length - 1
              ? "bg-gray-700 text-gray-500 cursor-not-allowed opacity-50"
              : "bg-indigo-700 hover:bg-indigo-600 text-white"
          }`}
        >
          Phase suivante
          <ChevronRight size={18} />
        </button>
      </div>
    </>
  );
};

export default StudentExercise;
