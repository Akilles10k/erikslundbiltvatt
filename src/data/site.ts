export const SITE = {
  name: "Glansig Bilvård",
  tagline: "Professionell handtvätt & rekond",
  city: "Erikslund",
  phone: "0709131414",
  phoneHref: "tel:+46709131414",
  phoneSecondary: "",
  phoneSecondaryHref: "",
  phones: [{ number: "0709131414", href: "tel:+46709131414" }],
  email: "glansigbilvarderikslund@gmail.com",
  bookingEmail: "glansigbilvarderikslund@gmail.com",
  /** FormSubmit endpoint id (hides email in form action) */
  formSubmitId: "a8dbf22e60b22639a6d6ba84797ccad9",
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
  serviceId: number;
  slug: string;
  validUntil?: string;
  ctaText: string;
  ctaLink: string;
};

/** Redigera kampanjpriser här – styr om erbjudandepopup visas */
export const CAMPAIGN: Campaign = {
  active: true,
  title: "50% RABATT",
  subtitle: "PÅ HELREKOND",
  originalPrice: "3 000 kr",
  campaignPrice: "1 495 kr",
  description:
    "Just nu 1 495 kr (Ord. pris 3 000 kr) Inklusive en anpassad polering, noggrann vaxning och en detaljerad Rekond!",
  serviceId: 11,
  slug: "helrekond",
  ctaText: "Hämta Erbjudandet",
  ctaLink: "/tjanster?kampanj=helrekond",
};

export type OfferCampaign = {
  id: string;
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  imagePosition?: string;
  bookingName: string;
  kicker: string;
  headline: string;
  tagline?: string;
  description: string;
  includes?: string[];
  highlight?: string;
  footnote?: string;
  price: string;
  originalPrice?: string;
};

/** Kampanjer i startsidans erbjudandepopup (välj → boka) */
export const CAMPAIGNS: OfferCampaign[] = [
  {
    id: "komplett-bilvard",
    image: "/kampanjer/komplett-bilvard.png",
    imageAlt:
      "Komplett bilvård, kampanjpris 1 290 kr. Utvändig tvätt, invändig rengöring, asfaltsborttagning, vaxning och däckbyte.",
    imageWidth: 1145,
    imageHeight: 1374,
    imagePosition: "center top",
    bookingName: "Komplett bilvård",
    kicker: "KOMPLETT BILVÅRD",
    headline: "1 290 KR",
    tagline: "Supererbjudande – allt i ett paket",
    description:
      "Ge din bil ny glans till ett fantastiskt pris! Ett komplett bilvårdspaket som gör din bil ren, fräsch och redo för vägarna.",
    includes: [
      "Utvändig biltvätt – Noggrann rengöring av bilens utsida",
      "Invändig rengöring – Dammsugning och rengöring av kupé, instrumentpanel och mattor",
      "Asfaltsborttagning – Vi tar bort envisa asfaltfläckar från lacken",
      "Vaxning – Ger bilen en fantastisk glans och hjälper till att skydda lacken",
      "Däckbyte – Byte mellan sommar- och vinterhjul",
    ],
    highlight: "Allt detta för endast 1 290 kr!",
    footnote:
      "OBS! Sätestvätt och klädseltvätt ingår inte i erbjudandet. Endast vanlig invändig rengöring. Ren bil, glänsande lack och rätt däck – allt i ett paket. Kontakta oss redan idag för att boka din tid!",
    price: "1 290 kr",
  },
  {
    id: "vinter-keramiskt",
    image: "/kampanjer/vinter-keramiskt.png",
    imageAlt:
      "Vinterkampanj keramiskt lackskydd. 2 900 kr, ordinarie 5 900 kr. 3 års garanti.",
    imageWidth: 1024,
    imageHeight: 1024,
    imagePosition: "center top",
    bookingName: "Keramiskt lackskydd – vinterkampanj",
    kicker: "KERAMISKT LACKSKYDD",
    headline: "2 900 KR",
    tagline: "Vintererbjudande – spara 3 000 kr",
    description:
      "Skydda din bil inför vintern! Vägsalt, smuts och slask utsätter lacken för stora påfrestningar. Med vårt keramiska lackskydd får din bil en fantastisk glans och en skyddande, vattenavvisande yta.",
    includes: [
      "Hjälper till att minska hur mycket salt och smuts som fastnar på lacken",
      "Gör bilen betydligt enklare att tvätta",
      "Vatten- och smutsavvisande effekt",
      "Ger lacken en djup och exklusiv glans",
      "Underlättar bilens skötsel under vintern",
      "3 års garanti enligt våra garantivillkor",
    ],
    highlight: "3 års garanti",
    footnote:
      "Vintern är tuff mot din bil – ge lacken det skydd den förtjänar! Begränsat erbjudande – endast under vinterkampanjen. Boka din tid redan idag!",
    price: "2 900 kr",
    originalPrice: "5 900 kr",
  },
  {
    id: "invandig-rekond-black-week",
    image: "/kampanjer/invandig-rekond.png",
    imageAlt:
      "Black Week invändig rekond. 1 245 kr, ordinarie 2 490 kr. Sätestvätt och komplett invändig rengöring.",
    imageWidth: 986,
    imageHeight: 1024,
    imagePosition: "center top",
    bookingName: "Invändig rekond – Black Week",
    kicker: "BLACK WEEK",
    headline: "INVÄNDIG REKOND",
    tagline: "Sätestvätt + komplett invändig rengöring – 50% rabatt",
    description:
      "Ge din bil en nybilskänsla med vår professionella invändiga rekond!",
    includes: [
      "Professionell sätestvätt",
      "Djuprengöring av hela interiören",
      "Rengöring av instrumentpanel och mittkonsol",
      "Rengöring av mattor och golv",
      "Noggrann dammsugning",
      "Borttagning av smuts och fläckar",
    ],
    highlight: "Halva priset – Black Week endast 1 245 kr!",
    footnote:
      "Begränsat Black Week-erbjudande. Ren kupé, fräsch känsla och bättre körupplevelse. Boka din tid redan idag och spara 1 245 kr!",
    price: "1 245 kr",
    originalPrice: "2 490 kr",
  },
];
