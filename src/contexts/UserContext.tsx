import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Student, Instructor } from "../types/database";
import { firebaseDataService, getDeviceInfo } from "../services/firebaseDataService";
import {
  signInAnonymouslyToFirebase,
  onAuthStateChange,
  setUserOnlinePresence,
  updateUserActivity,
  saveUserToFirebase,
  subscribeToActiveUsers,
  FirebaseUser,
} from "../config/firebase";

// Constantes
const ACTIVITY_UPDATE_INTERVAL = 30000; // 30 secondes

// Types pour le contexte
export interface ActiveUser {
  odcfUserId: string;
  name: string;
  role: "instructor" | "student";
  isOnline: boolean;
  lastSeen: number;
  connectedAt: number;
}

interface UserContextType {
  // État utilisateur
  currentUser: Student | Instructor | null;
  firebaseUser: FirebaseUser | null;
  isInitialized: boolean;
  isFirebaseConnected: boolean;
  sessionId: string | null;

  // Actions utilisateur
  loginUser: (user: Student | Instructor) => Promise<void>;
  logoutUser: () => Promise<void>;
  updateUserProgress: (
    progressType: "speedDating" | "hackathon",
    progress: any
  ) => Promise<boolean>;
  refreshCurrentUser: () => void;

  // Utilisateurs actifs
  activeUsers: ActiveUser[];
  getActiveUsersCount: () => number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Générateur d'ID de session unique
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  // États
  const [currentUser, setCurrentUser] = useState<Student | Instructor | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

  // Générer un nouvel ID de session à chaque ouverture de page
  useEffect(() => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
  }, []);

  // Initialiser l'application : auth Firebase puis restauration de session
  useEffect(() => {
    const initialize = async () => {
      // 1. Initialiser Firebase Auth
      try {
        onAuthStateChange((user) => {
          setFirebaseUser(user);
          setIsFirebaseConnected(!!user);
        });

        const user = await signInAnonymouslyToFirebase();
        if (user) {
          console.log("Firebase: Authentification anonyme réussie");
        } else {
          console.warn("Firebase: Authentification échouée, utilisation du mode dégradé");
        }
      } catch (error) {
        console.error("Firebase: Erreur d'initialisation", error);
        setIsFirebaseConnected(false);
      }

      // 2. Restaurer la session depuis localStorage
      const storedUserId = localStorage.getItem("excel_training_user_id");
      if (storedUserId) {
        try {
          const user = await firebaseDataService.getUserById(storedUserId);
          if (user) {
            setCurrentUser(user);
          } else {
            localStorage.removeItem("excel_training_user_id");
          }
        } catch (error) {
          console.error("Erreur lors de la restauration de session:", error);
          localStorage.removeItem("excel_training_user_id");
        }
      }

      setIsInitialized(true);
    };

    initialize();
  }, []);

  // Mettre à jour la présence Firebase quand l'utilisateur change
  useEffect(() => {
    if (!sessionId || !isFirebaseConnected || !currentUser) return;

    const updatePresence = async () => {
      // Validation défensive: vérifier que currentUser a tous les champs requis
      if (!currentUser.id || !currentUser.name) {
        console.warn("[UserContext] Cannot update presence: currentUser missing required fields", {
          hasId: !!currentUser.id,
          hasName: !!currentUser.name,
        });
        return;
      }

      const deviceInfo = getDeviceInfo();
      const result = await setUserOnlinePresence(sessionId, {
        odcfUserId: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        deviceInfo,
      });

      // Gérer le résultat de la mise à jour de présence
      if (!result.success) {
        console.error("[UserContext] Failed to update presence:", result.error);
        // Continue quand même avec la sauvegarde utilisateur (dégradation gracieuse)
      }

      // Sauvegarder également les données utilisateur dans Firebase
      const userData = {
        name: currentUser.name,
        role: currentUser.role,
        createdAt: currentUser.createdAt,
        lastActivity: currentUser.lastActivity,
        deviceInfo,
        ...(currentUser.role === "student" && {
          speedDatingProgress: (currentUser as Student).speedDatingProgress ?? {},
          hackathonProgress: (currentUser as Student).hackathonProgress ?? {
            currentLevel: 0,
            levelsCompleted: [],
            totalScore: 0,
            individualContributions: {},
          },
        }),
      };
      await saveUserToFirebase(currentUser.id, userData);
    };

    updatePresence();

    // Mettre à jour l'activité périodiquement
    const activityInterval = setInterval(() => {
      if (sessionId) {
        updateUserActivity(sessionId);
      }
    }, ACTIVITY_UPDATE_INTERVAL);

    return () => clearInterval(activityInterval);
  }, [sessionId, isFirebaseConnected, currentUser]);

  // S'abonner aux utilisateurs actifs
  useEffect(() => {
    if (!isFirebaseConnected) return;

    const unsubscribe = subscribeToActiveUsers((users) => {
      const now = Date.now();
      const activeUsersList: ActiveUser[] = Object.entries(users)
        .map(([key, value]: [string, any]) => ({
          odcfUserId: value.odcfUserId,
          name: value.name,
          role: value.role,
          isOnline: value.isOnline,
          lastSeen: value.lastSeen || 0,
          connectedAt: value.connectedAt || 0,
        }))
        // Filtrer les utilisateurs inactifs depuis plus de 2 minutes
        .filter((user) => {
          const lastSeenTime = typeof user.lastSeen === "number" ? user.lastSeen : now;
          return now - lastSeenTime < 2 * 60 * 1000;
        });

      setActiveUsers(activeUsersList);
    });

    return () => unsubscribe();
  }, [isFirebaseConnected]);

  // Actions
  const loginUser = useCallback(
    async (user: Student | Instructor) => {
      setCurrentUser(user);
      localStorage.setItem("excel_training_user_id", user.id);
      await firebaseDataService.updateLastActivity(user.id, true);

      // Mettre à jour Firebase si connecté
      if (isFirebaseConnected && sessionId) {
        // Validation défensive: vérifier que l'utilisateur a tous les champs requis
        if (!user.id || !user.name) {
          console.warn("[UserContext] Cannot update presence during login: user missing required fields", {
            hasId: !!user.id,
            hasName: !!user.name,
          });
          // Continuer quand même le login (dégradation gracieuse)
          return;
        }

        const deviceInfo = getDeviceInfo();
        const result = await setUserOnlinePresence(sessionId, {
          odcfUserId: user.id,
          name: user.name,
          role: user.role,
          deviceInfo,
        });

        // Gérer le résultat de la mise à jour de présence
        if (!result.success) {
          console.error("[UserContext] Failed to update presence during login:", result.error);
          // Continuer quand même avec la sauvegarde utilisateur (dégradation gracieuse)
        }

        const userData = {
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          lastActivity: user.lastActivity,
          deviceInfo,
          ...(user.role === "student" && {
            speedDatingProgress: (user as Student).speedDatingProgress ?? {},
            hackathonProgress: (user as Student).hackathonProgress ?? {
              currentLevel: 0,
              levelsCompleted: [],
              totalScore: 0,
              individualContributions: {},
            },
          }),
        };
        await saveUserToFirebase(user.id, userData);
      }
    },
    [isFirebaseConnected, sessionId]
  );

  const logoutUser = useCallback(async () => {
    setCurrentUser(null);
    localStorage.removeItem("excel_training_user_id");
    // La présence Firebase sera automatiquement supprimée via onDisconnect
  }, []);

  const updateUserProgress = useCallback(
    async (
      progressType: "speedDating" | "hackathon",
      progress: any
    ): Promise<boolean> => {
      if (!currentUser || currentUser.role !== "student") {
        return false;
      }

      // Mettre à jour directement dans Firebase
      const success = await firebaseDataService.updateUserProgress(
        currentUser.id,
        progressType,
        progress
      );

      if (success) {
        // Rafraîchir les données utilisateur depuis Firebase
        const updatedUser = await firebaseDataService.getUserById(currentUser.id);
        if (updatedUser) {
          setCurrentUser(updatedUser);

          // Synchroniser avec Firebase (les données utilisateur et la présence)
          if (isFirebaseConnected) {
            const deviceInfo = getDeviceInfo();
            const userData = {
              name: updatedUser.name,
              role: updatedUser.role,
              createdAt: updatedUser.createdAt,
              lastActivity: updatedUser.lastActivity,
              deviceInfo,
              speedDatingProgress: (updatedUser as Student).speedDatingProgress ?? {},
              hackathonProgress: (updatedUser as Student).hackathonProgress ?? {
                currentLevel: 0,
                levelsCompleted: [],
                totalScore: 0,
                individualContributions: {},
              },
            };
            await saveUserToFirebase(updatedUser.id, userData);
          }
        }
      }

      return success;
    },
    [currentUser, isFirebaseConnected]
  );

  const refreshCurrentUser = useCallback(async () => {
    if (currentUser) {
      const updatedUser = await firebaseDataService.getUserById(currentUser.id);
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
    }
  }, [currentUser]);

  const getActiveUsersCount = useCallback(() => {
    return activeUsers.length;
  }, [activeUsers]);

  const value: UserContextType = {
    currentUser,
    firebaseUser,
    isInitialized,
    isFirebaseConnected,
    sessionId,
    loginUser,
    logoutUser,
    updateUserProgress,
    refreshCurrentUser,
    activeUsers,
    getActiveUsersCount,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Hook personnalisé pour utiliser le contexte
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser doit être utilisé à l'intérieur d'un UserProvider");
  }
  return context;
};

export default UserContext;
