import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  query,
  orderByChild,
  limitToLast,
  serverTimestamp,
  push,
  runTransaction,
} from "firebase/database";
import { database } from "../config/firebase";
import {
  Student,
  Instructor,
  DatabaseState,
  SpeedDatingProgress,
  HackathonProgress,
  UserStats,
  DeviceInfo,
  ConnectionLog,
} from "../types/database";

// Constantes
const ONLINE_THRESHOLD = 2 * 60 * 1000; // 2 minutes pour considérer comme en ligne
const MAX_RECENT_USERS = 10;
const MAX_CONNECTION_HISTORY = 50;

// Fonction utilitaire pour détecter les informations de l'appareil
export const getDeviceInfo = (): DeviceInfo => {
  const userAgent = navigator.userAgent;

  // Détection du navigateur
  let browser = "Unknown";
  let browserVersion = "";
  if (userAgent.includes("Firefox")) {
    browser = "Firefox";
    browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || "";
  } else if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
    browser = "Chrome";
    browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || "";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    browser = "Safari";
    browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || "";
  } else if (userAgent.includes("Edg")) {
    browser = "Edge";
    browserVersion = userAgent.match(/Edg\/(\d+)/)?.[1] || "";
  } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
    browser = "Opera";
    browserVersion = userAgent.match(/(?:Opera|OPR)\/(\d+)/)?.[1] || "";
  }

  // Détection de l'OS
  let os = "Unknown";
  let osVersion = "";
  if (userAgent.includes("Windows")) {
    os = "Windows";
    if (userAgent.includes("Windows NT 10.0")) osVersion = "10/11";
    else if (userAgent.includes("Windows NT 6.3")) osVersion = "8.1";
    else if (userAgent.includes("Windows NT 6.2")) osVersion = "8";
    else if (userAgent.includes("Windows NT 6.1")) osVersion = "7";
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
    osVersion = userAgent.match(/OS (\d+_\d+)/)?.[1]?.replace("_", ".") || "";
  }

  // Détection du type d'appareil
  let deviceType: "desktop" | "mobile" | "tablet" = "desktop";
  if (/Mobi|Android/i.test(userAgent) && !/iPad/i.test(userAgent)) {
    deviceType = "mobile";
  } else if (/iPad|Tablet/i.test(userAgent)) {
    deviceType = "tablet";
  }

  // Résolution d'écran
  const screenResolution = `${window.screen.width}x${window.screen.height}`;

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    deviceType,
    screenResolution,
    language: navigator.language,
    userAgent: userAgent.substring(0, 200), // Limiter la taille
  };
};

/**
 * Service Firebase optimisé pour gérer toutes les données
 * Remplace complètement le databaseService avec localStorage
 */
export class FirebaseDataService {
  private static instance: FirebaseDataService;

  private constructor() {
    // Initialisation si nécessaire
  }

  public static getInstance(): FirebaseDataService {
    if (!FirebaseDataService.instance) {
      FirebaseDataService.instance = new FirebaseDataService();
    }
    return FirebaseDataService.instance;
  }

  // ==================== GESTION DES UTILISATEURS ====================

  /**
   * Créer un nouvel utilisateur dans Firebase
   */
  public async addUser(
    name: string,
    role: "instructor" | "student"
  ): Promise<Student | Instructor> {
    const userId = `${role}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const now = new Date().toISOString();
    const deviceInfo = getDeviceInfo();

    const connectionLog: ConnectionLog = {
      timestamp: now,
      deviceInfo,
      action: "login",
    };

    const baseUser = {
      id: userId,
      name,
      role,
      createdAt: now,
      lastActivity: now,
      deviceInfo,
      connectionHistory: [connectionLog],
      isOnline: true,
      lastSeenAt: now,
    };

    let user: Student | Instructor;

    if (role === "student") {
      user = {
        ...baseUser,
        role: "student",
        speedDatingProgress: {},
        hackathonProgress: {
          currentLevel: 0,
          levelsCompleted: [],
          totalScore: 0,
          individualContributions: {},
        },
      } as Student;
    } else {
      user = {
        ...baseUser,
        role: "instructor",
      } as Instructor;
    }

    // Sauvegarder dans Firebase
    const userRef = ref(database, `users/${userId}`);
    await set(userRef, {
      ...user,
      lastSyncedAt: serverTimestamp(),
    });

    // Ajouter aux utilisateurs récents si c'est un étudiant
    if (role === "student") {
      await this.addToRecentUsers(user.id, user.name);
    }

    return user;
  }

  /**
   * Récupérer un utilisateur par ID
   */
  public async getUserById(userId: string): Promise<Student | Instructor | null> {
    try {
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        return { ...snapshot.val(), id: userId } as Student | Instructor;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      return null;
    }
  }

  /**
   * Récupérer un utilisateur par nom
   */
  public async getUserByName(name: string): Promise<Student | Instructor | null> {
    try {
      const usersRef = ref(database, "users");
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const users = snapshot.val();
        const entry = Object.entries(users).find(
          ([, user]: [string, any]) => user.name.toLowerCase() === name.toLowerCase()
        );
        if (entry) {
          const [key, user] = entry as [string, any];
          return { ...user, id: user.id || key } as Student | Instructor;
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching user by name:", error);
      return null;
    }
  }

  /**
   * Récupérer tous les utilisateurs
   */
  public async getAllUsers(): Promise<(Student | Instructor)[]> {
    try {
      const usersRef = ref(database, "users");
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const users = snapshot.val();
        return Object.entries(users).map(([key, user]: [string, any]) => ({
          ...user,
          id: user.id || key,
        })) as (Student | Instructor)[];
      }
      return [];
    } catch (error) {
      console.error("Error fetching all users:", error);
      return [];
    }
  }

  /**
   * Récupérer tous les étudiants
   */
  public async getStudents(): Promise<Student[]> {
    const allUsers = await this.getAllUsers();
    return allUsers.filter((user) => user.role === "student") as Student[];
  }

  /**
   * Récupérer tous les instructeurs
   */
  public async getInstructors(): Promise<Instructor[]> {
    const allUsers = await this.getAllUsers();
    return allUsers.filter((user) => user.role === "instructor") as Instructor[];
  }

  /**
   * Mettre à jour la progression d'un utilisateur
   */
  public async updateUserProgress(
    userId: string,
    progressType: "speedDating" | "hackathon",
    progress: any
  ): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user || user.role !== "student") {
        return false;
      }

      const userRef = ref(database, `users/${userId}`);
      const updates: any = {
        lastActivity: new Date().toISOString(),
        lastSyncedAt: serverTimestamp(),
      };

      if (progressType === "speedDating") {
        updates.speedDatingProgress = {
          ...(user as Student).speedDatingProgress,
          ...progress,
        };
      } else if (progressType === "hackathon") {
        updates.hackathonProgress = {
          ...(user as Student).hackathonProgress,
          ...progress,
        };
      }

      await update(userRef, updates);
      return true;
    } catch (error) {
      console.error("Error updating user progress:", error);
      return false;
    }
  }

  /**
   * Mettre à jour la dernière activité d'un utilisateur
   */
  public async updateLastActivity(
    userId: string,
    logConnection: boolean = false
  ): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        return false;
      }

      const now = new Date().toISOString();
      const deviceInfo = getDeviceInfo();
      const userRef = ref(database, `users/${userId}`);

      const updates: any = {
        lastActivity: now,
        lastSeenAt: now,
        isOnline: true,
        deviceInfo,
        lastSyncedAt: serverTimestamp(),
      };

      // Ajouter au journal de connexion si demandé
      if (logConnection) {
        const connectionLog: ConnectionLog = {
          timestamp: now,
          deviceInfo,
          action: "activity",
        };

        const connectionHistory = user.connectionHistory || [];
        connectionHistory.push(connectionLog);

        // Garder seulement les 50 dernières entrées
        updates.connectionHistory = connectionHistory.slice(-MAX_CONNECTION_HISTORY);
      }

      await update(userRef, updates);

      // Ajouter aux utilisateurs récents
      if (user.role === "student") {
        await this.addToRecentUsers(user.id, user.name);
      }

      return true;
    } catch (error) {
      console.error("Error updating last activity:", error);
      return false;
    }
  }

  /**
   * Supprimer un utilisateur et toutes ses données associées
   */
  public async deleteUser(userId: string): Promise<boolean> {
    try {
      // 1. Supprimer l'utilisateur principal
      const userRef = ref(database, `users/${userId}`);
      await remove(userRef);

      // 2. Supprimer toutes les sessions actives de cet utilisateur
      const activeUsersRef = ref(database, "activeUsers");
      const activeUsersSnapshot = await get(activeUsersRef);
      if (activeUsersSnapshot.exists()) {
        const activeSessions = activeUsersSnapshot.val();
        const sessionsToDelete = Object.keys(activeSessions).filter(
          sessionId => activeSessions[sessionId].odcfUserId === userId
        );

        for (const sessionId of sessionsToDelete) {
          await remove(ref(database, `activeUsers/${sessionId}`));
        }
      }

      // 3. Supprimer l'utilisateur de la liste des utilisateurs récents
      const recentUsersRef = ref(database, "recentUsers");
      const recentSnapshot = await get(recentUsersRef);
      if (recentSnapshot.exists()) {
        const recentUsers = Object.values(recentSnapshot.val()) as Array<{ id: string; name: string; lastUsed: string }>;
        const updatedRecentUsers = recentUsers.filter(u => u.id !== userId);
        await set(recentUsersRef, updatedRecentUsers);
      }

      // 4. Supprimer l'entrée du leaderboard Speed Dating
      const leaderboardRef = ref(database, `speedDatingLeaderboard/${userId}`);
      await remove(leaderboardRef);

      // 5. Nettoyer les sessions hackathon où l'utilisateur est enregistré
      const hackathonSessionsRef = ref(database, "hackathonSessions");
      const hackathonSnapshot = await get(hackathonSessionsRef);
      if (hackathonSnapshot.exists()) {
        const sessions = hackathonSnapshot.val();
        for (const sessionId of Object.keys(sessions)) {
          const session = sessions[sessionId];
          if (session.registeredStudents && session.registeredStudents[userId]) {
            await remove(ref(database, `hackathonSessions/${sessionId}/registeredStudents/${userId}`));
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  // ==================== GESTION DES UTILISATEURS RÉCENTS ====================

  /**
   * Ajouter un utilisateur aux utilisateurs récents (global, partagé entre tous les appareils)
   */
  private async addToRecentUsers(userId: string, userName: string): Promise<void> {
    try {
      const recentUsersRef = ref(database, "recentUsers");
      const snapshot = await get(recentUsersRef);

      let recentUsers: Array<{ id: string; name: string; lastUsed: string }> = [];

      if (snapshot.exists()) {
        recentUsers = Object.values(snapshot.val());
      }

      // Retirer l'utilisateur s'il existe déjà
      recentUsers = recentUsers.filter(u => u.id !== userId);

      // Ajouter l'utilisateur en tête de liste
      recentUsers.unshift({
        id: userId,
        name: userName,
        lastUsed: new Date().toISOString(),
      });

      // Garder seulement les MAX_RECENT_USERS derniers
      recentUsers = recentUsers.slice(0, MAX_RECENT_USERS);

      // Sauvegarder dans Firebase
      await set(recentUsersRef, recentUsers);
    } catch (error) {
      console.error("Error adding to recent users:", error);
    }
  }

  /**
   * Récupérer les utilisateurs récents
   */
  public async getRecentUsers(): Promise<Array<{ id: string; name: string; lastUsed: string }>> {
    try {
      const recentUsersRef = ref(database, "recentUsers");
      const snapshot = await get(recentUsersRef);

      if (snapshot.exists()) {
        return Object.values(snapshot.val());
      }
      return [];
    } catch (error) {
      console.error("Error getting recent users:", error);
      return [];
    }
  }

  /**
   * Récupérer les étudiants récents avec toutes leurs données
   */
  public async getRecentStudents(): Promise<Student[]> {
    const recentUsers = await this.getRecentUsers();
    const students: Student[] = [];

    for (const recent of recentUsers) {
      const user = await this.getUserById(recent.id);
      if (user && user.role === "student") {
        students.push(user as Student);
      }
    }

    return students;
  }

  // ==================== GESTION DES UTILISATEURS EN LIGNE ====================

  /**
   * Récupérer les utilisateurs en ligne (actifs dans les 2 dernières minutes)
   */
  public async getOnlineUsers(): Promise<(Student | Instructor)[]> {
    const allUsers = await this.getAllUsers();
    const threshold = Date.now() - ONLINE_THRESHOLD;

    return allUsers.filter(user => {
      const lastActivity = new Date(user.lastActivity).getTime();
      return lastActivity > threshold;
    });
  }

  /**
   * Forcer la synchronisation (pour compatibilité avec databaseService)
   * Firebase se synchronise automatiquement, donc cette méthode est un no-op
   */
  public async forceSync(): Promise<void> {
    // Firebase est déjà en temps réel, pas besoin de synchronisation manuelle
    return Promise.resolve();
  }

  /**
   * Mettre à jour le statut en ligne de tous les utilisateurs
   */
  public async updateOnlineStatuses(): Promise<void> {
    try {
      const allUsers = await this.getAllUsers();
      const threshold = Date.now() - ONLINE_THRESHOLD;

      const updates: Promise<void>[] = [];

      allUsers.forEach(user => {
        const lastActivity = new Date(user.lastActivity).getTime();
        const shouldBeOnline = lastActivity > threshold;

        // Mettre à jour uniquement si le statut a changé
        if (user.isOnline !== shouldBeOnline) {
          const userRef = ref(database, `users/${user.id}`);
          updates.push(
            update(userRef, {
              isOnline: shouldBeOnline,
              lastSyncedAt: serverTimestamp(),
            })
          );
        }
      });

      // Exécuter toutes les mises à jour en parallèle
      if (updates.length > 0) {
        await Promise.all(updates);
      }
    } catch (error) {
      console.error("Error updating online statuses:", error);
    }
  }

  /**
   * Écouter les changements d'utilisateurs en temps réel
   */
  public subscribeToUsers(
    callback: (users: (Student | Instructor)[]) => void
  ): () => void {
    const usersRef = ref(database, "users");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const users = Object.values(snapshot.val()) as (Student | Instructor)[];
        callback(users);
      } else {
        callback([]);
      }
    });

    return unsubscribe;
  }

  /**
   * Écouter les changements d'un utilisateur spécifique en temps réel
   */
  public subscribeToUser(
    userId: string,
    callback: (user: Student | Instructor | null) => void
  ): () => void {
    const userRef = ref(database, `users/${userId}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as Student | Instructor);
      } else {
        callback(null);
      }
    });

    return unsubscribe;
  }

  // ==================== LEADERBOARD ET STATISTIQUES ====================

  /**
   * Récupérer le leaderboard
   */
  public async getLeaderboard(): Promise<Array<{
    name: string;
    totalScore: number;
    speedDatingCompleted: number;
    hackathonLevel: number;
    lastActivity: string;
  }>> {
    const students = await this.getStudents();

    return students
      .map((student) => {
        const speedDatingValues = Object.values(
          student.speedDatingProgress || {}
        );

        const speedDatingCompleted = speedDatingValues
          .filter((progress) => progress && typeof progress === "object" && progress.completed).length;

        const totalSpeedDatingScore = speedDatingValues
          .filter((progress) => progress && typeof progress === "object")
          .reduce((sum, progress) => sum + (progress.score || 0), 0);

        const hackathonProgress = student.hackathonProgress || { totalScore: 0, currentLevel: 0 };

        return {
          name: student.name,
          totalScore: totalSpeedDatingScore + (hackathonProgress.totalScore || 0),
          speedDatingCompleted,
          hackathonLevel: hackathonProgress.currentLevel || 0,
          lastActivity: student.lastActivity,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * Récupérer les statistiques globales
   */
  public async getStats(): Promise<UserStats> {
    const users = await this.getAllUsers();
    const students = users.filter((user) => user.role === "student") as Student[];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const activeToday = users.filter((user) => {
      const lastActivity = new Date(user.lastActivity);
      return lastActivity >= today;
    }).length;

    // Calcul des taux de completion
    let speedDatingTotal = 0;
    let speedDatingCompleted = 0;
    let hackathonTotal = 0;
    let hackathonCompleted = 0;

    students.forEach((student) => {
      const speedProgress = Object.values(student.speedDatingProgress || {})
        .filter((p) => p && typeof p === "object");
      speedDatingTotal += speedProgress.length;
      speedDatingCompleted += speedProgress.filter((p) => p.completed).length;

      const hackathonProgress = student.hackathonProgress || { currentLevel: 0, levelsCompleted: [] };
      if ((hackathonProgress.currentLevel || 0) > 0) {
        hackathonTotal += 1;
        if ((hackathonProgress.levelsCompleted || []).length >= 6) {
          hackathonCompleted += 1;
        }
      }
    });

    return {
      totalUsers: users.length,
      totalStudents: students.length,
      totalInstructors: users.filter((user) => user.role === "instructor").length,
      activeToday,
      completionRates: {
        speedDating:
          speedDatingTotal > 0
            ? (speedDatingCompleted / speedDatingTotal) * 100
            : 0,
        hackathon:
          hackathonTotal > 0 ? (hackathonCompleted / hackathonTotal) * 100 : 0,
      },
    };
  }

  // ==================== EXPORT / IMPORT ====================

  /**
   * Exporter toutes les données
   */
  public async exportData(): Promise<string> {
    const users = await this.getAllUsers();
    const data: DatabaseState = {
      users,
      initialized: true,
      lastUpdated: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Importer des données
   */
  public async importData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      if (data.users && Array.isArray(data.users)) {
        // Sauvegarder chaque utilisateur dans Firebase
        const promises = data.users.map((user: Student | Instructor) => {
          const userRef = ref(database, `users/${user.id}`);
          return set(userRef, {
            ...user,
            lastSyncedAt: serverTimestamp(),
          });
        });

        await Promise.all(promises);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }

  // ==================== INITIALISATION ====================

  /**
   * Initialiser la base de données (créer la structure si nécessaire)
   */
  public async initializeDatabase(): Promise<void> {
    try {
      const metadataRef = ref(database, "metadata");
      await set(metadataRef, {
        initialized: true,
        initializedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  /**
   * Réinitialiser la base de données (ATTENTION: supprime toutes les données)
   */
  public async resetDatabase(): Promise<void> {
    try {
      const usersRef = ref(database, "users");
      await remove(usersRef);

      const recentUsersRef = ref(database, "recentUsers");
      await remove(recentUsersRef);

      await this.initializeDatabase();
    } catch (error) {
      console.error("Error resetting database:", error);
    }
  }

  /**
   * Vérifier si la base de données est initialisée
   */
  public async isInitialized(): Promise<boolean> {
    try {
      const metadataRef = ref(database, "metadata/initialized");
      const snapshot = await get(metadataRef);
      return snapshot.exists() && snapshot.val() === true;
    } catch (error) {
      console.error("Error checking initialization:", error);
      return false;
    }
  }
}

// Instance singleton
export const firebaseDataService = FirebaseDataService.getInstance();
