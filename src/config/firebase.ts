import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, Auth, User as FirebaseUser } from "firebase/auth";
import { getDatabase, ref, set, get, update, remove, onValue, onDisconnect, serverTimestamp, Database, push, query, limitToLast } from "firebase/database";
import type { ChatMessage } from "../components/ExcelTraining/Hackathon/types";

// Configuration Firebase fournie
const firebaseConfig = {
  apiKey: "AIzaSyC-YgJS_1AS8rgjKpb7Dhwl-28nVdjzDGw",
  authDomain: "formation-excel.firebaseapp.com",
  databaseURL: "https://formation-excel-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "formation-excel",
  storageBucket: "formation-excel.firebasestorage.app",
  messagingSenderId: "969922478190",
  appId: "1:969922478190:web:b67384c6ad0f480c56a67f",
  measurementId: "G-NHQEKTFP0Q"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Services Firebase
export const auth: Auth = getAuth(app);
export const database: Database = getDatabase(app);

// Fonction pour l'authentification anonyme
export const signInAnonymouslyToFirebase = async (): Promise<FirebaseUser | null> => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error("Erreur lors de l'authentification anonyme Firebase:", error);
    return null;
  }
};

// Listener pour les changements d'état d'authentification
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Références de la base de données
export const getUsersRef = () => ref(database, "users");
export const getUserRef = (userId: string) => ref(database, `users/${userId}`);
export const getActiveUsersRef = () => ref(database, "activeUsers");
export const getActiveUserRef = (sessionId: string) => ref(database, `activeUsers/${sessionId}`);
export const getHackathonSessionsRef = () => ref(database, "hackathonSessions");
export const getHackathonSessionRef = (sessionId: string) => ref(database, `hackathonSessions/${sessionId}`);
export const getSpeedDatingLeaderboardRef = () => ref(database, "speedDatingLeaderboard");

// Fonction pour marquer un utilisateur comme connecté
export const setUserOnlinePresence = async (
  sessionId: string,
  userData: {
    odcfUserId: string;
    name: string;
    role: "instructor" | "student";
    deviceInfo?: object;
  }
): Promise<{ success: boolean; error?: string }> => {
  const activeUserRef = getActiveUserRef(sessionId);

  try {
    // Import des fonctions de validation
    const { validatePresenceData, sanitizeForFirebase } = await import('../utils/firebaseHelpers');

    // Validation des données avant l'envoi à Firebase
    if (!validatePresenceData(userData)) {
      const errorMsg = "Données utilisateur invalides: champs requis manquants ou invalides";
      console.error("[Firebase] setUserOnlinePresence failed:", errorMsg, {
        sessionId,
        userData: {
          hasOdcfUserId: !!userData.odcfUserId,
          hasName: !!userData.name,
          hasRole: !!userData.role,
          role: userData.role,
        },
      });
      return { success: false, error: errorMsg };
    }

    // Sanitization pour retirer les valeurs undefined (Firebase les rejette)
    const presenceData = sanitizeForFirebase({
      ...userData,
      isOnline: true,
      lastSeen: serverTimestamp(),
      connectedAt: serverTimestamp()
    });

    // Définir les données de présence
    await set(activeUserRef, presenceData);

    // Configurer la déconnexion automatique
    const disconnectRef = onDisconnect(activeUserRef);
    await disconnectRef.remove();

    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[Firebase] Erreur lors de la mise à jour de la présence:", {
      error: errorMsg,
      sessionId,
      userData: {
        odcfUserId: userData.odcfUserId,
        name: userData.name,
        role: userData.role,
      },
    });
    return { success: false, error: errorMsg };
  }
};

// Fonction pour mettre à jour l'activité de l'utilisateur
export const updateUserActivity = async (sessionId: string) => {
  const activeUserRef = getActiveUserRef(sessionId);

  try {
    await update(activeUserRef, { lastSeen: serverTimestamp() });
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'activité:", error);
    return false;
  }
};

// Fonction pour sauvegarder les données utilisateur dans Realtime Database
export const saveUserToFirebase = async (
  userId: string,
  userData: {
    name: string;
    role: "instructor" | "student";
    createdAt: string;
    lastActivity: string;
    deviceInfo?: object;
    speedDatingProgress?: object;
    hackathonProgress?: object;
  }
) => {
  const userRef = getUserRef(userId);

  try {
    await set(userRef, {
      id: userId,
      ...userData,
      lastSyncedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde utilisateur Firebase:", error);
    return false;
  }
};

// Fonction pour écouter les changements d'utilisateurs actifs
export const subscribeToActiveUsers = (
  callback: (users: Record<string, any>) => void
) => {
  const activeUsersRef = getActiveUsersRef();
  return onValue(activeUsersRef, (snapshot) => {
    const data = snapshot.val();
    callback(data || {});
  });
};

// Fonction pour écouter les changements d'un utilisateur spécifique
export const subscribeToUser = (
  userId: string,
  callback: (userData: any) => void
) => {
  const userRef = getUserRef(userId);
  return onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

// Fonctions pour la synchronisation des sessions hackathon via Firebase
export const saveHackathonSessionToFirebase = async (
  sessionId: string,
  sessionData: {
    teams: any[];
    isSessionStarted: boolean;
    timeLeft: number;
    seconds: number;
    sessionActive: boolean;
    startTime?: number | null;
  }
) => {
  const sessionRef = getHackathonSessionRef(sessionId);
  try {
    await set(sessionRef, {
      ...sessionData,
      lastUpdated: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde session hackathon Firebase:", error);
    return false;
  }
};

// Écouter les changements d'une session hackathon en temps réel
export const subscribeToHackathonSession = (
  sessionId: string,
  callback: (sessionData: any) => void
) => {
  const sessionRef = getHackathonSessionRef(sessionId);
  return onValue(sessionRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

// Sauvegarder le leaderboard speed dating dans Firebase
export const saveSpeedDatingLeaderboardToFirebase = async (
  leaderboardData: any[]
) => {
  const leaderboardRef = getSpeedDatingLeaderboardRef();
  try {
    await set(leaderboardRef, {
      participants: leaderboardData,
      lastUpdated: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde leaderboard Firebase:", error);
    return false;
  }
};

// Écouter les changements du leaderboard speed dating en temps réel
export const subscribeToSpeedDatingLeaderboard = (
  callback: (data: any) => void
) => {
  const leaderboardRef = getSpeedDatingLeaderboardRef();
  return onValue(leaderboardRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

// --- Hackathon Session CRUD via Firebase ---

// Référence vers les étudiants enregistrés d'une session
export const getHackathonRegisteredStudentsRef = (sessionId: string) =>
  ref(database, `hackathonSessions/${sessionId}/registeredStudents`);

export const getHackathonRegisteredStudentRef = (sessionId: string, userId: string) =>
  ref(database, `hackathonSessions/${sessionId}/registeredStudents/${userId}`);

// Lire une session hackathon (one-shot)
export const getHackathonSessionOnce = async (sessionId: string) => {
  const sessionRef = getHackathonSessionRef(sessionId);
  const snapshot = await get(sessionRef);
  return snapshot.val();
};

// Lire toutes les sessions hackathon (one-shot)
export const getAllHackathonSessions = async () => {
  const sessionsRef = getHackathonSessionsRef();
  const snapshot = await get(sessionsRef);
  return snapshot.val() as Record<string, any> | null;
};

// Écouter toutes les sessions hackathon en temps réel
export const subscribeToAllHackathonSessions = (
  callback: (sessions: Record<string, any> | null) => void
) => {
  const sessionsRef = getHackathonSessionsRef();
  return onValue(sessionsRef, (snapshot) => {
    callback(snapshot.val());
  });
};

// Mettre à jour partiellement une session hackathon (merge)
export const updateHackathonSession = async (
  sessionId: string,
  updates: Record<string, any>
) => {
  const sessionRef = getHackathonSessionRef(sessionId);
  try {
    await update(sessionRef, {
      ...updates,
      lastUpdated: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour session hackathon Firebase:", error);
    return false;
  }
};

// Supprimer une session hackathon
export const removeHackathonSession = async (sessionId: string) => {
  const sessionRef = getHackathonSessionRef(sessionId);
  try {
    await remove(sessionRef);
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression session hackathon Firebase:", error);
    return false;
  }
};

// Enregistrer un étudiant dans une session (Firebase)
export const registerStudentInFirebase = async (
  sessionId: string,
  userId: string,
  studentData: {
    id: string;
    name: string;
    teamId: number;
    answers: Record<string, string>;
    hintsUsed: number[];
  }
) => {
  const studentRef = getHackathonRegisteredStudentRef(sessionId, userId);
  try {
    await set(studentRef, {
      ...studentData,
      registeredAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Erreur lors de l'enregistrement étudiant Firebase:", error);
    return false;
  }
};

// Retirer un étudiant d'une session (Firebase)
export const unregisterStudentFromFirebase = async (
  sessionId: string,
  userId: string
) => {
  const studentRef = getHackathonRegisteredStudentRef(sessionId, userId);
  try {
    await remove(studentRef);
    return true;
  } catch (error) {
    console.error("Erreur lors de la désinscription étudiant Firebase:", error);
    return false;
  }
};

// Récupérer l'enregistrement d'un étudiant dans une session (one-shot)
export const getRegisteredStudentFromFirebase = async (
  sessionId: string,
  userId: string
) => {
  const studentRef = getHackathonRegisteredStudentRef(sessionId, userId);
  try {
    const snapshot = await get(studentRef);
    return snapshot.val();
  } catch (error) {
    console.error("Erreur lors de la récupération étudiant Firebase:", error);
    return null;
  }
};

// Écouter les changements d'étudiants enregistrés dans une session
export const subscribeToRegisteredStudents = (
  sessionId: string,
  callback: (students: Record<string, any> | null) => void
) => {
  const studentsRef = getHackathonRegisteredStudentsRef(sessionId);
  return onValue(studentsRef, (snapshot) => {
    callback(snapshot.val());
  });
};

// Mettre à jour des champs spécifiques d'une équipe (path-specific, évite les conflits entre équipes)
export const updateTeamInFirebase = async (
  sessionId: string,
  teamIndex: number,
  updates: Partial<{
    score: number;
    currentLevel: number;
    completedLevels: number[];
    progress: Record<number, number>;
    errors: number;
    completionTime: number;
    phaseStartTimestamps: Record<number, number>;
  }>
): Promise<boolean> => {
  const sessionRef = getHackathonSessionRef(sessionId);
  try {
    const flatUpdates: Record<string, any> = { lastUpdated: serverTimestamp() };
    Object.entries(updates).forEach(([key, value]) => {
      flatUpdates[`teams/${teamIndex}/${key}`] = value;
    });
    await update(sessionRef, flatUpdates);
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour ciblée de l'équipe:", error);
    return false;
  }
};

// Sauvegarder la réponse d'un étudiant dans Firebase
export const updateStudentAnswerInFirebase = async (
  sessionId: string,
  userId: string,
  exerciseId: string,
  answer: string
): Promise<boolean> => {
  const studentRef = getHackathonRegisteredStudentRef(sessionId, userId);
  try {
    await update(studentRef, { [`answers/${exerciseId}`]: answer });
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la réponse étudiant:", error);
    return false;
  }
};

// Sauvegarder le timestamp de démarrage de session Speed Dating
export const setSpeedDatingSessionStartTime = async (
  userId: string,
  startTime: number
): Promise<boolean> => {
  const userRef = getUserRef(userId);
  try {
    await update(userRef, { speedDatingSessionStartTime: startTime });
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du startTime Speed Dating:", error);
    return false;
  }
};

// Récupérer le timestamp de démarrage de session Speed Dating
export const getSpeedDatingSessionStartTime = async (
  userId: string
): Promise<number | null> => {
  const startTimeRef = ref(database, `users/${userId}/speedDatingSessionStartTime`);
  try {
    const snapshot = await get(startTimeRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error("Erreur lors de la récupération du startTime Speed Dating:", error);
    return null;
  }
};

// ── Chat Hackathon ────────────────────────────────────────────────────────────

// Références chat
const getTeamChatRef = (sessionId: string, teamId: number) =>
  ref(database, `hackathonSessions/${sessionId}/chat/teams/${teamId}/messages`);

const getBroadcastChatRef = (sessionId: string) =>
  ref(database, `hackathonSessions/${sessionId}/chat/broadcast/messages`);

// Envoyer un message dans le chat d'équipe
export const sendTeamChatMessage = async (
  sessionId: string,
  teamId: number,
  message: { senderId: string; senderName: string; text: string }
): Promise<boolean> => {
  try {
    await push(getTeamChatRef(sessionId, teamId), {
      ...message,
      timestamp: Date.now(),
      type: "user",
    });
    return true;
  } catch (error) {
    console.error("Erreur envoi message équipe:", error);
    return false;
  }
};

// Envoyer un message broadcast (formateur → toutes les équipes)
export const sendBroadcastMessage = async (
  sessionId: string,
  message: { senderName: string; text: string }
): Promise<boolean> => {
  try {
    await push(getBroadcastChatRef(sessionId), {
      ...message,
      senderId: "instructor",
      timestamp: Date.now(),
      type: "broadcast",
    });
    return true;
  } catch (error) {
    console.error("Erreur envoi broadcast:", error);
    return false;
  }
};

// S'abonner au chat d'une équipe (50 derniers messages)
export const subscribeToTeamChat = (
  sessionId: string,
  teamId: number,
  callback: (messages: ChatMessage[]) => void
): (() => void) => {
  const chatQuery = query(getTeamChatRef(sessionId, teamId), limitToLast(50));
  return onValue(chatQuery, (snapshot) => {
    const data = snapshot.val();
    if (!data) { callback([]); return; }
    const messages: ChatMessage[] = Object.entries(data)
      .map(([id, msg]: [string, any]) => ({ id, ...msg }))
      .sort((a, b) => a.timestamp - b.timestamp);
    callback(messages);
  });
};

// S'abonner aux messages broadcast (50 derniers)
export const subscribeToBroadcastChat = (
  sessionId: string,
  callback: (messages: ChatMessage[]) => void
): (() => void) => {
  const broadcastQuery = query(getBroadcastChatRef(sessionId), limitToLast(50));
  return onValue(broadcastQuery, (snapshot) => {
    const data = snapshot.val();
    if (!data) { callback([]); return; }
    const messages: ChatMessage[] = Object.entries(data)
      .map(([id, msg]: [string, any]) => ({ id, ...msg }))
      .sort((a, b) => a.timestamp - b.timestamp);
    callback(messages);
  });
};

export { app };
export type { FirebaseUser };
