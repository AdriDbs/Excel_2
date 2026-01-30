import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Lock,
  Unlock,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Award,
} from "lucide-react";
import { Level, Team } from "../types";
import { useHackathon } from "../context/HackathonContext";

interface StudentExerciseProps {
  teamData: Team;
  getLevelIcon: (levelId: number) => React.FC<React.ComponentProps<typeof CheckCircle>>;
  hackathonLevels: Level[];
}

const StudentExercise: React.FC<StudentExerciseProps> = ({ 
  teamData, 
  getLevelIcon,
  hackathonLevels
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
  const [showHint, setShowHint] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [exerciseDuration, setExerciseDuration] = useState(0);

  // Obtenir le niveau actuel
  const currentLevelData = hackathonLevels[currentLevel];

  // Réinitialiser le timer lors du changement de niveau
  useEffect(() => {
    setExerciseDuration(0);
    setTimerRunning(false);
  }, [currentLevel]);

  // Réinitialiser l'état lorsque l'équipe change
  useEffect(() => {
    // Initialiser le niveau actuel
    setCurrentLevel(teamData.currentLevel || 0);
    // Réinitialiser l'indice
    setShowHint(false);
    // Réinitialiser la réponse
    setAnswer("");
  }, [teamData]);
  
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

    // Dans cette version de démo, toutes les réponses sont "BearingPoint"
    if (answer.trim() === "BearingPoint") {
      // Mettre à jour l'équipe
      completeLevel(teamData.id, currentLevel);

      // Ajouter le nombre de points correspondant au niveau
      const pointsEarned = currentLevelData.pointsValue || 200;
      updateTeamScore(teamData.id, "success", pointsEarned);

      // Mettre à jour la progression à 100%
      updateLevelProgress(teamData.id, currentLevel, 100);

      // Arrêter le timer
      setTimerRunning(false);

      // Afficher la notification de succès
      setNotification(`Niveau complété ! +${pointsEarned} points`, "success");

      // Passer au niveau suivant si possible
      if (currentLevel < hackathonLevels.length - 1) {
        setTimeout(() => {
          setCurrentLevel(currentLevel + 1);
          setAnswer("");
          setShowHint(false);
        }, 2000);
      }
    } else {
      // Réponse incorrecte
      setNotification("Réponse incorrecte. Essayez encore !", "error");
    }
  };

  // Gérer la demande d'indice
  const handleRequestHint = () => {
    if (!teamData.id) return;

    // Pénalité de 25 points pour l'utilisation d'un indice
    updateTeamScore(teamData.id, "hint");

    // Afficher l'indice
    setShowHint(true);
  };

  // Passer au niveau précédent si possible
  const goToPreviousLevel = () => {
    if (currentLevel > 0) {
      setCurrentLevel(currentLevel - 1);
      setAnswer("");
      setShowHint(false);
    }
  };

  // Passer au niveau suivant si possible
  const goToNextLevel = () => {
    if (
      currentLevel < hackathonLevels.length - 1 &&
      teamData.completedLevels?.includes(currentLevel)
    ) {
      setCurrentLevel(currentLevel + 1);
      setAnswer("");
      setShowHint(false);
    }
  };

  // Vérifier si l'indice a déjà été utilisé
  const isHintUsed = () => {
    // Dans cette démo, nous considérons que l'indice est utilisé si showHint est true
    return showHint;
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
                  currentLevel === index
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
                  setShowHint(false);
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
                      currentLevel === index
                        ? "text-indigo-300"
                        : "text-gray-400"
                    }
                  />
                )}
              </div>
              {currentLevel === index && (
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
                    const LevelIcon = getLevelIcon(currentLevel);
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
                  Astuce
                </h3>
                <p className="text-gray-300 text-sm">
                  Pour la démo, toutes les réponses sont "BearingPoint".
                </p>
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
                  disabled={currentLevel === 0}
                  className={`p-2 rounded-lg ${
                    currentLevel === 0
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-gray-600 hover:bg-gray-500 text-white"
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  onClick={goToNextLevel}
                  disabled={
                    currentLevel === hackathonLevels.length - 1 ||
                    !isLevelCompleted(currentLevel)
                  }
                  className={`p-2 rounded-lg ${
                    currentLevel === hackathonLevels.length - 1 ||
                    !isLevelCompleted(currentLevel)
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
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Saisissez votre réponse..."
                      disabled={isLevelCompleted(currentLevel)}
                    />
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={isLevelCompleted(currentLevel)}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                        isLevelCompleted(currentLevel)
                          ? "bg-green-700 text-white cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                    >
                      {isLevelCompleted(currentLevel) ? (
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

              {/* Section Indice */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-bp-red-400 flex items-center gap-2">
                    <Lightbulb size={20} />
                    Indice
                  </h3>

                  {!isHintUsed() && !isLevelCompleted(currentLevel) && (
                    <button
                      onClick={handleRequestHint}
                      className="px-3 py-1 bg-yellow-700/50 hover:bg-yellow-700 text-bp-red-200 rounded-lg text-sm flex items-center gap-1"
                    >
                      <Lightbulb size={14} />
                      Débloquer (-25 pts)
                    </button>
                  )}
                </div>

                <div
                  className={`bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4 ${
                    showHint || isHintUsed()
                      ? "opacity-100"
                      : "opacity-50 blur-sm"
                  }`}
                >
                  {showHint || isHintUsed() ? (
                    <p className="text-yellow-200">{currentLevelData.hint}</p>
                ) : (
                    <div className="flex items-center justify-center gap-2 text-bp-red-400/50">
                      <Lock size={16} />
                      <span>Indice verrouillé</span>
                    </div>
                  )}
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