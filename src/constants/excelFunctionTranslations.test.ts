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

  test("traduit les fonctions utilisées dans la page Formules Avancées", () => {
    expect(translateFunctionLabel("ISNUMBER", "fr")).toBe("ESTNUM");
    expect(translateFunctionLabel("SEARCH", "fr")).toBe("CHERCHE");
    expect(translateFunctionLabel("FIND", "fr")).toBe("TROUVE");
    expect(translateFunctionLabel("SUMPRODUCT", "fr")).toBe("SOMMEPROD");
    expect(translateFunctionLabel("SUMIFS", "fr")).toBe("SOMME.SI.ENS");
    expect(translateFunctionLabel("COUNTIFS", "fr")).toBe("NB.SI.ENS");
    expect(translateFunctionLabel("AND", "fr")).toBe("ET");
    expect(translateFunctionLabel("OR", "fr")).toBe("OU");
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

  test("distingue SUMIFS de SUMIF (le plus long doit matcher en priorité)", () => {
    expect(translateExcelTerms("=SUMIFS(a;b;c)", "fr")).toBe("=SOMME.SI.ENS(a;b;c)");
    expect(translateExcelTerms("=SUMIF(a;b)", "fr")).toBe("=SOMME.SI(a;b)");
  });

  test("traduit la formule ISNUMBER(SEARCH(...)) sans casser les guillemets ni les points-virgules", () => {
    const input = '=SUM(ISNUMBER(SEARCH("XXX";A1:A100))*(B1:B100<>"Non"))';
    const result = translateExcelTerms(input, "fr");
    expect(result).toBe('=SOMME(ESTNUM(CHERCHE("XXX";A1:A100))*(B1:B100<>"Non"))');
  });

  test("gère un texte vide ou undefined sans erreur", () => {
    expect(translateExcelTerms("", "fr")).toBe("");
  });
});
