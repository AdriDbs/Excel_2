import React, { useState, useEffect } from "react";
import {
  Settings,
  Users,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  BarChart3,
  Trophy,
  Clock,
  Target,
  X,
  AlertTriangle,
  CheckCircle,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Wifi,
  WifiOff,
  Eye,
  ChevronDown,
  ChevronUp,
  Activity,
  History,
} from "lucide-react";
import { firebaseDataService } from "../../services/firebaseDataService";
import { Student, Instructor, UserStats, DeviceInfo, ConnectionLog } from "../../types/database";
import { getAllRegisteredStudents, unregisterStudent } from "./Hackathon/services/hackathonService";

interface InstructorDashboardProps {
  currentUser: Instructor;
  onClose: () => void;
}

const InstructorDashboard: React.FC<InstructorDashboardProps> = ({
  currentUser,
  onClose,
}) => {
  const [users, setUsers] = useState<(Student | Instructor)[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"stats" | "users" | "sessions" | "settings">("stats");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<Student | Instructor | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [hackathonProfiles, setHackathonProfiles] = useState<any[]>([]);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  useEffect(() => {
    refreshData();

    // Synchronisation automatique toutes les 3 secondes
    const interval = setInterval(() => {
      refreshData();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    setIsLoading(true);

    // Définir les opérations avec leurs noms pour le suivi des erreurs
    const operations = [
      {
        name: "Synchronisation Firebase",
        fn: () => firebaseDataService.forceSync(),
        onSuccess: () => {},
      },
      {
        name: "Mise à jour des statuts en ligne",
        fn: () => firebaseDataService.updateOnlineStatuses(),
        onSuccess: () => {},
      },
      {
        name: "Chargement des utilisateurs",
        fn: () => firebaseDataService.getAllUsers(),
        onSuccess: (result: any) => setUsers(result),
      },
      {
        name: "Chargement des statistiques",
        fn: () => firebaseDataService.getStats(),
        onSuccess: (result: any) => setStats(result),
      },
      {
        name: "Chargement du classement",
        fn: () => firebaseDataService.getLeaderboard().then((data) => data.slice(0, 10)),
        onSuccess: (result: any) => setLeaderboard(result),
      },
      {
        name: "Chargement des profils hackathon",
        fn: () => getAllRegisteredStudents(),
        onSuccess: (result: any) => setHackathonProfiles(result),
      },
    ];

    // Exécuter toutes les opérations en parallèle
    const results = await Promise.allSettled(operations.map((op) => op.fn()));

    // Analyser les résultats
    const errors: string[] = [];
    let successCount = 0;

    results.forEach((result, index) => {
      const operation = operations[index];

      if (result.status === "fulfilled") {
        successCount++;
        // Appeler le callback onSuccess si l'opération a réussi
        operation.onSuccess(result.value);
      } else {
        // Collecter les erreurs avec contexte
        const errorMessage = result.reason instanceof Error
          ? result.reason.message
          : String(result.reason);

        errors.push(`${operation.name}: ${errorMessage}`);

        console.error(`[InstructorDashboard] ${operation.name} failed:`, {
          error: errorMessage,
          operation: operation.name,
        });
      }
    });

    // Afficher les notifications d'erreur si nécessaire
    if (errors.length > 0) {
      if (errors.length === operations.length) {
        // Toutes les opérations ont échoué
        showNotification(
          "Échec complet du chargement des données. Vérifiez votre connexion.",
          "error"
        );
      } else {
        // Certaines opérations ont échoué
        const errorSummary = `${successCount}/${operations.length} opérations réussies. Erreurs: ${errors.join("; ")}`;
        console.warn("[InstructorDashboard] Partial data load:", errorSummary);

        // Afficher un message plus court à l'utilisateur
        showNotification(
          `Chargement partiel (${successCount}/${operations.length} réussis). Voir console pour détails.`,
          "error"
        );
      }
    }

    setIsLoading(false);
  };

  const showNotification = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleResetDatabase = async () => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir réinitialiser toute la base de données ? Cette action est irréversible."
      )
    ) {
      await firebaseDataService.resetDatabase();
      await refreshData();
      showNotification("Base de données réinitialisée avec succès", "success");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (await firebaseDataService.deleteUser(userId)) {
      await refreshData();
      showNotification("Utilisateur supprimé avec succès", "success");
    } else {
      showNotification(
        "Erreur lors de la suppression de l'utilisateur",
        "error"
      );
    }
    setShowDeleteConfirm(null);
  };

  const handleExportData = async () => {
    try {
      const data = await firebaseDataService.exportData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bearingpoint_excel_training_${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showNotification("Données exportées avec succès", "success");
    } catch (error) {
      showNotification("Erreur lors de l'export des données", "error");
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result as string;
        if (await firebaseDataService.importData(data)) {
          await refreshData();
          showNotification("Données importées avec succès", "success");
        } else {
          showNotification("Erreur lors de l'import des données", "error");
        }
      } catch (error) {
        showNotification("Fichier invalide", "error");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const getOnlineUsers = () => {
    return users.filter(user => {
      const lastActivity = new Date(user.lastActivity).getTime();
      return Date.now() - lastActivity < 2 * 60 * 1000;
    });
  };

  const getDeviceIcon = (deviceInfo?: DeviceInfo) => {
    if (!deviceInfo) return <Monitor size={16} className="text-gray-400" />;

    switch (deviceInfo.deviceType) {
      case "mobile":
        return <Smartphone size={16} className="text-blue-500" />;
      case "tablet":
        return <Tablet size={16} className="text-purple-500" />;
      default:
        return <Monitor size={16} className="text-green-500" />;
    }
  };

  const getOnlineStatus = (user: Student | Instructor) => {
    const lastActivity = new Date(user.lastActivity).getTime();
    const diffMs = Date.now() - lastActivity;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 2) {
      return { status: "online", label: "En ligne", color: "bg-green-500", animate: true };
    } else if (diffMins < 30) {
      return { status: "idle", label: `Inactif (${diffMins} min)`, color: "bg-yellow-500", animate: false };
    } else {
      return { status: "offline", label: "Hors ligne", color: "bg-gray-400", animate: false };
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString("fr-FR");
  };

  const toggleUserExpand = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const toggleSessionExpand = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const handleRemoveStudentFromSession = async (sessionId: string, userId: string, teamId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir retirer cet étudiant de la session ?")) {
      const result = await unregisterStudent(sessionId, userId, teamId);
      if (result) {
        showNotification("Étudiant retiré de la session avec succès", "success");
        await refreshData();
      } else {
        showNotification("Erreur lors du retrait de l'étudiant", "error");
      }
    }
  };

  const onlineUsers = getOnlineUsers();
  const students = users.filter(u => u.role === "student") as Student[];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-bp-red-600 to-bp-red-400 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings size={28} />
            <div>
              <h2 className="text-2xl font-bold">Dashboard Instructeur</h2>
              <p className="text-bp-red-100">Bienvenue, {currentUser.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Indicateur utilisateurs en ligne */}
            <div className="bg-white/20 rounded-lg px-4 py-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="font-medium">{onlineUsers.length} en ligne</span>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 transition-colors duration-200"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`px-6 py-3 ${
              notification.type === "success"
                ? "bg-green-50 text-green-800 border-l-4 border-green-500"
                : notification.type === "error"
                ? "bg-red-100 text-red-800 border-l-4 border-red-500"
                : "bg-blue-100 text-blue-800 border-l-4 border-blue-500"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" && <CheckCircle size={20} />}
              {notification.type === "error" && <AlertTriangle size={20} />}
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: "stats", label: "Statistiques", icon: <BarChart3 size={20} /> },
              { id: "users", label: "Utilisateurs", icon: <Users size={20} /> },
              { id: "sessions", label: "Sessions & Connexions", icon: <Activity size={20} /> },
              { id: "settings", label: "Paramètres", icon: <Settings size={20} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "text-bp-red-500 border-b-2 border-bp-red-500 bg-bp-red-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Statistiques */}
          {activeTab === "stats" && stats && (
            <div className="space-y-6">
              {/* Cartes de statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="text-blue-600" size={20} />
                    <h3 className="font-semibold text-blue-800">Total Utilisateurs</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="text-green-600" size={20} />
                    <h3 className="font-semibold text-green-800">Étudiants</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-900">{stats.totalStudents}</p>
                </div>

                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Wifi className="text-emerald-600" size={20} />
                    <h3 className="font-semibold text-emerald-800">En Ligne</h3>
                  </div>
                  <p className="text-2xl font-bold text-emerald-900">{onlineUsers.length}</p>
                </div>

                <div className="bg-bp-red-50 p-4 rounded-lg border border-bp-red-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="text-bp-red-500" size={20} />
                    <h3 className="font-semibold text-bp-red-600">Actifs Aujourd'hui</h3>
                  </div>
                  <p className="text-2xl font-bold text-bp-red-700">{stats.activeToday}</p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="text-yellow-600" size={20} />
                    <h3 className="font-semibold text-yellow-800">Speed Dating</h3>
                  </div>
                  <p className="text-2xl font-bold text-yellow-900">
                    {stats.completionRates.speedDating.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Utilisateurs en ligne en temps réel */}
              {onlineUsers.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                    <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Utilisateurs en ligne ({onlineUsers.length})
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-3">
                      {onlineUsers.map(user => (
                        <div
                          key={user.id}
                          className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200"
                        >
                          {getDeviceIcon(user.deviceInfo)}
                          <span className="font-medium">{user.name}</span>
                          {user.deviceInfo && (
                            <span className="text-xs text-gray-500">
                              ({user.deviceInfo.browser})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Leaderboard */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Trophy className="text-yellow-500" size={20} />
                    Classement des Étudiants
                  </h3>
                </div>
                <div className="p-4">
                  {leaderboard.length > 0 ? (
                    <div className="space-y-2">
                      {leaderboard.map((student, index) => (
                        <div
                          key={student.name}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            index === 0
                              ? "bg-yellow-50 border border-yellow-200"
                              : index === 1
                              ? "bg-gray-50 border border-gray-200"
                              : index === 2
                              ? "bg-orange-50 border border-orange-200"
                              : "bg-gray-25"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`font-bold text-lg ${
                                index === 0
                                  ? "text-yellow-600"
                                  : index === 1
                                  ? "text-gray-600"
                                  : index === 2
                                  ? "text-orange-600"
                                  : "text-gray-500"
                              }`}
                            >
                              #{index + 1}
                            </span>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-gray-500">
                                Speed Dating: {student.speedDatingCompleted}/12 |
                                Hackathon: Niveau {student.hackathonLevel}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{student.totalScore}</p>
                            <p className="text-xs text-gray-500">points</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      Aucun étudiant enregistré
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Utilisateurs */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Gestion des Utilisateurs ({users.length})
                </h3>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <div className="w-2 h-2 bg-bp-red-500 rounded-full animate-pulse"></div>
                      Synchronisation automatique
                    </span>
                  </div>
                  <button
                    onClick={refreshData}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-bp-red-400 hover:bg-bp-red-500 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    <RefreshCw
                      size={16}
                      className={isLoading ? "animate-spin" : ""}
                    />
                    Actualiser
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {users.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Nom
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Appareil
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Dernière Activité
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Progression
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => {
                          const status = getOnlineStatus(user);
                          return (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-3 h-3 rounded-full ${status.color} ${
                                      status.animate ? "animate-pulse" : ""
                                    }`}
                                  />
                                  <span className="text-xs text-gray-500">{status.label}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{user.name}</span>
                                  <span
                                    className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                                      user.role === "instructor"
                                        ? "bg-bp-red-50 text-bp-red-600"
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    {user.role === "instructor" ? "Instructeur" : "Étudiant"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                {user.deviceInfo ? (
                                  <div className="flex items-center gap-2">
                                    {getDeviceIcon(user.deviceInfo)}
                                    <div className="text-sm">
                                      <div>{user.deviceInfo.browser} {user.deviceInfo.browserVersion}</div>
                                      <div className="text-xs text-gray-500">
                                        {user.deviceInfo.os} • {user.deviceInfo.screenResolution}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">Non disponible</span>
                                )}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div>{formatRelativeTime(user.lastActivity)}</div>
                                <div className="text-xs text-gray-400">
                                  {formatDateTime(user.lastActivity)}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">
                                {user.role === "student" ? (
                                  <div>
                                    <p>
                                      Speed Dating:{" "}
                                      {
                                        Object.values(
                                          (user as Student).speedDatingProgress || {}
                                        ).filter((p) => p.completed).length
                                      }/12
                                    </p>
                                    <p>
                                      Hackathon: Niveau{" "}
                                      {(user as Student).hackathonProgress?.currentLevel || 0}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setSelectedUser(user)}
                                    className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                    title="Voir détails"
                                  >
                                    <Eye size={16} />
                                  </button>
                                  {user.id !== currentUser.id && (
                                    <button
                                      onClick={() => setShowDeleteConfirm(user.id)}
                                      className="text-red-600 hover:text-red-800 transition-colors duration-200"
                                      title="Supprimer"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Aucun utilisateur enregistré</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sessions & Connexions */}
          {activeTab === "sessions" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Suivi des Sessions et Connexions
                </h3>
                <button
                  onClick={refreshData}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-bp-red-400 hover:bg-bp-red-500 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                  Actualiser
                </button>
              </div>

              {/* Profils des Sessions Hackathon */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
                  <h4 className="font-semibold text-purple-800 flex items-center gap-2">
                    <Users size={18} />
                    Profils des Sessions Hackathon ({hackathonProfiles.reduce((sum, session) => sum + session.students.length, 0)})
                  </h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {hackathonProfiles.length > 0 ? (
                    hackathonProfiles.map((session) => {
                      const isExpanded = expandedSessions.has(session.sessionId);
                      return (
                        <div key={session.sessionId}>
                          <button
                            onClick={() => toggleSessionExpand(session.sessionId)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${session.isActive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                              <div className="text-left">
                                <p className="font-medium">{session.sessionName}</p>
                                <p className="text-xs text-gray-500">
                                  {session.students.length} participant(s) • {session.isActive ? "Active" : "Terminée"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${session.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                {session.isActive ? "En cours" : "Archivée"}
                              </span>
                              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="px-4 pb-4 bg-purple-50">
                              <div className="space-y-2">
                                {session.students.map((student: any) => (
                                  <div
                                    key={student.id}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100"
                                  >
                                    <div className="flex items-center gap-3">
                                      <Target size={16} className="text-purple-500" />
                                      <div>
                                        <p className="font-medium text-gray-800">{student.name}</p>
                                        <p className="text-xs text-gray-500">
                                          {student.teamName} • {student.hintsUsed.length} indice(s) utilisé(s)
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => {
                                          setSelectedUser({
                                            ...student,
                                            role: "student",
                                            createdAt: new Date().toISOString(),
                                            lastActivity: new Date().toISOString(),
                                          } as any);
                                        }}
                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                        title="Voir détails"
                                      >
                                        <Eye size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleRemoveStudentFromSession(session.sessionId, student.id, student.teamId)}
                                        className="text-red-600 hover:text-red-800 transition-colors"
                                        title="Retirer de la session"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Users size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Aucun profil dans les sessions hackathon</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Vue temps réel */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Utilisateurs en ligne */}
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                    <h4 className="font-semibold text-green-800 flex items-center gap-2">
                      <Wifi size={18} />
                      Connexions Actives ({onlineUsers.length})
                    </h4>
                  </div>
                  <div className="p-4 max-h-64 overflow-y-auto">
                    {onlineUsers.length > 0 ? (
                      <div className="space-y-3">
                        {onlineUsers.map(user => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100"
                          >
                            <div className="flex items-center gap-3">
                              {getDeviceIcon(user.deviceInfo)}
                              <div>
                                <p className="font-medium">{user.name}</p>
                                {user.deviceInfo && (
                                  <p className="text-xs text-gray-500">
                                    {user.deviceInfo.browser} • {user.deviceInfo.os} • {user.deviceInfo.screenResolution}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right text-sm">
                              <div className="text-green-600 font-medium">En ligne</div>
                              <div className="text-xs text-gray-500">
                                {formatRelativeTime(user.lastActivity)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <WifiOff size={32} className="mx-auto mb-2 opacity-50" />
                        <p>Aucun utilisateur en ligne</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Activité récente */}
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                    <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                      <Activity size={18} />
                      Activité Récente
                    </h4>
                  </div>
                  <div className="p-4 max-h-64 overflow-y-auto">
                    {users
                      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
                      .slice(0, 10)
                      .map(user => {
                        const status = getOnlineStatus(user);
                        return (
                          <div
                            key={user.id}
                            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${status.color}`} />
                              <span className="font-medium">{user.name}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatRelativeTime(user.lastActivity)}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Historique détaillé par utilisateur */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <History size={18} />
                    Historique des Connexions par Utilisateur
                  </h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {students.map(student => {
                    const isExpanded = expandedUsers.has(student.id);
                    const status = getOnlineStatus(student);

                    return (
                      <div key={student.id}>
                        <button
                          onClick={() => toggleUserExpand(student.id)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${status.color} ${status.animate ? "animate-pulse" : ""}`} />
                            {getDeviceIcon(student.deviceInfo)}
                            <div className="text-left">
                              <p className="font-medium">{student.name}</p>
                              <p className="text-xs text-gray-500">
                                {student.deviceInfo
                                  ? `${student.deviceInfo.browser} • ${student.deviceInfo.os}`
                                  : "Informations non disponibles"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-600">{status.label}</p>
                              <p className="text-xs text-gray-400">
                                {student.connectionHistory?.length || 0} connexions
                              </p>
                            </div>
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </div>
                        </button>

                        {isExpanded && student.connectionHistory && student.connectionHistory.length > 0 && (
                          <div className="px-4 pb-4 bg-gray-50">
                            <div className="ml-6 border-l-2 border-gray-300 pl-4 space-y-2">
                              {student.connectionHistory.slice(-10).reverse().map((log, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-3 text-sm py-2"
                                >
                                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5" />
                                  <div>
                                    <p className="text-gray-700">
                                      {log.action === "login" ? "Connexion" : "Activité"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatDateTime(log.timestamp)}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {log.deviceInfo.browser} • {log.deviceInfo.os} • {log.deviceInfo.screenResolution}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Paramètres */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Paramètres de la Base de Données
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export/Import */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-md font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Download size={20} />
                    Sauvegarde des Données
                  </h4>
                  <div className="space-y-3">
                    <button
                      onClick={handleExportData}
                      className="w-full bg-bp-red-400 hover:bg-bp-red-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
                    >
                      <Download size={16} />
                      Exporter les données
                    </button>

                    <label className="w-full bg-bp-red-500 hover:bg-bp-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 cursor-pointer">
                      <Upload size={16} />
                      Importer les données
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportData}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    Sauvegardez régulièrement les données de progression des étudiants.
                  </p>
                </div>

                {/* Réinitialisation */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-md font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <AlertTriangle size={20} className="text-red-500" />
                    Zone Dangereuse
                  </h4>
                  <button
                    onClick={handleResetDatabase}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
                  >
                    <Trash2 size={16} />
                    Réinitialiser la base de données
                  </button>
                  <p className="text-sm text-gray-500 mt-3">
                    Cette action supprimera définitivement tous les utilisateurs et leurs progressions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal détails utilisateur */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Détails de {selectedUser.name}
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Informations générales */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Informations</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rôle:</span>
                    <span className="font-medium">
                      {selectedUser.role === "instructor" ? "Instructeur" : "Étudiant"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Créé le:</span>
                    <span>{formatDateTime(selectedUser.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dernière activité:</span>
                    <span>{formatDateTime(selectedUser.lastActivity)}</span>
                  </div>
                </div>
              </div>

              {/* Appareil actuel */}
              {selectedUser.deviceInfo && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                    {getDeviceIcon(selectedUser.deviceInfo)}
                    Appareil Actuel
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Navigateur:</span>
                      <span>{selectedUser.deviceInfo.browser} {selectedUser.deviceInfo.browserVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Système:</span>
                      <span>{selectedUser.deviceInfo.os} {selectedUser.deviceInfo.osVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Écran:</span>
                      <span>{selectedUser.deviceInfo.screenResolution}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Langue:</span>
                      <span>{selectedUser.deviceInfo.language}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Progression (étudiants) */}
              {selectedUser.role === "student" && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                    <Trophy size={18} />
                    Progression
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Speed Dating:</span>
                      <span>
                        {Object.values((selectedUser as Student).speedDatingProgress || {}).filter(p => p.completed).length}/12 complétés
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Score Speed Dating:</span>
                      <span>
                        {Object.values((selectedUser as Student).speedDatingProgress || {}).reduce((sum, p) => sum + (p.score || 0), 0)} pts
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Hackathon:</span>
                      <span>Niveau {(selectedUser as Student).hackathonProgress?.currentLevel || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Score Hackathon:</span>
                      <span>{(selectedUser as Student).hackathonProgress?.totalScore || 0} pts</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Historique des connexions */}
              {selectedUser.connectionHistory && selectedUser.connectionHistory.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <History size={18} />
                    Historique Récent ({selectedUser.connectionHistory.length} entrées)
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedUser.connectionHistory.slice(-5).reverse().map((log, index) => (
                      <div key={index} className="text-sm border-l-2 border-blue-300 pl-3 py-1">
                        <p className="font-medium">
                          {log.action === "login" ? "Connexion" : "Activité"}
                        </p>
                        <p className="text-xs text-gray-500">{formatDateTime(log.timestamp)}</p>
                        <p className="text-xs text-gray-400">
                          {log.deviceInfo.browser} • {log.deviceInfo.os}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="mt-6 w-full bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-4">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
