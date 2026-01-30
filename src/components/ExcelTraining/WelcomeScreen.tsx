import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  User,
  UserCheck,
  Users,
  LogIn,
  BookOpen,
  ChevronDown,
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
  const [selectedRole, setSelectedRole] = useState<"instructor" | "student" | null>(null);
  const [studentName, setStudentName] = useState("");
  const [existingUsers, setExistingUsers] = useState<(Student | Instructor)[]>([]);
  const [showExistingUsers, setShowExistingUsers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const users = databaseService.getAllUsers();
    setExistingUsers(users);

    if (!databaseService.isInitialized()) {
      databaseService.initializeDatabase();
    }
  }, []);

  const handleUserLogin = useCallback(async (
    role: "instructor" | "student",
    name?: string
  ) => {
    setIsLoading(true);
    setError("");

    try {
      let user: Student | Instructor;

      if (role === "instructor") {
        const existingInstructor = databaseService.getInstructors()[0];
        if (existingInstructor) {
          user = existingInstructor;
          databaseService.updateLastActivity(existingInstructor.id);
        } else {
          user = databaseService.addUser("Instructeur", "instructor");
        }
      } else {
        if (!name || name.trim().length < 2) {
          setError("Veuillez saisir un nom valide (au moins 2 caractères)");
          setIsLoading(false);
          return;
        }

        const existingStudent = databaseService.getUserByName(name.trim());
        if (existingStudent && existingStudent.role === "student") {
          user = existingStudent as Student;
          databaseService.updateLastActivity(existingStudent.id);
        } else {
          user = databaseService.addUser(name.trim(), "student");
        }
      }

      onUserSelected(user);
    } catch (err) {
      console.error("Erreur lors de la connexion:", err);
      setError("Une erreur est survenue lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  }, [onUserSelected]);

  const handleRoleSelection = useCallback((role: "instructor" | "student") => {
    setSelectedRole(role);
    setError("");

    if (role === "instructor") {
      handleUserLogin(role);
    }
  }, [handleUserLogin]);

  const handleExistingUserSelection = useCallback((user: Student | Instructor) => {
    databaseService.updateLastActivity(user.id);
    onUserSelected(user);
  }, [onUserSelected]);

  const handleStudentSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === "student") {
      handleUserLogin("student", studentName);
    }
  }, [selectedRole, studentName, handleUserLogin]);

  const roleButtons = useMemo(() => [
    {
      role: "instructor" as const,
      icon: UserCheck,
      title: "Instructeur",
      description: "Accès aux outils de gestion, statistiques et contrôles de session",
      bgClass: "bg-bp-red-600 hover:bg-bp-red-700",
    },
    {
      role: "student" as const,
      icon: User,
      title: "Étudiant",
      description: "Accès aux exercices, speed dating Excel et hackathons",
      bgClass: "bg-bp-red-400 hover:bg-bp-red-500",
    },
    {
      role: "guest" as const,
      icon: BookOpen,
      title: "Visiteur",
      description: "Consulter le contenu sans enregistrer de progression",
      bgClass: "bg-bp-gray-500 hover:bg-bp-gray-400",
    },
  ], []);

  return (
    <div className="min-h-screen bg-bp-gradient flex items-center justify-center p-4">
      <div className="max-w-4xl w-full animate-fade-in">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Formation Excel Avancé
          </h1>
          <h2 className="text-2xl text-bp-red-400 mb-2">BearingPoint</h2>
          <p className="text-xl text-bp-gray-200 max-w-2xl mx-auto">
            Plateforme interactive de formation aux fonctionnalités avancées d'Excel
          </p>
        </div>

        {/* Choix de mode de connexion */}
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-8 mb-8 shadow-bp-lg">
          <h3 className="text-2xl font-bold text-white text-center mb-6">
            Comment souhaitez-vous accéder à la formation ?
          </h3>

          {!selectedRole && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roleButtons.map(({ role, icon: Icon, title, description, bgClass }) => (
                <button
                  key={role}
                  onClick={() => role === "guest" ? onViewAsGuest() : handleRoleSelection(role)}
                  disabled={isLoading}
                  className={`${bgClass} text-white p-6 rounded-xl transition-all duration-300 hover:shadow-bp transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Icon size={48} className="mx-auto mb-4" />
                  <h4 className="text-xl font-bold mb-2">{title}</h4>
                  <p className="text-sm opacity-90">{description}</p>
                </button>
              ))}
            </div>
          )}

          {/* Formulaire pour étudiant */}
          {selectedRole === "student" && (
            <form onSubmit={handleStudentSubmit} className="max-w-md mx-auto animate-slide-up">
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
                  className="w-full px-4 py-3 rounded-lg border-2 border-bp-red-300 focus:ring-2 focus:ring-bp-red-400 focus:border-transparent text-gray-900 text-lg bg-white"
                  disabled={isLoading}
                  maxLength={50}
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-bp-red-400/20 border border-bp-red-400 text-white px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedRole(null)}
                  disabled={isLoading}
                  className="flex-1 bg-bp-gray-500 hover:bg-bp-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  Retour
                </button>

                <button
                  type="submit"
                  disabled={isLoading || studentName.trim().length < 2}
                  className="flex-1 bg-bp-red-400 hover:bg-bp-red-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-bp"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
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
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-6">
            <button
              onClick={() => setShowExistingUsers(!showExistingUsers)}
              className="w-full flex items-center justify-between text-white hover:text-bp-red-300 transition-colors duration-300 mb-4"
            >
              <div className="flex items-center gap-2">
                <Users size={24} />
                <span className="text-lg font-semibold">
                  Utilisateurs récents ({existingUsers.length})
                </span>
              </div>
              <ChevronDown
                size={24}
                className={`transform transition-transform duration-300 ${
                  showExistingUsers ? "rotate-180" : ""
                }`}
              />
            </button>

            {showExistingUsers && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {existingUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleExistingUserSelection(user)}
                    className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-lg transition-all duration-300 text-left hover:shadow-bp"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {user.role === "instructor" ? (
                        <UserCheck size={16} className="text-bp-red-300" />
                      ) : (
                        <User size={16} className="text-bp-red-200" />
                      )}
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <div className="text-sm opacity-75">
                      {user.role === "instructor" ? "Instructeur" : "Étudiant"}
                      <br />
                      <span className="text-xs">
                        Dernière activité:{" "}
                        {new Date(user.lastActivity).toLocaleDateString("fr-FR")}
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
