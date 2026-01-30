import React, { useState } from "react";
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  FileText,
  BarChart2,
  User,
  Users,
  Award,
  Download,
} from "lucide-react";
import DownloadFilesOverlay from "./DownloadFilesOverlay";

interface WaitingScreenProps {
  teamName: string;
  studentName: string;
  goBackToLanding: () => void;
}

const WaitingScreen: React.FC<WaitingScreenProps> = ({
  teamName,
  studentName,
  goBackToLanding,
}) => {
  const [showDownloadOverlay, setShowDownloadOverlay] = useState(false);

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      {/* Bouton de retour */}
      <button
        onClick={goBackToLanding}
        className="mb-8 bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-all duration-300 hover:shadow-md absolute top-4 left-4 z-20"
      >
        <ArrowLeft size={20} />
        Retour à l'accueil
      </button>

      {/* Fond avec effet grille */}
      <div className="fixed inset-0 bg-grid opacity-20 z-0"></div>

      <div className="max-w-4xl mx-auto pt-20 relative z-10">
        <div className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-6 text-center">
          <AlertCircle size={48} className="mx-auto text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-4">
            En attente de démarrage de session
          </h2>
          <div className="flex justify-center mb-4">
            <div className="bg-gray-800 rounded-lg px-4 py-2 inline-flex items-center">
              <Clock className="text-bearing-red mr-2" size={20} />
              <span className="text-bearing-red">
                Session en attente de démarrage par le formateur
              </span>
            </div>
          </div>
          <p className="text-yellow-200 mb-2">
            {studentName}, vous avez rejoint l'équipe{" "}
            <strong>{teamName}</strong>
          </p>
          <p className="text-gray-300 mb-4">
            Le hackathon commencera dès que le formateur lancera la session.
            Profitez de ce temps pour vous familiariser avec le scénario
            ci-dessous.
          </p>

          {/* Bouton de téléchargement */}
          <button
            onClick={() => setShowDownloadOverlay(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 mx-auto transition-all duration-300 hover:shadow-lg"
          >
            <Download size={20} />
            Télécharger les ressources
          </button>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-center text-bearing-red-40">
            Scénario du Hackathon: Le Dossier Perdu 2.0
          </h2>

          <div className="bg-bearing-red-80/20 border border-bearing-red-70/50 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-3 text-bearing-red-30">
              Mise en situation
            </h3>
            <p className="mb-4">
              Un client important, la société Nexus, attend une présentation
              cruciale demain matin concernant l'optimisation de sa chaîne
              d'approvisionnement.
            </p>
            <p className="mb-4">
              Malheureusement, votre collègue senior qui a préparé l'analyse a
              dû partir en urgence suite à un incident familial. Avant de
              partir, il a sécurisé tous ses fichiers avec un système d'énigmes
              basé sur les fonctions avancées d'Excel. De plus, les données
              brutes qu'il a collectées sont désorganisées et incomplètes.
            </p>
            <p className="text-lg font-medium text-bearing-red-30">
              Votre mission comporte trois grands défis :
            </p>
            <ol className="list-decimal pl-6 space-y-2 mt-2">
              <li>
                <strong className="text-bearing-red-30">Data Cleaning :</strong>{" "}
                Nettoyer et préparer les données brutes dispersées et
                incohérentes
              </li>
              <li>
                <strong className="text-bearing-red-30">Data Analysis :</strong>{" "}
                Résoudre les énigmes analytiques pour reconstituer l'analyse
                complète
              </li>
              <li>
                <strong className="text-bearing-red-30">
                  Data Visualization :
                </strong>{" "}
                Créer un tableau de bord percutant pour la présentation client
              </li>
            </ol>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="text-blue-400" size={20} />
                <h3 className="text-lg font-semibold text-blue-400">
                  Phase 1: Data Cleaning
                </h3>
              </div>
              <p className="text-gray-300 text-sm">
                Vous devrez fusionner et nettoyer des données provenant de
                multiples sources. Vous travaillerez avec Power Query et des
                fonctions comme TRIM, CLEAN, et SUBSTITUTE pour standardiser les
                formats et corriger les incohérences.
              </p>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 className="text-green-400" size={20} />
                <h3 className="text-lg font-semibold text-green-400">
                  Phase 2: Data Analysis
                </h3>
              </div>
              <p className="text-gray-300 text-sm">
                Vous résoudrez 5 niveaux d'énigmes analytiques en utilisant des
                fonctions avancées comme XLOOKUP, FILTER, SEQUENCE, BYROW,
                CHOOSEROWS, TRANSPOSE, VSTACK, GROUPBY, REDUCE, SCAN et plus.
                Chaque niveau débloque des informations cruciales pour
                l'analyse.
              </p>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Award className="text-bearing-red" size={20} />
                <h3 className="text-lg font-semibold text-bearing-red">
                  Phase 3: Visualisation
                </h3>
              </div>
              <p className="text-gray-300 text-sm">
                Vous créerez un tableau de bord professionnel avec des KPIs, des
                graphiques pertinents et des éléments interactifs pour présenter
                clairement les insights critiques au client. Ce sera la touche
                finale pour impressionner le client.
              </p>
            </div>
          </div>

          <div className="bg-bearing-red-70/30 border border-indigo-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="text-indigo-400" size={20} />
              <h3 className="text-lg font-semibold text-indigo-400">
                Votre rôle dans l'équipe
              </h3>
            </div>
            <p className="text-gray-300 mb-4">
              En tant que membre de l'équipe <strong>{teamName}</strong>, votre
              mission est de collaborer efficacement pour résoudre ces défis
              dans le temps imparti. Utilisez vos compétences Excel avancées et
              votre esprit d'analyse pour aider votre équipe à réussir.
            </p>

            <div className="flex items-center gap-2">
              <Users className="text-bearing-red-40" size={20} />
              <p className="text-gray-300 text-sm italic">
                N'oubliez pas : la communication et la collaboration sont
                essentielles pour réussir ce hackathon !
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS pour l'effet de grille en arrière-plan */}
      <style>
        {`
        .bg-grid {
          background-image: 
            linear-gradient(to right, rgba(25, 25, 35, 0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(25, 25, 35, 0.8) 1px, transparent 1px);
          background-size: 30px 30px;
        }
        `}
      </style>

      {/* Overlay de téléchargement de fichiers */}
      {showDownloadOverlay && (
        <DownloadFilesOverlay onClose={() => setShowDownloadOverlay(false)} />
      )}
    </div>
  );
};

export default WaitingScreen;
