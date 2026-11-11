/** Dados FICTÍCIOS para os ecrãs de demonstração (portal e painel). */

export const demoClient = {
  firstName: "Ana",
  fullName: "Ana Silva",
  initials: "AS",
  stamps: 6,
  referralCode: "ANA-7K2Q",
  lastSession: { date: "12 set", description: "blackwork antebraço", price: "€120" },
};

export type Appointment = { time: string; client: string; zone: string };

/** Marcações de exemplo, repetidas em todos os meses (por dia do mês). */
export const demoAppointments: Record<number, Appointment[]> = {
  3: [{ time: "10:00", client: "Ana Silva", zone: "antebraço" }],
  9: [{ time: "14:30", client: "João Costa", zone: "ombro" }],
  12: [
    { time: "11:00", client: "Marta Reis", zone: "perna" },
    { time: "16:00", client: "Ana Silva", zone: "braço" },
  ],
  18: [{ time: "15:00", client: "João Costa", zone: "peito" }],
  24: [{ time: "10:30", client: "Marta Reis", zone: "coxa" }],
  27: [{ time: "17:00", client: "Ana Silva", zone: "mão" }],
};

export const demoSummary = { weekAppointments: 4, openTickets: 2, rating: "4,9" };

export const demoFeedback = {
  site: [
    { author: "Ana Silva", stars: 5, text: "Adorei o resultado e todo o cuidado durante a sessão." },
    { author: "Marta Reis", stars: 5, text: "Ambiente tranquilo e um traço impecável." },
  ],
  google: [
    { author: "João Costa", stars: 5, text: "Muito profissional. Recomendo sem hesitar." },
    { author: "Marta Reis", stars: 4, text: "Correu tudo bem, voltarei para a próxima." },
  ],
};

export const demoTickets = [
  { id: "#032", subject: "cuidados pós-tattoo", client: "Ana Silva", open: true },
  { id: "#031", subject: "cuidados pós-tattoo", client: "João Costa", open: true },
  { id: "#029", subject: "cuidados pós-tattoo", client: "Marta Reis", open: false },
];
