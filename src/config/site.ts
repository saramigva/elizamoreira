/**
 * Configuração central do site.
 * Os valores marcados «A CONFIRMAR» são provisórios: basta alterá-los aqui.
 */
export const site = {
  name: "Eliza Moreira",
  tagline: "TATTOO — LISBOA",
  heroLine: "Traço firme, simbolismo pessoal, uma marca que fica.",
  about:
    "Olá, sou a Eliza, artista independente. A arte sempre fez parte de quem sou e tatuar sempre foi a minha paixão. Agora é também o meu caminho e quero partilhar convosco cada passo, linha a linha.",
  styles: "Blackwork e fine line",

  instagram: "elizamoreira.ink",
  /** Número em formato internacional, só dígitos (ex.: "351912345678"). Vazio = botão «em breve». */
  whatsapp: "",

  /** false mostra o botão «marcações» como «em breve». */
  bookingsOpen: true,
  /** A CONFIRMAR: localização do estúdio. */
  studioLocation: "Lisboa",
  /** A CONFIRMAR: número de selos e brinde. */
  loyalty: { total: 10, reward: "o teu brinde" },
  referralDiscountPercent: 50,
  /** A CONFIRMAR: sinal (20% ou 30%) e preço mínimo (50€ ou 60€). Ainda não usado no front-end. */
  deposit: { percent: 30, minSessionEur: 60 },
} as const;

export const instagramUrl = `https://instagram.com/${site.instagram}`;
