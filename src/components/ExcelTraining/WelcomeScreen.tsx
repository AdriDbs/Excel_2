import React, { useState, useEffect } from "react";
import {
  User,
  UserCheck,
  Settings,
  Users,
  LogIn,
  BookOpen,
} from "lucide-react";
import { databaseService } from "../../services/databaseService";
import { Student, Instructor } from "../../types/database";

interface WelcomeScreenProps {
  onUserSelected: (user: Student | Instructor) => void;
  onViewAsGuest: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onUserSelected,
  onViewAsGuest,
}) => {
  const [selectedRole, setSelectedRole] = useState<
    "instructor" | "student" | null
  >(null);
  const [studentName, setStudentName] = useState("");
  const [existingUsers, setExistingUsers] = useState<(Student | Instructor)[]>(
    []
  );
  const [showExistingUsers, setShowExistingUsers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Charger la liste des utilisateurs existants
    const users = databaseService.getAllUsers();
    setExistingUsers(users);

    // Initialiser la base de données si ce n'est pas déjà fait
    if (!databaseService.isInitialized()) {
      databaseService.initializeDatabase();
    }
  }, []);

  const handleRoleSelection = (role: "instructor" | "student") => {
    setSelectedRole(role);
    setError("");

    if (role === "instructor") {
      // Pour un instructeur, pas besoin de nom, connexion directe
      handleUserLogin(role);
    }
  };

  const handleUserLogin = async (
    role: "instructor" | "student",
    name?: string
  ) => {
    setIsLoading(true);
    setError("");

    try {
      let user: Student | Instructor;

      if (role === "instructor") {
        // Chercher un instructeur existant ou en créer un nouveau
        const existingInstructor = databaseService.getInstructors()[0];
        if (existingInstructor) {
          user = existingInstructor;
          databaseService.updateLastActivity(existingInstructor.id);
        } else {
          user = databaseService.addUser("Instructeur", "instructor");
        }
      } else {
        // Pour un étudiant, vérifier le nom
        if (!name || name.trim().length < 2) {
          setError("Veuillez saisir un nom valide (au moins 2 caractères)");
          return;
        }

        // Chercher un étudiant existant avec ce nom
        const existingStudent = databaseService.getUserByName(name.trim());
        if (existingStudent && existingStudent.role === "student") {
          user = existingStudent as Student;
          databaseService.updateLastActivity(existingStudent.id);
        } else {
          user = databaseService.addUser(name.trim(), "student");
        }
      }

      onUserSelected(user);
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setError("Une erreur est survenue lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExistingUserSelection = (user: Student | Instructor) => {
    databaseService.updateLastActivity(user.id);
    onUserSelected(user);
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === "student") {
      handleUserLogin("student", studentName);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Formation Excel Avancé
          </h1>
          <h2 className="text-2xl text-yellow-400 mb-2">BearingPoint</h2>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Plateforme interactive de formation aux fonctionnalités avancées
            d'Excel
          </p>
        </div>

        {/* Choix de mode de connexion */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-white text-center mb-6">
            Comment souhaitez-vous accéder à la formation ?
          </h3>

          {!selectedRole && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Option Instructeur */}
              <button
                onClick={() => handleRoleSelection("instructor")}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserCheck size={48} className="mx-auto mb-4" />
                <h4 className="text-xl font-bold mb-2">Instructeur</h4>
                <p className="text-sm opacity-90">
                  Accès aux outils de gestion, statistiques et contrôles de
                  session
                </p>
              </button>

              {/* Option Étudiant */}
              <button
                onClick={() => handleRoleSelection("student")}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <User size={48} className="mx-auto mb-4" />
                <h4 className="text-xl font-bold mb-2">Étudiant</h4>
                <p className="text-sm opacity-90">
                  Accès aux exercices, speed dating Excel et hackathons
                </p>
              </button>

              {/* Option Invité */}
              <button
                onClick={onViewAsGuest}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BookOpen size={48} className="mx-auto mb-4" />
                <h4 className="text-xl font-bold mb-2">Visiteur</h4>
                <p className="text-sm opacity-90">
                  Consulter le contenu sans enregistrer de progression
                </p>
              </button>
            </div>
          )}

          {/* Formulaire pour étudiant */}
          {selectedRole === "student" && (
            <form onSubmit={handleStudentSubmit} className="max-w-md mx-auto">
              <div className="mb-6">
                <label
                  htmlFor="studentName"
                  className="block text-white text-lg font-semibold mb-2"
                >
                  Votre nom complet
                </label>
                <input
                  type="text"
                  id="studentName"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Ex: Jean Dupont"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-lg"
                  disabled={isLoading}
                  maxLength={50}
                />
              </div>

              {error && (
                <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-100 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedRole(null)}
                  disabled={isLoading}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  Retour
                </button>

                <button
                  type="submit"
                  disabled={isLoading || studentName.trim().length < 2}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <LogIn size={20} />
                      Commencer
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Section utilisateurs existants */}
        {existingUsers.length > 0 && (
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6">
            <button
              onClick={() => setShowExistingUsers(!showExistingUsers)}
              className="w-full flex items-center justify-between text-white hover:text-yellow-400 transition-colors duration-300 mb-4"
            >
              <div className="flex items-center gap-2">
                <Users size={24} />
                <span className="text-lg font-semibold">
                  Utilisateurs récents ({existingUsers.length})
                </span>
              </div>
              <div
                className={`transform transition-transform duration-300 ${
                  showExistingUsers ? "rotate-180" : ""
                }`}
              >
                ▼
              </div>
            </button>

            {showExistingUsers && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {existingUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleExistingUserSelection(user)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-lg transition-all duration-300 text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {user.role === "instructor" ? (
                        <UserCheck size={16} className="text-green-400" />
                      ) : (
                        <User size={16} className="text-blue-400" />
                      )}
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <div className="text-sm opacity-75">
                      {user.role === "instructor" ? "Instructeur" : "Étudiant"}
                      <br />
                      <span className="text-xs">
                        Dernière activité:{" "}
                        {new Date(user.lastActivity).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;
