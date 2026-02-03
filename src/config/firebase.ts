import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, Auth, User as FirebaseUser } from "firebase/auth";
import { getDatabase, ref, set, onValue, onDisconnect, serverTimestamp, Database } from "firebase/database";

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

// Fonction pour marquer un utilisateur comme connecté
export const setUserOnlinePresence = async (
  sessionId: string,
  userData: {
    odcfUserId: string;
    name: string;
    role: "instructor" | "student";
    deviceInfo?: object;
  }
) => {
  const activeUserRef = getActiveUserRef(sessionId);

  try {
    // Définir les données de présence
    await set(activeUserRef, {
      ...userData,
      isOnline: true,
      lastSeen: serverTimestamp(),
      connectedAt: serverTimestamp()
    });

    // Configurer la déconnexion automatique
    const disconnectRef = onDisconnect(activeUserRef);
    await disconnectRef.remove();

    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la présence:", error);
    return false;
  }
};

// Fonction pour mettre à jour l'activité de l'utilisateur
export const updateUserActivity = async (sessionId: string) => {
  const activeUserRef = getActiveUserRef(sessionId);

  try {
    await set(ref(database, `activeUsers/${sessionId}/lastSeen`), serverTimestamp());
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

export { app };
export type { FirebaseUser };
