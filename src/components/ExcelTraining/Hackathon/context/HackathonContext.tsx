import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { Team, Student, HackathonState } from "../types";
import {
  syncTeamsData,
  fetchInitialState,
  endSession,
  getStudentFromStorage,
} from "../services/hackathonService";
import {
  saveHackathonSessionToFirebase,
  subscribeToHackathonSession,
} from "../../../../config/firebase";

const TOTAL_DURATION_SECONDS = 120 * 60; // 120 minutes en secondes

// Valeurs par défaut pour le contexte
const defaultState: HackathonState = {
  teams: [],
  timeLeftSeconds: TOTAL_DURATION_SECONDS,
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
};

// Interface pour les fonctions du contexte
interface HackathonContextType {
  state: HackathonState;
  updateTeamScore: (
    teamId: number,
    actionType: "success" | "hint",
    points?: number
  ) => void;
  setTimeLeftSeconds: (seconds: number) => void;
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
  startSessionTimer: () => void;
  formatTime: (totalSeconds: number) => string;
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
  const firebaseUnsubRef = useRef<(() => void) | null>(null);
  const isFirebaseSyncingRef = useRef(false);

  // Formater le temps: HH:MM:SS
  const formatTime = useCallback((totalSeconds: number): string => {
    const clamped = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(clamped / 3600);
    const minutes = Math.floor((clamped % 3600) / 60);
    const secs = clamped % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Charger l'état initial
  useEffect(() => {
    const initState = async () => {
      try {
        const initialState = await fetchInitialState();
        const storedStudent = getStudentFromStorage();

        // Calculer le temps restant en secondes
        const timeLeftMinutes = initialState.timeLeft || 120;
        const timeLeftSeconds = Math.floor(timeLeftMinutes * 60);
        const isStarted = timeLeftSeconds < TOTAL_DURATION_SECONDS;

        setState((prevState) => ({
          ...prevState,
          teams: initialState.teams || [],
          timeLeftSeconds: timeLeftSeconds,
          sessionId: initialState.sessionId || "",
          registeredStudent: storedStudent,
          sessionActive:
            initialState.sessionActive !== undefined
              ? initialState.sessionActive
              : true,
          isSessionStarted: isStarted,
        }));
      } catch (error) {
        console.error("Failed to fetch initial state:", error);
      }
    };

    initState();
  }, []);

  // Timer countdown - un seul intervalle, une seule variable en secondes
  useEffect(() => {
    if (!state.isSessionStarted || !state.sessionActive) return;

    const interval = setInterval(() => {
      setState((prevState) => {
        if (prevState.timeLeftSeconds <= 0) {
          return prevState;
        }
        return {
          ...prevState,
          timeLeftSeconds: prevState.timeLeftSeconds - 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isSessionStarted, state.sessionActive]);

  // Synchroniser les changements d'équipes vers localStorage ET Firebase
  useEffect(() => {
    if (state.teams.length > 0 && state.sessionId) {
      syncTeamsData(state.teams, state.sessionId);

      // Sync to Firebase for real-time updates across clients
      if (!isFirebaseSyncingRef.current) {
        saveHackathonSessionToFirebase(state.sessionId, {
          teams: state.teams,
          isSessionStarted: state.isSessionStarted,
          timeLeft: state.timeLeftSeconds / 60,
          seconds: state.timeLeftSeconds % 60,
          sessionActive: state.sessionActive,
        });
      }
    }
  }, [state.teams, state.sessionId, state.isSessionStarted, state.sessionActive]);

  // S'abonner aux mises à jour Firebase de la session hackathon
  useEffect(() => {
    if (!state.sessionId) return;

    if (firebaseUnsubRef.current) {
      firebaseUnsubRef.current();
    }

    const unsubscribe = subscribeToHackathonSession(state.sessionId, (data) => {
      if (!data) return;

      isFirebaseSyncingRef.current = true;

      setState((prevState) => {
        const firebaseTeams = data.teams || prevState.teams;
        const isStarted = data.isSessionStarted !== undefined ? data.isSessionStarted : prevState.isSessionStarted;
        const isActive = data.sessionActive !== undefined ? data.sessionActive : prevState.sessionActive;

        return {
          ...prevState,
          teams: firebaseTeams,
          isSessionStarted: isStarted,
          sessionActive: isActive,
        };
      });

      setTimeout(() => {
        isFirebaseSyncingRef.current = false;
      }, 500);
    });

    firebaseUnsubRef.current = unsubscribe;

    return () => {
      if (firebaseUnsubRef.current) {
        firebaseUnsubRef.current();
        firebaseUnsubRef.current = null;
      }
    };
  }, [state.sessionId]);

  // Écouter les événements de démarrage et de fin de session (communication locale)
  useEffect(() => {
    const handleSessionStart = (event: CustomEvent) => {
      if (event.detail && event.detail.sessionId === state.sessionId) {
        setState((prev) => ({
          ...prev,
          isSessionStarted: true,
          timeLeftSeconds: TOTAL_DURATION_SECONDS,
        }));
      }
    };

    const handleSessionEnd = (event: CustomEvent) => {
      if (event.detail && event.detail.sessionId === state.sessionId) {
        setState((prev) => ({
          ...prev,
          sessionActive: false,
        }));
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

  const resetHackathonState = () => {
    setState({
      ...defaultState,
      registeredStudent: state.registeredStudent,
    });
  };

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
            newScore += points || 200;
          } else if (actionType === "hint") {
            newScore -= 25;
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
              [levelId]: 100,
              [levelId + 1]: 0,
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

    setTimeout(clearNotification, 3000);
  };

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

  const setTimeLeftSeconds = (seconds: number) => {
    setState((prevState) => ({
      ...prevState,
      timeLeftSeconds: Math.max(0, Math.floor(seconds)),
    }));
  };

  const setSessionId = async (id: string) => {
    setState((prevState) => ({
      ...prevState,
      sessionId: id,
      sessionActive: id ? true : false,
      timeLeftSeconds: id && prevState.sessionId !== id ? TOTAL_DURATION_SECONDS : prevState.timeLeftSeconds,
    }));

    if (id && id !== state.sessionId) {
      try {
        const initialState = await fetchInitialState();

        if (initialState.teams) {
          const timeLeftMinutes = initialState.timeLeft || 120;
          setState((prevState) => ({
            ...prevState,
            teams: initialState.teams || [],
            timeLeftSeconds: Math.floor(timeLeftMinutes * 60),
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

  const setRegisteredStudent = (student: Student | null) => {
    setState((prevState) => ({
      ...prevState,
      registeredStudent: student,
    }));

    if (student) {
      localStorage.setItem(
        "hackathon_registered_student",
        JSON.stringify(student)
      );
    } else {
      localStorage.removeItem("hackathon_registered_student");
    }
  };

  const setSessionActive = (active: boolean) => {
    setState((prevState) => ({
      ...prevState,
      sessionActive: active,
    }));
  };

  const setIsSessionStarted = (started: boolean) => {
    setState((prevState) => ({
      ...prevState,
      isSessionStarted: started,
    }));
  };

  const startSessionTimer = () => {
    setState((prevState) => ({
      ...prevState,
      isSessionStarted: true,
      timeLeftSeconds: TOTAL_DURATION_SECONDS,
    }));

    if (state.sessionId) {
      saveHackathonSessionToFirebase(state.sessionId, {
        teams: state.teams,
        isSessionStarted: true,
        timeLeft: 120,
        seconds: 0,
        sessionActive: true,
        startTime: Date.now(),
      });
    }

    window.dispatchEvent(
      new CustomEvent("hackathon_session_started", {
        detail: { sessionId: state.sessionId },
      })
    );
  };

  const checkSessionValidity = async (): Promise<boolean> => {
    if (!state.sessionId || !state.registeredStudent) return false;

    try {
      const initialState = await fetchInitialState();

      if (initialState.sessionId !== state.sessionId) {
        setSessionActive(false);
        setNotification("La session n'existe plus ou a été terminée", "error");
        return false;
      }

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

  const setIsGlobalView = (isGlobal: boolean) => {
    setState((prevState) => ({
      ...prevState,
      isGlobalView: isGlobal,
    }));
  };

  const endCurrentSession = async (): Promise<boolean> => {
    if (!state.sessionId) return false;

    try {
      const result = await endSession(state.sessionId);

      if (result) {
        setNotification("La session a été terminée avec succès", "success");

        saveHackathonSessionToFirebase(state.sessionId, {
          teams: state.teams,
          isSessionStarted: false,
          timeLeft: 0,
          seconds: 0,
          sessionActive: false,
        });

        setState((prevState) => ({
          ...prevState,
          sessionId: "",
          sessionActive: false,
          isSessionStarted: false,
        }));

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
        setTimeLeftSeconds,
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
        startSessionTimer,
        formatTime,
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
