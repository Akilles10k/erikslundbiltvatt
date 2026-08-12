export const SITE = {
  name: "Glansig Biltvätt",
  tagline: "Professionell handtvätt & rekond",
  city: "Erikslund",
  phone: "0709131414",
  phoneHref: "tel:+46709131414",
  phoneSecondary: "",
  phoneSecondaryHref: "",
  phones: [{ number: "0709131414", href: "tel:+46709131414" }],
  email: "glansigbilvarderikslund@gmail.com",
  bookingEmail: "glansigbilvarderikslund@gmail.com",
  address: {
    street: "Hallsta Gårdsgata 24",
    postalCode: "721 38",
    city: "Västerås",
    full: "Hallsta Gårdsgata 24, 721 38 Västerås",
    mapsHref:
      "https://www.google.com/maps/search/?api=1&query=Hallsta+G%C3%A5rdsgata+24%2C+721+38+V%C3%A4ster%C3%A5s",
    mapsEmbedHref:
      "https://maps.google.com/maps?q=Hallsta+G%C3%A5rdsgata+24%2C+721+38+V%C3%A4ster%C3%A5s&hl=sv&z=15&output=embed",
  },
  openingHours: [
    { days: "Mån – Fre", hours: "08 – 18" },
    { days: "Lördag", hours: "10 – 17" },
  ],
  geo: {
    latitude: 59.3653,
    longitude: 16.4923,
  },
} as const;

export type Service = {
  id: number;
  name: string;
  price: string;
  priceLarge?: string;
  description: string;
  duration?: string;
  category: "tvatt" | "rekond" | "special" | "dack" | "fordon";
};

export const SERVICES: Service[] = [
  {
    id: 1,
    name: "Handtvätt utvändigt",
    price: "fr 300 kr",
    priceLarge: "7-sits/SUV/Jeep fr 400 kr",
    description:
      "Mikroavfettning, schamponering, spolning av hjulhus, fälgrengöring och torkning.",
    category: "tvatt",
  },
  {
    id: 2,
    name: "Handtvätt invändigt",
    price: "fr 300 kr",
    priceLarge: "7-sits/SUV/Jeep fr 400 kr",
    description:
      "Dammsugning av kupé och bagageutrymme, rengöring och torkning av paneler, dörrkarmar och dörrfack. Fönsterputsning invändigt. Dörrmattor tvättas/dammsugs.",
    category: "tvatt",
  },
  {
    id: 3,
    name: "In & utvändig tvätt",
    price: "fr 499 kr",
    priceLarge: "7-sits/SUV/Jeep fr 599 kr",
    description: "Kombination av nummer 1 och 2.",
    duration: "ca 70 min",
    category: "tvatt",
  },
  {
    id: 4,
    name: "Supertvätt",
    price: "fr 699 kr",
    priceLarge: "7-sits/SUV/Jeep fr 799 kr",
    description:
      "När bilen är smutsigare och en vanlig in- och utvändig tvätt inte räcker till.",
    category: "tvatt",
  },
  {
    id: 5,
    name: "Utvändig tvätt med asfaltrengöring",
    price: "fr 450 kr",
    priceLarge: "7-sits/SUV/Jeep fr 600 kr",
    description:
      "Då bilen inte tvättats på länge eller du åker mycket med den. Syns som svarta prickar/fläckar eller att bilen känns som sandpapper.",
    category: "tvatt",
  },
  {
    id: 6,
    name: "In & utvändig tvätt + Asfaltsborttagning",
    price: "fr 790 kr",
    priceLarge: "7-sits/SUV/Jeep fr 890 kr",
    description: "Nummer 3 plus kallavfettning som löser asfalt och annat.",
    duration: "ca 80 min",
    category: "tvatt",
  },
  {
    id: 7,
    name: "Hundhårsborttagning",
    price: "fr 490 kr",
    description: "Effektiv borttagning av hundhår från interiören.",
    category: "special",
  },
  {
    id: 8,
    name: "Vaxning",
    price: "fr 1490 kr",
    priceLarge: "7-sits/SUV/Jeep fr 1690 kr",
    description: "Utvändig tvätt med asfaltborttagning och vaxning.",
    duration: "ca 3 tim",
    category: "rekond",
  },
  {
    id: 9,
    name: "Utvändig Rekond/Polering",
    price: "fr 2990 kr",
    description:
      "Maskinell mikroslipning och vaxning. Behandlingen gör att smårepor försvinner och bilen blir glansig och mer lättskött.",
    duration: "ca 6 tim",
    category: "rekond",
  },
  {
    id: 10,
    name: "Invändig Rekond",
    price: "fr 2490 kr",
    description:
      "En grundligare rengöring där nummer 2 följs av att säten behandlas och fläckar tas bort för hand från golv till tak. Säten torkas skonsamt upp i våra hallar med fläktar.",
    duration: "6 tim – 1 dag",
    category: "rekond",
  },
  {
    id: 11,
    name: "Helrekond",
    price: "fr 3990 kr",
    description: "Nummer 8 och 9 tillsammans plus motortvätt.",
    duration: "1 dag",
    category: "rekond",
  },
  {
    id: 12,
    name: "Lackskydd, lackkonservering, lackförsegling",
    price: "fr 5900 kr",
    description:
      "Som nummer 9, men vaxning ersätts med lackförsegling. Vi använder Meguiar's/Wax Guard-produkter och lämnar 2 års garanti.",
    category: "rekond",
  },
  {
    id: 13,
    name: "Klädseltvätt/Sätestvätt",
    price: "fr 1490 kr",
    description: "Professionell tvätt av klädsel och säten.",
    category: "rekond",
  },
  {
    id: 14,
    name: "Skinnklädsel",
    price: "fr 950 kr",
    description:
      "Skinn tvättas och behandlas med speciellt anpassat medel för maximal vård och hållbarhet.",
    category: "rekond",
  },
  {
    id: 15,
    name: "Motortvätt",
    price: "fr 490 kr",
    description:
      "Rengöring av motorutrymmet. OBS! Vi tar inget ansvar för motortvätt.",
    category: "special",
  },
  {
    id: 16,
    name: "Strålkastarrenovering",
    price: "fr 500 kr/st",
    description: "Se klarare och bli så mycket snyggare – återställer gulnade och matta strålkastare.",
    category: "special",
  },
  {
    id: 17,
    name: "Däckbyte",
    price: "fr 390 kr",
    description: "Byte av däck på befintliga fälgar.",
    category: "dack",
  },
  {
    id: 18,
    name: "Fälgrengöring/däcktvätt",
    price: "fr 150 kr",
    description:
      "För 4 lösa sommar-/vinterdäck. Däckpåsar 4 st för 100 kr. Tips: ta med egna påsar till blöta däck.",
    category: "dack",
  },
  {
    id: 19,
    name: "Montering och balansering av aluminiumfälgar",
    price: "fr 900 kr",
    description: "Professionell montering och balansering.",
    category: "dack",
  },
  {
    id: 20,
    name: "Montering och balansering av plåtfälg",
    price: "fr 790 kr",
    description: "Professionell montering och balansering.",
    category: "dack",
  },
  {
    id: 21,
    name: "Skåpbil (mindre) In- och utvändig tvätt",
    price: "fr 790 kr",
    description: "Komplett tvätt för mindre skåpbilar.",
    category: "fordon",
  },
  {
    id: 22,
    name: "Minibuss & större Skåpbil In- och utvändig tvätt",
    price: "fr 1250 kr",
    description: "Komplett tvätt för minibussar och större skåpbilar.",
    category: "fordon",
  },
  {
    id: 23,
    name: "Lätt lastbilstvätt Utvändig tvätt",
    price: "fr 1290 kr",
    description: "Utvändig tvätt för lätta lastbilar.",
    category: "fordon",
  },
  {
    id: 24,
    name: "Husbilstvätt Utvändig tvätt",
    price: "fr 1950 kr",
    description: "Utvändig tvätt för husbilar.",
    category: "fordon",
  },
  {
    id: 25,
    name: "Husbil Rekond",
    price: "Kontakta oss för prisoffert",
    description: "Skräddarsydd rekond för husbilar – offert på begäran.",
    category: "fordon",
  },
  {
    id: 26,
    name: "Båttvätt",
    price: "Kontakta oss för prisoffert",
    description: "Professionell båttvätt – offert på begäran.",
    category: "fordon",
  },
  {
    id: 27,
    name: "Påfyllnad av spolarvätska",
    price: "fr 75 kr",
    description: "Snabb påfyllnad av spolarvätska.",
    category: "special",
  },
  {
    id: 28,
    name: "Keramiskt lackskydd",
    price: "fr 7990 kr",
    description: "Med 8 års garanti (24 000 mil). Premium keramiskt lackskydd.",
    category: "rekond",
  },
  {
    id: 29,
    name: "Glansig Special",
    price: "fr 14900 kr",
    description:
      "Keramiskt lackskydd kombinerat med grundlig invändig rekond och utvändig tvätt.",
    category: "rekond",
  },
];

export const CATEGORY_LABELS: Record<Service["category"], string> = {
  tvatt: "Handtvätt & Paket",
  rekond: "Rekond & Lackskydd",
  special: "Tilläggstjänster",
  dack: "Däck & Fälgar",
  fordon: "Skåpbil, Lastbil & Husbil",
};
export type Campaign = {
  active: boolean;
  title: string;
  subtitle: string;
  originalPrice: string;
  campaignPrice: string;
  description: string;
  validUntil?: string;
  ctaText: string;
  ctaLink: string;
};

/** Redigera kampanjpriser här – visas som popup vid första besök */
export const CAMPAIGN: Campaign = {
  active: true,
  title: "Vårkampanj!",
  subtitle: "In & utvändig tvätt",
  originalPrice: "499 kr",
  campaignPrice: "449 kr",
  description:
    "Boka in- och utvändig handtvätt till kampanjpris. Gäller t.o.m. 31 augusti 2026.",
  validUntil: "2026-08-31",
  ctaText: "Boka nu",
  ctaLink: "/tjanster",
};
