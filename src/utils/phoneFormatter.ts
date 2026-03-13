/**
 * Formatage des numéros de téléphone avec indicatifs pays
 * Pays supportés: CI, SN, BJ, GN, ML, TG
 */

interface CountryCode {
  code: string;
  dialCode: string;
  minLength: number;
  maxLength: number;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: 'SN', dialCode: '+221', minLength: 9, maxLength: 9 },   // Sénégal
  { code: 'CI', dialCode: '+225', minLength: 10, maxLength: 10 }, // Côte d'Ivoire
  { code: 'BJ', dialCode: '+229', minLength: 8, maxLength: 8 },   // Bénin
  { code: 'GN', dialCode: '+224', minLength: 9, maxLength: 9 },   // Guinée
  { code: 'ML', dialCode: '+223', minLength: 8, maxLength: 8 },   // Mali
  { code: 'TG', dialCode: '+228', minLength: 8, maxLength: 8 },   // Togo
];

/**
 * Nettoie un numéro de téléphone en retirant tous les caractères non numériques
 * sauf le + au début
 */
export const cleanPhoneNumber = (phone: string): string => {
  if (!phone) return '';

  // Garder le + au début si présent, puis ne garder que les chiffres
  const hasPlus = phone.trim().startsWith('+');
  const digits = phone.replace(/\D/g, '');

  return hasPlus ? `+${digits}` : digits;
};

/**
 * Détecte le pays en fonction du numéro de téléphone
 */
const detectCountry = (cleanedPhone: string): CountryCode | null => {
  // Si le numéro commence par +, vérifier l'indicatif
  if (cleanedPhone.startsWith('+')) {
    for (const country of COUNTRY_CODES) {
      if (cleanedPhone.startsWith(country.dialCode)) {
        return country;
      }
    }
  }

  // Si pas d'indicatif, essayer de deviner par la longueur
  const digitsOnly = cleanedPhone.replace(/^\+/, '');

  for (const country of COUNTRY_CODES) {
    if (digitsOnly.length === country.minLength) {
      return country;
    }
  }

  // Par défaut, considérer que c'est le Sénégal (car le système est principalement SN)
  return COUNTRY_CODES[0]; // Sénégal
};

/**
 * Formate un numéro de téléphone avec l'indicatif international
 *
 * @param phone - Numéro de téléphone à formater
 * @param defaultCountry - Code pays par défaut (SN par défaut)
 * @returns Numéro formaté avec indicatif international (+221...)
 *
 * @example
 * formatPhoneNumber('77 123 45 67') // '+221771234567' (Sénégal)
 * formatPhoneNumber('0771234567') // '+221771234567' (Sénégal)
 * formatPhoneNumber('+221771234567') // '+221771234567' (déjà formaté)
 * formatPhoneNumber('0701234567', 'CI') // '+2250701234567' (Côte d'Ivoire)
 */
export const formatPhoneNumber = (phone: string, defaultCountry: string = 'SN'): string => {
  if (!phone) return '';

  // Nettoyer le numéro
  const cleaned = cleanPhoneNumber(phone);

  // Si déjà au format international valide, le retourner
  if (cleaned.startsWith('+')) {
    const country = detectCountry(cleaned);
    if (country) {
      return cleaned;
    }
  }

  // Retirer le 0 initial si présent (format local)
  let digitsOnly = cleaned.replace(/^\+/, '').replace(/^0+/, '');

  // Détecter ou utiliser le pays par défaut
  let country = detectCountry(digitsOnly);

  if (!country) {
    // Utiliser le pays par défaut
    country = COUNTRY_CODES.find(c => c.code === defaultCountry) || COUNTRY_CODES[0];
  }

  // Vérifier la longueur
  if (digitsOnly.length < country.minLength || digitsOnly.length > country.maxLength) {
    console.warn(`Numéro de téléphone invalide pour ${country.code}: longueur ${digitsOnly.length}, attendu ${country.minLength}-${country.maxLength}`);
  }

  // Retourner le numéro formaté
  return `${country.dialCode}${digitsOnly}`;
};

/**
 * Valide un numéro de téléphone
 *
 * @param phone - Numéro à valider
 * @returns true si le numéro est valide
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone) return false;

  // Rejeter si contient des lettres
  const stripped = phone.trim().replace(/^\+/, '');
  if (/[a-zA-Z]/.test(stripped)) return false;
  if (/[^0-9\s\-\+\(\)]/.test(phone.trim())) return false;

  const formatted = formatPhoneNumber(phone);
  const cleaned = formatted.replace(/^\+/, '');

  // Vérifier que c'est bien un numéro valide pour l'un des pays
  for (const country of COUNTRY_CODES) {
    const dialCodeDigits = country.dialCode.replace(/^\+/, '');
    if (cleaned.startsWith(dialCodeDigits)) {
      const numberPart = cleaned.substring(dialCodeDigits.length);
      return numberPart.length >= country.minLength && numberPart.length <= country.maxLength;
    }
  }

  return false;
};
