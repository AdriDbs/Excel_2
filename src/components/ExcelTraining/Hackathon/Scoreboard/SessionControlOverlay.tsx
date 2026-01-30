import React, { useState } from "react";
import {
  X,
  Play,
  Users,
  Clock,
  Settings,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Team } from "../types";
import { useHackathon } from "../context/HackathonContext";
import { startSession, updateTeamName } from "../services/hackathonService";

interface SessionControlOverlayProps {
  onClose: () => void;
}

const SessionControlOverlay: React.FC<SessionControlOverlayProps> = ({
  onClose,
}) => {
  const { 
    state, 
    setNotification, 
    setSessionActive, 
    startSessionTimer
  } = useHackathon();
  
  const { teams, sessionId, timeLeft, isSessionStarted, seconds } = state;
  const [isStarting, setIsStarting] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Gérer le démarrage de la session
  const handleStartSession = async () => {
    if (!sessionId) return;

    if (isSessionStarted) {
      // Si la session est déjà lancée, afficher une notification
      setNotification("La session est déjà en cours", "error");
      return;
    }

    setIsStarting(true);
    try {
      // Appeler le service pour démarrer la session
      const success = await startSession(sessionId);
      if (success) {
        // Utiliser la fonction du contexte pour démarrer le timer
        startSessionTimer();
        setSessionActive(true);
        setNotification(
          "Session démarrée avec succès! Le timer est lancé.",
          "success"
        );
      } else {
        setNotification("Erreur lors du démarrage de la session", "error");
      }
    } catch (error) {
      console.error("Error starting session:", error);
      setNotification("Erreur lors du démarrage de la session", "error");
    } finally {
      setIsStarting(false);
    }
  };

  // Sélectionner une équipe pour l'édition
  const selectTeamForEdit = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setSelectedTeamId(team.id);
  };

  // Modifier le nom d'une équipe
  const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeamName(e.target.value);
  };

  // Sauvegarder les modifications d'une équipe
  const saveTeamChanges = async () => {
    if (!editingTeam || !sessionId || !teamName.trim()) {
      setNotification("Nom d'équipe invalide", "error");
      return;
    }

    setIsSaving(true);
    try {
      // Mettre à jour le nom de l'équipe via le service
      const success = await updateTeamName(sessionId, editingTeam.id, teamName);

      if (success) {
        setNotification(`Équipe renommée en "${teamName}"`, "success");
        // Fermer l'éditeur après la sauvegarde réussie
        setEditingTeam(null);
        setTeamName("");
        // Forcer un rechargement des données de la session pour afficher le nouveau nom
        window.dispatchEvent(
          new CustomEvent("hackathon_data_updated", {
            detail: { sessionId },
          })
        );
      } else {
        setNotification(
          "Erreur lors de la mise à jour du nom d'équipe",
          "error"
        );
      }
    } catch (error) {
      console.error("Error updating team name:", error);
      setNotification("Erreur lors de la mise à jour du nom d'équipe", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Formatter le temps restant avec secondes
  const formatTime = (minutes: number, secs: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-screen overflow-auto shadow-2xl border border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="text-blue-400" />
            Contrôle de session
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Session Info */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white mb-1">
                  Informations sur la session
                </h3>
                <p className="text-gray-300 text-sm mb-2">
                  ID: <span className="font-mono">{sessionId}</span>
                </p>
                <p className="text-gray-300 text-sm">
                  Status:{" "}
                  <span
                    className={`font-medium ${
                      isSessionStarted ? "text-green-400" : "text-bp-red-400"
                    }`}
                  >
                    {isSessionStarted ? "En cours" : "En attente de démarrage"}
                  </span>
                </p>
              </div>

              <div className="flex items-center">
                <Clock
                  className={`mr-2 ${
                    isSessionStarted ? "text-green-400" : "text-blue-400"
                  }`}
                  size={20}
                />
                <span className="text-2xl font-mono text-white">
                  {formatTime(timeLeft, seconds)}
                </span>
              </div>

              <button
                onClick={handleStartSession}
                disabled={isStarting || isSessionStarted}
                className={`${
                  isSessionStarted || isStarting
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } text-white font-bold py-2 px-4 rounded flex items-center gap-2 transition-all`}
              >
                {isStarting ? (
                  <RefreshCw size={20} className="animate-spin" />
                ) : (
                  <Play size={20} />
                )}
                {isSessionStarted
                  ? "Session en cours"
                  : isStarting
                  ? "Démarrage..."
                  : "Démarrer la session"}
              </button>
            </div>

            {isSessionStarted && (
              <div className="mt-4 bg-yellow-900/30 border border-yellow-600/30 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle
                  className="text-yellow-500 mt-1 flex-shrink-0"
                  size={18}
                />
                <p className="text-bp-red-200 text-sm">
                  La session a déjà été démarrée. Le timer est en cours
                  d'exécution.
                </p>
              </div>
            )}
          </div>

          {/* Teams Management */}
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="text-blue-400" />
            Équipes et participants
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {teams.map((team) => (
              <div
                key={team.id}
                className={`bg-gray-700 rounded-lg p-4 border ${
                  selectedTeamId === team.id
                    ? "border-blue-500"
                    : "border-gray-600"
                } transition-all`}
              >
                {editingTeam?.id === team.id ? (
                  <div className="mb-2">
                    <input
                      type="text"
                      value={teamName}
                      onChange={handleTeamNameChange}
                      className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 w-full text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Nom de l'équipe"
                    />
                    <div className="flex justify-end mt-2 gap-2">
                      <button
                        onClick={() => setEditingTeam(null)}
                        className="bg-gray-600 text-white px-3 py-1 rounded"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={saveTeamChanges}
                        disabled={isSaving}
                        className="bg-bp-red-400 text-white px-3 py-1 rounded flex items-center gap-1"
                      >
                        {isSaving && (
                          <RefreshCw size={14} className="animate-spin" />
                        )}
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-medium text-white">
                      {team.name}
                    </h4>
                    <div className="flex gap-1">
                      <button
                        onClick={() => selectTeamForEdit(team)}
                        className="text-gray-400 hover:text-white p-1"
                        title="Modifier l'équipe"
                      >
                        <Settings size={16} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-300 mb-2">
                  Score:{" "}
                  <span className="font-medium text-blue-300">
                    {team.score}
                  </span>
                </div>

                <div className="mt-3">
                  <h5 className="text-gray-400 text-xs uppercase tracking-wide mb-2">
                    Participants ({team.studentIds?.length || 0})
                  </h5>

                  {team.studentIds && team.studentIds.length > 0 ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                      {/* Cette section contiendra la liste des participants quand cette fonctionnalité sera implémentée */}
                      {/* Pour l'instant, affichez uniquement le nombre */}
                      <div className="text-white text-sm">
                        {team.studentIds.length} participants connectés
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm italic">
                      Aucun participant
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-900/30 border border-blue-600/30 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-300 mb-2">
              Instructions pour démarrer la session
            </h3>
            <ol className="list-decimal list-inside text-gray-300 space-y-2 text-sm">
              <li>
                Vérifiez que toutes les équipes sont correctement configurées
              </li>
              <li>
                Assurez-vous que tous les participants sont inscrits dans leurs
                équipes respectives
              </li>
              <li>
                Cliquez sur "Démarrer la session" pour lancer le chronomètre et
                commencer officiellement le hackathon
              </li>
              <li>
                Une fois la session démarrée, le temps commencera à s'écouler
                pour tous les participants
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionControlOverlay;