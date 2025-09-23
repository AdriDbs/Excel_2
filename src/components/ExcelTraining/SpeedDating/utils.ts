// Fonction utilitaire pour formater le temps global en heures, minutes, secondes
export const formatGlobalTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours > 0 ? hours + ":" : ""}${
    minutes < 10 && hours > 0 ? "0" : ""
  }${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};

// Fonction utilitaire pour formater le temps en minutes:secondes
export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};
