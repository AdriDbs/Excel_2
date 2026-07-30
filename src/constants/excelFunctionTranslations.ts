// Traduction des noms de fonctions Excel (FR/EN) — n'affecte que les noms de
// fonctions affichés (indices, fiches, mini-jeux, hackathon). La syntaxe des
// formules (parenthèses, point-virgule comme séparateur, etc.) n'est jamais
// modifiée : seul le nom de la fonction change selon la langue choisie.

export type ExcelLanguage = "fr" | "en";

interface FunctionTranslation {
  fr: string;
  en: string;
  /**
   * Confiance dans la traduction officielle Microsoft (fonctions récentes /
   * renommées selon les versions d'Office). "low"/"medium" = à vérifier dans
   * un Excel FR réel avant utilisation en formation.
   */
  confidence?: "medium" | "low";
}

// Clé = nom canonique tel qu'écrit dans le code (toujours en anglais pour les
// fonctions de formule). Valeur = { fr, en }.
const FUNCTION_NAMES: Record<string, FunctionTranslation> = {
  SUM: { fr: "SOMME", en: "SUM" },
  AVERAGE: { fr: "MOYENNE", en: "AVERAGE" },
  MAX: { fr: "MAX", en: "MAX" },
  MIN: { fr: "MIN", en: "MIN" },
  COUNT: { fr: "NB", en: "COUNT" },
  COUNTA: { fr: "NBVAL", en: "COUNTA" },
  COUNTIF: { fr: "NB.SI", en: "COUNTIF" },
  COUNTIFS: { fr: "NB.SI.ENS", en: "COUNTIFS" },
  IF: { fr: "SI", en: "IF" },
  AND: { fr: "ET", en: "AND" },
  OR: { fr: "OU", en: "OR" },
  ISNUMBER: { fr: "ESTNUM", en: "ISNUMBER" },
  SEARCH: { fr: "CHERCHE", en: "SEARCH" },
  FIND: { fr: "TROUVE", en: "FIND" },
  SUMPRODUCT: { fr: "SOMMEPROD", en: "SUMPRODUCT" },
  SUMIFS: { fr: "SOMME.SI.ENS", en: "SUMIFS" },
  SUMIF: { fr: "SOMME.SI", en: "SUMIF" },
  TRIM: { fr: "SUPPRESPACE", en: "TRIM" },
  CLEAN: { fr: "ÉPURAGE", en: "CLEAN" },
  PROPER: { fr: "NOMPROPRE", en: "PROPER" },
  MATCH: { fr: "EQUIV", en: "MATCH" },
  STDEV: { fr: "ECARTYPE", en: "STDEV" },
  OFFSET: { fr: "DECALER", en: "OFFSET" },
  ROWS: { fr: "LIGNES", en: "ROWS" },
  VLOOKUP: { fr: "RECHERCHEV", en: "VLOOKUP" },
  FILTER: { fr: "FILTRE", en: "FILTER" },
  UNIQUE: { fr: "UNIQUE", en: "UNIQUE" },
  SORT: { fr: "TRI", en: "SORT" },
  XLOOKUP: { fr: "RECHERCHEX", en: "XLOOKUP" },
  LAMBDA: { fr: "LAMBDA", en: "LAMBDA" },
  LET: { fr: "LET", en: "LET" },
  BYROW: { fr: "BYROW", en: "BYROW" },
  BYCOL: { fr: "BYCOL", en: "BYCOL" },
  CHOOSECOLS: { fr: "CHOISIRCOLS", en: "CHOOSECOLS" },
  CHOOSEROWS: { fr: "CHOISIRLIGNES", en: "CHOOSEROWS" },
  TAKE: { fr: "PRENDRE", en: "TAKE" },
  DROP: { fr: "EXCLURE", en: "DROP" },
  TRANSPOSE: { fr: "TRANSPOSE", en: "TRANSPOSE" },
  SEQUENCE: { fr: "SEQUENCE", en: "SEQUENCE" },
  REDUCE: { fr: "REDUCE", en: "REDUCE" },
  MAP: { fr: "MAP", en: "MAP" },
  TOCOL: { fr: "DANSCOL", en: "TOCOL" },
  TOROW: { fr: "DANSLIGNE", en: "TOROW" },
  // Confirmé sur poste Excel FR réel (2026-07-29) : GROUPBY et SCAN restent
  // inchangés, VSTACK/HSTACK utilisent désormais ASSEMB.V/ASSEMB.H.
  GROUPBY: { fr: "GROUPBY", en: "GROUPBY" },
  VSTACK: { fr: "ASSEMB.V", en: "VSTACK" },
  HSTACK: { fr: "ASSEMB.H", en: "HSTACK" },
  SCAN: { fr: "SCAN", en: "SCAN" },
};

// Fonctionnalités Excel (pas des fonctions de formule) mentionnées dans les
// indices du hackathon. Clé = texte français tel qu'écrit dans le code.
const FEATURE_NAMES: Record<string, FunctionTranslation> = {
  "Power Query": { fr: "Power Query", en: "Power Query" },
  "Tableaux croisés dynamiques": { fr: "Tableaux croisés dynamiques", en: "PivotTables" },
  "Graphiques croisés dynamiques": { fr: "Graphiques croisés dynamiques", en: "PivotCharts" },
  "Mise en forme conditionnelle": { fr: "Mise en forme conditionnelle", en: "Conditional Formatting" },
  Segments: { fr: "Segments", en: "Slicers" },
};

const ALL_TERMS: Record<string, FunctionTranslation> = { ...FUNCTION_NAMES, ...FEATURE_NAMES };

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Regex unique, la plus longue clé d'abord pour éviter les recouvrements
// partiels (ex: "Tableaux croisés dynamiques" avant "Segments"). Le "avant"
// est capturé (plutôt qu'un lookbehind, non supporté sur d'anciens
// navigateurs/Safari) pour être réinséré tel quel après traduction.
const TERM_PATTERN = new RegExp(
  `(^|[^A-Za-zÀ-ÿ0-9])(${Object.keys(ALL_TERMS)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|")})(?![A-Za-zÀ-ÿ0-9])`,
  "g"
);

/**
 * Traduit un nom de fonction/fonctionnalité exact (ex: "COUNTIF",
 * "Power Query") vers la langue Excel choisie. Renvoie la chaîne d'origine
 * si elle n'est pas reconnue.
 */
export function translateFunctionLabel(label: string, lang: ExcelLanguage): string {
  const entry = ALL_TERMS[label];
  return entry ? entry[lang] : label;
}

/**
 * Traduit chaque nom de fonction/fonctionnalité reconnu à l'intérieur d'un
 * texte libre (indice, formule, présentation…), sans toucher au reste du
 * texte : séparateurs (;), parenthèses, arguments, ponctuation, tout le
 * contenu inchangé.
 */
export function translateExcelTerms(text: string, lang: ExcelLanguage): string {
  if (!text) return text;
  return text.replace(TERM_PATTERN, (_match, prefix, word) => prefix + (ALL_TERMS[word]?.[lang] ?? word));
}
