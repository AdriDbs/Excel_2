import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { Student, HackathonState } from "../types";
import {
  syncTeamsData,
  fetchInitialState,
  endSession,
  getStudentFromFirebase,
  unregisterStudent,
} from "../services/hackathonService";
import {
  subscribeToHackathonSession,
  subscribeToAllHackathonSessions,
  updateHackathonSession,
  updateTeamInFirebase,
} from "../../../../config/firebase";

const TOTAL_DURATION_SECONDS = 120 * 60; // 120 minutes en secondes

// Timing des phases du hackathon
export const PHASE_TIMINGS: Record<number, { duration: number; exercises: number }> = {
  0: { duration: 20, exercises: 1 },  // Phase 0: Data Cleaning
  1: { duration: 15, exercises: 3 },  // Phase 1: Analyse
  2: { duration: 15, exercises: 2 },  // Phase 2: Restructuration
  3: { duration: 15, exercises: 3 },  // Phase 3: Temporel
  4: { duration: 15, exercises: 3 },  // Phase 4: Consolidation
  5: { duration: 20, exercises: 1 },  // Phase 5: Financier (exercice final complexe)
  6: { duration: 25, exercises: 1 },  // Phase 6: Matrices/Dashboard
};

// Délimitation des phases (niveaux)
export const PHASE_BOUNDARIES = [
  { id: 0, name: "Data Cleaning",  firstLevel: 0,  lastLevel: 0  },
  { id: 1, name: "Accès Serveur",  firstLevel: 1,  lastLevel: 3  },
  { id: 2, name: "Données Client", firstLevel: 4,  lastLevel: 5  },
  { id: 3, name: "Tendances",      firstLevel: 6,  lastLevel: 8  },
  { id: 4, name: "Consolidation",  firstLevel: 9,  lastLevel: 11 },
  { id: 5, name: "Expert",         firstLevel: 12, lastLevel: 12 },
  { id: 6, name: "Visualisation",  firstLevel: 13, lastLevel: 15 },
];

export const getPhaseForLevel = (levelIndex: number): number => {
  const phase = PHASE_BOUNDARIES.find(
    (p) => levelIndex >= p.firstLevel && levelIndex <= p.lastLevel
  );
  return phase?.id ?? 0;
};

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
  bonusApplied: false,
  bonusAppliedAt: null,
  timerStopped: false,
};

// Barèmes de bonus finaux
export const SPEED_BONUS_SCALE = [300, 200, 100, 75, 50];
export const ACCURACY_BONUS_SCALE = [200, 150, 100, 75, 50];

export interface BonusResult {
  teamId: number;
  teamName: string;
  bonus: number;
  rank: number;
}

export interface AccuracyBonusResult extends BonusResult {
  errors: number;
}

export interface FinalBonuses {
  speedBonuses: BonusResult[];
  accuracyBonuses: AccuracyBonusResult[];
}

// Interface pour les fonctions du contexte
interface HackathonContextType {
  state: HackathonState;
  updateTeamScore: (
    teamId: number,
    actionType: "success" | "hint" | "wrong",
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
  leaveTeam: () => Promise<boolean>;
  loadStudentFromFirebase: (sessionId: string, userId: string) => Promise<Student | null>;
  applyFinalBonuses: () => FinalBonuses;
  stopTimer: () => void;
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
  const allSessionsUnsubRef = useRef<(() => void) | null>(null);
  const isFirebaseSyncingRef = useRef(false);
  const syncDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref to track current sessionId inside callbacks (avoids stale closure)
  const sessionIdRef = useRef(state.sessionId);
  useEffect(() => {
    sessionIdRef.current = state.sessionId;
  }, [state.sessionId]);

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

  // Charger l'état initial depuis Firebase
  useEffect(() => {
    const initState = async () => {
      try {
        const initialState = await fetchInitialState();

        const timeLeftMinutes = initialState.timeLeft || 120;
        const timeLeftSeconds = Math.floor(timeLeftMinutes * 60);

        setState((prevState) => ({
          ...prevState,
          teams: initialState.teams || [],
          timeLeftSeconds: timeLeftSeconds,
          sessionId: initialState.sessionId || "",
          sessionActive:
            initialState.sessionActive !== undefined
              ? initialState.sessionActive
              : true,
          isSessionStarted: initialState.isSessionStarted || false,
        }));
      } catch (error) {
        console.error("Failed to fetch initial state:", error);
      }
    };

    initState();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!state.isSessionStarted || !state.sessionActive || state.timerStopped) return;

    const interval = setInterval(() => {
      setState((prevState) => {
        if (prevState.timeLeftSeconds <= 0 || prevState.timerStopped) {
          return prevState;
        }
        return {
          ...prevState,
          timeLeftSeconds: prevState.timeLeftSeconds - 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isSessionStarted, state.sessionActive, state.timerStopped]);

  // Synchroniser les changements d'équipes vers Firebase (debounced)
  useEffect(() => {
    if (state.teams.length > 0 && state.sessionId && !isFirebaseSyncingRef.current) {
      if (syncDebounceRef.current) {
        clearTimeout(syncDebounceRef.current);
      }
      syncDebounceRef.current = setTimeout(() => {
        syncTeamsData(state.teams, state.sessionId);
      }, 300);
    }
  }, [state.teams, state.sessionId]);

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
        const firebaseTeams = data.teams
          ? data.teams.filter(Boolean).map((team: any) => ({
              ...team,
              progress: team.progress || {},
              completedLevels: team.completedLevels || [],
              currentLevel: team.currentLevel ?? 0,
              studentIds: team.studentIds || [],
              errors: team.errors ?? 0,
              completionTime: team.completionTime ?? undefined,
              phaseStartTimestamps: team.phaseStartTimestamps || {},
            }))
          : prevState.teams;

        const isStarted =
          data.isSessionStarted !== undefined
            ? data.isSessionStarted
            : prevState.isSessionStarted;
        const isActive =
          data.sessionActive !== undefined
            ? data.sessionActive
            : prevState.sessionActive;
        const timerStopped =
          data.timerStopped !== undefined
            ? data.timerStopped
            : prevState.timerStopped;
        const bonusApplied =
          data.bonusApplied !== undefined
            ? data.bonusApplied
            : prevState.bonusApplied;
        const bonusAppliedAt =
          data.bonusAppliedAt !== undefined
            ? data.bonusAppliedAt
            : prevState.bonusAppliedAt;

        // Recalculer le temps si la session a un startTime
        let timeLeftSeconds = prevState.timeLeftSeconds;
        if (timerStopped) {
          timeLeftSeconds = 0;
        } else if (data.startTime && isStarted) {
          const elapsedSeconds = (Date.now() - data.startTime) / 1000;
          timeLeftSeconds = Math.max(0, Math.floor(TOTAL_DURATION_SECONDS - elapsedSeconds));
        } else if (!isStarted) {
          timeLeftSeconds = TOTAL_DURATION_SECONDS;
        }

        return {
          ...prevState,
          teams: firebaseTeams,
          isSessionStarted: isStarted,
          sessionActive: isActive,
          timeLeftSeconds,
          timerStopped,
          bonusApplied,
          bonusAppliedAt,
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

  // Écouter toutes les sessions quand aucune session n'est active (auto-refresh)
  useEffect(() => {
    if (state.sessionId) {
      // Une session est déjà active, pas besoin d'écouter toutes les sessions
      if (allSessionsUnsubRef.current) {
        allSessionsUnsubRef.current();
        allSessionsUnsubRef.current = null;
      }
      return;
    }

    const unsubscribe = subscribeToAllHackathonSessions((allSessions) => {
      // Si une session a été définie entre temps, ignorer
      if (sessionIdRef.current) return;
      if (!allSessions) return;

      // Trouver la session active la plus récente
      let activeSession: any = null;
      let activeSessionId = "";

      for (const [id, session] of Object.entries(allSessions)) {
        if (session && session.sessionActive !== false && session.isActive !== false) {
          if (
            !activeSession ||
            (session.sessionCreationTime || 0) > (activeSession.sessionCreationTime || 0)
          ) {
            activeSession = session;
            activeSessionId = id;
          }
        }
      }

      if (!activeSession || !activeSessionId) return;

      isFirebaseSyncingRef.current = true;

      const rawTeams = activeSession.teams || [];
      const teams = rawTeams
        .filter(Boolean)
        .map((team: any) => ({
          ...team,
          progress: team.progress || {},
          completedLevels: team.completedLevels || [],
          currentLevel: team.currentLevel ?? 0,
          studentIds: team.studentIds || [],
          errors: team.errors ?? 0,
          completionTime: team.completionTime ?? undefined,
          phaseStartTimestamps: team.phaseStartTimestamps || {},
        }));

      const isStarted =
        activeSession.isSessionStarted !== undefined
          ? activeSession.isSessionStarted
          : activeSession.startTime != null;

      let timeLeftSeconds = TOTAL_DURATION_SECONDS;
      if (activeSession.startTime && isStarted) {
        const elapsed = (Date.now() - activeSession.startTime) / 1000;
        timeLeftSeconds = Math.max(0, Math.floor(TOTAL_DURATION_SECONDS - elapsed));
      }

      setState((prevState) => {
        if (prevState.sessionId) return prevState; // Session déjà définie, ne pas écraser
        const timerStopped = activeSession.timerStopped ?? false;
        return {
          ...prevState,
          teams,
          sessionId: activeSessionId,
          sessionActive: true,
          isSessionStarted: isStarted,
          timeLeftSeconds: timerStopped ? 0 : timeLeftSeconds,
          timerStopped,
          bonusApplied: activeSession.bonusApplied ?? false,
          bonusAppliedAt: activeSession.bonusAppliedAt ?? null,
        };
      });

      setTimeout(() => {
        isFirebaseSyncingRef.current = false;
      }, 500);
    });

    allSessionsUnsubRef.current = unsubscribe;

    return () => {
      if (allSessionsUnsubRef.current) {
        allSessionsUnsubRef.current();
        allSessionsUnsubRef.current = null;
      }
    };
  }, [state.sessionId]); // Se déclenche quand sessionId passe de "" à une valeur (et vice versa)

  // Charger un étudiant depuis Firebase
  const loadStudentFromFirebase = async (
    sessionId: string,
    userId: string
  ): Promise<Student | null> => {
    const student = await getStudentFromFirebase(sessionId, userId);
    if (student) {
      setState((prev) => ({ ...prev, registeredStudent: student }));
    }
    return student;
  };

  // Quitter l'équipe
  const leaveTeam = async (): Promise<boolean> => {
    if (!state.registeredStudent || !state.sessionId) return false;

    try {
      const result = await unregisterStudent(
        state.sessionId,
        state.registeredStudent.id,
        state.registeredStudent.teamId
      );

      if (result) {
        setState((prev) => ({ ...prev, registeredStudent: null }));
      }

      return result;
    } catch (error) {
      console.error("Error leaving team:", error);
      return false;
    }
  };

  const resetHackathonState = () => {
    setState({
      ...defaultState,
      registeredStudent: state.registeredStudent,
    });
  };

  const updateTeamScore = (
    teamId: number,
    actionType: "success" | "hint" | "wrong",
    points?: number
  ) => {
    const teamIndex = state.teams.findIndex((t) => t.id === teamId);
    if (teamIndex === -1) return;

    const team = state.teams[teamIndex];
    let newScore = team.score;
    let newErrors = team.errors ?? 0;

    if (actionType === "success") {
      newScore += points || 200;
    } else if (actionType === "hint") {
      // points contient la pénalité spécifique : -25 pour indice 1, -50 pour indice 2
      const penalty = points || 25;
      newScore = Math.max(0, newScore - penalty);
    } else if (actionType === "wrong") {
      // Pénalité de -10 pts par mauvaise réponse
      newScore = Math.max(0, newScore - 10);
      newErrors += 1;
    }

    setState((prevState) => ({
      ...prevState,
      teams: prevState.teams.map((t) =>
        t.id === teamId ? { ...t, score: newScore, errors: newErrors } : t
      ),
    }));

    // Écriture directe Firebase (path-specific) pour éviter les conflits entre équipes
    if (state.sessionId) {
      updateTeamInFirebase(state.sessionId, teamIndex, { score: newScore, errors: newErrors });
    }

    let message: string;
    let notifType: "success" | "hint" | "error";
    if (actionType === "success") {
      message = `${team.name} a validé une question ! +${points || 200} points`;
      notifType = "success";
    } else if (actionType === "hint") {
      const penalty = points || 25;
      message = `${team.name} a utilisé un indice. -${penalty} points`;
      notifType = "hint";
    } else {
      message = `Réponse incorrecte. -10 points (${newErrors} erreur${newErrors > 1 ? "s" : ""})`;
      notifType = "error";
    }
    setNotification(message, notifType);
  };

  const TOTAL_LEVELS = 16; // Nombre total d'exercices du hackathon

  const completeLevel = (teamId: number, levelId: number) => {
    const teamIndex = state.teams.findIndex((t) => t.id === teamId);
    if (teamIndex === -1) return;

    const team = state.teams[teamIndex];
    const newCompletedLevels = [...(team.completedLevels || [])];
    if (!newCompletedLevels.includes(levelId)) {
      newCompletedLevels.push(levelId);
    }
    const newCurrentLevel = levelId + 1;
    const newProgress = {
      ...team.progress,
      [levelId]: 100,
      [newCurrentLevel]: 0,
    };

    // Enregistrer l'heure de fin si tous les niveaux sont complétés
    const isFullyCompleted = newCompletedLevels.length >= TOTAL_LEVELS;
    const newCompletionTime = isFullyCompleted && !team.completionTime ? Date.now() : team.completionTime;

    // Détecter le changement de phase et enregistrer le timestamp d'entrée
    const currentPhaseId = getPhaseForLevel(levelId);
    const newPhaseId = newCurrentLevel < TOTAL_LEVELS ? getPhaseForLevel(newCurrentLevel) : -1;
    const phaseChanged = newPhaseId !== -1 && newPhaseId !== currentPhaseId;
    const newPhaseStartTimestamps = {
      ...(team.phaseStartTimestamps || {}),
      ...(phaseChanged ? { [newPhaseId]: Date.now() } : {}),
    };

    setState((prevState) => ({
      ...prevState,
      teams: prevState.teams.map((t) =>
        t.id === teamId
          ? {
              ...t,
              completedLevels: newCompletedLevels,
              currentLevel: newCurrentLevel,
              progress: newProgress,
              phaseStartTimestamps: newPhaseStartTimestamps,
              ...(newCompletionTime !== t.completionTime ? { completionTime: newCompletionTime } : {}),
            }
          : t
      ),
    }));

    // Écriture directe Firebase (path-specific) pour une synchronisation immédiate
    if (state.sessionId) {
      const firebaseUpdate: any = {
        completedLevels: newCompletedLevels,
        currentLevel: newCurrentLevel,
        progress: newProgress,
        phaseStartTimestamps: newPhaseStartTimestamps,
      };
      if (newCompletionTime && newCompletionTime !== team.completionTime) {
        firebaseUpdate.completionTime = newCompletionTime;
      }
      updateTeamInFirebase(state.sessionId, teamIndex, firebaseUpdate);
    }
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
      timeLeftSeconds:
        id && prevState.sessionId !== id
          ? TOTAL_DURATION_SECONDS
          : prevState.timeLeftSeconds,
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
            isSessionStarted: initialState.isSessionStarted || false,
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
    const startTime = Date.now();

    setState((prevState) => ({
      ...prevState,
      isSessionStarted: true,
      timeLeftSeconds: TOTAL_DURATION_SECONDS,
      teams: prevState.teams.map((t) => ({
        ...t,
        phaseStartTimestamps: { ...(t.phaseStartTimestamps || {}), 0: startTime },
      })),
    }));

    if (state.sessionId) {
      // Enregistrer le timestamp de début de phase 0 pour toutes les équipes
      state.teams.forEach((team, index) => {
        updateTeamInFirebase(state.sessionId, index, {
          phaseStartTimestamps: { ...(team.phaseStartTimestamps || {}), 0: startTime },
        });
      });

      updateHackathonSession(state.sessionId, {
        isSessionStarted: true,
        sessionActive: true,
        startTime,
        timeLeft: 120,
        seconds: 0,
      });
    }
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

        setState((prevState) => ({
          ...prevState,
          sessionId: "",
          sessionActive: false,
          isSessionStarted: false,
        }));
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

  // ── Arrêt manuel du timer ────────────────────────────────────────────────
  const stopTimer = () => {
    setState((prevState) => ({
      ...prevState,
      timerStopped: true,
      timeLeftSeconds: 0,
    }));
    if (state.sessionId) {
      updateHackathonSession(state.sessionId, {
        timerStopped: true,
        finalTime: 0,
      });
    }
  };

  // ── Calcul et application des bonus finaux ────────────────────────────────
  const applyFinalBonuses = (): FinalBonuses => {
    const totalLevels = TOTAL_LEVELS;

    // Bonus rapidité : uniquement les équipes ayant terminé tous les niveaux
    const finishedTeams = state.teams
      .filter((t) => (t.completedLevels?.length ?? 0) >= totalLevels && t.completionTime)
      .sort((a, b) => (a.completionTime ?? 0) - (b.completionTime ?? 0));

    // Bonus précision : toutes les équipes, par nombre d'erreurs croissant
    const allTeamsByErrors = [...state.teams].sort(
      (a, b) => (a.errors ?? 0) - (b.errors ?? 0)
    );

    const speedBonuses: BonusResult[] = finishedTeams.map((team, index) => ({
      teamId: team.id,
      teamName: team.name,
      bonus: SPEED_BONUS_SCALE[index] ?? SPEED_BONUS_SCALE[SPEED_BONUS_SCALE.length - 1],
      rank: index + 1,
    }));

    const accuracyBonuses: AccuracyBonusResult[] = allTeamsByErrors.map((team, index) => ({
      teamId: team.id,
      teamName: team.name,
      bonus: ACCURACY_BONUS_SCALE[index] ?? ACCURACY_BONUS_SCALE[ACCURACY_BONUS_SCALE.length - 1],
      rank: index + 1,
      errors: team.errors ?? 0,
    }));

    // Agréger les bonus par équipe
    const bonusByTeam: { [teamId: number]: number } = {};
    speedBonuses.forEach((b) => {
      bonusByTeam[b.teamId] = (bonusByTeam[b.teamId] ?? 0) + b.bonus;
    });
    accuracyBonuses.forEach((b) => {
      bonusByTeam[b.teamId] = (bonusByTeam[b.teamId] ?? 0) + b.bonus;
    });

    const bonusAppliedAt = Date.now();

    // Mettre à jour l'état local
    setState((prevState) => ({
      ...prevState,
      teams: prevState.teams.map((t) => ({
        ...t,
        score: t.score + (bonusByTeam[t.id] ?? 0),
      })),
      bonusApplied: true,
      bonusAppliedAt,
      timerStopped: true,
      timeLeftSeconds: 0,
    }));

    // Écriture Firebase pour chaque équipe + métadonnées de session
    if (state.sessionId) {
      state.teams.forEach((team, index) => {
        const bonus = bonusByTeam[team.id] ?? 0;
        if (bonus > 0) {
          updateTeamInFirebase(state.sessionId, index, {
            score: team.score + bonus,
          });
        }
      });

      // Persister l'état bonus et arrêter le timer pour tous les clients
      updateHackathonSession(state.sessionId, {
        bonusApplied: true,
        bonusAppliedAt,
        timerStopped: true,
        finalTime: 0,
      });
    }

    return { speedBonuses, accuracyBonuses };
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
        leaveTeam,
        loadStudentFromFirebase,
        applyFinalBonuses,
        stopTimer,
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
