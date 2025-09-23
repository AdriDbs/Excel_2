import React, { useState, useEffect } from "react";
import { Play, History, RefreshCw, ArrowLeft } from "lucide-react";
import { HackathonSession } from "./types";
import { createNewSession } from "./services/hackathonService";
import { useHackathon } from "./context/HackathonContext";

interface SessionSelectorProps {
  goBackToLanding: () => void;
}

// Récupérer les sessions existantes depuis le localStorage
const getExistingSessions = (): HackathonSession[] => {
  try {
    const storedData = localStorage.getItem("hackathon_session_data");
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error("Error reading sessions:", error);
  }
  return [];
};

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

const SessionSelector: React.FC<SessionSelectorProps> = ({
  goBackToLanding,
}) => {
  const { setSessionId, setNotification } = useHackathon();
  const [sessions, setSessions] = useState<HackathonSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les sessions existantes
  useEffect(() => {
    const loadSessions = () => {
      const existingSessions = getExistingSessions();
      setSessions(existingSessions);
    };

    loadSessions();

    // Gérer les mises à jour de session
    const handleSessionUpdate = () => {
      loadSessions();
    };

    window.addEventListener("hackathon_session_created", handleSessionUpdate);
    window.addEventListener("hackathon_session_ended", handleSessionUpdate);

    return () => {
      window.removeEventListener(
        "hackathon_session_created",
        handleSessionUpdate
      );
      window.removeEventListener(
        "hackathon_session_ended",
        handleSessionUpdate
      );
    };
  }, []);

  // Créer une nouvelle session - version simplifiée
  const handleCreateNewSession = async () => {
    setIsLoading(true);
    try {
      // Supprimer l'étudiant du localStorage pour assurer un démarrage propre
      localStorage.removeItem("hackathon_registered_student");

      const newSessionId = await createNewSession();

      // Définir l'ID de session
      setSessionId(newSessionId);

      // Recharger les sessions
      setSessions(getExistingSessions());
      setNotification("Nouvelle session créée avec succès", "success");

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

  // Rafraîchir la liste des sessions
  const refreshSessions = () => {
    setSessions(getExistingSessions());
  };

  return (
    <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-yellow-300">
          Gestion des Sessions
        </h2>
        <p className="text-blue-200 mt-2">
          Créez une nouvelle session ou rejoignez une session existante
        </p>
      </div>

      <button
        onClick={handleCreateNewSession}
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 mb-6 transition-all duration-300"
      >
        {isLoading ? (
          <RefreshCw className="animate-spin" size={20} />
        ) : (
          <Play size={20} />
        )}
        Créer une nouvelle session
      </button>

      {sessions.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-white">
              Sessions existantes
            </h3>
            <button
              onClick={refreshSessions}
              className="text-blue-300 hover:text-blue-200"
              title="Rafraîchir la liste"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="space-y-3 mb-4">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => selectSession(session.id)}
                disabled={isLoading}
                className={`w-full ${
                  session.isActive
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-gray-800/50 hover:bg-gray-700/50"
                } ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                } border border-gray-700 text-left p-3 rounded-lg flex items-start transition-all`}
              >
                <History
                  className={`mr-3 mt-1 flex-shrink-0 ${
                    session.isActive ? "text-blue-400" : "text-gray-400"
                  }`}
                  size={18}
                />
                <div className="overflow-hidden">
                  <div className="font-medium text-white truncate">
                    Session{" "}
                    {session.id.substring(
                      session.id.indexOf("_") + 1,
                      session.id.indexOf("_") + 9
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatSessionDate(session.sessionCreationTime)} •{" "}
                    {session.teams.length} équipes
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {session.isActive ? (
                      <span className="text-green-400">Active</span>
                    ) : (
                      <span className="text-red-400">
                        Terminée{" "}
                        {session.endTime
                          ? `le ${formatSessionDate(session.endTime)}`
                          : ""}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p>Aucune session existante</p>
        </div>
      )}

      <button
        onClick={goBackToLanding}
        disabled={isLoading}
        className={`mt-4 text-center w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white flex items-center justify-center gap-2 ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <ArrowLeft size={16} />
        Retour
      </button>
    </div>
  );
};

export default SessionSelector;
