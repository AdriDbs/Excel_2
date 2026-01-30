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
} from "lucide-react";
import { databaseService } from "../../services/databaseService";
import { Student, Instructor, UserStats } from "../../types/database";

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
  const [activeTab, setActiveTab] = useState<"users" | "stats" | "settings">(
    "stats"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  useEffect(() => {
    refreshData();

    // Synchronisation automatique toutes les 3 secondes pour voir les changements d'autres navigateurs
    const interval = setInterval(() => {
      refreshData();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    setIsLoading(true);
    try {
      // Forcer la synchronisation avant de charger les données
      databaseService.forcSync();

      const allUsers = databaseService.getAllUsers();
      const userStats = databaseService.getStats();

      setUsers(allUsers);
      setStats(userStats);

      showNotification("Données actualisées avec succès", "success");
    } catch (error) {
      showNotification("Erreur lors du chargement des données", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleResetDatabase = () => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir réinitialiser toute la base de données ? Cette action est irréversible."
      )
    ) {
      databaseService.resetDatabase();
      refreshData();
      showNotification("Base de données réinitialisée avec succès", "success");
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (databaseService.deleteUser(userId)) {
      refreshData();
      showNotification("Utilisateur supprimé avec succès", "success");
    } else {
      showNotification(
        "Erreur lors de la suppression de l'utilisateur",
        "error"
      );
    }
    setShowDeleteConfirm(null);
  };

  const handleExportData = () => {
    try {
      const data = databaseService.exportData();
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
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        if (databaseService.importData(data)) {
          refreshData();
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

  const getLeaderboard = () => {
    return databaseService.getLeaderboard().slice(0, 10);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-bearing-red-70 to-bearing-red text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings size={28} />
            <div>
              <h2 className="text-2xl font-bold">Dashboard Instructeur</h2>
              <p className="text-bearing-red-20">Bienvenue, {currentUser.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-red-200 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`px-6 py-3 ${
              notification.type === "success"
                ? "bg-bearing-red-10 text-bearing-red-70 border-l-4 border-green-500"
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
              {
                id: "stats",
                label: "Statistiques",
                icon: <BarChart3 size={20} />,
              },
              { id: "users", label: "Utilisateurs", icon: <Users size={20} /> },
              {
                id: "settings",
                label: "Paramètres",
                icon: <Settings size={20} />,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "text-bearing-red-60 border-b-2 border-bearing-red-60 bg-bearing-red-10"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="text-blue-600" size={20} />
                    <h3 className="font-semibold text-blue-800">
                      Total Utilisateurs
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {stats.totalUsers}
                  </p>
                </div>

                <div className="bg-bearing-red-10 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="text-bearing-red-60" size={20} />
                    <h3 className="font-semibold text-bearing-red-70">Étudiants</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {stats.totalStudents}
                  </p>
                </div>

                <div className="bg-bearing-red-10 p-4 rounded-lg border border-bearing-red-20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="text-bearing-red-60" size={20} />
                    <h3 className="font-semibold text-bearing-red-70">
                      Actifs Aujourd'hui
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-bearing-red-80">
                    {stats.activeToday}
                  </p>
                </div>

                <div className="bg-bearing-gray-10 p-4 rounded-lg border border-bearing-gray-30">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="text-bearing-red" size={20} />
                    <h3 className="font-semibold text-bearing-red-70">
                      Speed Dating
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-bearing-red-80">
                    {stats.completionRates.speedDating.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Trophy className="text-yellow-500" size={20} />
                    Classement des Étudiants
                  </h3>
                </div>
                <div className="p-4">
                  {getLeaderboard().length > 0 ? (
                    <div className="space-y-2">
                      {getLeaderboard().map((student, index) => (
                        <div
                          key={student.name}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            index === 0
                              ? "bg-bearing-gray-10 border border-bearing-gray-30"
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
                                  ? "text-bearing-red"
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
                                Speed Dating: {student.speedDatingCompleted} |
                                Hackathon: Niveau {student.hackathonLevel}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              {student.totalScore}
                            </p>
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
                      <div className="w-2 h-2 bg-bearing-red-100 rounded-full animate-pulse"></div>
                      Synchronisation automatique
                    </span>
                  </div>
                  <button
                    onClick={refreshData}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-bearing-red hover:bg-bearing-red-60 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
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
                            Nom
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Rôle
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
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {user.role === "instructor" ? (
                                  <div className="w-2 h-2 bg-bearing-red-100 rounded-full"></div>
                                ) : (
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      new Date(user.lastActivity) >
                                      new Date(Date.now() - 5 * 60 * 1000)
                                        ? "bg-bearing-red-100 animate-pulse"
                                        : new Date(user.lastActivity) >
                                          new Date(Date.now() - 30 * 60 * 1000)
                                        ? "bg-bearing-gray-100"
                                        : "bg-gray-400"
                                    }`}
                                  ></div>
                                )}
                                <span className="font-medium">{user.name}</span>
                                {new Date(user.lastActivity) >
                                  new Date(Date.now() - 2 * 60 * 1000) && (
                                  <span className="text-xs bg-bearing-red-10 text-bearing-red-70 px-2 py-1 rounded-full">
                                    En ligne
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.role === "instructor"
                                    ? "bg-bearing-red-10 text-bearing-red-70"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {user.role === "instructor"
                                  ? "Instructeur"
                                  : "Étudiant"}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.lastActivity).toLocaleString(
                                "fr-FR"
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              {user.role === "student" ? (
                                <div>
                                  <p>
                                    Speed Dating:{" "}
                                    {
                                      Object.values(
                                        (user as Student).speedDatingProgress
                                      ).filter((p) => p.completed).length
                                    }{" "}
                                    complétés
                                  </p>
                                  <p>
                                    Hackathon: Niveau{" "}
                                    {
                                      (user as Student).hackathonProgress
                                        .currentLevel
                                    }
                                  </p>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right">
                              {user.id !== currentUser.id && (
                                <button
                                  onClick={() => setShowDeleteConfirm(user.id)}
                                  className="text-red-600 hover:text-red-800 transition-colors duration-200"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
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
                      className="w-full bg-bearing-red hover:bg-bearing-red-60 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
                    >
                      <Download size={16} />
                      Exporter les données
                    </button>

                    <label className="w-full bg-bearing-red-60 hover:bg-bearing-red-70 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 cursor-pointer">
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
                    Sauvegardez régulièrement les données de progression des
                    étudiants.
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
                    ⚠️ Cette action supprimera définitivement tous les
                    utilisateurs et leurs progressions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-4">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action
              est irréversible.
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
