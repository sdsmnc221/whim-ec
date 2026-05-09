const THEMES = [
  "Tous les thèmes",
  "Principes et valeurs de la République",
  "Système institutionnel et politique",
  "Droits et devoirs",
  "Histoire, géographie et culture",
  "Vivre dans la société française",
];

const RULES = [
  ["40 questions", "28 conn. + 12 mises en situation"],
  ["45 minutes", "durée maximale"],
  ["32 / 40 (80 %)", "seuil de réussite"],
  ["Réponses masquées", "aucune correction pendant l'examen"],
  ["[Faible Confiance] Toggle", "orange · à réviser avant soumission"],
];

const THEME_SHORT: Record<string, string> = {
  "Principes et valeurs de la République": "Principes",
  "Système institutionnel et politique": "Institutions",
  "Droits et devoirs": "Droits",
  "Histoire, géographie et culture": "Histoire",
  "Vivre dans la société française": "Société",
};

const THEME_COLOR: Record<string, string> = {
  "Principes et valeurs de la République": "var(--c-bleu)",
  "Système institutionnel et politique": "var(--c-encre)",
  "Droits et devoirs": "var(--c-vert)",
  "Histoire, géographie et culture": "var(--c-orange)",
  "Vivre dans la société française": "var(--c-rouge)",
};

export { THEMES, RULES, THEME_SHORT, THEME_COLOR };
