import React from "react";
import {
  X,
  Check,
  ExternalLink,
  ChevronDown,
  TrendingUp,
  BarChart2,
  FileText,
  Database,
  Copy,
  Download,
} from "lucide-react";
import { UseCase, Function } from "./types";

interface FullscreenUseCaseOverlayProps {
  useCase: UseCase;
  onClose: () => void;
}

// Fonction pour obtenir l'icône de catégorie
const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Conseil en Stratégie":
    case "Stratégie & Transformation":
      return <TrendingUp size={24} className="text-yellow-400" />;
    case "Conseil en Management":
      return <BarChart2 size={24} className="text-yellow-400" />;
    case "Conseil en Transformation":
      return <Database size={24} className="text-yellow-400" />;
    case "Conseil IT":
      return <FileText size={24} className="text-yellow-400" />;
    default:
      return <FileText size={24} className="text-yellow-400" />;
  }
};

// Fonction pour copier dans le presse-papier
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).catch((err) => {
    console.error("Erreur lors de la copie:", err);
  });
};

const FullscreenUseCaseOverlay: React.FC<FullscreenUseCaseOverlayProps> = ({
  useCase,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-gray-800 rounded-xl max-w-6xl w-full max-h-screen overflow-auto shadow-2xl border border-yellow-700">
        <div className="sticky top-0 z-10 bg-yellow-900 bg-opacity-30 border-b border-yellow-700 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {getCategoryIcon(useCase.category)}
            <div>
              <span className="text-sm font-medium text-yellow-300">
                {useCase.category}
              </span>
              <h2 className="text-2xl font-bold text-white">{useCase.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-yellow-300 hover:text-white p-2 rounded-full hover:bg-yellow-800/50 transition-colors"
            aria-label="Fermer"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Description principale */}
              <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold mb-4 text-yellow-300">
                  Description
                </h3>
                <p className="text-gray-200 text-lg leading-relaxed mb-6">
                  {useCase.description}
                </p>

                <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 mt-6">
                  <h4 className="font-medium text-yellow-300 mb-2">
                    Contexte client
                  </h4>
                  <p className="text-white italic">"{useCase.example}"</p>
                  <p className="text-yellow-300 text-sm mt-2">
                    — {useCase.exampleSource}
                  </p>
                </div>
              </div>

              {/* Implémentation */}
              <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold mb-4 text-yellow-300">
                  Comment l'implémenter
                </h3>
                <p className="text-gray-200 leading-relaxed">
                  {useCase.implementation}
                </p>
              </div>

              {/* Bénéfices */}
              <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold mb-4 text-yellow-300">
                  Bénéfices pour le client
                </h3>
                <ul className="space-y-3">
                  {useCase.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check
                        className="text-green-400 mt-1 flex-shrink-0"
                        size={20}
                      />
                      <span className="text-gray-200">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-1">
              {/* Détails des fonctions */}
              <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-xl p-6 mb-6 sticky top-24">
                <h3 className="text-xl font-bold mb-4 text-yellow-300">
                  Fonctions Excel utilisées
                </h3>
                <div className="space-y-4">
                  {useCase.functions.map((func) => (
                    <div
                      key={func.name}
                      className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-white">{func.name}</h4>
                        {func.example && (
                          <button
                            onClick={() => copyToClipboard(func.example || "")}
                            className="text-yellow-300 hover:text-yellow-200 p-1"
                            title="Copier le code"
                          >
                            <Copy size={16} />
                          </button>
                        )}
                      </div>
                      <p className="text-yellow-200 text-sm mb-3">
                        {func.description}
                      </p>
                      {func.example && (
                        <div className="bg-yellow-900/50 p-3 rounded font-mono text-xs text-yellow-300 overflow-x-auto">
                          {func.example}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {useCase.related && (
                  <div className="mt-6 border-t border-yellow-700/50 pt-4">
                    <h4 className="font-medium text-yellow-200 mb-2">
                      Voir aussi
                    </h4>
                    <div className="flex items-center gap-2 text-yellow-300 hover:text-yellow-200 cursor-pointer">
                      <ExternalLink size={16} />
                      <span>{useCase.related}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="w-full mt-6 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullscreenUseCaseOverlay;
