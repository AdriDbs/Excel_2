import React, { memo, useMemo } from "react";
import { CheckSquare, X } from "lucide-react";
import { ExcelFunction } from "../types";
import { BRAND } from "../../../constants/brand";

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
    <div className="fixed inset-0 bg-bearing-red-80/95 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-bearing-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-bearing-gray-20 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-bearing-red-70">
              Passeport des Fonctions Excel
            </h2>
            <p className="text-bearing-gray-50 text-sm">{userName}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {excelFunctions.map((func, index) => {
              const isCompleted = completedFunctions.includes(index);
              return (
                <div
                  key={func.name}
                  className={`border-2 rounded-lg p-4 relative transition-all ${
                    isCompleted
                      ? "border-bearing-red-60 bg-bearing-red-10"
                      : "border-bearing-gray-30 bg-bearing-gray-10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{func.avatar}</span>
                    <div>
                      <h3 className="font-bold text-bearing-red-80">{func.name}</h3>
                      <p className="text-sm text-bearing-gray-50">{func.superpower}</p>
                    </div>
                  </div>
                  {isCompleted && (
                    <CheckSquare
                      className="absolute top-2 right-2 text-bearing-red-60"
                      size={24}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-bearing-gray-10 rounded-lg">
            <p className="text-lg font-bold text-bearing-red-70 text-center">
              Progression: {completedFunctions.length} / {excelFunctions.length} fonctions
            </p>
            <div className="w-full bg-bearing-gray-30 rounded-full h-4 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-bearing-red-60 to-bearing-red h-4 rounded-full transition-all duration-500 ease-out"
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
