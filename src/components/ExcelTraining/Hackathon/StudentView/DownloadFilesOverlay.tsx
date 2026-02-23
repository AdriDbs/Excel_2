import React from "react";
import { X, Download, FileText, Table2 } from "lucide-react";

interface DownloadFilesOverlayProps {
  onClose: () => void;
}

// Fichiers réellement disponibles dans /public
const availableFiles = [
  {
    id: "guide-participant",
    name: "Guide Participant Formation Excel BearingPoint",
    filename: "Guide_Participant_Formation_Excel_BearingPoint.pdf",
    description: "Guide complet du participant pour la formation Excel BearingPoint",
    type: "pdf",
  },
  {
    id: "hackathon-excel",
    name: "Hackathon Excel – Le Dossier Perdu",
    filename: "Hackathon_Excel_Le_Dossier_Perdu(1).xlsx",
    description: "Fichier Excel du hackathon « Le Dossier Perdu »",
    type: "excel",
  },
  {
    id: "speed-dating-excel",
    name: "Speed Dating Excel BearingPoint",
    filename: "Speed_Dating_Excel_BearingPoint.xlsx",
    description: "Fichier Excel pour l'atelier Speed Dating",
    type: "excel",
  },
];

// Icône selon le type de fichier
const getFileIcon = (type: string) => {
  if (type === "excel") return <Table2 className="text-green-400" size={28} />;
  return <FileText className="text-red-400" size={28} />;
};

const DownloadFilesOverlay: React.FC<DownloadFilesOverlayProps> = ({ onClose }) => {
  const handleDownload = (filename: string) => {
    const link = document.createElement("a");
    link.href = `/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full shadow-2xl border border-gray-700">
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
            Téléchargez les fichiers nécessaires pour la formation. Ces ressources vous aideront à comprendre le scénario et à résoudre les défis.
          </p>

          <div className="flex flex-col gap-4">
            {availableFiles.map((file) => (
              <div
                key={file.id}
                className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-all flex items-center gap-4"
              >
                <div className="shrink-0">{getFileIcon(file.type)}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">{file.name}</h4>
                  <p className="text-gray-400 text-sm">{file.description}</p>
                  <p className="text-gray-500 text-xs mt-1 font-mono">{file.filename}</p>
                </div>
                <button
                  onClick={() => handleDownload(file.filename)}
                  className="shrink-0 bg-bp-red-400 hover:bg-bp-red-500 text-white text-sm py-2 px-4 rounded flex items-center gap-1 transition-colors"
                >
                  <Download size={14} />
                  Télécharger
                </button>
              </div>
            ))}
          </div>

          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 mt-6">
            <p className="text-blue-300 text-sm">
              <strong>Note :</strong> Ces fichiers sont essentiels pour réussir la formation. Assurez-vous de les télécharger avant de commencer les exercices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadFilesOverlay;