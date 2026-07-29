import React, { createContext, useContext, useState, ReactNode } from "react";
import { ExcelLanguage } from "../constants/excelFunctionTranslations";

const STORAGE_KEY = "excelLanguage";

interface ExcelLanguageContextType {
  excelLanguage: ExcelLanguage;
  setExcelLanguage: (lang: ExcelLanguage) => void;
  toggleExcelLanguage: () => void;
}

const ExcelLanguageContext = createContext<ExcelLanguageContextType | undefined>(undefined);

const readStoredLanguage = (): ExcelLanguage => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "fr";
  } catch {
    return "fr";
  }
};

// Choix de langue des noms de fonctions Excel (FR/EN), valable pour tous les
// profils (instructeur et étudiants) sur cet appareil — persisté en local,
// pas besoin de compte pour changer de préférence.
export const ExcelLanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [excelLanguage, setExcelLanguageState] = useState<ExcelLanguage>(readStoredLanguage);

  const setExcelLanguage = (lang: ExcelLanguage) => {
    setExcelLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Stockage indisponible (navigation privée...) : la préférence reste en mémoire pour la session
    }
  };

  const toggleExcelLanguage = () => setExcelLanguage(excelLanguage === "fr" ? "en" : "fr");

  return (
    <ExcelLanguageContext.Provider value={{ excelLanguage, setExcelLanguage, toggleExcelLanguage }}>
      {children}
    </ExcelLanguageContext.Provider>
  );
};

export const useExcelLanguage = (): ExcelLanguageContextType => {
  const ctx = useContext(ExcelLanguageContext);
  if (!ctx) {
    throw new Error("useExcelLanguage must be used within an ExcelLanguageProvider");
  }
  return ctx;
};
