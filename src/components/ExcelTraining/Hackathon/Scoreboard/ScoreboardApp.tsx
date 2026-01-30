import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  Trophy,
  Users,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Settings,
} from "lucide-react";
import { NavigationProps } from "../../types";
import { useHackathon } from "../context/HackathonContext";
import { hackathonLevels } from "../services/hackathonService";
import SessionControlOverlay from "./SessionControlOverlay";

interface ScoreboardProps extends NavigationProps {
  goBackToLanding: () => void;
}

const ScoreboardApp = ({ goBackToLanding, navigateTo }: ScoreboardProps) => {
  // Utiliser le contexte Hackathon
  const {
    state,
    setTimeLeft,
    setIsGlobalView,
    setSessionId,
    endCurrentSession,
    setNotification,
    setSeconds,
  } = useHackathon();

  const {
    teams,
    timeLeft,
    notification,
    sessionId,
    sessionActive,
    isSessionStarted,
    seconds,
  } = state;

  // État pour le classement précédent (pour les animations)
  const [previousRanking, setPreviousRanking] = useState<number[]>([]);
  const [rankChanges, setRankChanges] = useState<{ [key: number]: string }>({});
  const [isUrgent, setIsUrgent] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // État pour afficher/masquer l'overlay de contrôle de session
  const [showControlOverlay, setShowControlOverlay] = useState(false);

  // Trier les équipes par score
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  // Définir la vue comme globale
  useEffect(() => {
    setIsGlobalView(true);

    return () => {
      setIsGlobalView(false);
    };
  }, [setIsGlobalView]);

  // Vérifier les changements de classement et mettre à jour les animations
  useEffect(() => {
    if (previousRanking.length > 0) {
      const currentRanking = sortedTeams.map((team) => team.id);
      const changes: { [key: number]: string } = {};

      currentRanking.forEach((teamId, index) => {
        const prevIndex = previousRanking.indexOf(teamId);
        if (prevIndex !== -1 && prevIndex > index) {
          // L'équipe est montée dans le classement
          changes[teamId] = "rank-up";
        }
      });

      if (Object.keys(changes).length > 0) {
        setRankChanges(changes);

        // Réinitialiser les animations après 3 secondes
        setTimeout(() => {
          setRankChanges({});
        }, 3000);
      }
    }

    // Mettre à jour le classement précédent
    setPreviousRanking(sortedTeams.map((team) => team.id));
  }, [sortedTeams.map((t) => t.score).join("-")]); // Se déclenche uniquement quand les scores changent

  // Vérifier si on est dans les 5 dernières minutes
  useEffect(() => {
    setIsUrgent(timeLeft <= 5);
  }, [timeLeft]);

  // Vérifier si la session est active
  useEffect(() => {
    if (!sessionActive && sessionId) {
      goBackToLanding();
    }
  }, [sessionActive, sessionId, goBackToLanding]);

  // Fonction pour passer à 5 minutes
  const setToFiveMinutes = () => {
    setTimeLeft(5);
    setSeconds(0);
  };

  // Formatter le temps restant avec secondes
  const formatTime = (minutes: number, secs: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Fonction pour rafraîchir manuellement les données
  const refreshData = () => {
    setIsRefreshing(true);

    // Simuler un rafraîchissement (en réalité, les données sont mises à jour via le contexte)
    setTimeout(() => {
      setNotification("Données rafraîchies", "success");
      setIsRefreshing(false);
    }, 500);
  };

  // Fonction pour terminer la session
  const handleEndSession = async () => {
    if (!sessionId) return;

    if (
      window.confirm(
        "Êtes-vous sûr de vouloir terminer cette session ? Cette action est irréversible."
      )
    ) {
      setIsEndingSession(true);
      try {
        const result = await endCurrentSession();
        if (result) {
          goBackToLanding();
        }
      } catch (error) {
        console.error("Error ending session:", error);
        setNotification("Erreur lors de la terminaison de la session", "error");
      } finally {
        setIsEndingSession(false);
      }
    }
  };

  // Si aucune session n'est active
  if (!sessionId) {
    return (
      <div className="bg-gray-900 min-h-screen text-white p-6 flex items-center justify-center">
        <div className="bg-gray-800 max-w-md p-8 rounded-xl text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-bearing-red" />
          <h2 className="text-2xl font-bold mb-4">Aucune session active</h2>
          <p className="mb-6">
            Veuillez créer ou rejoindre une session depuis la page d'accueil du
            hackathon.
          </p>
          <button
            onClick={goBackToLanding}
            className="px-4 py-2 bg-bearing-red hover:bg-bearing-red-60 rounded-lg"
          >
            Retourner à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      {/* Bouton de retour */}
      <button
        onClick={goBackToLanding}
        className="mb-8 bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-all duration-300 hover:shadow-md absolute top-4 left-4 z-20"
      >
        <ArrowLeft size={20} />
        Retour à l'accueil
      </button>

      {/* Fond avec effet grille */}
      <div className="fixed inset-0 bg-grid opacity-20 z-0"></div>

      {/* En-tête et chronomètre */}
      <div className="text-center mb-6 relative z-10 pt-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-bearing-red bg-clip-text text-transparent mb-2">
          Escape Excel: Le Dossier Perdu 2.0
        </h1>

        {sessionId ? (
          <p className="text-md text-gray-400 mb-4">Session ID: {sessionId}</p>
        ) : null}

        <div className="flex items-center justify-center mt-4">
          <div
            className={`
            flex items-center bg-gray-800 rounded-lg px-4 py-2 border shadow-lg
            ${
              isUrgent
                ? "border-red-500 animate-pulse shadow-red-500/30"
                : isSessionStarted
                ? "border-green-500 shadow-green-500/30"
                : "border-cyan-500"
            }
          `}
          >
            <Clock
              className={`mr-2 ${
                isUrgent
                  ? "text-red-500"
                  : isSessionStarted
                  ? "text-green-500"
                  : "text-cyan-400"
              }`}
            />
            <span
              className={`text-2xl font-mono ${
                isUrgent
                  ? "text-red-500"
                  : isSessionStarted
                  ? "text-green-500"
                  : "text-cyan-400"
              }`}
            >
              {formatTime(timeLeft, seconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Bouton de rafraîchissement manuel */}
      <div className="flex justify-center mb-4">
        <button
          onClick={refreshData}
          disabled={isRefreshing}
          className="bg-bearing-red hover:bg-bearing-red-60 text-white py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Rafraîchissement..." : "Rafraîchir les données"}
        </button>
      </div>

      {/* Classement simplifié - DÉPLACÉ EN HAUT */}
      <div className="mb-8 bg-gray-800 rounded-xl p-4 relative z-10">
        <div className="flex items-center mb-4">
          <Trophy className="text-bearing-red mr-2" size={24} />
          <h2 className="text-xl font-bold">Classement</h2>
        </div>

        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400 mb-2 px-4">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Équipe</div>
          <div className="col-span-2 text-right">Score</div>
          <div className="col-span-4">Progression</div>
        </div>

        {sortedTeams.length > 0 ? (
          sortedTeams.map((team, index) => (
            <div
              key={team.id}
              className={`
                grid grid-cols-12 gap-4 bg-gray-700/40 p-4 rounded-lg mb-2 items-center transition-all duration-500
                ${
                  rankChanges[team.id] === "rank-up"
                    ? "bg-green-700/40 animate-highlight"
                    : ""
                }
              `}
            >
              <div className="col-span-1">
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold
                  ${
                    index === 0
                      ? "bg-yellow-500 text-gray-900"
                      : index === 1
                      ? "bg-gray-400 text-gray-900"
                      : index === 2
                      ? "bg-amber-700 text-white"
                      : "bg-gray-600 text-white"
                  }
                `}
                >
                  {index + 1}
                </div>
              </div>

              <div className="col-span-5 font-medium text-white">
                {team.name}
                {rankChanges[team.id] === "rank-up" && (
                  <span className="ml-2 text-green-400 text-sm animate-bounce">
                    ▲
                  </span>
                )}
                {team.studentIds && team.studentIds.length > 0 && (
                  <span className="ml-2 text-blue-300 text-xs">
                    ({team.studentIds.length} participants)
                  </span>
                )}
              </div>

              <div className="col-span-2 text-right font-bold text-cyan-400">
                {team.score}
              </div>

              <div className="col-span-4">
                <div className="flex h-3 space-x-1">
                  {hackathonLevels.map((_, levelIndex) => (
                    <div
                      key={levelIndex}
                      className={`
                        h-full flex-1 rounded-full 
                        ${
                          team.completedLevels &&
                          team.completedLevels.includes(levelIndex)
                            ? "bg-green-500"
                            : levelIndex === team.currentLevel
                            ? "bg-cyan-500 enhanced-shimmer"
                            : "bg-gray-600"
                        }
                      `}
                      title={hackathonLevels[levelIndex].name}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-6 text-gray-400">
            <p>
              Aucune équipe disponible. Utilisez le bouton "Rafraîchir les
              données" ci-dessus.
            </p>
          </div>
        )}
      </div>

      {/* Tableau des scores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {teams.length > 0 ? (
          teams.map((team) => (
            <div
              key={team.id}
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 transition-all hover:shadow-cyan-900/30 hover:shadow-lg"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <div className="flex items-center">
                  <div className="bg-gray-700 p-2 rounded-lg mr-3">
                    <Users className="text-cyan-400" size={20} />
                  </div>
                  <h2 className="text-xl font-bold">{team.name}</h2>
                </div>
                <div className="text-2xl font-bold text-cyan-400">
                  {team.score}
                </div>
              </div>

              {/* Barre de progression simplifiée */}
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <div className="w-1/3 text-sm font-medium">
                    Niveau actuel:
                  </div>
                  <div className="text-lg font-bold text-white">
                    {team.currentLevel < hackathonLevels.length
                      ? hackathonLevels[team.currentLevel].name
                      : "Complété"}
                  </div>
                </div>

                <div className="h-4 w-full bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-bearing-red rounded-full"
                    style={{
                      width: `${team.progress[team.currentLevel] || 0}%`,
                    }}
                  ></div>
                </div>

                {/* Indicateurs de niveau simplifiés */}
                <div className="flex mt-4 space-x-1">
                  {hackathonLevels.map((level, index) => (
                    <div
                      key={index}
                      className={`h-2 flex-1 rounded-full ${
                        team.completedLevels &&
                        team.completedLevels.includes(index)
                          ? "bg-green-500"
                          : index === team.currentLevel
                          ? "bg-cyan-500 enhanced-shimmer"
                          : "bg-gray-600"
                      }`}
                      title={level.name}
                    ></div>
                  ))}
                </div>

                {/* Affichage des derniers niveaux complétés */}
                {team.completedLevels && team.completedLevels.length > 0 && (
                  <div className="mt-4 bg-gray-700/50 p-2 rounded-lg">
                    <div className="text-xs text-gray-400">
                      Derniers niveaux complétés:
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {team.completedLevels
                        .slice(-3) // Affiche seulement les 3 derniers
                        .map((levelId) => (
                          <span
                            key={levelId}
                            className="px-2 py-1 bg-green-900/50 rounded text-xs text-green-300"
                          >
                            {hackathonLevels[levelId].name}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="lg:col-span-2 text-center p-8 bg-gray-800 rounded-xl">
            <AlertCircle size={48} className="mx-auto mb-4 text-bearing-red" />
            <h3 className="text-xl font-bold mb-2">Aucune équipe disponible</h3>
            <p className="text-gray-400 mb-4">
              Utilisez le bouton "Rafraîchir les données" ci-dessus pour mettre
              à jour l'affichage.
            </p>
          </div>
        )}
      </div>

      {/* Boutons d'actions */}
      <div className="mt-10 text-center relative z-10 flex flex-wrap justify-center gap-4">
        <button
          onClick={() => setShowControlOverlay(true)}
          className="bg-bearing-red-60 hover:bg-bearing-red text-white font-bold py-2 px-6 rounded-lg border border-blue-600 transition-colors shadow-lg flex items-center gap-2"
        >
          <Settings size={20} />
          Contrôle de session
        </button>

        <button
          onClick={setToFiveMinutes}
          className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg border border-gray-700 transition-colors shadow-lg"
        >
          Passer à 5 minutes
        </button>

        <button
          onClick={handleEndSession}
          disabled={isEndingSession}
          className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg border border-red-700 transition-colors shadow-lg flex items-center gap-2"
        >
          {isEndingSession ? (
            <RefreshCw className="animate-spin" size={20} />
          ) : null}
          Terminer la session
        </button>
      </div>

      {/* Notification */}
      {notification.visible && (
        <div
          className={`
          fixed bottom-6 right-6 max-w-md p-4 rounded-lg shadow-lg z-50
          ${
            notification.type === "success"
              ? "bg-green-800 border-l-4 border-green-500"
              : notification.type === "hint"
              ? "bg-yellow-800 border-l-4 border-yellow-500"
              : "bg-red-800 border-l-4 border-red-500"
          }
        `}
        >
          {notification.message}
        </div>
      )}

      {/* CSS pour l'effet de grille en arrière-plan */}
      <style>
        {`
        .bg-grid {
          background-image: 
            linear-gradient(to right, rgba(25, 25, 35, 0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(25, 25, 35, 0.8) 1px, transparent 1px);
          background-size: 30px 30px;
        }
        
        .shimmering-progress {
          position: relative;
          overflow: hidden;
        }
        
        .shimmering-progress::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, 
                     transparent 0%,
                     rgba(255, 255, 255, 0.2) 50%,
                     transparent 100%);
          animation: shimmer 2s infinite linear;
        }
        
        .enhanced-shimmer {
          position: relative;
          overflow: hidden;
        }
        
        .enhanced-shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, 
                     transparent 0%,
                     rgba(255, 255, 255, 0.4) 50%,
                     transparent 100%);
          animation: shimmer 1.5s infinite ease-in-out;
          background-size: 200% 100%;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        @keyframes highlight {
          0% { box-shadow: 0 0 0 rgba(74, 222, 128, 0); transform: scale(1); }
          50% { box-shadow: 0 0 15px rgba(74, 222, 128, 0.5); transform: scale(1.02); }
          100% { box-shadow: 0 0 0 rgba(74, 222, 128, 0); transform: scale(1); }
        }
        
        .animate-highlight {
          animation: highlight 1s ease-in-out 2;
        }
        `}
      </style>

      {/* Overlay de contrôle de session */}
      {showControlOverlay && (
        <SessionControlOverlay onClose={() => setShowControlOverlay(false)} />
      )}
    </div>
  );
};

export default ScoreboardApp;
