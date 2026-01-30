import React from "react";
import { ExcelFunction, LeaderboardParticipant } from "../types";

interface LeaderboardProps {
  leaderboardData: LeaderboardParticipant[];
  onClose: () => void;
  excelFunctions?: ExcelFunction[];
  userName?: string;
}

const Leaderboard = ({
  leaderboardData,
  onClose,
  excelFunctions = [],
  userName = "",
}: LeaderboardProps) => {
  // Tri du leaderboard par nombre de fonctions complétées
  const sortedLeaderboard = [...leaderboardData].sort(
    (a, b) => b.completed - a.completed
  );

  // Total des fonctions (utiliser excelFunctions si disponible, sinon 12 par défaut)
  const totalFunctions = excelFunctions.length > 0 ? excelFunctions.length : 12;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-auto p-6 text-gray-900">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-800">Leaderboard</h2>
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full"
          >
            Fermer
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Position
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Participant
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fonctions complétées
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Temps total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedLeaderboard.map((participant, index) => (
                <tr
                  key={participant.name}
                  className={participant.name === userName ? "bg-blue-50" : ""}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {participant.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        {participant.completed} / {totalFunctions}
                      </span>
                      <div className="ml-2 w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (participant.completed / totalFunctions) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {participant.totalTime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {excelFunctions.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-2">
              Fonctions maîtrisées par les participants
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {excelFunctions.map((func, index) => (
                <div key={func.name} className="flex items-center gap-2">
                  <div className="text-xl">{func.avatar}</div>
                  <div className="text-sm">
                    <div className="font-medium">{func.name}</div>
                    <div className="flex gap-1">
                      {sortedLeaderboard.map(
                        (participant) =>
                          participant.completedFunctions.includes(index) && (
                            <div
                              key={participant.name}
                              className="w-2 h-2 rounded-full bg-green-500"
                              title={`Complété par ${participant.name}`}
                            ></div>
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
  );
};

export default Leaderboard;
