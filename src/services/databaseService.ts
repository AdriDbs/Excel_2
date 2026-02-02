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

const DATABASE_KEY = "bearingpoint_excel_training_db";
const SYNC_INTERVAL = 2000; // Synchronisation toutes les 2 secondes
const ONLINE_THRESHOLD = 2 * 60 * 1000; // 2 minutes pour considérer comme en ligne
const RECENT_USERS_KEY = "bearingpoint_recent_users";
const MAX_RECENT_USERS = 10;

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

export class DatabaseService {
  private static instance: DatabaseService;
  private database: DatabaseState;
  private syncTimer: NodeJS.Timeout | null = null;
  private lastSyncTime: number = 0;

  private constructor() {
    this.database = this.loadDatabase();
    this.startSyncTimer();

    // Écouter les changements dans localStorage d'autres onglets
    if (typeof window !== "undefined") {
      window.addEventListener("storage", this.handleStorageChange.bind(this));

      // Simuler une synchronisation cross-browser en utilisant BroadcastChannel si disponible
      if ("BroadcastChannel" in window) {
        const channel = new BroadcastChannel("bearingpoint_db_sync");
        channel.addEventListener("message", (event) => {
          if (event.data.type === "database_updated") {
            this.database = this.loadDatabase();
          }
        });

        // Fonction pour notifier les autres onglets/navigateurs
        this.notifyOthers = () => {
          channel.postMessage({
            type: "database_updated",
            timestamp: Date.now(),
          });
        };
      }
    }
  }

  private notifyOthers: (() => void) | null = null;

  private handleStorageChange(event: StorageEvent) {
    if (event.key === DATABASE_KEY) {
      this.database = this.loadDatabase();
    }
  }

  private startSyncTimer() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(() => {
      // Recharger la base de données pour capturer les changements d'autres instances
      const freshData = this.loadDatabase();
      if (freshData.lastUpdated !== this.database.lastUpdated) {
        this.database = freshData;
      }
    }, SYNC_INTERVAL);
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private loadDatabase(): DatabaseState {
    try {
      const stored = localStorage.getItem(DATABASE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          users: parsed.users || [],
          initialized: parsed.initialized || false,
          lastUpdated: parsed.lastUpdated || new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error("Error loading database:", error);
    }

    return {
      users: [],
      initialized: false,
      lastUpdated: new Date().toISOString(),
    };
  }

  private saveDatabase(): void {
    try {
      this.database.lastUpdated = new Date().toISOString();
      localStorage.setItem(DATABASE_KEY, JSON.stringify(this.database));

      // Notifier les autres instances
      if (this.notifyOthers) {
        this.notifyOthers();
      }

      // Déclencher un événement de stockage manuellement pour les autres onglets du même navigateur
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: DATABASE_KEY,
            newValue: JSON.stringify(this.database),
            url: window.location.href,
          })
        );
      }
    } catch (error) {
      console.error("Error saving database:", error);
    }
  }

  // Forcer la synchronisation
  public forcSync(): void {
    this.database = this.loadDatabase();
  }

  public initializeDatabase(): void {
    this.database.initialized = true;
    this.saveDatabase();
  }

  public resetDatabase(): void {
    this.database = {
      users: [],
      initialized: true,
      lastUpdated: new Date().toISOString(),
    };
    this.saveDatabase();
  }

  public addUser(
    name: string,
    role: "instructor" | "student"
  ): Student | Instructor {
    // Forcer la synchronisation avant d'ajouter
    this.forcSync();

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

    this.database.users.push(user);
    this.saveDatabase();

    // Ajouter aux utilisateurs récents si c'est un étudiant
    if (role === "student") {
      this.addToRecentUsers(user.id, user.name);
    }

    return user;
  }

  public getUserById(userId: string): Student | Instructor | null {
    // Forcer la synchronisation avant de chercher
    this.forcSync();
    return this.database.users.find((user) => user.id === userId) || null;
  }

  public getUserByName(name: string): Student | Instructor | null {
    // Forcer la synchronisation avant de chercher
    this.forcSync();
    return (
      this.database.users.find(
        (user) => user.name.toLowerCase() === name.toLowerCase()
      ) || null
    );
  }

  public getAllUsers(): (Student | Instructor)[] {
    // Forcer la synchronisation avant de retourner tous les utilisateurs
    this.forcSync();
    return [...this.database.users];
  }

  public getStudents(): Student[] {
    // Forcer la synchronisation avant de retourner les étudiants
    this.forcSync();
    return this.database.users.filter(
      (user) => user.role === "student"
    ) as Student[];
  }

  public getInstructors(): Instructor[] {
    // Forcer la synchronisation avant de retourner les instructeurs
    this.forcSync();
    return this.database.users.filter(
      (user) => user.role === "instructor"
    ) as Instructor[];
  }

  public updateUserProgress(
    userId: string,
    progressType: "speedDating" | "hackathon",
    progress: any
  ): boolean {
    // Forcer la synchronisation avant la mise à jour
    this.forcSync();

    const userIndex = this.database.users.findIndex(
      (user) => user.id === userId
    );

    if (userIndex === -1 || this.database.users[userIndex].role !== "student") {
      return false;
    }

    const student = this.database.users[userIndex] as Student;

    if (progressType === "speedDating") {
      student.speedDatingProgress = {
        ...student.speedDatingProgress,
        ...progress,
      };
    } else if (progressType === "hackathon") {
      student.hackathonProgress = { ...student.hackathonProgress, ...progress };
    }

    student.lastActivity = new Date().toISOString();
    this.saveDatabase();

    return true;
  }

  public updateLastActivity(userId: string, logConnection: boolean = false): boolean {
    // Forcer la synchronisation avant la mise à jour
    this.forcSync();

    const userIndex = this.database.users.findIndex(
      (user) => user.id === userId
    );

    if (userIndex === -1) {
      return false;
    }

    const now = new Date().toISOString();
    const user = this.database.users[userIndex];

    user.lastActivity = now;
    user.lastSeenAt = now;
    user.isOnline = true;

    // Mettre à jour les informations de l'appareil
    const deviceInfo = getDeviceInfo();
    user.deviceInfo = deviceInfo;

    // Ajouter au journal de connexion si demandé (limiter à 50 entrées)
    if (logConnection) {
      const connectionLog: ConnectionLog = {
        timestamp: now,
        deviceInfo,
        action: "activity",
      };

      if (!user.connectionHistory) {
        user.connectionHistory = [];
      }

      user.connectionHistory.push(connectionLog);

      // Garder seulement les 50 dernières entrées
      if (user.connectionHistory.length > 50) {
        user.connectionHistory = user.connectionHistory.slice(-50);
      }
    }

    // Ajouter aux utilisateurs récents
    if (user.role === "student") {
      this.addToRecentUsers(user.id, user.name);
    }

    this.saveDatabase();

    return true;
  }

  // Gestion des utilisateurs récents
  private addToRecentUsers(userId: string, userName: string): void {
    try {
      const recentUsers = this.getRecentUsers();

      // Retirer l'utilisateur s'il existe déjà
      const filteredUsers = recentUsers.filter(u => u.id !== userId);

      // Ajouter l'utilisateur en tête de liste
      filteredUsers.unshift({ id: userId, name: userName, lastUsed: new Date().toISOString() });

      // Garder seulement les MAX_RECENT_USERS derniers
      const trimmedUsers = filteredUsers.slice(0, MAX_RECENT_USERS);

      localStorage.setItem(RECENT_USERS_KEY, JSON.stringify(trimmedUsers));
    } catch (error) {
      console.error("Error adding to recent users:", error);
    }
  }

  public getRecentUsers(): Array<{ id: string; name: string; lastUsed: string }> {
    try {
      const stored = localStorage.getItem(RECENT_USERS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Error getting recent users:", error);
    }
    return [];
  }

  public getRecentStudents(): Student[] {
    this.forcSync();
    const recentUsers = this.getRecentUsers();
    const students: Student[] = [];

    for (const recent of recentUsers) {
      const user = this.getUserById(recent.id);
      if (user && user.role === "student") {
        students.push(user as Student);
      }
    }

    return students;
  }

  // Obtenir les utilisateurs en ligne (actifs dans les 2 dernières minutes)
  public getOnlineUsers(): (Student | Instructor)[] {
    this.forcSync();
    const threshold = Date.now() - ONLINE_THRESHOLD;

    return this.database.users.filter(user => {
      const lastActivity = new Date(user.lastActivity).getTime();
      return lastActivity > threshold;
    });
  }

  // Mettre à jour le statut en ligne de tous les utilisateurs
  public updateOnlineStatuses(): void {
    this.forcSync();
    const threshold = Date.now() - ONLINE_THRESHOLD;
    let changed = false;

    this.database.users.forEach(user => {
      const lastActivity = new Date(user.lastActivity).getTime();
      const shouldBeOnline = lastActivity > threshold;

      if (user.isOnline !== shouldBeOnline) {
        user.isOnline = shouldBeOnline;
        changed = true;
      }
    });

    if (changed) {
      this.saveDatabase();
    }
  }

  public deleteUser(userId: string): boolean {
    // Forcer la synchronisation avant la suppression
    this.forcSync();

    const initialLength = this.database.users.length;
    this.database.users = this.database.users.filter(
      (user) => user.id !== userId
    );

    if (this.database.users.length < initialLength) {
      this.saveDatabase();
      return true;
    }

    return false;
  }

  public getLeaderboard(): Array<{
    name: string;
    totalScore: number;
    speedDatingCompleted: number;
    hackathonLevel: number;
    lastActivity: string;
  }> {
    // Forcer la synchronisation avant de calculer le leaderboard
    this.forcSync();

    return this.getStudents()
      .map((student) => {
        const speedDatingCompleted = Object.values(
          student.speedDatingProgress
        ).filter((progress) => progress.completed).length;

        const totalSpeedDatingScore = Object.values(
          student.speedDatingProgress
        ).reduce((sum, progress) => sum + progress.score, 0);

        return {
          name: student.name,
          totalScore:
            totalSpeedDatingScore + student.hackathonProgress.totalScore,
          speedDatingCompleted,
          hackathonLevel: student.hackathonProgress.currentLevel,
          lastActivity: student.lastActivity,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);
  }

  public getStats(): UserStats {
    // Forcer la synchronisation avant de calculer les stats
    this.forcSync();

    const users = this.database.users;
    const students = users.filter(
      (user) => user.role === "student"
    ) as Student[];

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
      const speedProgress = Object.values(student.speedDatingProgress);
      speedDatingTotal += speedProgress.length;
      speedDatingCompleted += speedProgress.filter((p) => p.completed).length;

      if (student.hackathonProgress.currentLevel > 0) {
        hackathonTotal += 1;
        if (student.hackathonProgress.levelsCompleted.length >= 6) {
          // Assuming 6 levels total
          hackathonCompleted += 1;
        }
      }
    });

    return {
      totalUsers: users.length,
      totalStudents: students.length,
      totalInstructors: users.filter((user) => user.role === "instructor")
        .length,
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

  public isInitialized(): boolean {
    return this.database.initialized;
  }

  public exportData(): string {
    // Forcer la synchronisation avant l'export
    this.forcSync();
    return JSON.stringify(this.database, null, 2);
  }

  public importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.users && Array.isArray(data.users)) {
        this.database = {
          users: data.users,
          initialized: true,
          lastUpdated: new Date().toISOString(),
        };
        this.saveDatabase();
        return true;
      }
    } catch (error) {
      console.error("Error importing data:", error);
    }
    return false;
  }

  // Méthode pour nettoyer les timers lors de la destruction
  public destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    if (typeof window !== "undefined") {
      window.removeEventListener(
        "storage",
        this.handleStorageChange.bind(this)
      );
    }
  }
}

// Instance singleton
export const databaseService = DatabaseService.getInstance();
