import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock, Users, Trophy, Target, Star, CheckCircle, AlertCircle } from "lucide-react";
import { NavigationProps } from "../../types";
import { Student, Instructor } from "../../../../types/database";
import { useProgressManager, useProgressNotifications } from "../../../../hooks/useProgressManager";
import { useHackathon } from "../context/HackathonContext";
import WaitingScreen from "./WaitingScreen";
import DownloadFilesOverlay from "./DownloadFilesOverlay";

interface StudentInterfaceProps extends NavigationProps {
  goBackToLanding: () => void;
  currentUser?: Student | Instructor;
  onLevelComplete?: (level: number, score: number, timeSpent: number) => void;
}

const StudentInterface: React.FC<StudentInterfaceProps> = ({
  navigateTo,
  goBackToLanding,
  currentUser,
  onLevelComplete
}) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [showDownloadOverlay, setShowDownloadOverlay] = useState(false);

  // Context du hackathon
  const {
    state: { teams, timeLeft, sessionId, isSessionStarted },
    setRegisteredStudent
  } = useHackathon();

  // Hook de progression pour les étudiants
  const progressManager = currentUser?.role === 'student' 
    ? useProgressManager({ userId: currentUser.id })
    : null;

  const { notifications, addNotification } = useProgressNotifications();

  // Initialiser le nom avec l'utilisateur connecté (mais ne pas auto-enregistrer)
  useEffect(() => {
    if (currentUser && currentUser.role === 'student') {
      setStudentName(currentUser.name);
      // Ne pas auto-enregistrer - laisser l'étudiant choisir son équipe d'abord
    }
  }, [currentUser]);

  const handleRegisterStudent = () => {
    if (studentName && selectedTeamId !== null) {
      const student = {
        id: currentUser?.id || `temp_${Date.now()}`,
        name: studentName,
        teamId: selectedTeamId,
        answers: {},
        hintsUsed: []
      };

      setRegisteredStudent(student);
      setIsRegistered(true);
      addNotification(`Bienvenue dans l'équipe ${teams.find(t => t.id === selectedTeamId)?.name} !`, "success");
    }
  };

  // Fonction pour gérer la validation d'une réponse/niveau
  const handleLevelValidation = async (levelId: number, answer: string) => {
    // Simuler la validation - dans un vrai cas, vous auriez la logique de validation ici
    const isCorrect = validateAnswer(levelId, answer);
    
    if (isCorrect && progressManager && onLevelComplete) {
      // Calculer le score basé sur la performance
      const baseScore = 200; // Score de base par niveau
      const timeBonus = calculateTimeBonus(levelId);
      const finalScore = baseScore + timeBonus;
      
      // Temps passé sur ce niveau (simulé)
      const timeSpent = calculateTimeSpent(levelId);
      
      // Appeler la fonction de completion
      await onLevelComplete(levelId, finalScore, timeSpent);
      
      addNotification(
        `🎉 Niveau ${levelId + 1} complété ! +${finalScore} points`,
        "achievement"
      );
      
      // Vérifier les milestones
      const hackathonCompletion = progressManager.getHackathonCompletion();
      if (hackathonCompletion.currentLevel === 3) {
        addNotification("🏆 Milestone : 3 niveaux complétés !", "milestone");
      } else if (hackathonCompletion.currentLevel === 6) {
        addNotification("👑 Presque fini ! 6 niveaux complétés !", "milestone");
      } else if (hackathonCompletion.currentLevel === 7) {
        addNotification("🎊 Félicitations ! Hackathon terminé !", "milestone");
      }
    }
  };

  // Fonctions utilitaires (à adapter selon votre logique)
  const validateAnswer = (levelId: number, answer: string): boolean => {
    // Votre logique de validation ici
    // Pour cet exemple, on considère que "BearingPoint" est toujours correct
    return answer.toLowerCase().includes("bearingpoint");
  };

  const calculateTimeBonus = (levelId: number): number => {
    // Calculer le bonus de temps basé sur la rapidité
    return Math.max(0, 50 - levelId * 5);
  };

  const calculateTimeSpent = (levelId: number): number => {
    // Calculer le temps passé sur ce niveau (simulé)
    return (levelId + 1) * 300; // 5 minutes par niveau en moyenne
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const isUrgent = timeLeft < 600; // Urgent si moins de 10 minutes

  // Trouver les données de l'équipe
  const teamData = teams.find(team => team.id === selectedTeamId);

  // Statistiques de progression
  const getProgressStats = () => {
    if (!progressManager) return null;
    
    const hackathonCompletion = progressManager.getHackathonCompletion();
    return {
      currentLevel: hackathonCompletion.currentLevel,
      maxLevel: hackathonCompletion.maxLevel,
      totalScore: progressManager.hackathonProgress.totalScore,
      levelsCompleted: progressManager.hackathonProgress.levelsCompleted.length
    };
  };

  const progressStats = getProgressStats();

  // Afficher l'écran d'inscription si pas encore enregistré
  if (!isRegistered) {
    return (
      <div className="bg-gray-900 min-h-screen text-white p-6">
        <div className="max-w-4xl mx-auto">
          {/* Bouton retour */}
          <button
            onClick={goBackToLanding}
            className="mb-8 bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-all duration-300 hover:shadow-md"
          >
            <ArrowLeft size={20} />
            Retour à l'accueil
          </button>

          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-8">
            <h1 className="text-3xl font-bold mb-6 text-center">
              Rejoindre le <span className="text-bp-red-400">Hackathon</span>
            </h1>

            {/* Saisie du nom (seulement si pas d'utilisateur connecté) */}
            {!currentUser && (
              <div className="mb-6">
                <label className="block text-lg font-semibold mb-2">
                  Votre nom complet
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Ex: Jean Dupont"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 text-lg"
                  maxLength={50}
                />
              </div>
            )}

            {/* Sélection d'équipe */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Choisissez votre équipe</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      selectedTeamId === team.id
                        ? "border-indigo-500 bg-indigo-500/20"
                        : "border-gray-600 bg-gray-800 hover:border-gray-500"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Users size={24} />
                      <h3 className="font-bold text-lg">{team.name}</h3>
                    </div>
                    <div className="text-left space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Score:</span>
                        <span className="font-medium">{team.score} pts</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Niveau:</span>
                        <span className="font-medium">{team.currentLevel}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Participants:</span>
                        <span className="font-medium">
                          {team.studentIds?.length || 0}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRegisterStudent}
              disabled={!studentName || !selectedTeamId}
              className={`
                w-full py-3 rounded-lg font-bold text-center transition-all duration-300
                ${
                  !studentName || !selectedTeamId
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white hover:shadow-lg"
                }
              `}
            >
              Rejoindre l'équipe
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Afficher l'écran d'attente si la session n'a pas commencé
  if (isRegistered && !isSessionStarted) {
    return (
      <WaitingScreen
        teamName={teamData?.name || ""}
        studentName={studentName}
        goBackToLanding={goBackToLanding}
      />
    );
  }

  // Interface principale du hackathon
  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      {/* Notifications de progression */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-3 rounded-lg shadow-lg backdrop-blur-md transition-all duration-300 animate-slide-in-right ${
                notification.type === 'achievement' ? 'bg-green-500 bg-opacity-90 border-l-4 border-green-300' :
                notification.type === 'milestone' ? 'bg-bp-red-400 bg-opacity-90 border-l-4 border-bp-red-200' :
                notification.type === 'warning' ? 'bg-yellow-500 bg-opacity-90 border-l-4 border-yellow-300' :
                'bg-bp-red-400 bg-opacity-90 border-l-4 border-blue-300'
              }`}
            >
              <p className="text-white font-medium text-sm">{notification.message}</p>
            </div>
          ))}
        </div>
      )}

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
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-bp-red-400 bg-clip-text text-transparent mb-2">
          Escape Excel: Le Dossier Perdu 2.0
        </h1>
        <h2 className="text-xl text-gray-300 mb-4">
          Interface Étudiant - {studentName} - {teamData?.name}
        </h2>

        {/* Chronomètre et statistiques */}
        <div className="flex justify-center items-center gap-6 mb-6">
          {/* Timer */}
          <div className={`
            flex items-center bg-gray-800 rounded-lg px-4 py-2 border shadow-lg
            ${isUrgent ? "border-red-500 animate-pulse shadow-red-500/30" : "border-cyan-500"}
          `}>
            <Clock className={`mr-2 ${isUrgent ? "text-red-500" : "text-cyan-400"}`} size={24} />
            <div>
              <div className={`text-2xl font-bold ${isUrgent ? "text-red-400" : "text-cyan-400"}`}>
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs text-gray-400">Temps restant</div>
            </div>
          </div>

          {/* Statistiques de progression */}
          {progressStats && (
            <div className="flex gap-4">
              <div className="bg-gray-800 rounded-lg px-4 py-2 border border-bp-red-400">
                <div className="flex items-center gap-2">
                  <Trophy className="text-bp-red-400" size={20} />
                  <div>
                    <div className="text-lg font-bold">{progressStats.totalScore}</div>
                    <div className="text-xs text-gray-400">Points</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg px-4 py-2 border border-green-500">
                <div className="flex items-center gap-2">
                  <Target className="text-green-400" size={20} />
                  <div>
                    <div className="text-lg font-bold">{progressStats.currentLevel}</div>
                    <div className="text-xs text-gray-400">Niveau</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg px-4 py-2 border border-blue-500">
                <div className="flex items-center gap-2">
                  <Star className="text-blue-400" size={20} />
                  <div>
                    <div className="text-lg font-bold">{progressStats.levelsCompleted}</div>
                    <div className="text-xs text-gray-400">Complétés</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Barre de progression */}
        {progressStats && (
          <div className="max-w-md mx-auto">
            <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(progressStats.currentLevel / progressStats.maxLevel) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-400">
              Progression: {progressStats.currentLevel}/{progressStats.maxLevel} niveaux
            </div>
          </div>
        )}
      </div>

      {/* Interface de hackathon - contenu principal */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Zone principale de travail */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="text-orange-400" size={24} />
                Niveau Actuel: {progressStats?.currentLevel || 0}
              </h3>

              {/* Contenu du niveau actuel */}
              <div className="bg-gray-900/50 rounded-lg p-6 mb-4">
                <h4 className="text-lg font-semibold mb-2">Défi à résoudre:</h4>
                <p className="text-gray-300 mb-4">
                  Utilisez les fonctions Excel avancées pour résoudre cette énigme...
                  {/* Ici vous intégreriez le contenu réel du niveau */}
                </p>

                {/* Zone de réponse */}
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Votre réponse:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Saisissez votre réponse..."
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    />
                    <button
                      onClick={() => handleLevelValidation(progressStats?.currentLevel || 0, "BearingPoint")}
                      className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                    >
                      <CheckCircle size={20} />
                      Valider
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panneau latéral */}
          <div className="space-y-4">
            {/* Équipe */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <Users size={20} />
                {teamData?.name}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Score équipe:</span>
                  <span className="font-medium">{teamData?.score} pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Niveau équipe:</span>
                  <span className="font-medium">{teamData?.currentLevel}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => setShowDownloadOverlay(true)}
                className="w-full bg-bp-red-400 hover:bg-bp-red-500 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                📁 Télécharger les fichiers
              </button>
              
              <button
                className="w-full bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                💡 Demander un indice (-25 pts)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CSS pour l'effet de grille */}
      <style>
        {`
        .bg-grid {
          background-image: 
            linear-gradient(to right, rgba(25, 25, 35, 0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(25, 25, 35, 0.8) 1px, transparent 1px);
          background-size: 30px 30px;
        }
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

      {/* Overlay de téléchargement */}
      {showDownloadOverlay && (
        <DownloadFilesOverlay onClose={() => setShowDownloadOverlay(false)} />
      )}
    </div>
  );
};

export default StudentInterface;