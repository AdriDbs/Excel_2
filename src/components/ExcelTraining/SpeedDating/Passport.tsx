import React from "react";
import { CheckSquare } from "lucide-react";
import { ExcelFunction } from "../types";

interface PassportProps {
  excelFunctions: ExcelFunction[];
  completedFunctions: number[];
  onClose: () => void;
  userName: string;
}

const Passport = ({
  excelFunctions,
  completedFunctions,
  onClose,
  userName,
}: PassportProps) => {
  const progressPercentage =
    (completedFunctions.length / excelFunctions.length) * 100;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-800">
            Passeport des Fonctions Excel
          </h2>
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full"
          >
            Fermer
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {excelFunctions.map((func, index) => (
            <div
              key={func.name}
              className={`border-2 ${
                completedFunctions.includes(index)
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 bg-gray-50"
              } 
                rounded-lg p-4 relative`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{func.avatar}</span>
                <div>
                  <h3 className="font-bold">{func.name}</h3>
                  <p className="text-sm text-gray-600">{func.superpower}</p>
                </div>
              </div>
              {completedFunctions.includes(index) && (
                <CheckSquare
                  className="absolute top-2 right-2 text-green-600"
                  size={24}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-lg font-bold">
            Progression: {completedFunctions.length} / {excelFunctions.length}{" "}
            fonctions
          </p>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Passport;
