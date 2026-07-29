import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Users,
  Target,
  Play,
  Settings,
  AlertTriangle,
  User,
  Crown,
  Zap,
  Star,
  Calendar,
  Power,
  Clock,
} from "lucide-react";
import { NavigationProps } from "../types";
import { Student, Instructor } from "../../../types/database";
import { useProgressManager } from "../../../hooks/useProgressManager";
import { useHackathon } from "./context/HackathonContext";
import {
  hackathonLevels,
  fetchInitialState,
} from "./services/hackathonService";
import SessionSelector from "./SessionSelector";

interface HackathonLandingProps extends NavigationProps {
  setHackathonView: (view: string) => void;
  currentUser?: Student | Instructor;
}

const HackathonLanding: React.FC<HackathonLandingProps> = ({
  navigateTo,
  setHackathonView,
  currentUser,
}) => {
  const {
    state: hackathonState,
    endCurrentSession,
    setNotification,
    formatTime,
  } = useHackathon();
  const { sessionId, sessionActive, isSessionStarted, timeLeftSeconds } = hackathonState;

  const [showSessionSelector, setShowSessionSelector] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);

  const isInstructor = currentUser?.role === "instructor";
  const isStudent = currentUser?.role === "student";

  // Hook de progression pour les étudiants
  const progressManagerInstance = useProgressManager({ userId: currentUser?.id ?? "" });
  const progressManager = isStudent ? progressManagerInstance : null;

  // Calculer la durée totale du hackathon
  const totalDuration = hackathonLevels.reduce(
    (sum, level) => sum + level.timeAllocation,
    0
  );

  // Formater la durée totale en heures et minutes
  const formatTotalDuration = () => {
    const hours = Math.floor(totalDuration / 60);
    const minutes = totalDuration % 60;
    return `${hours > 0 ? `${hours}h` : ""}${
      minutes > 0 ? `${minutes}min` : ""
    }`;
  };

  // S'assurer que les données sont à jour lorsqu'on arrive sur cette page
  useEffect(() => {
    const refreshData = async () => {
      if (sessionId) {
        try {
          await fetchInitialState();
        } catch (error) {
          console.error("Error refreshing data on landing page:", error);
        }
      }
    };

    refreshData();
  }, [sessionId]);

  // Gérer la fin d'une session
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
          setNotification("Session terminée avec succès", "success");
        } else {
          setNotification(
            "Erreur lors de la terminaison de la session",
            "error"
          );
        }
      } catch (error) {
        setNotification("Erreur lors de la terminaison de la session", "error");
      } finally {
        setIsEndingSession(false);
      }
    }
  };

  // Naviguer vers une vue
  const handleNavigate = (view: string) => {
    setTimeout(() => {
      setHackathonView(view);
    }, 100);
  };

  // Statistiques de progression pour les étudiants
  const getProgressStats = () => {
    if (!progressManager) return null;

    const hackathonCompletion = progressManager.getHackathonCompletion();
    const totalScore = progressManager.hackathonProgress.totalScore;

    return {
      currentLevel: hackathonCompletion.currentLevel,
      maxLevel: hackathonCompletion.maxLevel,
      percentage: hackathonCompletion.percentage,
      totalScore,
      levelsCompleted: progressManager.hackathonProgress.levelsCompleted.length,
    };
  };

  const progressStats = getProgressStats();

  // Afficher SessionSelector si demandé
  if (showSessionSelector) {
    return (
      <SessionSelector goBackToLanding={() => setShowSessionSelector(false)} />
    );
  }

  return (
    <div className="min-h-screen bg-bp-gradient text-white p-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigateTo("menu")}
          className="mb-8 bg-bp-red-500 hover:bg-bp-red-600 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-all duration-300 hover:shadow-bp"
        >
          <ArrowLeft size={20} />
          Retour au menu
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Hackathon Excel:{" "}
            <span className="text-bp-red-400">Le Dossier Perdu 2.0</span>
          </h1>
          <p className="text-xl text-bp-red-100 max-w-3xl mx-auto">
            Bienvenue dans notre défi Excel. Utilisez vos compétences avancées
            pour résoudre l'énigme du dossier perdu et découvrez les secrets
            qu'il contient !
          </p>

          {/* Informations utilisateur */}
          {currentUser && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                {isInstructor ? (
                  <Crown size={18} className="text-bp-red-400" />
                ) : (
                  <User size={18} className="text-blue-400" />
                )}
                <span className="font-medium">
                  {isInstructor ? "Instructeur" : "Étudiant"}
                  : {currentUser.name}
                </span>
              </div>

              {/* Statistiques de progression pour étudiants */}
              {progressStats && (
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                  <Star size={18} className="text-bp-red-400" />
                  <span>
                    Niveau {progressStats.currentLevel} •{" "}
                    {progressStats.totalScore} pts
                  </span>
                </div>
              )}

              {/* Bouton terminer session pour instructeurs */}
              {sessionId &&
                sessionActive &&
                isInstructor && (
                  <button
                    onClick={handleEndSession}
                    disabled={isEndingSession}
                    className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                  >
                    {isEndingSession ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Terminaison...
                      </>
                    ) : (
                      <>
                        <Power size={16} />
                        Terminer session
                      </>
                    )}
                  </button>
                )}
            </div>
          )}

          {sessionId && (
            <div className="mt-4 flex flex-col items-center gap-3">
              <div className="bg-bp-red-600 inline-flex px-4 py-2 rounded-lg items-center gap-2">
                <span
                  className={sessionActive ? "text-green-400" : "text-red-400"}
                >
                  ●
                </span>
                Session {sessionActive ? "active" : "terminée"}:{" "}
                <span className="font-mono">
                  {sessionId.substring(0, 10)}...
                </span>
              </div>
              {isSessionStarted ? (
                <div className={`flex items-center gap-3 bg-gray-800 rounded-lg px-5 py-3 border shadow-lg ${timeLeftSeconds < 300 ? "border-red-500 animate-pulse shadow-red-500/30" : "border-green-500 shadow-green-500/20"}`}>
                  <Clock size={20} className={timeLeftSeconds < 300 ? "text-red-400" : "text-green-400"} />
                  <div>
                    <div className={`text-xl font-bold font-mono ${timeLeftSeconds < 300 ? "text-red-400" : "text-green-400"}`}>
                      {formatTime(timeLeftSeconds)}
                    </div>
                    <div className="text-xs text-gray-400">Temps restant</div>
                  </div>
                </div>
              ) : (
                <div className="text-yellow-300 text-sm flex items-center gap-2">
                  <Clock size={16} />
                  Session créée — en attente de démarrage par l'instructeur
                </div>
              )}
            </div>
          )}

          {/* Barre de progression pour étudiants */}
          {progressStats && (
            <div className="mt-6 max-w-md mx-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-bp-red-100">
                  Progression globale
                </span>
                <div className="bg-bp-red-500 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold">
                    {progressStats.percentage.toFixed(0)}%
                  </div>
                  <div className="text-xs opacity-90">Progression</div>
                </div>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressStats.percentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-5xl font-bold mb-4">
            Escape Excel:{" "}
            <span className="text-bp-red-400">Le Dossier Perdu 2.0</span>
          </h1>
          <p className="text-xl text-bp-red-100 max-w-3xl mx-auto mb-8">
            Un hackathon Excel immersif de 2h où vous devez résoudre 7 défis
            analytiques pour reconstituer l'analyse critique d'un client
            important. Travaillez en équipe et maîtrisez les fonctions avancées
            d'Excel !
          </p>
        </div>

        {/* Challenge Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Scenario */}
          <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-xl p-8">
            <div className="flex items-center mb-6">
              <div className="bg-red-500 p-3 rounded-full mr-4">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Scénario de Crise</h2>
                <p className="text-bp-red-100">
                  Une situation d'urgence client
                </p>
              </div>
            </div>
            <div className="space-y-4 text-bp-red-50">
              <p>
                🏢 <strong>Client :</strong> Nexus Corporation - Présentation
                critique demain matin
              </p>
              <p>
                👤 <strong>Situation :</strong> Votre collègue senior est parti
                en urgence, laissant son analyse incomplète et sécurisée par des
                énigmes Excel
              </p>
              <p>
                ⏱️ <strong>Mission :</strong> Votre collègue senior a dû partir
                en urgence et a sécurisé tous ses fichiers avec un système
                d'énigmes basé sur Excel.
              </p>
              <div className="flex items-center gap-3 text-bp-red-200 mt-4">
                <Calendar size={20} />
                <span>Durée totale: {formatTotalDuration()}</span>
              </div>
            </div>

            {/* Carte présentant les niveaux */}
            <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-xl p-6 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">📊</div>
                <h2 className="text-xl font-bold">Structure du défi</h2>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-500 w-3 h-3 rounded-full"></div>
                  <p>
                    Phase 0 : Data Cleaning ({hackathonLevels[0].timeAllocation}
                    min)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-green-500 w-3 h-3 rounded-full"></div>
                  <p>
                    Phases 1–5 : Analyse &amp; Formules avancées (
                    {hackathonLevels
                      .slice(1, 13)
                      .reduce((sum, level) => sum + level.timeAllocation, 0)}
                    min)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-bp-red-400 w-3 h-3 rounded-full"></div>
                  <p>
                    Phase 6 : Visualisation (
                    {hackathonLevels
                      .slice(13)
                      .reduce((sum, level) => sum + level.timeAllocation, 0)}
                    min)
                  </p>
                </div>
              </div>
              <div className="mt-4 text-xs text-bp-red-200">
                {hackathonLevels.length} exercices au total à compléter
              </div>
            </div>

            {/* Carte des points et récompenses */}
            <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-xl p-6 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">🏆</div>
                <h2 className="text-xl font-bold">Système de points</h2>
              </div>
              <ul className="space-y-2 text-bp-red-100">
                <li className="flex justify-between">
                  <span>Phase 0 – Data Cleaning</span>
                  <span className="text-bp-red-200">
                    {hackathonLevels[0].pointsValue} pts
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Phases 1–4 – Formules Excel</span>
                  <span className="text-bp-red-200">50–100 pts/exercice</span>
                </li>
                <li className="flex justify-between">
                  <span>Phase 5 – Exercice Expert</span>
                  <span className="text-bp-red-200">450 pts</span>
                </li>
                <li className="flex justify-between">
                  <span>Phase 6 – Visualisation</span>
                  <span className="text-bp-red-200">
                    {hackathonLevels[hackathonLevels.length - 1].pointsValue} pts (dernier ex.)
                  </span>
                </li>
                <li className="border-t border-white/20 pt-2 mt-2"></li>
                <li className="flex justify-between text-red-300">
                  <span>Mauvaise réponse</span>
                  <span>-25 pts</span>
                </li>
                <li className="flex justify-between text-red-300">
                  <span>Indice n°1</span>
                  <span>-25 pts</span>
                </li>
                <li className="flex justify-between text-red-300">
                  <span>Indice n°2</span>
                  <span>-50 pts supplémentaires</span>
                </li>
                <li className="border-t border-white/20 pt-2 mt-2"></li>
                <li className="text-xs text-bp-red-200 font-semibold uppercase tracking-wide">Bonus finaux (fin de session) :</li>
                <li className="flex justify-between text-green-300 text-sm">
                  <span>🏅 Précision — 1er / 2e / 3e / 4e+</span>
                  <span>+200 / +150 / +100 / +75 pts</span>
                </li>
                <li className="flex justify-between text-cyan-300 text-sm">
                  <span>⚡ Rapidité — 1er / 2e / 3e / 4e+</span>
                  <span>+300 / +200 / +100 / +75 pts</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-xl p-8">
            <div className="flex flex-col items-center">
              <div className="text-5xl mb-6">🔍</div>
              <h2 className="text-2xl font-bold mb-4">
                {isInstructor
                  ? "Gestion du Hackathon"
                  : "Rejoindre le Hackathon"}
              </h2>

              <p className="text-center text-bp-red-100 mb-8 max-w-2xl">
                {isInstructor
                  ? "Créez et gérez les sessions de hackathon, suivez la progression des équipes en temps réel depuis l'interface globale."
                  : "Rejoignez une équipe et participez au hackathon ! Vous serez guidé étape par étape."}
              </p>

              {!sessionId ? (
                <div className="bg-bp-red-700/30 border border-bp-red-500/30 rounded-lg p-4 mb-6 max-w-md">
                  <div className="flex items-center gap-2 text-bp-red-200 mb-2">
                    <AlertTriangle size={20} />
                    <h3 className="font-bold">Aucune session active</h3>
                  </div>
                  <p className="text-yellow-200 text-sm">
                    {isInstructor
                      ? "Vous devez créer une session de hackathon pour que les participants puissent accéder aux interfaces."
                      : "Une session de hackathon doit être créée par un instructeur pour accéder aux interfaces."}
                  </p>
                </div>
              ) : null}

              <div className="w-full max-w-4xl">
                {/* Étudiant: uniquement le bouton Interface Étudiant */}
                {isStudent && (
                  <button
                    onClick={() => handleNavigate("student")}
                    disabled={!sessionActive}
                    className={`w-full rounded-xl p-6 text-left transition-all duration-300 hover:shadow-lg flex items-center gap-4 ${
                      sessionActive
                        ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <div className="bg-white bg-opacity-20 p-3 rounded-full">
                      <User size={32} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">
                        Rejoindre le Hackathon
                      </h3>
                      <p className="text-sm opacity-90">
                        Rejoignez une équipe et participez au hackathon avec un
                        guidage étape par étape
                      </p>
                      {progressStats && (
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <Star size={12} />
                          <span>
                            Niveau {progressStats.currentLevel} •{" "}
                            {progressStats.totalScore} pts
                          </span>
                        </div>
                      )}
                    </div>
                    <Play size={24} />
                  </button>
                )}

                {/* Instructeur: Interface Globale + Gérer les sessions */}
                {isInstructor && (
                  <div className="space-y-4">
                    <button
                      onClick={() => handleNavigate("global")}
                      disabled={!sessionActive}
                      className={`w-full rounded-xl p-6 text-left transition-all duration-300 hover:shadow-lg flex items-center gap-4 ${
                        sessionActive
                          ? "bg-gradient-to-r from-bp-red-500 to-pink-600 hover:from-bp-red-500 hover:to-pink-700 text-white"
                          : "bg-gray-600 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <div className="bg-white bg-opacity-20 p-3 rounded-full">
                        <Users size={32} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">
                          Interface Globale (Scoreboard)
                        </h3>
                        <p className="text-sm opacity-90">
                          Affichage temps réel pour animer le hackathon et suivre la
                          progression des équipes
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <Zap size={12} />
                          <span>Vue d'ensemble • Temps réel</span>
                        </div>
                      </div>
                      <Target size={24} />
                    </button>

                    <button
                      onClick={() => setShowSessionSelector(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-md"
                    >
                      <Settings size={24} />
                      Gérer les sessions
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Challenge Levels Preview */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-center mb-8">
            Aperçu des Défis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hackathonLevels.slice(0, 3).map((level) => (
              <div
                key={level.id}
                className="bg-white bg-opacity-5 backdrop-blur-sm rounded-lg p-4"
              >
                <h4 className="font-bold text-lg mb-2">
                  Niveau {level.id}: {level.name}
                </h4>
                <p className="text-sm text-bp-red-100 mb-2">
                  {level.description}
                </p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-bp-red-200">
                    {level.pointsValue} pts
                  </span>
                  <span className="text-gray-300">
                    {level.timeAllocation} min
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <p className="text-bp-red-100 text-sm">
              ... et {hackathonLevels.length - 3} autres exercices de difficulté croissante !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonLanding;
