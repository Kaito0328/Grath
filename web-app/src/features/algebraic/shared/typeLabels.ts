export const AlgebraicTypeLabels = {
  expr: { en: "Expr", ja: "文字式" },
  rational: { en: "Rational", ja: "有理数" },
  complex: { en: "Complex", ja: "複素数" },
  polynomial: { en: "Polynomial", ja: "多項式" },
} as const;

export type AlgebraicTypeKey = keyof typeof AlgebraicTypeLabels;
