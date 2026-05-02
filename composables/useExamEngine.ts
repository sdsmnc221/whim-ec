export const CONN_COUNT = 28;
export const MISE_COUNT = 12;
export const PASS_THRESHOLD = 0.8;
export const EXAM_SECS = 45 * 60;
export const MIN_FOR_VERDICT = 15;

export interface RawQuestion {
  id: string;
  type: "connaissance" | "mise-situation";
  theme: string;
  question: string;
  answers: string[];
  correct_index: number;
  explication: string;
  [key: string]: unknown; // extra dataset fields (source, difficulte, etc.)
}

export interface BuiltQuestion extends Omit<RawQuestion, "answers"> {
  displayAnswers: string[];
  correctDisplayIndex: number;
}

const seededRng = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const shuffle = <T>(arr: T[], rng: () => number): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const buildQ = (raw: RawQuestion, rng: () => number): BuiltQuestion => {
  const correct = raw.answers[raw.correct_index];
  const displayAnswers = shuffle(raw.answers, rng);
  return {
    ...raw,
    displayAnswers,
    correctDisplayIndex: displayAnswers.indexOf(correct),
  };
};

export const drawQuestions = (
  dataset: RawQuestion[],
  themes: string[],
  seed: number,
): BuiltQuestion[] => {
  const filter = (q: RawQuestion) =>
    themes.length === 0 || themes.includes(q.theme);

  const conn = shuffle(
    dataset.filter((q) => q.type === "connaissance" && filter(q)),
    seededRng(seed),
  ).slice(0, CONN_COUNT);

  const mise = shuffle(
    dataset.filter((q) => q.type === "mise-situation" && filter(q)),
    seededRng(seed + 1),
  ).slice(0, MISE_COUNT);

  // interleave ~2 conn → 1 mise
  const all: RawQuestion[] = [];
  let ci = 0,
    mi = 0;
  while (ci < conn.length || mi < mise.length) {
    if (ci < conn.length) all.push(conn[ci++]);
    if (ci < conn.length) all.push(conn[ci++]);
    if (mi < mise.length) all.push(mise[mi++]);
  }

  return all
    .slice(0, CONN_COUNT + MISE_COUNT)
    .map((q, i) => buildQ(q, seededRng(seed + i * 37)));
};

export const computeScore = (
  questions: BuiltQuestion[],
  answers: (number | null)[],
) => {
  const correct = questions.reduce(
    (acc, q, i) => (answers[i] === q.correctDisplayIndex ? acc + 1 : acc),
    0,
  );
  const total = questions.length;
  const pct = correct / total;
  const hasVerdict = total >= MIN_FOR_VERDICT;
  return {
    correct,
    total,
    pct,
    hasVerdict,
    passed: hasVerdict && pct >= PASS_THRESHOLD,
  };
};

export const fmtTime = (s: number): string =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
