import React from "react";
import { ArrowLeft } from "lucide-react";
import { WorkInProgressSectionProps } from "../types";

// Composant pour les sections en cours de développement
const WorkInProgressSection = ({
  title,
  navigateTo,
}: WorkInProgressSectionProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigateTo("menu")}
          className="mb-8 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-all duration-300 hover:shadow-md"
        >
          <ArrowLeft size={20} />
          Retour au menu
        </button>

        <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-xl p-12 text-center">
          <h1 className="text-3xl font-bold mb-6">{title}</h1>
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-blue-800 rounded-full">
            <span className="text-5xl">⚙️</span>
          </div>
          <p className="text-xl mb-8">
            Cette section est en cours de développement.
          </p>
          <p className="text-lg text-blue-300">
            Revenez bientôt pour découvrir de nouveaux contenus!
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkInProgressSection;
