import * as Anton from "@remotion/google-fonts/Anton";
import * as BebasNeue from "@remotion/google-fonts/BebasNeue";
import * as Inter from "@remotion/google-fonts/Inter";
import * as Montserrat from "@remotion/google-fonts/Montserrat";
import * as Nunito from "@remotion/google-fonts/Nunito";
import * as Oswald from "@remotion/google-fonts/Oswald";
import * as Poppins from "@remotion/google-fonts/Poppins";
import * as RobotoCondensed from "@remotion/google-fonts/RobotoCondensed";

// Fonts offered in the Studio props panel. To add one, import it from
// @remotion/google-fonts and add it here; the schema picks it up automatically.
const FONT_MODULES = {
  Montserrat,
  Poppins,
  Inter,
  Oswald,
  "Bebas Neue": BebasNeue,
  "Roboto Condensed": RobotoCondensed,
  Anton,
  Nunito,
};

export type FontName = keyof typeof FONT_MODULES;

export const FONT_NAMES = Object.keys(FONT_MODULES) as [FontName, ...FontName[]];

// Each font module has its own narrowly-typed loadFont(); this is the shape they share.
type LoadFont = (
  style: "normal",
  options: { weights: string[]; subsets: string[] },
) => { fontFamily: string };

const WANTED_WEIGHTS = ["400", "600", "700", "800", "900"];
const loaded = new Map<FontName, string>();

// Only the fonts actually selected get downloaded. loadFont() blocks rendering
// until the font is ready, so the first frame never shows a fallback font.
export const getFontFamily = (name: FontName): string => {
  const cached = loaded.get(name);
  if (cached) return cached;
  const mod = FONT_MODULES[name];
  const available = Object.keys(mod.getInfo().fonts.normal);
  const { fontFamily } = (mod.loadFont as LoadFont)("normal", {
    weights: WANTED_WEIGHTS.filter((w) => available.includes(w)),
    subsets: ["latin"],
  });
  loaded.set(name, fontFamily);
  return fontFamily;
};
