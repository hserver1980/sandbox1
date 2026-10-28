// Mixes a hex color with white (amount > 0) or black (amount < 0).
export const shade = (hex: string, amount: number): string => {
  const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
  const target = amount > 0 ? 255 : 0;
  const a = Math.abs(amount);
  const channel = (shift: number) => {
    const c = (n >> shift) & 0xff;
    return Math.round(c + (target - c) * a)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${channel(16)}${channel(8)}${channel(0)}`;
};
