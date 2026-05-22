const COUNTRY_FLAGS = {
  // Europe
  "Bulgaria":       "🇧🇬",
  "Germany":        "🇩🇪",
  "France":         "🇫🇷",
  "Italy":          "🇮🇹",
  "Austria":        "🇦🇹",
  "Switzerland":    "🇨🇭",
  "Norway":         "🇳🇴",
  "Sweden":         "🇸🇪",
  "Finland":        "🇫🇮",
  "Netherlands":    "🇳🇱",
  "Belgium":        "🇧🇪",
  "Spain":          "🇪🇸",
  "Portugal":       "🇵🇹",
  "Poland":         "🇵🇱",
  "Czech Republic": "🇨🇿",
  "Slovakia":       "🇸🇰",
  "Hungary":        "🇭🇺",
  "Romania":        "🇷🇴",
  "Croatia":        "🇭🇷",
  "Slovenia":       "🇸🇮",
  "Serbia":         "🇷🇸",
  "Greece":         "🇬🇷",
  "Denmark":        "🇩🇰",
  "Iceland":        "🇮🇸",
  "Ireland":        "🇮🇪",
  "United Kingdom": "🇬🇧",
  "Russia":         "🇷🇺",
  "Ukraine":        "🇺🇦",
  "Belarus":        "🇧🇾",
  "Latvia":         "🇱🇻",
  "Lithuania":      "🇱🇹",
  "Estonia":        "🇪🇪",

  // Americas
  "United States":  "🇺🇸",
  "USA":            "🇺🇸",
  "Canada":         "🇨🇦",
  "Brazil":         "🇧🇷",
  "Argentina":      "🇦🇷",
  "Mexico":         "🇲🇽",

  // Asia / Pacific
  "Japan":          "🇯🇵",
  "China":          "🇨🇳",
  "South Korea":    "🇰🇷",
  "Korea":          "🇰🇷",
  "Kazakhstan":     "🇰🇿",
  "Australia":      "🇦🇺",
  "New Zealand":    "🇳🇿",

  // Other
  "Georgia":        "🇬🇪",
};

/**
 * Returns the flag emoji for a country name, or a generic 🏳️ if not found.
 * Case-insensitive match as fallback.
 */
export function getFlag(country) {
  if (!country) return "🏳️";

  // exact match first
  if (COUNTRY_FLAGS[country]) return COUNTRY_FLAGS[country];

  // case-insensitive fallback
  const lower = country.toLowerCase();
  const key = Object.keys(COUNTRY_FLAGS).find(k => k.toLowerCase() === lower);
  return key ? COUNTRY_FLAGS[key] : "🏳️";
}