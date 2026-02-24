/**
 * Utilitaires pour la validation et la sanitization des données Firebase
 *
 * Firebase Realtime Database rejette les valeurs undefined dans les objets.
 * Ces utilitaires garantissent que toutes les données sont valides avant l'envoi.
 */

/**
 * Retire toutes les propriétés avec des valeurs undefined d'un objet
 * Firebase rejette les objets contenant des valeurs undefined
 *
 * @param obj - L'objet à sanitizer
 * @returns Un nouvel objet sans propriétés undefined
 */
export function sanitizeForFirebase<T extends Record<string, any>>(obj: T): Partial<T> {
  const sanitized: any = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
      sanitized[key] = obj[key];
    }
  }

  return sanitized;
}

/**
 * Valide qu'un objet userData contient tous les champs requis pour la présence
 *
 * @param userData - Les données utilisateur à valider
 * @returns true si toutes les données requises sont présentes et valides
 */
export function validatePresenceData(userData: {
  odcfUserId?: string;
  name?: string;
  role?: string;
  deviceInfo?: object;
}): boolean {
  // Vérifier que les champs requis existent
  if (!userData.odcfUserId || !userData.name || !userData.role) {
    console.warn('[Firebase] Validation failed: missing required fields', {
      hasOdcfUserId: !!userData.odcfUserId,
      hasName: !!userData.name,
      hasRole: !!userData.role,
    });
    return false;
  }

  // Vérifier que ce sont des strings non vides
  if (
    typeof userData.odcfUserId !== 'string' ||
    typeof userData.name !== 'string' ||
    typeof userData.role !== 'string'
  ) {
    console.warn('[Firebase] Validation failed: invalid field types', {
      odcfUserIdType: typeof userData.odcfUserId,
      nameType: typeof userData.name,
      roleType: typeof userData.role,
    });
    return false;
  }

  if (
    userData.odcfUserId.trim() === '' ||
    userData.name.trim() === '' ||
    userData.role.trim() === ''
  ) {
    console.warn('[Firebase] Validation failed: empty string fields', {
      odcfUserId: userData.odcfUserId,
      name: userData.name,
      role: userData.role,
    });
    return false;
  }

  // Vérifier que le rôle est valide
  if (userData.role !== 'instructor' && userData.role !== 'student') {
    console.warn('[Firebase] Validation failed: invalid role', {
      role: userData.role,
      expected: 'instructor or student',
    });
    return false;
  }

  return true;
}

