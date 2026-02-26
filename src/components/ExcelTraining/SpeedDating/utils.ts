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

// --- Validation des réponses Speed Dating ---

export interface ExpectedAnswer {
  functionName: string;
  exerciseNumber: 1 | 2;
  expectedValue: string | number;
  type: "number" | "string" | "integer" | "date";
}

export const EXPECTED_ANSWERS: ExpectedAnswer[] = [
  // 1. XLOOKUP
  { functionName: "XLOOKUP", exerciseNumber: 1, expectedValue: 2243.4, type: "number" },
  { functionName: "XLOOKUP", exerciseNumber: 2, expectedValue: "F009", type: "string" },

  // 2. FILTER
  { functionName: "FILTER", exerciseNumber: 1, expectedValue: 30, type: "integer" },
  { functionName: "FILTER", exerciseNumber: 2, expectedValue: 100, type: "integer" },

  // 3. SEQUENCE
  { functionName: "SEQUENCE", exerciseNumber: 1, expectedValue: "2025-01-03", type: "date" },
  { functionName: "SEQUENCE", exerciseNumber: 2, expectedValue: 242726.2, type: "number" },

  // 4. BYROW & BYCOL
  { functionName: "BYROW & BYCOL", exerciseNumber: 1, expectedValue: 68.3, type: "number" },
  { functionName: "BYROW & BYCOL", exerciseNumber: 2, expectedValue: 0.6, type: "number" },

  // 5. CHOOSECOLS
  { functionName: "CHOOSECOLS", exerciseNumber: 1, expectedValue: "CHOOSECOLS1", type: "string" },
  { functionName: "CHOOSECOLS", exerciseNumber: 2, expectedValue: "CHOOSECOLS1", type: "string" },

  // 6. DROP & TAKE
  { functionName: "DROP & TAKE", exerciseNumber: 1, expectedValue: 4504.1, type: "number" },
  { functionName: "DROP & TAKE", exerciseNumber: 2, expectedValue: 2235988.8, type: "number" },

  // 7. TRANSPOSE
  { functionName: "TRANSPOSE", exerciseNumber: 1, expectedValue: "TRANSPOSE1", type: "string" },
  { functionName: "TRANSPOSE", exerciseNumber: 2, expectedValue: "TRANSPOSE2", type: "string" },

  // 8. LET & MAP
  { functionName: "LET & MAP", exerciseNumber: 1, expectedValue: 0.5, type: "number" },
  { functionName: "LET & MAP", exerciseNumber: 2, expectedValue: 2779047.8, type: "number" },

  // 9. VSTACK & HSTACK
  { functionName: "VSTACK & HSTACK", exerciseNumber: 1, expectedValue: 25469.5, type: "number" },
  { functionName: "VSTACK & HSTACK", exerciseNumber: 2, expectedValue: 965950.2, type: "number" },

  // 10. GROUPBY
  { functionName: "GROUPBY", exerciseNumber: 1, expectedValue: 2459.8, type: "number" },
  { functionName: "GROUPBY", exerciseNumber: 2, expectedValue: 77, type: "integer" },

  // 11. REDUCE & SCAN
  { functionName: "REDUCE & SCAN", exerciseNumber: 1, expectedValue: 6923587.8, type: "number" },
  { functionName: "REDUCE & SCAN", exerciseNumber: 2, expectedValue: -126.0, type: "number" },

  // 12. TOCOL & TOROW
  { functionName: "TOCOL & TOROW", exerciseNumber: 1, expectedValue: 0.3, type: "number" },
  { functionName: "TOCOL & TOROW", exerciseNumber: 2, expectedValue: 85730, type: "integer" },

  // 13. OFFSET
  { functionName: "OFFSET", exerciseNumber: 1, expectedValue: 191.4, type: "number" },
  { functionName: "OFFSET", exerciseNumber: 2, expectedValue: 22753609086.3, type: "number" },
];

export function getExpectedAnswer(
  functionName: string,
  exerciseNumber: 1 | 2
): ExpectedAnswer | undefined {
  return EXPECTED_ANSWERS.find(
    (a) => a.functionName === functionName && a.exerciseNumber === exerciseNumber
  );
}

function normalizeDateToISO(input: string): string | null {
  // Format JJ/MM/AAAA ou JJ-MM-AAAA
  let match = input.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // Format AAAA-MM-JJ ou AAAA/MM/JJ
  match = input.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (match) {
    const [, y, m, d] = match;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // Format texte français "3 janvier 2025"
  const moisFR: Record<string, string> = {
    janvier: "01",
    février: "02",
    mars: "03",
    avril: "04",
    mai: "05",
    juin: "06",
    juillet: "07",
    août: "08",
    septembre: "09",
    octobre: "10",
    novembre: "11",
    décembre: "12",
  };
  match = input.match(/^(\d{1,2})\s+([\wéûà]+)\s+(\d{4})$/i);
  if (match) {
    const [, d, moisText, y] = match;
    const m = moisFR[moisText.toLowerCase()];
    if (m) return `${y}-${m}-${d.padStart(2, "0")}`;
  }

  return null;
}

export function validateSpeedDatingAnswer(
  userInput: string,
  expected: ExpectedAnswer
): boolean {
  const trimmed = userInput.trim();
  if (trimmed === "") return false;

  switch (expected.type) {
    case "string":
      return (
        trimmed.toLowerCase() ===
        String(expected.expectedValue).toLowerCase().trim()
      );

    case "integer": {
      const userInt = parseInt(
        trimmed.replace(/\s/g, "").replace(",", "."),
        10
      );
      return !isNaN(userInt) && userInt === expected.expectedValue;
    }

    case "date":
      return normalizeDateToISO(trimmed) === expected.expectedValue;

    case "number": {
      const userNum = parseFloat(
        trimmed.replace(/\s/g, "").replace(",", ".")
      );
      if (isNaN(userNum)) return false;

      const expectedNum = expected.expectedValue as number;
      const userRounded = Math.round(userNum * 10) / 10;
      const expectedRounded = Math.round(expectedNum * 10) / 10;

      return userRounded === expectedRounded;
    }

    default:
      return false;
  }
}
