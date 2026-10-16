import type { CSSProperties } from "react";

/** Paleta do Pomo — Sorbet Stem, Petal Glaze, Dusty Orchid + cores "Kahoot" de apoio. */
export const COLORS = {
  orchid: { bg: "#D56989", soft: "#F8DCE5", shadow: "#A94D6B", ink: "#FFFFFF", label: "Dusty Orchid" },
  petal: { bg: "#EA9CAF", soft: "#FCE8ED", shadow: "#C77A8D", ink: "#4A1F2B", label: "Petal Glaze" },
  leaf: { bg: "#C2DC80", soft: "#EEF6D6", shadow: "#94B052", ink: "#2F3B12", label: "Sorbet Stem" },
  forest: { bg: "#217A6E", soft: "#D3ECE7", shadow: "#145247", ink: "#FFFFFF", label: "Floresta" },
  sun: { bg: "#F4C24E", soft: "#FDF1CF", shadow: "#C9962A", ink: "#4A3205", label: "Girassol" },
  sky: { bg: "#6FA8DC", soft: "#DDEBF8", shadow: "#4A80B2", ink: "#FFFFFF", label: "Céu" },
  tangerine: { bg: "#F28C5B", soft: "#FDE3D6", shadow: "#C4653A", ink: "#FFFFFF", label: "Tangerina" },
  lavender: { bg: "#A58BD8", soft: "#ECE5F8", shadow: "#7A61AD", ink: "#FFFFFF", label: "Lavanda" },
} as const;

export type ColorName = keyof typeof COLORS;
export const COLOR_NAMES = Object.keys(COLORS) as ColorName[];

export function color(name: string | null | undefined) {
  return COLORS[(name ?? "orchid") as ColorName] ?? COLORS.orchid;
}

/** Variáveis CSS para componentes que aceitam qualquer cor da paleta. */
export function colorVars(name: string | null | undefined): CSSProperties {
  const c = color(name);
  return {
    "--c": c.bg,
    "--c-soft": c.soft,
    "--c-shadow": c.shadow,
    "--c-ink": c.ink,
  } as CSSProperties;
}

export const AVATAR_EMOJIS = ["🍅", "🦌", "🌷", "🐝", "🌵", "🦊", "🐸", "🍓", "🌻", "🐼", "🦉", "🍄", "🐙", "🌙", "⚡", "🧠"];
export const SUBJECT_EMOJIS = ["📚", "📐", "🧮", "🔬", "🧪", "💻", "📊", "🌍", "✍️", "🎨", "🧬", "⚖️", "🗣️", "🎵", "🔭", "📝"];
export const ROOM_EMOJIS = ["🏆", "🔥", "🚀", "🌱", "🍅", "🎯", "👑", "⚡"];
export const REACTIONS = ["🔥", "💪", "🧠", "👏", "🍅"];
