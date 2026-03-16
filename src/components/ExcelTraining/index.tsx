import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { SectionType } from "./types";
import { Student, Instructor } from "../../types/database";
import { firebaseDataService } from "../../services/firebaseDataService";
import { useUser } from "../../contexts/UserContext";

// Composants
import WelcomeScreen from "./WelcomeScreen";
import MainMenu from "./MainMenu/MainMenu";
import ExcelSpeedDating from "./SpeedDating/ExcelSpeedDating";
import BestPracticesSection from "./BestPractices/BestPracticesSection";
import UseCasesSection from "./UseCases/UseCasesSection";
import HackathonContainer from "./Hackathon/HackathonContainer";

// ── Menu visiteur (accès limité sans compte Firebase) ───────────────────────
// Affiche uniquement les sections Cas d'usage et Bonnes pratiques.
const GuestMenu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bp-gradient text-white p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">Formation Excel Avancé</h1>
          <p className="text-bp-red-200 text-lg">BearingPoint — Accès Visiteur</p>
          <p className="text-bp-gray-300 text-sm mt-2">
            Explorez les ressources disponibles en accès libre.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => navigate("/visiteur/cas-usage")}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-6 text-left transition-all duration-300 hover:shadow-bp"
          >
            <div className="text-3xl mb-3">📋</div>
            <h3 className="text-xl font-bold mb-1">Cas d'Usage</h3>
            <p className="text-bp-gray-300 text-sm">
              Découvrez 5 cas d'usage métier issus de missions réelles BearingPoint.
            </p>
          </button>

          <button
            onClick={() => navigate("/visiteur/meilleures-pratiques")}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-6 text-left transition-all duration-300 hover:shadow-bp"
          >
            <div className="text-3xl mb-3">📖</div>
            <h3 className="text-xl font-bold mb-1">Bonnes Pratiques</h3>
            <p className="text-bp-gray-300 text-sm">
              Maîtrisez l'art de créer des fichiers Excel professionnels.
            </p>
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate("/accueil")}
            className="bg-bp-red-400 hover:bg-bp-red-500 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300"
          >
            Se connecter pour accéder au hackathon et au Speed Dating
          </button>
        </div>
      </div>
    </div>
  );
};

// Correspondance section → chemin URL
const SECTION_TO_PATH: Record<SectionType, string> = {
  menu: "/mon_espace",
  functions: "/mon_espace/speed-dating",
  bestPractices: "/mon_espace/meilleures-pratiques",
  useCases: "/mon_espace/cas-usage",
  hackathon: "/mon_espace/hackathon",
  hackathonLanding: "/mon_espace/hackathon",
};

// Composant interne avec accès au useNavigate
const ExcelTrainingRoutes: React.FC = () => {
  const navigate = useNavigate();

  const {
    currentUser,
    isInitialized,
    loginUser,
    logoutUser,
    updateUserProgress,
  } = useUser();

  const navigateTo = async (section: SectionType) => {
    navigate(SECTION_TO_PATH[section]);

    if (currentUser) {
      firebaseDataService.updateLastActivity(currentUser.id).catch((err) => {
        console.error("Erreur mise à jour activité:", err);
      });
    }
  };

  const handleUserSelected = async (user: Student | Instructor) => {
    await loginUser(user);
    navigate("/mon_espace");
  };

  // Accès visiteur — pas besoin de Firebase, navigation directe vers le menu visiteur
  const handleViewAsGuest = () => {
    navigate("/visiteur");
  };

  const handleLogout = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      await logoutUser();
      navigate("/accueil");
    }
  };

  const handleProgressUpdate = async (
    progressType: "speedDating" | "hackathon",
    progress: any
  ) => {
    if (currentUser && currentUser.role === "student") {
      await updateUserProgress(progressType, progress);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-bp-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-bp-red-400"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Page d'accueil / connexion */}
      <Route
        path="/accueil"
        element={
          currentUser ? (
            <Navigate to="/mon_espace" replace />
          ) : (
            <WelcomeScreen
              onUserSelected={handleUserSelected}
              onViewAsGuest={handleViewAsGuest}
            />
          )
        }
      />

      {/* Espace personnel — tableau de bord */}
      <Route
        path="/mon_espace"
        element={
          !currentUser ? (
            <Navigate to="/accueil" replace />
          ) : (
            <MainMenu
              navigateTo={navigateTo}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          )
        }
      />

      {/* Speed Dating Excel */}
      <Route
        path="/mon_espace/speed-dating"
        element={
          !currentUser ? (
            <Navigate to="/accueil" replace />
          ) : (
            <ExcelSpeedDating
              navigateTo={navigateTo}
              currentUser={currentUser}
              onProgressUpdate={handleProgressUpdate}
            />
          )
        }
      />

      {/* Meilleures pratiques */}
      <Route
        path="/mon_espace/meilleures-pratiques"
        element={
          !currentUser ? (
            <Navigate to="/accueil" replace />
          ) : (
            <BestPracticesSection navigateTo={navigateTo} />
          )
        }
      />

      {/* Cas d'usage — accessible uniquement aux visiteurs (non authentifiés) */}
      <Route
        path="/mon_espace/cas-usage"
        element={<Navigate to="/mon_espace" replace />}
      />

      {/* Hackathon */}
      <Route
        path="/mon_espace/hackathon"
        element={
          !currentUser ? (
            <Navigate to="/accueil" replace />
          ) : (
            <HackathonContainer
              navigateTo={navigateTo}
              currentUser={currentUser}
              onProgressUpdate={(progress) =>
                handleProgressUpdate("hackathon", progress)
              }
            />
          )
        }
      />

      {/* ── Espace Visiteur (sans compte) — accès limité ── */}
      <Route path="/visiteur" element={<GuestMenu />} />
      <Route
        path="/visiteur/cas-usage"
        element={
          <UseCasesSection
            navigateTo={(section) => {
              if (section === "menu") navigate("/visiteur");
              else navigate(`/visiteur/${section}`);
            }}
          />
        }
      />
      <Route
        path="/visiteur/meilleures-pratiques"
        element={
          <BestPracticesSection
            navigateTo={(section) => {
              if (section === "menu") navigate("/visiteur");
              else navigate(`/visiteur/${section}`);
            }}
          />
        }
      />

      {/* Redirection racine → accueil */}
      <Route path="/" element={<Navigate to="/accueil" replace />} />

      {/* Toute URL inconnue → accueil */}
      <Route path="*" element={<Navigate to="/accueil" replace />} />
    </Routes>
  );
};

const ExcelTraining: React.FC = () => {
  return <ExcelTrainingRoutes />;
};

export default ExcelTraining;
