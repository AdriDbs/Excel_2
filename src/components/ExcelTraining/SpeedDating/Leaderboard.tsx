import React, { memo, useMemo } from "react";
import { X, Trophy, Medal } from "lucide-react";
import { ExcelFunction, LeaderboardParticipant } from "../types";

interface LeaderboardProps {
  leaderboardData: LeaderboardParticipant[];
  onClose: () => void;
  excelFunctions?: ExcelFunction[];
  userName?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = memo(({
  leaderboardData,
  onClose,
  excelFunctions = [],
  userName = "",
}) => {
  const sortedLeaderboard = useMemo(
    () => [...leaderboardData].sort((a, b) => b.completed - a.completed),
    [leaderboardData]
  );

  const totalFunctions = excelFunctions.length > 0 ? excelFunctions.length : 12;

  const getPositionStyle = (index: number) => {
    if (index === 0) return "bg-bearing-red text-white";
    if (index === 1) return "bg-bearing-red-60 text-white";
    if (index === 2) return "bg-bearing-red-40 text-white";
    return "bg-bearing-gray-20 text-bearing-gray-60";
  };

  return (
    <div className="fixed inset-0 bg-bearing-red-80/95 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-bearing-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-bearing-gray-20 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Trophy className="text-bearing-red" size={28} />
            <h2 className="text-2xl font-bold text-bearing-red-70">Leaderboard</h2>
          </div>
          <button
            onClick={onClose}
            className="bg-bearing-gray-20 hover:bg-bearing-gray-30 text-bearing-gray-60 p-2 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="overflow-hidden rounded-lg border border-bearing-gray-20 mb-6">
            <table className="min-w-full divide-y divide-bearing-gray-20">
              <thead className="bg-bearing-gray-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-bearing-gray-50 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-bearing-gray-50 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-bearing-gray-50 uppercase tracking-wider">
                    Fonctions completees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-bearing-gray-50 uppercase tracking-wider">
                    Temps total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-bearing-gray-20">
                {sortedLeaderboard.map((participant, index) => (
                  <tr
                    key={participant.name}
                    className={participant.name === userName ? "bg-bearing-red-10" : ""}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${getPositionStyle(index)}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-bearing-red-80">
                      {participant.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-bearing-gray-60">
                          {participant.completed} / {totalFunctions}
                        </span>
                        <div className="w-24 bg-bearing-gray-20 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-bearing-red h-2 rounded-full transition-all"
                            style={{ width: `${(participant.completed / totalFunctions) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-bearing-gray-50">
                      {participant.totalTime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {excelFunctions.length > 0 && (
            <div className="bg-bearing-red-10 rounded-lg p-4 border border-bearing-red-20">
              <h3 className="font-bold text-bearing-red-70 mb-3">
                Fonctions maitrisees par les participants
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {excelFunctions.map((func, index) => (
                  <div key={func.name} className="flex items-center gap-2">
                    <div className="text-xl">{func.avatar}</div>
                    <div className="text-sm">
                      <div className="font-medium text-bearing-red-80">{func.name}</div>
                      <div className="flex gap-1">
                        {sortedLeaderboard.map(
                          (participant) =>
                            participant.completedFunctions.includes(index) && (
                              <div
                                key={participant.name}
                                className="w-2 h-2 rounded-full bg-bearing-red-60"
                                title={`Complete par ${participant.name}`}
                              />
                            )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

Leaderboard.displayName = "Leaderboard";

export default Leaderboard;
