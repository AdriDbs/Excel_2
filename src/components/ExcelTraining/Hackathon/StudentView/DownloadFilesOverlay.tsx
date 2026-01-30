import React from "react";
import { X, Download, FileText, File, Database } from "lucide-react";

interface DownloadFilesOverlayProps {
  onClose: () => void;
}

// Liste des fichiers disponibles au téléchargement
// Cette liste peut être modifiée selon les besoins
const availableFiles = [
  {
    id: "excel-template",
    name: "Template Excel - Hackathon.xlsx",
    description: "Template Excel pour le démarrage du hackathon",
    category: "templates",
    type: "excel",
    size: "1.2 MB"
  },
  {
    id: "instructions-pdf",
    name: "Instructions détaillées.pdf",
    description: "Guide complet des instructions pour le hackathon",
    category: "guides",
    type: "pdf",
    size: "3.8 MB"
  },
  {
    id: "data-sources",
    name: "Sources de données - Exercice 1.xlsx",
    description: "Données pour le premier exercice de nettoyage",
    category: "data",
    type: "excel",
    size: "5.1 MB"
  },
  {
    id: "scenario-details",
    name: "Scénario - Le Dossier Perdu.pdf",
    description: "Document explicatif complet du scénario",
    category: "guides",
    type: "pdf",
    size: "2.3 MB"
  },
  {
    id: "functions-cheatsheet",
    name: "Aide-mémoire - Fonctions Excel.pdf",
    description: "Rappel des fonctions Excel avancées utilisées",
    category: "guides",
    type: "pdf",
    size: "1.5 MB"
  },
  {
    id: "appendix-data",
    name: "Données annexes.xlsx",
    description: "Données complémentaires pour les exercices avancés",
    category: "data",
    type: "excel",
    size: "7.2 MB"
  }
];

// Fonction pour récupérer l'icône selon le type de fichier
const getFileIcon = (type: string) => {
  switch (type) {
    case "excel":
      return <Database className="text-green-500" size={24} />;
    case "pdf":
      return <FileText className="text-red-500" size={24} />;
    default:
      return <File className="text-blue-500" size={24} />;
  }
};

const DownloadFilesOverlay: React.FC<DownloadFilesOverlayProps> = ({ onClose }) => {
  // Grouper les fichiers par catégorie
  const filesByCategory = availableFiles.reduce((acc, file) => {
    if (!acc[file.category]) {
      acc[file.category] = [];
    }
    acc[file.category].push(file);
    return acc;
  }, {} as { [key: string]: typeof availableFiles });

  // Simuler un téléchargement (dans une application réelle, cela pointerait vers l'URL du fichier)
  const handleDownload = (fileId: string) => {
    // Dans une implémentation réelle, on utiliserait window.location.href ou fetch pour télécharger
    // Par exemple: window.location.href = `/api/download/${fileId}`;
    alert(`Simulation de téléchargement du fichier: ${fileId}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-screen overflow-auto shadow-2xl border border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Download className="text-blue-400" />
            Téléchargement des Ressources
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-300 mb-6">
            Téléchargez les fichiers nécessaires pour compléter le hackathon. Ces ressources vous aideront à comprendre le scénario et à résoudre les défis.
          </p>

          {/* Liste des fichiers par catégorie */}
          {Object.entries(filesByCategory).map(([category, files]) => (
            <div key={category} className="mb-8">
              <h3 className="text-lg font-medium text-blue-300 capitalize mb-4">
                {category === "templates" ? "Templates" : 
                 category === "guides" ? "Guides & Instructions" : 
                 category === "data" ? "Données" : category}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map((file) => (
                  <div 
                    key={file.id} 
                    className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-1">{file.name}</h4>
                        <p className="text-gray-400 text-sm mb-3">{file.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-xs">{file.size}</span>
                          <button 
                            onClick={() => handleDownload(file.id)}
                            className="bg-bearing-red hover:bg-bearing-red-60 text-white text-sm py-1 px-3 rounded flex items-center gap-1 transition-colors"
                          >
                            <Download size={14} />
                            Télécharger
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 mt-4">
            <p className="text-blue-300 text-sm">
              <strong>Note :</strong> Ces fichiers sont essentiels pour réussir le hackathon. Assurez-vous de les télécharger avant de commencer les exercices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadFilesOverlay;