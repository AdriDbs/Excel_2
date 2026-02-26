import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Clock,
  Users,
  Trophy,
  Target,
  Star,
  CheckCircle,
  LogOut,
  RefreshCw,
  Database,
  Filter,
  Layers,
  BarChart,
  Zap,
} from "lucide-react";
import { NavigationProps } from "../../types";
import { Student, Instructor } from "../../../../types/database";
import { useProgressNotifications } from "../../../../hooks/useProgressManager";
import { useHackathon } from "../context/HackathonContext";
import { registerStudent, hackathonLevels } from "../services/hackathonService";
import StudentExercise from "./StudentExercise";
import WaitingScreen from "./WaitingScreen";
import DownloadFilesOverlay from "./DownloadFilesOverlay";

interface StudentInterfaceProps extends NavigationProps {
  goBackToLanding: () => void;
  currentUser?: Student | Instructor;
  onLevelComplete?: (level: number, score: number, timeSpent: number) => void;
}

// Icônes par phase pour la navigation entre exercices
const getLevelIcon = (levelId: number): React.FC<React.ComponentProps<typeof CheckCircle>> => {
  if (levelId === 0) return Database as React.FC<any>;      // Phase 0 : Nettoyage
  if (levelId <= 3) return Target as React.FC<any>;         // Phase 1 : Fonctions de base
  if (levelId <= 5) return Zap as React.FC<any>;            // Phase 2 : Manipulation avancée
  if (levelId <= 8) return Filter as React.FC<any>;         // Phase 3 : Extraction
  if (levelId <= 11) return Layers as React.FC<any>;        // Phase 4 : Combinaison
  if (levelId === 12) return Star as React.FC<any>;         // Phase 5 : Expert
  return BarChart as React.FC<any>;                         // Phase 6 : Visualisation
};

const StudentInterface: React.FC<StudentInterfaceProps> = ({
  navigateTo,
  goBackToLanding,
  currentUser,
  onLevelComplete,
}) => {
  const [studentName, setStudentName] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [showDownloadOverlay, setShowDownloadOverlay] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLeavingTeam, setIsLeavingTeam] = useState(false);
  const [isLoadingRegistration, setIsLoadingRegistration] = useState(true);

  // Contexte hackathon
  const {
    state: { teams, timeLeftSeconds, sessionId, isSessionStarted, registeredStudent },
    setRegisteredStudent,
    leaveTeam,
    loadStudentFromFirebase,
    setNotification,
    formatTime: formatHackathonTime,
  } = useHackathon();

  const { notifications, addNotification } = useProgressNotifications();

  // Charger l'enregistrement existant depuis Firebase au montage
  useEffect(() => {
    const checkExistingRegistration = async () => {
      if (currentUser && currentUser.role === "student" && sessionId) {
        setIsLoadingRegistration(true);
        try {
          const existingStudent = await loadStudentFromFirebase(sessionId, currentUser.id);
          if (existingStudent) {
            setSelectedTeamId(existingStudent.teamId);
          }
        } catch (error) {
          console.error("Error checking existing registration:", error);
        } finally {
          setIsLoadingRegistration(false);
        }
      } else {
        setIsLoadingRegistration(false);
      }
    };

    checkExistingRegistration();
  }, [currentUser?.id, sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialiser le nom avec l'utilisateur connecté
  useEffect(() => {
    if (currentUser && currentUser.role === "student") {
      setStudentName(currentUser.name);
    }
  }, [currentUser]);

  const isRegistered = registeredStudent !== null && registeredStudent.teamId > 0;

  const handleRegisterStudent = async () => {
    if (!studentName || selectedTeamId === null || !sessionId) return;

    setIsRegistering(true);
    try {
      const userId = currentUser?.id || `temp_${Date.now()}`;
      const student = await registerStudent(studentName, selectedTeamId, sessionId, userId);
      setRegisteredStudent(student);
      addNotification(
        `Bienvenue dans l'équipe ${teams.find((t) => t.id === selectedTeamId)?.name} !`,
        "success"
      );
    } catch (error) {
      console.error("Error registering student:", error);
      setNotification("Erreur lors de l'inscription", "error");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir quitter votre équipe ?")) return;

    setIsLeavingTeam(true);
    try {
      const result = await leaveTeam();
      if (result) {
        setSelectedTeamId(null);
        addNotification("Vous avez quitté l'équipe", "success");
      } else {
        setNotification("Erreur lors du départ de l'équipe", "error");
      }
    } catch (error) {
      console.error("Error leaving team:", error);
      setNotification("Erreur lors du départ de l'équipe", "error");
    } finally {
      setIsLeavingTeam(false);
    }
  };

  // Callback de completion de niveau
  const handleLevelComplete = async (levelId: number, points: number, timeSpent: number) => {
    addNotification(`Exercice complété ! +${points} points`, "achievement");
    if (onLevelComplete) {
      await onLevelComplete(levelId, points, timeSpent);
    }
  };

  const isUrgent = timeLeftSeconds < 600;

  const activeTeamId = registeredStudent?.teamId || selectedTeamId;
  const teamData = teams.find((team) => team.id === activeTeamId);

  // ─── Écran de chargement ───────────────────────────────────────────────────
  if (isLoadingRegistration) {
    return (
      <div className="bg-gray-900 min-h-screen text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={48} className="mx-auto mb-4 animate-spin text-bp-red-400" />
          <p className="text-xl">Chargement...</p>
        </div>
      </div>
    );
  }

  // ─── Écran d'inscription ──────────────────────────────────────────────────
  if (!isRegistered) {
    return (
      <div className="bg-gray-900 min-h-screen text-white p-6">
        <div className="max-w-4xl mx-auto">
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

            {!currentUser && (
              <div className="mb-6">
                <label className="block text-lg font-semibold mb-2">Votre nom complet</label>
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
                        <span className="font-medium">{team.studentIds?.length || 0}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRegisterStudent}
              disabled={!studentName || selectedTeamId === null || isRegistering}
              className={`
                w-full py-3 rounded-lg font-bold text-center transition-all duration-300 flex items-center justify-center gap-2
                ${
                  !studentName || selectedTeamId === null || isRegistering
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white hover:shadow-lg"
                }
              `}
            >
              {isRegistering ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  Inscription en cours...
                </>
              ) : (
                "Rejoindre l'équipe"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Écran d'attente (session non démarrée) ───────────────────────────────
  if (isRegistered && !isSessionStarted) {
    return (
      <WaitingScreen
        teamName={teamData?.name || ""}
        studentName={studentName || registeredStudent?.name || ""}
        goBackToLanding={goBackToLanding}
        onLeaveTeam={handleLeaveTeam}
        isLeavingTeam={isLeavingTeam}
      />
    );
  }

  // ─── Interface principale du hackathon ────────────────────────────────────
  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
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
                  ? "bg-bp-red-400 bg-opacity-90 border-l-4 border-bp-red-200"
                  : "bg-blue-500 bg-opacity-90 border-l-4 border-blue-300"
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

      {/* En-tête */}
      <div className="text-center mb-6 relative z-10 pt-12">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-bp-red-400 bg-clip-text text-transparent mb-1">
          Escape Excel: Le Dossier Perdu 2.0
        </h1>
        <h2 className="text-lg text-gray-300 mb-4">
          {registeredStudent?.name || studentName} — {teamData?.name}
        </h2>

        {/* Timer + stats équipe */}
        <div className="flex flex-wrap justify-center items-center gap-4 mb-4">
          {/* Timer global */}
          <div
            className={`flex items-center bg-gray-800 rounded-lg px-4 py-2 border shadow-lg ${
              isUrgent ? "border-red-500 animate-pulse shadow-red-500/30" : "border-cyan-500"
            }`}
          >
            <Clock className={`mr-2 ${isUrgent ? "text-red-500" : "text-cyan-400"}`} size={22} />
            <div>
              <div className={`text-2xl font-bold font-mono ${isUrgent ? "text-red-400" : "text-cyan-400"}`}>
                {formatHackathonTime(timeLeftSeconds)}
              </div>
              <div className="text-xs text-gray-400">Temps restant</div>
            </div>
          </div>

          {/* Score équipe (mis à jour en temps réel) */}
          {teamData && (
            <div className="flex gap-4">
              <div className="bg-gray-800 rounded-lg px-4 py-2 border border-bp-red-400">
                <div className="flex items-center gap-2">
                  <Trophy className="text-bp-red-400" size={20} />
                  <div>
                    <div className="text-lg font-bold">{teamData.score}</div>
                    <div className="text-xs text-gray-400">Points équipe</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg px-4 py-2 border border-green-500">
                <div className="flex items-center gap-2">
                  <Target className="text-green-400" size={20} />
                  <div>
                    <div className="text-lg font-bold">{teamData.completedLevels?.length || 0}/16</div>
                    <div className="text-xs text-gray-400">Exercices</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg px-4 py-2 border border-blue-500">
                <div className="flex items-center gap-2">
                  <Users className="text-blue-400" size={20} />
                  <div>
                    <div className="text-lg font-bold">{teamData.studentIds?.length || 0}</div>
                    <div className="text-xs text-gray-400">Membres</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interface d'exercices (vraies questions, sync équipe en temps réel) */}
      <div className="relative z-10 max-w-6xl mx-auto">
        {teamData ? (
          <StudentExercise
            teamData={teamData}
            getLevelIcon={getLevelIcon}
            hackathonLevels={hackathonLevels}
            sessionId={sessionId}
            userId={currentUser?.id || registeredStudent?.id || ""}
            onLevelComplete={handleLevelComplete}
          />
        ) : (
          <div className="text-center text-gray-400 py-12">
            <RefreshCw size={32} className="mx-auto mb-4 animate-spin" />
            <p>Chargement des données de l'équipe...</p>
          </div>
        )}
      </div>

      {/* Actions bas de page */}
      <div className="relative z-10 max-w-6xl mx-auto mt-6 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => setShowDownloadOverlay(true)}
          className="bg-bp-red-400 hover:bg-bp-red-500 px-5 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          Télécharger les fichiers Excel
        </button>

        <button
          onClick={handleLeaveTeam}
          disabled={isLeavingTeam}
          className="bg-red-700 hover:bg-red-800 px-5 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
        >
          {isLeavingTeam ? <RefreshCw size={16} className="animate-spin" /> : <LogOut size={16} />}
          {isLeavingTeam ? "Départ en cours..." : "Quitter l'équipe"}
        </button>
      </div>

      {/* CSS */}
      <style>
        {`
        .bg-grid {
          background-image:
            linear-gradient(to right, rgba(25, 25, 35, 0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(25, 25, 35, 0.8) 1px, transparent 1px);
          background-size: 30px 30px;
        }
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
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
