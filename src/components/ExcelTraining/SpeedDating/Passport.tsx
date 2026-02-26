import React, { memo, useMemo } from "react";
import { CheckSquare, X } from "lucide-react";
import { ExcelFunction } from "../types";

interface PassportProps {
  excelFunctions: ExcelFunction[];
  completedFunctions: number[];
  onClose: () => void;
  userName: string;
}

const Passport: React.FC<PassportProps> = memo(({
  excelFunctions,
  completedFunctions,
  onClose,
  userName,
}) => {
  const progressPercentage = useMemo(
    () => (completedFunctions.length / excelFunctions.length) * 100,
    [completedFunctions.length, excelFunctions.length]
  );

  return (
    <div className="fixed inset-0 bg-bp-red-700/95 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-bp-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-bp-gray-100 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-bp-red-600">
              Passeport des Fonctions Excel
            </h2>
            <p className="text-bp-gray-400 text-sm">{userName}</p>
          </div>
          <button
            onClick={onClose}
            className="bg-bp-gray-100 hover:bg-bp-gray-200 text-bp-gray-500 p-2 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {excelFunctions.map((func, index) => {
              const isCompleted = completedFunctions.includes(index);
              return (
                <div
                  key={func.name}
                  className={`border-2 rounded-lg p-4 relative transition-all ${
                    isCompleted
                      ? "border-bp-red-500 bg-bp-red-50"
                      : "border-bp-gray-200 bg-bp-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{func.avatar}</span>
                    <div>
                      <h3 className="font-bold text-bp-red-700">{func.name}</h3>
                      <p className="text-sm text-bp-gray-400">{func.superpower}</p>
                    </div>
                  </div>
                  {isCompleted && (
                    <CheckSquare
                      className="absolute top-2 right-2 text-bp-red-500"
                      size={24}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-bp-gray-50 rounded-lg">
            <p className="text-lg font-bold text-bp-red-600 text-center">
              Progression: {completedFunctions.length} / {excelFunctions.length} fonctions
            </p>
            <div className="w-full bg-bp-gray-200 rounded-full h-4 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-bp-red-500 to-bp-red-400 h-4 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Passport.displayName = "Passport";

export default Passport;
