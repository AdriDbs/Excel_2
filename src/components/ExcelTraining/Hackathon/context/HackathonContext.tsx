import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Team, Student, HackathonState } from "../types";
import {
  syncTeamsData,
  fetchInitialState,
  endSession,
  getStudentFromStorage,
  isSessionActive,
} from "../services/hackathonService";

// Valeurs par défaut pour le contexte
const defaultState: HackathonState = {
  teams: [],
  timeLeft: 120, // en minutes
  notification: {
    visible: false,
    message: "",
    type: "success",
  },
  sessionId: "",
  isGlobalView: false,
  registeredStudent: null,
  sessionActive: true,
  isSessionStarted: false,
  seconds: 0,
};

// Interface pour les fonctions du contexte
interface HackathonContextType {
  state: HackathonState;
  updateTeamScore: (
    teamId: number,
    actionType: "success" | "hint",
    points?: number
  ) => void;
  setTimeLeft: (time: number) => void;
  completeLevel: (teamId: number, levelId: number) => void;
  updateLevelProgress: (
    teamId: number,
    levelId: number,
    progress: number
  ) => void;
  setNotification: (
    message: string,
    type: "success" | "hint" | "error"
  ) => void;
  clearNotification: () => void;
  setSessionId: (id: string) => void;
  setIsGlobalView: (isGlobal: boolean) => void;
  endCurrentSession: () => Promise<boolean>;
  setRegisteredStudent: (student: Student | null) => void;
  setSessionActive: (active: boolean) => void;
  checkSessionValidity: () => Promise<boolean>;
  resetHackathonState: () => void;
  setIsSessionStarted: (started: boolean) => void;
  setSeconds: (seconds: number) => void;
  startSessionTimer: () => void;
}

// Création du contexte
const HackathonContext = createContext<HackathonContextType | undefined>(
  undefined
);

// Provider du contexte
export const HackathonProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<HackathonState>(defaultState);

  // Charger l'état initial
  useEffect(() => {
    const initState = async () => {
      try {
        const initialState = await fetchInitialState();

        // Récupérer l'étudiant du localStorage si disponible
        const storedStudent = getStudentFromStorage();

        // Vérifier si la session a déjà été démarrée (timeLeft < 120)
        const isStarted =
          initialState.timeLeft !== undefined && initialState.timeLeft < 120;

        setState((prevState) => ({
          ...prevState,
          // Assurer que teams est défini en utilisant les valeurs de initialState ou un tableau vide
          teams: initialState.teams || [],
          timeLeft: initialState.timeLeft || 120,
          sessionId: initialState.sessionId || "",
          registeredStudent: storedStudent,
          sessionActive:
            initialState.sessionActive !== undefined
              ? initialState.sessionActive
              : true,
          isSessionStarted: isStarted,
          seconds: 0, // Initialiser les secondes à 0
        }));
      } catch (error) {
        console.error("Failed to fetch initial state:", error);
      }
    };

    initState();
  }, []);

  // Timer pour les secondes
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (state.isSessionStarted && state.sessionActive) {
      interval = setInterval(() => {
        setState((prevState) => {
          // Mise à jour des secondes
          const newSeconds = prevState.seconds - 1;

          if (newSeconds < 0) {
            // Si les secondes atteignent 0, décrémenter les minutes
            if (prevState.timeLeft > 0) {
              return {
                ...prevState,
                timeLeft: prevState.timeLeft - 1,
                seconds: 59,
              };
            }
            return prevState; // Ne pas changer si le temps est déjà à 0
          }

          return {
            ...prevState,
            seconds: newSeconds,
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isSessionStarted, state.sessionActive]);

  // Synchroniser les changements d'équipes
  useEffect(() => {
    if (state.teams.length > 0 && state.sessionId) {
      syncTeamsData(state.teams, state.sessionId);
    }
  }, [state.teams, state.sessionId]);

  // Écouter les événements de démarrage et de fin de session
  useEffect(() => {
    const handleSessionStart = (event: CustomEvent) => {
      if (event.detail && event.detail.sessionId === state.sessionId) {
        setIsSessionStarted(true);
        setTimeLeft(120); // Réinitialiser le timer à 120 minutes
        setSeconds(0); // Réinitialiser les secondes à 0
      }
    };

    const handleSessionEnd = (event: CustomEvent) => {
      if (event.detail && event.detail.sessionId === state.sessionId) {
        setSessionActive(false);
      }
    };

    window.addEventListener(
      "hackathon_session_started",
      handleSessionStart as EventListener
    );
    window.addEventListener(
      "hackathon_session_ended",
      handleSessionEnd as EventListener
    );

    return () => {
      window.removeEventListener(
        "hackathon_session_started",
        handleSessionStart as EventListener
      );
      window.removeEventListener(
        "hackathon_session_ended",
        handleSessionEnd as EventListener
      );
    };
  }, [state.sessionId]);

  // Réinitialiser l'état du hackathon
  const resetHackathonState = () => {
    setState({
      ...defaultState,
      registeredStudent: state.registeredStudent, // Conserver l'étudiant enregistré
    });
  };

  // Mettre à jour le score d'une équipe
  const updateTeamScore = (
    teamId: number,
    actionType: "success" | "hint",
    points?: number
  ) => {
    setState((prevState) => {
      const updatedTeams = prevState.teams.map((team) => {
        if (team.id === teamId) {
          let newScore = team.score;
          if (actionType === "success") {
            newScore += points || 200; // Utilise les points fournis ou 200 par défaut
          } else if (actionType === "hint") {
            newScore -= 25; // Pénalité fixe pour les indices
          }
          return { ...team, score: newScore };
        }
        return team;
      });

      const message =
        actionType === "success"
          ? `${
              updatedTeams.find((t) => t.id === teamId)?.name
            } a validé une question ! +${points || 200} points`
          : `${
              updatedTeams.find((t) => t.id === teamId)?.name
            } a utilisé un indice. -25 points`;

      setNotification(message, actionType);

      return {
        ...prevState,
        teams: updatedTeams,
      };
    });
  };

  // Mettre à jour le niveau d'une équipe
  const completeLevel = (teamId: number, levelId: number) => {
    setState((prevState) => {
      const updatedTeams = prevState.teams.map((team) => {
        if (team.id === teamId) {
          const newCompletedLevels = [...(team.completedLevels || [])];
          if (!newCompletedLevels.includes(levelId)) {
            newCompletedLevels.push(levelId);
          }
          return {
            ...team,
            completedLevels: newCompletedLevels,
            currentLevel: levelId + 1,
            progress: {
              ...team.progress,
              [levelId]: 100, // Niveau terminé = 100%
              [levelId + 1]: 0, // Prochain niveau = 0%
            },
          };
        }
        return team;
      });

      return {
        ...prevState,
        teams: updatedTeams,
      };
    });
  };

  // Mettre à jour la progression d'un niveau
  const updateLevelProgress = (
    teamId: number,
    levelId: number,
    progress: number
  ) => {
    setState((prevState) => {
      const updatedTeams = prevState.teams.map((team) => {
        if (team.id === teamId) {
          return {
            ...team,
            progress: {
              ...team.progress,
              [levelId]: progress,
            },
          };
        }
        return team;
      });

      return {
        ...prevState,
        teams: updatedTeams,
      };
    });
  };

  // Définir une notification
  const setNotification = (
    message: string,
    type: "success" | "hint" | "error"
  ) => {
    setState((prevState) => ({
      ...prevState,
      notification: {
        visible: true,
        message,
        type,
      },
    }));

    // Masquer la notification après 3 secondes
    setTimeout(clearNotification, 3000);
  };

  // Effacer la notification
  const clearNotification = () => {
    setState((prevState) => ({
      ...prevState,
      notification: {
        visible: false,
        message: "",
        type: "success",
      },
    }));
  };

  // Définir le temps restant
  const setTimeLeft = (time: number) => {
    setState((prevState) => ({
      ...prevState,
      timeLeft: time,
    }));
  };

  // Définir les secondes
  const setSeconds = (seconds: number) => {
    setState((prevState) => ({
      ...prevState,
      seconds,
    }));
  };

  // Définir l'ID de session
  const setSessionId = async (id: string) => {
    setState((prevState) => ({
      ...prevState,
      sessionId: id,
      sessionActive: id ? true : false,
      // Réinitialiser le timer à 120 minutes si une nouvelle session est créée
      timeLeft: id && prevState.sessionId !== id ? 120 : prevState.timeLeft,
      seconds: 0,
    }));

    //Si un nouvel ID de session est défini, récupérer immédiatement les données
    if (id && id !== state.sessionId) {
      try {
        const initialState = await fetchInitialState();

        if (initialState.teams) {
          setState((prevState) => ({
            ...prevState,
            teams: initialState.teams || [],
            timeLeft: initialState.timeLeft || 120,
            sessionActive:
              initialState.sessionActive !== undefined
                ? initialState.sessionActive
                : true,
          }));
        }
      } catch (error) {
        console.error(
          "Error fetching initial state after setting session ID:",
          error
        );
      }
    }
  };

  // Définir l'étudiant enregistré
  const setRegisteredStudent = (student: Student | null) => {
    setState((prevState) => ({
      ...prevState,
      registeredStudent: student,
    }));

    // Stocker l'étudiant dans le localStorage pour persistance
    if (student) {
      localStorage.setItem(
        "hackathon_registered_student",
        JSON.stringify(student)
      );
    } else {
      localStorage.removeItem("hackathon_registered_student");
    }
  };

  // Définir si la session est active
  const setSessionActive = (active: boolean) => {
    setState((prevState) => ({
      ...prevState,
      sessionActive: active,
    }));
  };

  // Définir si la session est démarrée
  const setIsSessionStarted = (started: boolean) => {
    setState((prevState) => ({
      ...prevState,
      isSessionStarted: started,
    }));
  };

  // Lancer le timer de la session
  const startSessionTimer = () => {
    setIsSessionStarted(true);
    setTimeLeft(120);
    setSeconds(0);

    // Émettre un événement pour synchroniser toutes les interfaces
    window.dispatchEvent(
      new CustomEvent("hackathon_session_started", {
        detail: { sessionId: state.sessionId },
      })
    );
  };

  // Vérifier la validité de la session
  const checkSessionValidity = async (): Promise<boolean> => {
    if (!state.sessionId || !state.registeredStudent) return false;

    try {
      const initialState = await fetchInitialState();

      // Vérifier si la session existe toujours et est active
      if (initialState.sessionId !== state.sessionId) {
        setSessionActive(false);
        setNotification("La session n'existe plus ou a été terminée", "error");
        return false;
      }

      // Vérifier si l'équipe de l'étudiant existe toujours
      const teamExists = initialState.teams?.some(
        (team) => team.id === state.registeredStudent?.teamId
      );

      if (!teamExists) {
        setRegisteredStudent(null);
        setNotification("Votre équipe n'existe plus", "error");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking session validity:", error);
      return false;
    }
  };

  // Définir si c'est la vue globale
  const setIsGlobalView = (isGlobal: boolean) => {
    setState((prevState) => ({
      ...prevState,
      isGlobalView: isGlobal,
    }));
  };

  // Terminer la session courante
  const endCurrentSession = async (): Promise<boolean> => {
    if (!state.sessionId) return false;

    try {
      const result = await endSession(state.sessionId);

      if (result) {
        setNotification("La session a été terminée avec succès", "success");
        // Réinitialiser l'état local
        setState((prevState) => ({
          ...prevState,
          sessionId: "",
          sessionActive: false,
          isSessionStarted: false,
        }));

        // Déclencher un événement pour informer les autres interfaces
        window.dispatchEvent(
          new CustomEvent("hackathon_session_ended", {
            detail: { sessionId: state.sessionId },
          })
        );
      } else {
        setNotification("Erreur lors de la fermeture de la session", "error");
      }

      return result;
    } catch (error) {
      console.error("Error ending session:", error);
      setNotification("Erreur lors de la fermeture de la session", "error");
      return false;
    }
  };

  return (
    <HackathonContext.Provider
      value={{
        state,
        updateTeamScore,
        setTimeLeft,
        completeLevel,
        updateLevelProgress,
        setNotification,
        clearNotification,
        setSessionId,
        setIsGlobalView,
        endCurrentSession,
        setRegisteredStudent,
        setSessionActive,
        checkSessionValidity,
        resetHackathonState,
        setIsSessionStarted,
        setSeconds,
        startSessionTimer,
      }}
    >
      {children}
    </HackathonContext.Provider>
  );
};

// Hook pour utiliser le contexte
export const useHackathon = () => {
  const context = useContext(HackathonContext);
  if (context === undefined) {
    throw new Error("useHackathon must be used within a HackathonProvider");
  }
  return context;
};
