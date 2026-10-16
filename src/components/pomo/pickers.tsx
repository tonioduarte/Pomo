"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { COLOR_NAMES, color } from "@/lib/palette";

export function ColorPicker({ name, value, onChange }: { name: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      <input type="hidden" name={name} value={value} />
      {COLOR_NAMES.map((n) => {
        const c = color(n);
        const active = value === n;
        return (
          <motion.button
            key={n}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={c.label}
            title={c.label}
            whileTap={{ scale: 0.85 }}
            animate={{ scale: active ? 1.15 : 1 }}
            onClick={() => onChange(n)}
            className={cn("size-9 rounded-full", active && "ring-4 ring-offset-2")}
            style={{ background: c.bg, boxShadow: `0 3px 0 ${c.shadow}`, ["--tw-ring-color" as string]: c.soft }}
          />
        );
      })}
    </div>
  );
}

export function EmojiPicker({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup">
      <input type="hidden" name={name} value={value} />
      {options.map((e) => (
        <motion.button
          key={e}
          type="button"
          role="radio"
          aria-checked={value === e}
          whileTap={{ scale: 0.8, rotate: -10 }}
          onClick={() => onChange(e)}
          className={cn(
            "flex size-10 items-center justify-center rounded-xl text-xl transition-colors",
            value === e ? "bg-petal/40 ring-2 ring-orchid" : "bg-lilac hover:bg-accent",
          )}
        >
          {e}
        </motion.button>
      ))}
    </div>
  );
}

export function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-sm font-bold text-destructive">{errors[0]}</p>;
}
