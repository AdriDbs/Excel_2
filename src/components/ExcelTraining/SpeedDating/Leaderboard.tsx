import React, { memo, useMemo, useState, useEffect } from "react";
import { X, Trophy, Medal, Wifi, WifiOff, RefreshCw, Clock, Monitor, Smartphone, Tablet } from "lucide-react";
import { ExcelFunction, LeaderboardParticipant } from "../types";
import { firebaseDataService } from "../../../services/firebaseDataService";
import { Student, DeviceInfo } from "../../../types/database";

interface LeaderboardProps {
  leaderboardData: LeaderboardParticipant[];
  onClose: () => void;
  excelFunctions?: ExcelFunction[];
  userName?: string;
}

interface EnhancedParticipant extends LeaderboardParticipant {
  isOnline?: boolean;
  deviceInfo?: DeviceInfo;
  lastActivity?: string;
  totalScore?: number;
}

const Leaderboard: React.FC<LeaderboardProps> = memo(({
  leaderboardData,
  onClose,
  excelFunctions = [],
  userName = "",
}) => {
  const [enhancedData, setEnhancedData] = useState<EnhancedParticipant[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Enrichir les données avec les infos de connexion
  useEffect(() => {
    const enrichData = async () => {
      const students = await firebaseDataService.getStudents();
      const studentMap = new Map<string, Student>();

      students.forEach(student => {
        studentMap.set(student.name.toLowerCase(), student);
      });

      const enriched = leaderboardData.map(participant => {
        const student = studentMap.get(participant.name.toLowerCase());
        const isCurrentUser = userName && participant.name.toLowerCase() === userName.toLowerCase();

        if (student) {
          const lastActivity = new Date(student.lastActivity).getTime();
          const isOnline = isCurrentUser || Date.now() - lastActivity < 2 * 60 * 1000;

          const totalScore = Object.values(student.speedDatingProgress || {})
            .reduce((sum, p) => sum + (p.score || 0), 0);

          return {
            ...participant,
            isOnline,
            deviceInfo: student.deviceInfo,
            lastActivity: student.lastActivity,
            totalScore,
          };
        }

        // L'utilisateur courant est toujours en ligne
        if (isCurrentUser) {
          return {
            ...participant,
            isOnline: true,
          };
        }

        return participant;
      });

      setEnhancedData(enriched);
      setLastUpdate(new Date());
    };

    enrichData();

    // Rafraîchir toutes les 5 secondes
    const interval = setInterval(enrichData, 5000);
    return () => clearInterval(interval);
  }, [leaderboardData]);

  const sortedLeaderboard = useMemo(
    () => [...enhancedData].sort((a, b) => {
      // Trier par nombre de fonctions complétées, puis par score
      if (b.completed !== a.completed) {
        return b.completed - a.completed;
      }
      return (b.totalScore || 0) - (a.totalScore || 0);
    }),
    [enhancedData]
  );

  const totalFunctions = excelFunctions.length > 0 ? excelFunctions.length : 12;
  const onlineCount = enhancedData.filter(p => p.isOnline).length;

  const getPositionStyle = (index: number) => {
    if (index === 0) return "bg-yellow-500 text-white";
    if (index === 1) return "bg-gray-400 text-white";
    if (index === 2) return "bg-orange-500 text-white";
    return "bg-bp-gray-100 text-bp-gray-500";
  };

  const getDeviceIcon = (deviceInfo?: DeviceInfo) => {
    if (!deviceInfo) return null;

    switch (deviceInfo.deviceType) {
      case "mobile":
        return <Smartphone size={14} className="text-blue-500" />;
      case "tablet":
        return <Tablet size={14} className="text-purple-500" />;
      default:
        return <Monitor size={14} className="text-green-500" />;
    }
  };

  const formatLastActivity = (dateString?: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await firebaseDataService.forceSync();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="fixed inset-0 bg-bp-red-700/95 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white text-gray-900 rounded-xl shadow-bp-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-bp-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="text-bp-red-400" size={28} />
              <h2 className="text-2xl font-bold text-bp-red-600">Leaderboard</h2>
            </div>
            <button
              onClick={onClose}
              className="bg-bp-gray-100 hover:bg-bp-gray-200 text-bp-gray-500 p-2 rounded-full transition-colors"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Barre de statut */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              {/* Participants en ligne */}
              <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-700 font-medium">
                  {onlineCount} en ligne
                </span>
              </div>

              {/* Total participants */}
              <div className="flex items-center gap-2 text-bp-gray-500">
                <span>{sortedLeaderboard.length} participants</span>
              </div>
            </div>

            {/* Bouton rafraîchir */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-bp-gray-400">
                Mis à jour {formatLastActivity(lastUpdate.toISOString())}
              </span>
              <button
                onClick={handleRefresh}
                className="p-1.5 hover:bg-bp-gray-100 rounded-full transition-colors"
                title="Rafraîchir"
              >
                <RefreshCw
                  size={16}
                  className={`text-bp-gray-400 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Tableau */}
          <div className="overflow-hidden rounded-lg border border-bp-gray-100 mb-6">
            <table className="min-w-full divide-y divide-bp-gray-100">
              <thead className="bg-bp-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-bp-gray-400 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-bp-gray-400 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-bp-gray-400 uppercase tracking-wider">
                    Progression
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-bp-gray-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-bp-gray-400 uppercase tracking-wider">
                    Temps
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-bp-gray-100">
                {sortedLeaderboard.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-bp-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Trophy size={32} className="text-bp-gray-300" />
                        <p className="font-medium">Aucun participant pour le moment</p>
                        <p className="text-sm">Completez votre premiere fonction pour apparaitre ici !</p>
                      </div>
                    </td>
                  </tr>
                )}
                {sortedLeaderboard.map((participant, index) => (
                  <tr
                    key={participant.name}
                    className={`${
                      participant.name === userName
                        ? "bg-bp-red-50 border-l-4 border-bp-red-400"
                        : ""
                    } ${
                      participant.isOnline
                        ? "bg-green-50/30"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${getPositionStyle(index)}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {/* Indicateur en ligne */}
                        {participant.isOnline !== undefined && (
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${
                              participant.isOnline
                                ? "bg-green-500 animate-pulse"
                                : "bg-gray-300"
                            }`}
                            title={participant.isOnline ? "En ligne" : "Hors ligne"}
                          />
                        )}

                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${
                              participant.name === userName
                                ? "text-bp-red-600"
                                : "text-bp-red-700"
                            }`}>
                              {participant.name}
                              {participant.name === userName && (
                                <span className="ml-2 text-xs bg-bp-red-100 text-bp-red-600 px-2 py-0.5 rounded-full">
                                  Vous
                                </span>
                              )}
                            </span>
                            {getDeviceIcon(participant.deviceInfo)}
                          </div>

                          {participant.deviceInfo && (
                            <div className="text-xs text-bp-gray-400 mt-0.5">
                              {participant.deviceInfo.browser} • {participant.deviceInfo.os}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-bp-gray-500">
                          {participant.completed} / {totalFunctions}
                        </span>
                        <div className="w-20 bg-bp-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              participant.completed === totalFunctions
                                ? "bg-green-500"
                                : "bg-bp-red-400"
                            }`}
                            style={{ width: `${(participant.completed / totalFunctions) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className="font-bold text-bp-red-600">
                        {participant.totalScore || 0}
                      </span>
                      <span className="text-bp-gray-400 text-xs ml-1">pts</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-bp-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{participant.totalTime}</span>
                      </div>
                      {participant.lastActivity && (
                        <div className="text-xs text-bp-gray-300 mt-0.5">
                          {formatLastActivity(participant.lastActivity)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fonctions maîtrisées */}
          {excelFunctions.length > 0 && (
            <div className="bg-bp-red-50 rounded-lg p-4 border border-bp-red-100">
              <h3 className="font-bold text-bp-red-600 mb-3 flex items-center gap-2">
                <Trophy size={18} />
                Fonctions maîtrisées par les participants
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {excelFunctions.map((func, index) => {
                  const completedBy = sortedLeaderboard.filter(
                    p => (p.completedFunctions || []).includes(index)
                  );
                  const onlineCompletedBy = completedBy.filter(p => p.isOnline);

                  return (
                    <div key={func.name} className="flex items-center gap-2 bg-white/50 p-2 rounded-lg">
                      <div className="text-xl">{func.avatar}</div>
                      <div className="flex-1 text-sm">
                        <div className="font-medium text-bp-red-700">{func.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-0.5">
                            {completedBy.slice(0, 5).map((participant) => (
                              <div
                                key={participant.name}
                                className={`w-2 h-2 rounded-full ${
                                  participant.isOnline
                                    ? "bg-green-500"
                                    : "bg-bp-red-300"
                                }`}
                                title={`${participant.name}${participant.isOnline ? " (en ligne)" : ""}`}
                              />
                            ))}
                            {completedBy.length > 5 && (
                              <span className="text-xs text-bp-gray-400 ml-1">
                                +{completedBy.length - 5}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-bp-gray-400">
                            {completedBy.length} participant{completedBy.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Légende */}
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-bp-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>En ligne</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-gray-300 rounded-full" />
              <span>Hors ligne</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Monitor size={12} />
              <span>PC</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Smartphone size={12} />
              <span>Mobile</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tablet size={12} />
              <span>Tablette</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Leaderboard.displayName = "Leaderboard";

export default Leaderboard;
