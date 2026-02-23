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

  const handleViewAsGuest = async () => {
    await logoutUser();
    navigate("/accueil");
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

      {/* Cas d'usage */}
      <Route
        path="/mon_espace/cas-usage"
        element={
          !currentUser ? (
            <Navigate to="/accueil" replace />
          ) : (
            <UseCasesSection navigateTo={navigateTo} />
          )
        }
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
