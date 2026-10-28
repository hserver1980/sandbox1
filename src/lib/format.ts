// Brazilian number formatting: "45,5 mi", "450 mil", "190.755.799".

const decimal = (n: number, digits: number) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const formatCompact = (n: number): string => {
  if (n >= 1_000_000) return `${decimal(n / 1_000_000, n >= 100_000_000 ? 0 : 1)} mi`;
  if (n >= 1_000) return `${decimal(n / 1_000, 0)} mil`;
  return decimal(n, 0);
};

export const formatFull = (n: number): string => decimal(Math.round(n), 0);

export const formatPercent = (share: number): string => `${decimal(share * 100, share < 0.1 ? 1 : 0)}%`;
