import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  User,
  UserCheck,
  Users,
  LogIn,
  ChevronDown,
  Clock,
  Monitor,
  Smartphone,
  Tablet,
  Trophy,
  ChevronRight,
  History,
} from "lucide-react";
import { firebaseDataService } from "../../services/firebaseDataService";
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
  const [loginMode, setLoginMode] = useState<"new" | "existing" | null>(null);
  const [existingUsers, setExistingUsers] = useState<(Student | Instructor)[]>([]);
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const users = await firebaseDataService.getAllUsers();
      setExistingUsers(users);

      // Charger les étudiants récents
      const recent = await firebaseDataService.getRecentStudents();
      setRecentStudents(recent);

      const isInit = await firebaseDataService.isInitialized();
      if (!isInit) {
        await firebaseDataService.initializeDatabase();
      }
    };

    loadData();
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
        const instructors = await firebaseDataService.getInstructors();
        const existingInstructor = instructors[0];
        if (existingInstructor) {
          user = existingInstructor;
          await firebaseDataService.updateLastActivity(existingInstructor.id, true);
        } else {
          user = await firebaseDataService.addUser("Instructeur", "instructor");
        }
      } else {
        if (!name || name.trim().length < 2) {
          setError("Veuillez saisir un nom valide (au moins 2 caractères)");
          setIsLoading(false);
          return;
        }

        const existingStudent = await firebaseDataService.getUserByName(name.trim());
        if (existingStudent && existingStudent.role === "student") {
          user = existingStudent as Student;
          await firebaseDataService.updateLastActivity(existingStudent.id, true);
        } else {
          user = await firebaseDataService.addUser(name.trim(), "student");
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
    setLoginMode(null);

    if (role === "instructor") {
      handleUserLogin(role);
    }
  }, [handleUserLogin]);

  const handleExistingUserSelection = useCallback(async (user: Student | Instructor) => {
    setIsLoading(true);
    await firebaseDataService.updateLastActivity(user.id, true);
    onUserSelected(user);
  }, [onUserSelected]);

  const handleStudentSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === "student") {
      handleUserLogin("student", studentName);
    }
  }, [selectedRole, studentName, handleUserLogin]);

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone size={14} className="text-bp-red-300" />;
      case "tablet":
        return <Tablet size={14} className="text-bp-red-300" />;
      default:
        return <Monitor size={14} className="text-bp-red-300" />;
    }
  };

  const getProgressSummary = (student: Student) => {
    const speedDatingCompleted = Object.values(student.speedDatingProgress || {})
      .filter(p => p.completed).length;
    const hackathonLevel = student.hackathonProgress?.currentLevel || 0;
    const totalScore = Object.values(student.speedDatingProgress || {})
      .reduce((sum, p) => sum + (p.score || 0), 0) + (student.hackathonProgress?.totalScore || 0);

    return { speedDatingCompleted, hackathonLevel, totalScore };
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 2) return "En ligne";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString("fr-FR");
  };

  const isOnline = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    return (now.getTime() - date.getTime()) < 2 * 60 * 1000;
  };

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
  ], []);

  const students = existingUsers.filter(u => u.role === "student") as Student[];

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
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roleButtons.map(({ role, icon: Icon, title, description, bgClass }) => (
                  <button
                    key={role}
                    onClick={() => handleRoleSelection(role)}
                    disabled={isLoading}
                    className={`${bgClass} text-white p-6 rounded-xl transition-all duration-300 hover:shadow-bp transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Icon size={48} className="mx-auto mb-4" />
                    <h4 className="text-xl font-bold mb-2">{title}</h4>
                    <p className="text-sm opacity-90">{description}</p>
                  </button>
                ))}
              </div>

              {/* Bouton accès visiteur — sans compte Firebase, accès limité aux ressources */}
              <div className="border-t border-white/20 pt-6 text-center">
                <p className="text-bp-gray-300 text-sm mb-3">
                  Pas encore de compte ? Explorez les ressources en accès libre.
                </p>
                <button
                  onClick={onViewAsGuest}
                  disabled={isLoading}
                  className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-bp disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  <Users size={20} />
                  Accès Visiteur
                  <span className="text-xs text-bp-gray-300 ml-1">(Cas d'usage &amp; Bonnes pratiques)</span>
                </button>
              </div>
            </div>
          )}

          {/* Options de connexion étudiant */}
          {selectedRole === "student" && !loginMode && (
            <div className="max-w-2xl mx-auto animate-slide-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Nouveau participant */}
                <button
                  onClick={() => setLoginMode("new")}
                  className="bg-bp-red-500 hover:bg-bp-red-600 text-white p-6 rounded-xl transition-all duration-300 hover:shadow-bp flex flex-col items-center"
                >
                  <User size={40} className="mb-3" />
                  <h4 className="text-lg font-bold mb-2">Nouveau participant</h4>
                  <p className="text-sm opacity-90 text-center">
                    Première connexion ? Entrez votre nom pour commencer
                  </p>
                </button>

                {/* Utilisateur existant */}
                <button
                  onClick={() => setLoginMode("existing")}
                  disabled={students.length === 0}
                  className={`${
                    students.length > 0
                      ? "bg-bp-gray-600 hover:bg-bp-gray-500"
                      : "bg-bp-gray-700 cursor-not-allowed opacity-50"
                  } text-white p-6 rounded-xl transition-all duration-300 hover:shadow-bp flex flex-col items-center`}
                >
                  <History size={40} className="mb-3" />
                  <h4 className="text-lg font-bold mb-2">Reprendre ma session</h4>
                  <p className="text-sm opacity-90 text-center">
                    {students.length > 0
                      ? `${students.length} participant(s) enregistré(s)`
                      : "Aucun participant enregistré"}
                  </p>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="w-full bg-bp-gray-500 hover:bg-bp-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
              >
                Retour
              </button>
            </div>
          )}

          {/* Formulaire nouveau participant */}
          {selectedRole === "student" && loginMode === "new" && (
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
                <p className="text-bp-gray-300 text-sm mt-2">
                  Si ce nom existe déjà, vous reprendrez votre progression existante.
                </p>
              </div>

              {error && (
                <div className="bg-bp-red-400/20 border border-bp-red-400 text-white px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setLoginMode(null)}
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

          {/* Sélection utilisateur existant */}
          {selectedRole === "student" && loginMode === "existing" && (
            <div className="max-w-2xl mx-auto animate-slide-up">
              <h4 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <Users size={20} />
                Sélectionnez votre profil
              </h4>

              {/* Utilisateurs récents en priorité */}
              {recentStudents.length > 0 && (
                <div className="mb-6">
                  <p className="text-bp-red-300 text-sm mb-3 flex items-center gap-2">
                    <Clock size={16} />
                    Utilisateurs récents
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recentStudents.slice(0, 4).map((student) => {
                      const progress = getProgressSummary(student);
                      const online = isOnline(student.lastActivity);

                      return (
                        <button
                          key={student.id}
                          onClick={() => handleExistingUserSelection(student)}
                          disabled={isLoading}
                          className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-lg transition-all duration-300 text-left hover:shadow-bp border border-white/20 hover:border-bp-red-400 group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${online ? "bg-green-400 animate-pulse" : "bg-gray-400"}`} />
                                <span className="font-bold text-lg">{student.name}</span>
                                {getDeviceIcon(student.deviceInfo?.deviceType)}
                              </div>

                              <div className="text-sm text-bp-gray-300 space-y-1">
                                <div className="flex items-center gap-2">
                                  <Clock size={12} />
                                  <span>{formatLastActivity(student.lastActivity)}</span>
                                </div>

                                {progress.totalScore > 0 && (
                                  <div className="flex items-center gap-2">
                                    <Trophy size={12} className="text-bp-red-400" />
                                    <span>{progress.totalScore} points</span>
                                    <span className="text-bp-gray-400">•</span>
                                    <span>SD: {progress.speedDatingCompleted}/12</span>
                                  </div>
                                )}

                                {student.deviceInfo && (
                                  <div className="text-xs text-bp-gray-400">
                                    {student.deviceInfo.browser} • {student.deviceInfo.os}
                                  </div>
                                )}
                              </div>
                            </div>
                            <ChevronRight size={20} className="text-bp-gray-400 group-hover:text-white transition-colors" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Afficher tous les utilisateurs */}
              {students.length > recentStudents.length && (
                <div>
                  <button
                    onClick={() => setShowAllUsers(!showAllUsers)}
                    className="w-full flex items-center justify-between text-white hover:text-bp-red-300 transition-colors duration-300 mb-3 py-2"
                  >
                    <span className="text-sm text-bp-gray-300">
                      Tous les participants ({students.length})
                    </span>
                    <ChevronDown
                      size={20}
                      className={`transform transition-transform duration-300 ${showAllUsers ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showAllUsers && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                      {students.map((student) => {
                        const progress = getProgressSummary(student);
                        const online = isOnline(student.lastActivity);

                        return (
                          <button
                            key={student.id}
                            onClick={() => handleExistingUserSelection(student)}
                            disabled={isLoading}
                            className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all duration-300 text-left hover:shadow-bp"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-2 h-2 rounded-full ${online ? "bg-green-400 animate-pulse" : "bg-gray-400"}`} />
                              <span className="font-medium truncate">{student.name}</span>
                            </div>
                            <div className="text-xs text-bp-gray-300 space-y-1">
                              <div>{formatLastActivity(student.lastActivity)}</div>
                              {progress.totalScore > 0 && (
                                <div className="flex items-center gap-1">
                                  <Trophy size={10} className="text-bp-red-400" />
                                  <span>{progress.totalScore} pts</span>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-bp-red-400/20 border border-bp-red-400 text-white px-4 py-3 rounded-lg my-4">
                  {error}
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setLoginMode(null)}
                  disabled={isLoading}
                  className="flex-1 bg-bp-gray-500 hover:bg-bp-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  Retour
                </button>

                <button
                  type="button"
                  onClick={() => setLoginMode("new")}
                  disabled={isLoading}
                  className="flex-1 bg-bp-red-400 hover:bg-bp-red-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <User size={20} />
                  Nouveau profil
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section utilisateurs connectés (instructeurs uniquement dans le menu all users) */}
        {!selectedRole && existingUsers.length > 0 && (
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-6">
            <button
              onClick={() => setShowAllUsers(!showAllUsers)}
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
                  showAllUsers ? "rotate-180" : ""
                }`}
              />
            </button>

            {showAllUsers && (
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
                      {isOnline(user.lastActivity) && (
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-sm opacity-75">
                      {user.role === "instructor" ? "Instructeur" : "Étudiant"}
                      <br />
                      <span className="text-xs">
                        {formatLastActivity(user.lastActivity)}
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
