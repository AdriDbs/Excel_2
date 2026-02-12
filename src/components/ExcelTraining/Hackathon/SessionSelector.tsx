import React, { useState, useEffect } from "react";
import {
  Play,
  History,
  RefreshCw,
  ArrowLeft,
  Users,
  Clock,
  Settings,
  Trash2,
  Eye,
  AlertTriangle,
  Plus,
  Minus,
  Trophy,
  Target,
  Power,
  Calendar,
} from "lucide-react";
import { HackathonSession } from "./types";
import {
  createNewSession,
  endSession,
  deleteSession,
  getAllSessions,
} from "./services/hackathonService";
import { useHackathon } from "./context/HackathonContext";
import { subscribeToAllHackathonSessions } from "../../../config/firebase";

interface SessionSelectorProps {
  goBackToLanding: () => void;
}

// Formater la date de début de session
const formatSessionDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Calculer la durée d'une session
const getSessionDuration = (session: HackathonSession): string => {
  const start = session.startTime || session.sessionCreationTime;
  const end = session.endTime || Date.now();
  const durationMs = end - start;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
};

const SessionSelector: React.FC<SessionSelectorProps> = ({
  goBackToLanding,
}) => {
  const { setSessionId, setNotification } = useHackathon();
  const [sessions, setSessions] = useState<HackathonSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [teamCount, setTeamCount] = useState(4);
  const [viewMode, setViewMode] = useState<"list" | "create" | "details">("list");
  const [selectedSession, setSelectedSession] = useState<HackathonSession | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [teamNames, setTeamNames] = useState<string[]>([]);

  // Charger les sessions existantes depuis Firebase et s'abonner aux mises à jour
  useEffect(() => {
    // Chargement initial
    const loadSessions = async () => {
      try {
        const allSessions = await getAllSessions();
        allSessions.sort((a, b) => b.sessionCreationTime - a.sessionCreationTime);
        setSessions(allSessions);
      } catch (error) {
        console.error("Error loading sessions from Firebase:", error);
      }
    };

    loadSessions();

    // S'abonner aux changements en temps réel
    const unsubscribe = subscribeToAllHackathonSessions((data) => {
      if (!data) {
        setSessions([]);
        return;
      }

      const sessionsList: HackathonSession[] = Object.entries(data).map(
        ([id, session]: [string, any]) => ({
          id,
          teams: (session.teams || []).filter(Boolean),
          sessionCreationTime: session.sessionCreationTime || 0,
          startTime: session.startTime || null,
          endTime: session.endTime,
          isActive: session.sessionActive !== false && session.isActive !== false,
        })
      );

      sessionsList.sort((a, b) => b.sessionCreationTime - a.sessionCreationTime);
      setSessions(sessionsList);
    });

    return () => unsubscribe();
  }, []);

  // Initialiser les noms d'équipes par défaut quand le nombre change
  useEffect(() => {
    const defaultNames = Array.from({ length: teamCount }, (_, i) => `Équipe ${i + 1}`);
    setTeamNames(defaultNames);
  }, [teamCount]);

  // Créer une nouvelle session avec le nombre d'équipes choisi
  const handleCreateNewSession = async () => {
    setIsLoading(true);
    try {
      const newSessionId = await createNewSession(teamCount, teamNames);

      // Définir l'ID de session
      setSessionId(newSessionId);

      setNotification(`Nouvelle session créée avec ${teamCount} équipes`, "success");

      // Revenir à la landing page
      goBackToLanding();
    } catch (error) {
      console.error("Error creating new session:", error);
      setNotification("Erreur lors de la création de la session", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Sélectionner une session existante
  const selectSession = (sessionId: string) => {
    setSessionId(sessionId);
    goBackToLanding();
  };

  // Terminer une session
  const handleEndSession = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const result = await endSession(sessionId);
      if (result) {
        setNotification("Session terminée avec succès", "success");
        setShowDeleteConfirm(null);
      } else {
        setNotification("Erreur lors de la terminaison", "error");
      }
    } catch (error) {
      setNotification("Erreur lors de la terminaison", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer une session de Firebase
  const handleDeleteSession = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const result = await deleteSession(sessionId);
      if (result) {
        setNotification("Session supprimée", "success");
        setShowDeleteConfirm(null);
      } else {
        setNotification("Erreur lors de la suppression", "error");
      }
    } catch (error) {
      setNotification("Erreur lors de la suppression", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Rafraîchir la liste des sessions
  const refreshSessions = async () => {
    try {
      const allSessions = await getAllSessions();
      allSessions.sort((a, b) => b.sessionCreationTime - a.sessionCreationTime);
      setSessions(allSessions);
    } catch (error) {
      console.error("Error refreshing sessions:", error);
    }
  };

  // Mettre à jour le nom d'une équipe
  const updateTeamName = (index: number, name: string) => {
    const newNames = [...teamNames];
    newNames[index] = name;
    setTeamNames(newNames);
  };

  const activeSessions = sessions.filter(s => s.isActive);
  const inactiveSessions = sessions.filter(s => !s.isActive);

  // Calculer les statistiques d'une session
  const getSessionStats = (session: HackathonSession) => {
    const totalParticipants = session.teams.reduce(
      (sum, team) => sum + (team.studentIds?.length || 0),
      0
    );
    const totalScore = session.teams.reduce((sum, team) => sum + team.score, 0);
    const avgLevel = session.teams.length > 0
      ? session.teams.reduce((sum, team) => sum + team.currentLevel, 0) / session.teams.length
      : 0;

    return { totalParticipants, totalScore, avgLevel };
  };

  return (
    <div className="min-h-screen bg-bp-gradient text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={goBackToLanding}
            className="bg-bp-red-500 hover:bg-bp-red-600 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-all duration-300"
          >
            <ArrowLeft size={20} />
            Retour
          </button>

          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Settings size={28} />
            Gestion des Sessions
          </h1>

          <button
            onClick={refreshSessions}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
            title="Rafraîchir"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        {/* Vue création */}
        {viewMode === "create" && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus size={24} />
              Créer une nouvelle session
            </h2>

            {/* Sélecteur du nombre d'équipes */}
            <div className="mb-6">
              <label className="block text-lg font-medium mb-3">
                Nombre d'équipes
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setTeamCount(Math.max(2, teamCount - 1))}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
                  disabled={teamCount <= 2}
                >
                  <Minus size={20} />
                </button>
                <div className="bg-green-600 text-white font-bold px-6 py-3 rounded-lg text-2xl min-w-[4rem] text-center">
                  {teamCount}
                </div>
                <button
                  onClick={() => setTeamCount(Math.min(10, teamCount + 1))}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
                  disabled={teamCount >= 10}
                >
                  <Plus size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-300 mt-2">
                Choisissez entre 2 et 10 équipes
              </p>
            </div>

            {/* Noms des équipes */}
            <div className="mb-6">
              <label className="block text-lg font-medium mb-3">
                Noms des équipes (optionnel)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {teamNames.map((name, index) => (
                  <input
                    key={index}
                    type="text"
                    value={name}
                    onChange={(e) => updateTeamName(index, e.target.value)}
                    placeholder={`Équipe ${index + 1}`}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ))}
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-4">
              <button
                onClick={() => setViewMode("list")}
                className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-lg font-bold transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateNewSession}
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  <Play size={20} />
                )}
                Créer la session
              </button>
            </div>
          </div>
        )}

        {/* Vue liste */}
        {viewMode === "list" && (
          <>
            {/* Bouton créer */}
            <button
              onClick={() => setViewMode("create")}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 mb-8 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Plus size={24} />
              Créer une nouvelle session
            </button>

            {/* Sessions actives */}
            {activeSessions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  Sessions actives ({activeSessions.length})
                </h2>
                <div className="space-y-3">
                  {activeSessions.map((session) => {
                    const stats = getSessionStats(session);
                    return (
                      <div
                        key={session.id}
                        className="bg-white/10 backdrop-blur-md rounded-xl p-4 border-2 border-green-500/50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              <h3 className="font-bold text-lg">
                                Session {session.id.substring(session.id.indexOf("_") + 1, session.id.indexOf("_") + 9)}
                              </h3>
                              <span className="text-xs bg-green-500 px-2 py-0.5 rounded-full">
                                Active
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                              <div className="flex items-center gap-2">
                                <Users size={16} className="text-blue-400" />
                                <span>{session.teams.length} équipes</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Target size={16} className="text-purple-400" />
                                <span>{stats.totalParticipants} participants</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Trophy size={16} className="text-yellow-400" />
                                <span>{stats.totalScore} pts total</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock size={16} className="text-gray-400" />
                                <span>{getSessionDuration(session)}</span>
                              </div>
                            </div>

                            <div className="text-xs text-gray-400">
                              <Calendar size={12} className="inline mr-1" />
                              Créée le {formatSessionDate(session.sessionCreationTime)}
                              {session.startTime && (
                                <span className="ml-3">
                                  Démarrée le {formatSessionDate(session.startTime)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <button
                              onClick={() => selectSession(session.id)}
                              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
                            >
                              <Play size={16} />
                              Rejoindre
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSession(session);
                                setViewMode("details");
                              }}
                              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all"
                            >
                              <Eye size={16} />
                              Détails
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(session.id)}
                              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all"
                            >
                              <Power size={16} />
                              Terminer
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sessions terminées */}
            {inactiveSessions.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <History size={20} className="text-gray-400" />
                  Sessions terminées ({inactiveSessions.length})
                </h2>
                <div className="space-y-3">
                  {inactiveSessions.slice(0, 5).map((session) => {
                    const stats = getSessionStats(session);
                    return (
                      <div
                        key={session.id}
                        className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-gray-600"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-2 h-2 bg-gray-500 rounded-full" />
                              <h3 className="font-bold text-lg text-gray-300">
                                Session {session.id.substring(session.id.indexOf("_") + 1, session.id.indexOf("_") + 9)}
                              </h3>
                              <span className="text-xs bg-gray-600 px-2 py-0.5 rounded-full">
                                Terminée
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400 mb-2">
                              <div className="flex items-center gap-2">
                                <Users size={16} />
                                <span>{session.teams.length} équipes</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Target size={16} />
                                <span>{stats.totalParticipants} participants</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Trophy size={16} />
                                <span>{stats.totalScore} pts</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock size={16} />
                                <span>{getSessionDuration(session)}</span>
                              </div>
                            </div>

                            <div className="text-xs text-gray-500">
                              Terminée le {formatSessionDate(session.endTime || Date.now())}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <button
                              onClick={() => {
                                setSelectedSession(session);
                                setViewMode("details");
                              }}
                              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all"
                            >
                              <Eye size={16} />
                              Voir
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(`delete_${session.id}`)}
                              className="bg-red-600/50 hover:bg-red-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all"
                            >
                              <Trash2 size={16} />
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Aucune session */}
            {sessions.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <History size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Aucune session existante</p>
                <p className="text-sm mt-2">Créez votre première session pour commencer</p>
              </div>
            )}
          </>
        )}

        {/* Vue détails */}
        {viewMode === "details" && selectedSession && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Eye size={24} />
                Détails de la session
              </h2>
              <button
                onClick={() => {
                  setViewMode("list");
                  setSelectedSession(null);
                }}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-all"
              >
                Retour
              </button>
            </div>

            {/* Infos session */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{selectedSession.teams.length}</div>
                <div className="text-sm text-gray-400">Équipes</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">
                  {selectedSession.teams.reduce((sum, t) => sum + (t.studentIds?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-400">Participants</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">
                  {selectedSession.teams.reduce((sum, t) => sum + t.score, 0)}
                </div>
                <div className="text-sm text-gray-400">Score total</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{getSessionDuration(selectedSession)}</div>
                <div className="text-sm text-gray-400">Durée</div>
              </div>
            </div>

            {/* Liste des équipes */}
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Users size={20} />
              Équipes et participants
            </h3>
            <div className="space-y-3">
              {selectedSession.teams
                .sort((a, b) => b.score - a.score)
                .map((team, index) => (
                  <div
                    key={team.id}
                    className={`bg-white/10 rounded-lg p-4 ${
                      index === 0 ? "border-2 border-yellow-500/50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-lg ${
                          index === 0 ? "text-yellow-400" :
                          index === 1 ? "text-gray-300" :
                          index === 2 ? "text-orange-400" : "text-gray-400"
                        }`}>
                          #{index + 1}
                        </span>
                        <h4 className="font-bold">{team.name}</h4>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{team.score} pts</div>
                        <div className="text-xs text-gray-400">
                          Niveau {team.currentLevel}
                        </div>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          index === 0 ? "bg-yellow-500" :
                          index === 1 ? "bg-gray-400" :
                          index === 2 ? "bg-orange-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${(team.currentLevel / 7) * 100}%` }}
                      />
                    </div>

                    {/* Participants */}
                    <div className="text-sm text-gray-400">
                      {team.studentIds && team.studentIds.length > 0 ? (
                        <span>{team.studentIds.length} participant(s)</span>
                      ) : (
                        <span className="italic">Aucun participant</span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Modal de confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4 text-yellow-400">
                <AlertTriangle size={24} />
                <h3 className="text-lg font-bold">
                  {showDeleteConfirm.startsWith("delete_") ? "Supprimer la session" : "Terminer la session"}
                </h3>
              </div>
              <p className="text-gray-300 mb-6">
                {showDeleteConfirm.startsWith("delete_")
                  ? "Cette action supprimera définitivement la session et toutes ses données."
                  : "Cette action terminera la session. Les participants ne pourront plus y accéder."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded-lg font-bold transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    if (showDeleteConfirm.startsWith("delete_")) {
                      handleDeleteSession(showDeleteConfirm.replace("delete_", ""));
                    } else {
                      handleEndSession(showDeleteConfirm);
                    }
                  }}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : (
                    <>
                      {showDeleteConfirm.startsWith("delete_") ? (
                        <Trash2 size={16} />
                      ) : (
                        <Power size={16} />
                      )}
                      Confirmer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionSelector;
