export interface CountryPhoneData {
  name: string;
  code: string; // ISO 2-letter uppercase
  dialCode: string; // "+91"
  flag: string; // "🇮🇳"
  formatHint?: string; // "98765 43210"
}

export const COUNTRY_PHONE_CODES: CountryPhoneData[] = [
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳", formatHint: "98765 43210" },
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸", formatHint: "(555) 234-5678" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧", formatHint: "7911 123456" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦", formatHint: "(555) 234-5678" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺", formatHint: "412 345 678" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "🇦🇪", formatHint: "50 123 4567" },
  { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "🇸🇦", formatHint: "50 123 4567" },
  { name: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬", formatHint: "8123 4567" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪", formatHint: "151 23456789" },
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷", formatHint: "6 12 34 56 78" },
  { name: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵", formatHint: "90 1234 5678" },
  { name: "China", code: "CN", dialCode: "+86", flag: "🇨🇳", formatHint: "138 0013 8000" },
  { name: "South Korea", code: "KR", dialCode: "+82", flag: "🇰🇷", formatHint: "10 1234 5678" },
  { name: "Bangladesh", code: "BD", dialCode: "+880", flag: "🇧🇩", formatHint: "1712 345678" },
  { name: "Pakistan", code: "PK", dialCode: "+92", flag: "🇵🇰", formatHint: "300 1234567" },
  { name: "Sri Lanka", code: "LK", dialCode: "+94", flag: "🇱🇰", formatHint: "71 234 5678" },
  { name: "Nepal", code: "NP", dialCode: "+977", flag: "🇳🇵", formatHint: "984 1234567" },
  { name: "Indonesia", code: "ID", dialCode: "+62", flag: "🇮🇩", formatHint: "812 3456 7890" },
  { name: "Malaysia", code: "MY", dialCode: "+60", flag: "🇲🇾", formatHint: "12 345 6789" },
  { name: "Philippines", code: "PH", dialCode: "+63", flag: "🇵🇭", formatHint: "917 123 4567" },
  { name: "Vietnam", code: "VN", dialCode: "+84", flag: "🇻🇳", formatHint: "91 234 5678" },
  { name: "Thailand", code: "TH", dialCode: "+66", flag: "🇹🇭", formatHint: "81 234 5678" },
  { name: "New Zealand", code: "NZ", dialCode: "+64", flag: "🇳🇿", formatHint: "21 123 4567" },
  { name: "Ireland", code: "IE", dialCode: "+353", flag: "🇮🇪", formatHint: "85 123 4567" },
  { name: "Netherlands", code: "NL", dialCode: "+31", flag: "🇳🇱", formatHint: "6 12345678" },
  { name: "Switzerland", code: "CH", dialCode: "+41", flag: "🇨🇭", formatHint: "78 123 45 67" },
  { name: "Sweden", code: "SE", dialCode: "+46", flag: "🇸🇪", formatHint: "70 123 45 67" },
  { name: "Norway", code: "NO", dialCode: "+47", flag: "🇳🇴", formatHint: "412 34 567" },
  { name: "Denmark", code: "DK", dialCode: "+45", flag: "🇩🇰", formatHint: "20 12 34 56" },
  { name: "Finland", code: "FI", dialCode: "+358", flag: "🇫🇮", formatHint: "40 1234567" },
  { name: "Spain", code: "ES", dialCode: "+34", flag: "🇪🇸", formatHint: "612 34 56 78" },
  { name: "Italy", code: "IT", dialCode: "+39", flag: "🇮🇹", formatHint: "312 345 6789" },
  { name: "Portugal", code: "PT", dialCode: "+351", flag: "🇵🇹", formatHint: "912 345 678" },
  { name: "Poland", code: "PL", dialCode: "+48", flag: "🇵🇱", formatHint: "512 345 678" },
  { name: "Austria", code: "AT", dialCode: "+43", flag: "🇦🇹", formatHint: "664 1234567" },
  { name: "Belgium", code: "BE", dialCode: "+32", flag: "🇧🇪", formatHint: "470 12 34 56" },
  { name: "Brazil", code: "BR", dialCode: "+55", flag: "🇧🇷", formatHint: "11 98765-4321" },
  { name: "Mexico", code: "MX", dialCode: "+52", flag: "🇲🇽", formatHint: "55 1234 5678" },
  { name: "Argentina", code: "AR", dialCode: "+54", flag: "🇦🇷", formatHint: "9 11 1234-5678" },
  { name: "South Africa", code: "ZA", dialCode: "+27", flag: "🇿🇦", formatHint: "71 123 4567" },
  { name: "Nigeria", code: "NG", dialCode: "+234", flag: "🇳🇬", formatHint: "802 123 4567" },
  { name: "Kenya", code: "KE", dialCode: "+254", flag: "🇰🇪", formatHint: "712 345678" },
  { name: "Egypt", code: "EG", dialCode: "+20", flag: "🇪🇬", formatHint: "10 1234 5678" },
  { name: "Turkey", code: "TR", dialCode: "+90", flag: "🇹🇷", formatHint: "532 123 4567" },
  { name: "Qatar", code: "QA", dialCode: "+974", flag: "🇶🇦", formatHint: "3312 3456" },
  { name: "Kuwait", code: "KW", dialCode: "+965", flag: "🇰🇼", formatHint: "9123 4567" },
  { name: "Oman", code: "OM", dialCode: "+968", flag: "🇴🇲", formatHint: "9123 4567" },
  { name: "Bahrain", code: "BH", dialCode: "+973", flag: "🇧🇭", formatHint: "3612 3456" },
  { name: "Israel", code: "IL", dialCode: "+972", flag: "🇮🇱", formatHint: "50 123 4567" },
  { name: "Russia", code: "RU", dialCode: "+7", flag: "🇷🇺", formatHint: "912 345-67-89" },
  { name: "Ukraine", code: "UA", dialCode: "+380", flag: "🇺🇦", formatHint: "50 123 4567" },
  { name: "Hong Kong", code: "HK", dialCode: "+852", flag: "🇭🇰", formatHint: "9123 4567" },
  { name: "Taiwan", code: "TW", dialCode: "+886", flag: "🇹🇼", formatHint: "912 345 678" },
  { name: "Ghana", code: "GH", dialCode: "+233", flag: "🇬🇭", formatHint: "24 123 4567" },
  { name: "Ethiopia", code: "ET", dialCode: "+251", flag: "🇪🇹", formatHint: "91 123 4567" },
  { name: "Colombia", code: "CO", dialCode: "+57", flag: "🇨🇴", formatHint: "300 1234567" },
  { name: "Chile", code: "CL", dialCode: "+56", flag: "🇨🇱", formatHint: "9 1234 5678" },
  { name: "Peru", code: "PE", dialCode: "+51", flag: "🇵🇪", formatHint: "912 345 678" },
  { name: "Greece", code: "GR", dialCode: "+30", flag: "🇬🇷", formatHint: "69 1234 5678" },
  { name: "Czech Republic", code: "CZ", dialCode: "+420", flag: "🇨🇿", formatHint: "601 123 456" },
  { name: "Hungary", code: "HU", dialCode: "+36", flag: "🇭🇺", formatHint: "20 123 4567" },
  { name: "Romania", code: "RO", dialCode: "+40", flag: "🇷🇴", formatHint: "712 345 678" },
];

/**
 * Parses an existing phone string to find the best matching country dial code.
 * E.g. "+91 9876543210" => { country: IN, nationalNumber: "9876543210" }
 */
export function parsePhoneNumber(fullPhone: string): { country: CountryPhoneData; nationalNumber: string } {
  const trimmed = fullPhone.trim();
  
  if (!trimmed) {
    return { country: COUNTRY_PHONE_CODES[0], nationalNumber: "" };
  }

  // Check if string starts with a known dialCode (sort longest dialCode first e.g. +880 before +8)
  const sorted = [...COUNTRY_PHONE_CODES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const c of sorted) {
    if (trimmed.startsWith(c.dialCode)) {
      const rest = trimmed.slice(c.dialCode.length).trim();
      return { country: c, nationalNumber: rest };
    }
  }

  // If starts with +, but unrecognized or just +, check digits
  return { country: COUNTRY_PHONE_CODES[0], nationalNumber: trimmed };
}
