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
  ["[Tab] Faible confiance", "orange · à réviser avant soumission"],
  ["[S] Soumettre", "boucle : faible confiance + sans réponse"],
];

const THEME_SHORT: Record<string, string> = {
  "Principes et valeurs de la République": "Principes",
  "Système institutionnel et politique": "Institutions",
  "Droits et devoirs": "Droits",
  "Histoire, géographie et culture": "Histoire",
  "Vivre dans la société française": "Société",
};

export { THEMES, RULES, THEME_SHORT };
