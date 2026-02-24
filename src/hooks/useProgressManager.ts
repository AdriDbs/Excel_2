import { useState, useEffect, useCallback } from "react";
import { firebaseDataService } from "../services/firebaseDataService";
import {
  Student,
  SpeedDatingProgress,
  HackathonProgress,
} from "../types/database";

interface UseProgressManagerProps {
  userId: string;
}

interface UseProgressManagerReturn {
  speedDatingProgress: SpeedDatingProgress;
  hackathonProgress: HackathonProgress;
  updateSpeedDatingProgress: (
    functionId: number,
    progress: Partial<SpeedDatingProgress[number]>
  ) => Promise<boolean>;
  updateHackathonProgress: (
    progress: Partial<HackathonProgress>
  ) => Promise<boolean>;
  getTotalScore: () => number;
  getSpeedDatingCompletion: () => {
    completed: number;
    total: number;
    percentage: number;
  };
  getHackathonCompletion: () => {
    currentLevel: number;
    maxLevel: number;
    percentage: number;
  };
  refreshProgress: () => void;
}

export const useProgressManager = ({
  userId,
}: UseProgressManagerProps): UseProgressManagerReturn => {
  const [speedDatingProgress, setSpeedDatingProgress] =
    useState<SpeedDatingProgress>({});
  const [hackathonProgress, setHackathonProgress] = useState<HackathonProgress>(
    {
      currentLevel: 0,
      levelsCompleted: [],
      totalScore: 0,
      individualContributions: {},
    }
  );

  const refreshProgress = useCallback(async () => {
    const user = await firebaseDataService.getUserById(userId);
    if (user && user.role === "student") {
      const student = user as Student;
      setSpeedDatingProgress(student.speedDatingProgress ?? {});
      setHackathonProgress(
        student.hackathonProgress ?? {
          currentLevel: 0,
          levelsCompleted: [],
          totalScore: 0,
          individualContributions: {},
        }
      );
    }
  }, [userId]);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  const updateSpeedDatingProgress = useCallback(
    async (
      functionId: number,
      progress: Partial<SpeedDatingProgress[number]>
    ): Promise<boolean> => {
      try {
        // Préparer la mise à jour
        const safeProgress = speedDatingProgress ?? {};
        const updatedProgress = {
          ...safeProgress,
          [functionId]: {
            ...(safeProgress[functionId] ?? {}),
            ...progress,
            attempts: (safeProgress[functionId]?.attempts || 0) + 1,
          },
        };

        // Mettre à jour en base
        const success = await firebaseDataService.updateUserProgress(
          userId,
          "speedDating",
          updatedProgress
        );

        if (success) {
          setSpeedDatingProgress(updatedProgress);
          return true;
        }

        return false;
      } catch (error) {
        console.error("Error updating speed dating progress:", error);
        return false;
      }
    },
    [userId, speedDatingProgress]
  );

  const updateHackathonProgress = useCallback(
    async (progress: Partial<HackathonProgress>): Promise<boolean> => {
      try {
        const updatedProgress = {
          ...hackathonProgress,
          ...progress,
        };

        const success = await firebaseDataService.updateUserProgress(
          userId,
          "hackathon",
          updatedProgress
        );

        if (success) {
          setHackathonProgress(updatedProgress);
          return true;
        }

        return false;
      } catch (error) {
        console.error("Error updating hackathon progress:", error);
        return false;
      }
    },
    [userId, hackathonProgress]
  );

  const getTotalScore = useCallback((): number => {
    const speedDatingScore = Object.values(speedDatingProgress)
      .filter((p) => p && typeof p === "object")
      .reduce((sum, p) => sum + (p.score || 0), 0);
    return speedDatingScore + (hackathonProgress.totalScore || 0);
  }, [speedDatingProgress, hackathonProgress]);

  const getSpeedDatingCompletion = useCallback((): {
    completed: number;
    total: number;
    percentage: number;
  } => {
    const progressArray = Object.values(speedDatingProgress)
      .filter((p) => p && typeof p === "object");
    const completed = progressArray.filter((p) => p.completed).length;
    const total = 12; // Nombre total de fonctions Excel

    return {
      completed,
      total,
      percentage: total > 0 ? (completed / total) * 100 : 0,
    };
  }, [speedDatingProgress]);

  const getHackathonCompletion = useCallback((): {
    currentLevel: number;
    maxLevel: number;
    percentage: number;
  } => {
    const maxLevel = 7; // Nombre total de niveaux du hackathon
    const currentLevel = hackathonProgress.currentLevel;

    return {
      currentLevel,
      maxLevel,
      percentage: maxLevel > 0 ? (currentLevel / maxLevel) * 100 : 0,
    };
  }, [hackathonProgress]);

  return {
    speedDatingProgress,
    hackathonProgress,
    updateSpeedDatingProgress,
    updateHackathonProgress,
    getTotalScore,
    getSpeedDatingCompletion,
    getHackathonCompletion,
    refreshProgress,
  };
};

// Hook pour les notifications de progression
export const useProgressNotifications = () => {
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      message: string;
      type: "success" | "achievement" | "milestone" | "warning";
      timestamp: Date;
    }>
  >([]);

  const addNotification = useCallback(
    (
      message: string,
      type: "success" | "achievement" | "milestone" | "warning" = "success"
    ) => {
      const notification = {
        id: `notification_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        message,
        type,
        timestamp: new Date(),
      };

      setNotifications((prev) => [...prev, notification].slice(-5)); // Garder seulement les 5 dernières

      // Auto-suppression après 5 secondes
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== notification.id)
        );
      }, 5000);
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
  };
};
