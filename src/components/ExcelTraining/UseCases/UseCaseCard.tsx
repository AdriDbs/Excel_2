import React, { useState } from "react";
import {
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Check,
  ExternalLink,
  FileText,
  BarChart2,
  Database,
  ArrowRight,
  Maximize,
} from "lucide-react";
import { UseCase } from "./types";
import FullscreenUseCaseOverlay from "./FullscreenUseCaseOverlay";

interface UseCaseCardProps {
  useCase: UseCase;
}

const UseCaseCard: React.FC<UseCaseCardProps> = ({ useCase }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  // Function to get icon for category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Conseil en Stratégie":
      case "Stratégie & Transformation":
        return <TrendingUp size={18} className="text-yellow-400" />;
      case "Conseil en Management":
        return <BarChart2 size={18} className="text-yellow-400" />;
      case "Conseil en Transformation":
        return <Database size={18} className="text-yellow-400" />;
      case "Conseil IT":
        return <FileText size={18} className="text-yellow-400" />;
      default:
        return <FileText size={18} className="text-yellow-400" />;
    }
  };

  // Ouvrir en plein écran
  const openFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFullscreen(true);
  };

  return (
    <>
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-yellow-800/50 transition-all duration-300 hover:shadow-lg hover:border-yellow-700 h-full flex flex-col">
        {/* Card header */}
        <div className="bg-yellow-900/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            {getCategoryIcon(useCase.category)}
            <span className="text-yellow-300 text-sm font-medium">
              {useCase.category}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
            {useCase.title}
          </h3>
          <p className="text-yellow-200/80 text-sm line-clamp-2">
            {useCase.description}
          </p>
        </div>

        {/* Card content */}
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <div className="mb-3">
              <h4 className="text-yellow-300 text-sm font-medium mb-2">
                Fonctions utilisées
              </h4>
              <div className="flex flex-wrap gap-2">
                {useCase.functions.map((func) => (
                  <span
                    key={func.name}
                    className="bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded text-xs"
                  >
                    {func.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Benefits highlights */}
            <div className="text-white">
              <h4 className="text-yellow-300 text-sm font-medium mb-2">
                Bénéfices clés
              </h4>
              <ul className="space-y-1">
                {useCase.benefits.slice(0, 2).map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check
                      size={16}
                      className="text-green-400 mt-0.5 flex-shrink-0"
                    />
                    <span className="text-sm text-gray-200 line-clamp-2">
                      {benefit}
                    </span>
                  </li>
                ))}
                {useCase.benefits.length > 2 && !isExpanded && (
                  <li className="text-yellow-400/80 text-sm italic">
                    + {useCase.benefits.length - 2} autres bénéfices
                  </li>
                )}
                {isExpanded &&
                  useCase.benefits.slice(2).map((benefit, index) => (
                    <li key={index + 2} className="flex items-start gap-2">
                      <Check
                        size={16}
                        className="text-green-400 mt-0.5 flex-shrink-0"
                      />
                      <span className="text-sm text-gray-200 line-clamp-2">
                        {benefit}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Expandable content */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-yellow-800/30">
                {/* Implementation */}
                <div className="mb-4">
                  <h4 className="text-yellow-300 text-sm font-medium mb-2">
                    Comment l'implémenter
                  </h4>
                  <p className="text-gray-300 text-sm line-clamp-4">
                    {useCase.implementation}
                  </p>
                </div>

                {/* Function details */}
                <div className="mb-4">
                  <h4 className="text-yellow-300 text-sm font-medium mb-2">
                    Détails des fonctions
                  </h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {useCase.functions.map((func) => (
                      <div
                        key={func.name}
                        className="bg-yellow-900/30 p-3 rounded-lg"
                      >
                        <h5 className="font-bold text-white text-sm mb-1">
                          {func.name}
                        </h5>
                        <p className="text-yellow-200/80 text-xs line-clamp-2">
                          {func.description}
                        </p>
                        {func.example && (
                          <div className="mt-2 bg-yellow-900/50 p-2 rounded font-mono text-xs text-yellow-300 overflow-x-auto whitespace-pre-wrap line-clamp-2">
                            {func.example}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real-world example */}
                <div>
                  <h4 className="text-yellow-300 text-sm font-medium mb-2">
                    Exemple concret
                  </h4>
                  <div className="bg-yellow-900/30 p-3 rounded-lg">
                    <p className="text-gray-200 text-sm italic line-clamp-3">
                      "{useCase.example}"
                    </p>
                    <p className="text-yellow-300/80 text-xs mt-2 truncate">
                      — {useCase.exampleSource}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card actions */}
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-yellow-300 flex items-center gap-1 hover:text-yellow-200 transition-colors text-sm"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={16} />
                  Voir moins
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Voir plus
                </>
              )}
            </button>

            <div className="flex items-center gap-3">
              {useCase.related && (
                <div className="text-yellow-300/80 text-xs flex items-center gap-1 max-w-[120px] truncate">
                  <ArrowRight size={12} className="flex-shrink-0" />
                  <span className="truncate">
                    Voir aussi: {useCase.related}
                  </span>
                </div>
              )}

              {/* Bouton plein écran */}
              <button
                onClick={openFullscreen}
                className="text-yellow-300 hover:text-yellow-200 transition-colors flex-shrink-0"
                title="Ouvrir en plein écran"
              >
                <Maximize size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay plein écran */}
      {showFullscreen && (
        <FullscreenUseCaseOverlay
          useCase={useCase}
          onClose={() => setShowFullscreen(false)}
        />
      )}
    </>
  );
};

export default UseCaseCard;
