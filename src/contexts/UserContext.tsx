import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Student, Instructor, DeviceInfo } from "../types/database";
import { databaseService } from "../services/databaseService";
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
const CURRENT_USER_KEY = "bearingpoint_current_user_id";
const FIREBASE_SESSION_KEY = "bearingpoint_firebase_session_id";
const ACTIVITY_UPDATE_INTERVAL = 30000; // 30 secondes

// Types pour le contexte
export interface ActiveUser {
  odcfUserId: string;
  name: string;
  role: "instructor" | "student";
  isOnline: boolean;
  lastSeen: number;
  connectedAt: number;
  deviceInfo?: DeviceInfo;
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

// Récupérer les infos de l'appareil
const getDeviceInfo = (): DeviceInfo => {
  const userAgent = navigator.userAgent;
  let browser = "Unknown";
  let browserVersion = "";
  let os = "Unknown";
  let osVersion = "";
  let deviceType: "desktop" | "mobile" | "tablet" = "desktop";

  // Détection du navigateur
  if (userAgent.includes("Firefox/")) {
    browser = "Firefox";
    browserVersion = userAgent.split("Firefox/")[1]?.split(" ")[0] || "";
  } else if (userAgent.includes("Chrome/")) {
    browser = "Chrome";
    browserVersion = userAgent.split("Chrome/")[1]?.split(" ")[0] || "";
  } else if (userAgent.includes("Safari/") && !userAgent.includes("Chrome")) {
    browser = "Safari";
    browserVersion = userAgent.split("Version/")[1]?.split(" ")[0] || "";
  } else if (userAgent.includes("Edge/")) {
    browser = "Edge";
    browserVersion = userAgent.split("Edge/")[1]?.split(" ")[0] || "";
  }

  // Détection de l'OS
  if (userAgent.includes("Windows")) {
    os = "Windows";
    osVersion = userAgent.match(/Windows NT (\d+\.\d+)/)?.[1] || "";
  } else if (userAgent.includes("Mac OS X")) {
    os = "macOS";
    osVersion = userAgent.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace("_", ".") || "";
  } else if (userAgent.includes("Linux")) {
    os = "Linux";
  } else if (userAgent.includes("Android")) {
    os = "Android";
    osVersion = userAgent.match(/Android (\d+\.?\d*)/)?.[1] || "";
  } else if (userAgent.includes("iOS") || userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    os = "iOS";
    osVersion = userAgent.match(/OS (\d+[._]\d+)/)?.[1]?.replace("_", ".") || "";
  }

  // Détection du type d'appareil
  if (/Mobi|Android/i.test(userAgent)) {
    deviceType = "mobile";
  } else if (/Tablet|iPad/i.test(userAgent)) {
    deviceType = "tablet";
  }

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    deviceType,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
    userAgent,
  };
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

  // Initialiser ou récupérer l'ID de session
  useEffect(() => {
    let storedSessionId = sessionStorage.getItem(FIREBASE_SESSION_KEY);
    if (!storedSessionId) {
      storedSessionId = generateSessionId();
      sessionStorage.setItem(FIREBASE_SESSION_KEY, storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

  // Initialiser l'authentification Firebase
  useEffect(() => {
    const initFirebaseAuth = async () => {
      try {
        // Écouter les changements d'état d'authentification
        const unsubscribe = onAuthStateChange((user) => {
          setFirebaseUser(user);
          setIsFirebaseConnected(!!user);
        });

        // Authentification anonyme
        const user = await signInAnonymouslyToFirebase();
        if (user) {
          console.log("Firebase: Authentification anonyme réussie");
        } else {
          console.warn("Firebase: Authentification échouée, utilisation du localStorage uniquement");
        }

        return unsubscribe;
      } catch (error) {
        console.error("Firebase: Erreur d'initialisation", error);
        setIsFirebaseConnected(false);
      }
    };

    initFirebaseAuth();
  }, []);

  // Charger l'utilisateur existant depuis localStorage
  useEffect(() => {
    const loadExistingUser = () => {
      try {
        const storedUserId = localStorage.getItem(CURRENT_USER_KEY);
        if (storedUserId) {
          const user = databaseService.getUserById(storedUserId);
          if (user) {
            setCurrentUser(user);
            databaseService.updateLastActivity(user.id);
          } else {
            localStorage.removeItem(CURRENT_USER_KEY);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error);
        localStorage.removeItem(CURRENT_USER_KEY);
      }
      setIsInitialized(true);
    };

    loadExistingUser();
  }, []);

  // Mettre à jour la présence Firebase quand l'utilisateur change
  useEffect(() => {
    if (!sessionId || !isFirebaseConnected || !currentUser) return;

    const updatePresence = async () => {
      const deviceInfo = getDeviceInfo();
      await setUserOnlinePresence(sessionId, {
        odcfUserId: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        deviceInfo,
      });

      // Sauvegarder également les données utilisateur dans Firebase
      const userData = {
        name: currentUser.name,
        role: currentUser.role,
        createdAt: currentUser.createdAt,
        lastActivity: currentUser.lastActivity,
        deviceInfo,
        ...(currentUser.role === "student" && {
          speedDatingProgress: (currentUser as Student).speedDatingProgress,
          hackathonProgress: (currentUser as Student).hackathonProgress,
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
          deviceInfo: value.deviceInfo,
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
      localStorage.setItem(CURRENT_USER_KEY, user.id);
      databaseService.updateLastActivity(user.id);

      // Mettre à jour Firebase si connecté
      if (isFirebaseConnected && sessionId) {
        const deviceInfo = getDeviceInfo();
        await setUserOnlinePresence(sessionId, {
          odcfUserId: user.id,
          name: user.name,
          role: user.role,
          deviceInfo,
        });

        const userData = {
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          lastActivity: user.lastActivity,
          deviceInfo,
          ...(user.role === "student" && {
            speedDatingProgress: (user as Student).speedDatingProgress,
            hackathonProgress: (user as Student).hackathonProgress,
          }),
        };
        await saveUserToFirebase(user.id, userData);
      }
    },
    [isFirebaseConnected, sessionId]
  );

  const logoutUser = useCallback(async () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);

    // Nettoyer la présence Firebase (sera automatiquement supprimé via onDisconnect)
    // mais on peut forcer la déconnexion si nécessaire
  }, []);

  const updateUserProgress = useCallback(
    async (
      progressType: "speedDating" | "hackathon",
      progress: any
    ): Promise<boolean> => {
      if (!currentUser || currentUser.role !== "student") {
        return false;
      }

      // Mettre à jour dans localStorage via databaseService
      const success = databaseService.updateUserProgress(
        currentUser.id,
        progressType,
        progress
      );

      if (success) {
        // Rafraîchir les données utilisateur
        const updatedUser = databaseService.getUserById(currentUser.id);
        if (updatedUser) {
          setCurrentUser(updatedUser);

          // Synchroniser avec Firebase
          if (isFirebaseConnected) {
            const deviceInfo = getDeviceInfo();
            const userData = {
              name: updatedUser.name,
              role: updatedUser.role,
              createdAt: updatedUser.createdAt,
              lastActivity: updatedUser.lastActivity,
              deviceInfo,
              speedDatingProgress: (updatedUser as Student).speedDatingProgress,
              hackathonProgress: (updatedUser as Student).hackathonProgress,
            };
            await saveUserToFirebase(updatedUser.id, userData);
          }
        }
      }

      return success;
    },
    [currentUser, isFirebaseConnected]
  );

  const refreshCurrentUser = useCallback(() => {
    if (currentUser) {
      const updatedUser = databaseService.getUserById(currentUser.id);
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
