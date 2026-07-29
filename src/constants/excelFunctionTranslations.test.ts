import { translateExcelTerms, translateFunctionLabel } from "./excelFunctionTranslations";

describe("translateFunctionLabel", () => {
  test("traduit un nom de fonction connu vers le français", () => {
    expect(translateFunctionLabel("COUNTIF", "fr")).toBe("NB.SI");
  });

  test("renvoie le nom anglais tel quel en mode anglais", () => {
    expect(translateFunctionLabel("COUNTIF", "en")).toBe("COUNTIF");
  });

  test("renvoie la chaîne d'origine si le terme est inconnu", () => {
    expect(translateFunctionLabel("INEXISTANT", "fr")).toBe("INEXISTANT");
  });

  test("traduit une fonctionnalité Excel (pas une fonction de formule)", () => {
    expect(translateFunctionLabel("Tableaux croisés dynamiques", "en")).toBe("PivotTables");
    expect(translateFunctionLabel("Tableaux croisés dynamiques", "fr")).toBe("Tableaux croisés dynamiques");
  });
});

describe("translateExcelTerms", () => {
  test("remplace le nom de fonction dans une formule sans toucher aux points-virgules", () => {
    const input = 'Utilisez : =COUNTIF(Table_Donnees_Propres[Contact]; "Client_015")';
    const result = translateExcelTerms(input, "fr");
    expect(result).toBe('Utilisez : =NB.SI(Table_Donnees_Propres[Contact]; "Client_015")');
    expect(result).toContain(";");
    expect(result).not.toContain(",");
  });

  test("mode anglais laisse le texte inchangé (déjà canonique EN)", () => {
    const input = "Utilisez : =SUM(BYROW(CHOOSECOLS(Table; 4; 5); LAMBDA(row; INDEX(row;1))))";
    expect(translateExcelTerms(input, "en")).toBe(input);
  });

  test("traduit plusieurs fonctions imbriquées dans une même formule", () => {
    const input = "Utilisez : =SUM(BYROW(CHOOSECOLS(Table_Donnees_Propres; 4; 5); LAMBDA(row; INDEX(row;1)*INDEX(row;2))))";
    const result = translateExcelTerms(input, "fr");
    expect(result).toContain("SOMME(BYROW(CHOISIRCOLS(");
    expect(result).toContain("LAMBDA(row;");
  });

  test("ne modifie pas un mot français ordinaire qui contient un nom de fonction en sous-chaîne", () => {
    // "séquence" en minuscule (mot français) ne doit pas matcher "SEQUENCE" (majuscule, mot entier)
    const input = "Créez une séquence de nombres.";
    expect(translateExcelTerms(input, "fr")).toBe(input);
  });

  test("ne traduit pas un nom de fonction en sous-chaîne d'un autre mot", () => {
    const input = "MAXIMUM et MAXIFS ne sont pas MAX.";
    const result = translateExcelTerms(input, "fr");
    expect(result).toBe("MAXIMUM et MAXIFS ne sont pas MAX.");
  });

  test("gère un texte vide ou undefined sans erreur", () => {
    expect(translateExcelTerms("", "fr")).toBe("");
  });
});
