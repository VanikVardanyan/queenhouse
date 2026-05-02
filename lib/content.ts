export const SITE = {
  name: "Queen House",
  domain: "queenhouse.am",
  url: "https://queenhouse.am",
  email: "queenhouse.arm@gmail.com",
  phone: "+374 41 59 59 56",
  phoneE164: "+37441595956",
  instagram: null as string | null,
  address: {
    hy: "Վարդաբլուր, Լոռու մարզ, Հայաստան",
    ru: "Вардаблур, Лорийская область, Армения",
    en: "Vardablur, Lori Province, Armenia",
  },
  coords: { lat: 41.001, lng: 44.38 },
  mapsUrl: "https://www.google.com/maps?q=41.001,44.380",
} as const;

export const AMENITIES = [
  { key: "jacuzzi", emoji: "♨️" },
  { key: "firepit", emoji: "🔥" },
  { key: "coffee", emoji: "☕" },
  { key: "wifi", emoji: "📶" },
  { key: "parking", emoji: "🅿️" },
] as const;
