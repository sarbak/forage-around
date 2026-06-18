// Scrump — warm botanical-almanac palette. Cream paper, forest ink, ripe accents.
export const C = {
  paper: "#F6F1E7", // warm cream background
  paperDeep: "#EFE7D6", // card / inset
  ink: "#1F2A20", // near-black forest green (primary text)
  inkSoft: "#5A6553", // muted green-grey (secondary text)
  line: "#DFD6C2", // hairline borders
  forest: "#2E5E3A", // brand green
  forestSoft: "#E3ECE0", // green tint chip bg
  ripe: "#A14F1A", // loquat / ripe-fruit orange (accent), dark enough for small text
  ripeSoft: "#F6E3CF",
  berry: "#7A2E4A", // out-of-season / deep berry
  white: "#FFFDF8",
  shadow: "rgba(31,42,32,0.10)",
};

import { Platform } from "react-native";

// On web we load Fraunces from the Google Fonts CDN (see App.tsx) and reference
// the bare family name. On native we use the bundled @expo-google-fonts faces.
export const F = {
  display: Platform.select({ web: "Fraunces", default: "Fraunces_600SemiBold" }),
  displayLight: Platform.select({ web: "Fraunces", default: "Fraunces_400Regular" }),
  // body uses the platform system font for crisp legibility + zero load cost
  body: undefined as string | undefined,
};
