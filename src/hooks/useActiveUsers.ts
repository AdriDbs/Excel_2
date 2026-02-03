import { useState, useEffect, useCallback, useMemo } from "react";
import { useUser, ActiveUser } from "../contexts/UserContext";
import { databaseService } from "../services/databaseService";

interface UseActiveUsersOptions {
  includeLocalUsers?: boolean; // Inclure aussi les utilisateurs du localStorage
  filterRole?: "student" | "instructor" | null; // Filtrer par rôle
  maxInactiveTime?: number; // Temps max d'inactivité en ms (défaut: 2 minutes)
}

interface UseActiveUsersReturn {
  // Utilisateurs actifs
  activeUsers: ActiveUser[];
  totalCount: number;
  studentsCount: number;
  instructorsCount: number;

  // État de la connexion
  isFirebaseConnected: boolean;
  isLoading: boolean;

  // Fonctions utilitaires
  getUsersByRole: (role: "student" | "instructor") => ActiveUser[];
  isUserOnline: (userId: string) => boolean;
  getOnlineUsers: () => ActiveUser[];
  refreshUsers: () => void;
}

export const useActiveUsers = (
  options: UseActiveUsersOptions = {}
): UseActiveUsersReturn => {
  const {
    includeLocalUsers = false,
    filterRole = null,
    maxInactiveTime = 2 * 60 * 1000, // 2 minutes par défaut
  } = options;

  const { activeUsers: firebaseActiveUsers, isFirebaseConnected } = useUser();
  const [localUsers, setLocalUsers] = useState<ActiveUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les utilisateurs locaux si nécessaire
  useEffect(() => {
    if (includeLocalUsers) {
      const loadLocalUsers = () => {
        const onlineUsers = databaseService.getOnlineUsers();
        const now = Date.now();

        const formattedLocalUsers: ActiveUser[] = onlineUsers.map((user) => ({
          odcfUserId: user.id,
          name: user.name,
          role: user.role,
          isOnline: true,
          lastSeen: new Date(user.lastActivity).getTime(),
          connectedAt: new Date(user.createdAt).getTime(),
          deviceInfo: user.deviceInfo,
        }));

        setLocalUsers(formattedLocalUsers);
      };

      loadLocalUsers();

      // Rafraîchir toutes les 5 secondes
      const interval = setInterval(loadLocalUsers, 5000);
      return () => clearInterval(interval);
    }
  }, [includeLocalUsers]);

  // Mettre à jour l'état de chargement
  useEffect(() => {
    // On considère le chargement terminé après un court délai
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isFirebaseConnected]);

  // Combiner et filtrer les utilisateurs
  const activeUsers = useMemo(() => {
    const now = Date.now();
    let users = [...firebaseActiveUsers];

    // Ajouter les utilisateurs locaux si demandé
    if (includeLocalUsers) {
      // Éviter les doublons basés sur odcfUserId
      const firebaseUserIds = new Set(users.map((u) => u.odcfUserId));
      const uniqueLocalUsers = localUsers.filter(
        (u) => !firebaseUserIds.has(u.odcfUserId)
      );
      users = [...users, ...uniqueLocalUsers];
    }

    // Filtrer les utilisateurs inactifs
    users = users.filter((user) => {
      const lastSeenTime =
        typeof user.lastSeen === "number" ? user.lastSeen : now;
      return now - lastSeenTime < maxInactiveTime;
    });

    // Filtrer par rôle si spécifié
    if (filterRole) {
      users = users.filter((user) => user.role === filterRole);
    }

    // Trier par dernière activité (plus récent en premier)
    users.sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));

    return users;
  }, [firebaseActiveUsers, localUsers, includeLocalUsers, filterRole, maxInactiveTime]);

  // Compteurs
  const totalCount = useMemo(() => activeUsers.length, [activeUsers]);

  const studentsCount = useMemo(
    () => activeUsers.filter((u) => u.role === "student").length,
    [activeUsers]
  );

  const instructorsCount = useMemo(
    () => activeUsers.filter((u) => u.role === "instructor").length,
    [activeUsers]
  );

  // Fonctions utilitaires
  const getUsersByRole = useCallback(
    (role: "student" | "instructor"): ActiveUser[] => {
      return activeUsers.filter((user) => user.role === role);
    },
    [activeUsers]
  );

  const isUserOnline = useCallback(
    (userId: string): boolean => {
      return activeUsers.some((user) => user.odcfUserId === userId);
    },
    [activeUsers]
  );

  const getOnlineUsers = useCallback((): ActiveUser[] => {
    return activeUsers.filter((user) => user.isOnline);
  }, [activeUsers]);

  const refreshUsers = useCallback(() => {
    if (includeLocalUsers) {
      const onlineUsers = databaseService.getOnlineUsers();
      const formattedLocalUsers: ActiveUser[] = onlineUsers.map((user) => ({
        odcfUserId: user.id,
        name: user.name,
        role: user.role,
        isOnline: true,
        lastSeen: new Date(user.lastActivity).getTime(),
        connectedAt: new Date(user.createdAt).getTime(),
        deviceInfo: user.deviceInfo,
      }));
      setLocalUsers(formattedLocalUsers);
    }
  }, [includeLocalUsers]);

  return {
    activeUsers,
    totalCount,
    studentsCount,
    instructorsCount,
    isFirebaseConnected,
    isLoading,
    getUsersByRole,
    isUserOnline,
    getOnlineUsers,
    refreshUsers,
  };
};

export default useActiveUsers;
