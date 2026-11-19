"use client";
import { translateText } from "@/app/_lib/localization";

import type { CSSProperties } from "react";
import { Menu } from "iconoir-react";

type AppHeaderProps = {
  open: boolean;
  sidebarWidth: number;
  onToggle: () => void;
};

function AppHeader({ open, sidebarWidth, onToggle }: AppHeaderProps) {
  return (
    <header
      style={{ "--header-left": `calc(${sidebarWidth}px + 0.5rem)` } as CSSProperties}
      className="fixed inset-x-0 top-0 z-50 flex h-11 items-center bg-[var(--color-foreground-secondary)] px-4 text-[var(--color-foreground)] shadow-sm sm:px-6 md:left-[var(--header-left)] md:rounded-bl-2xl"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={translateText(open ? "Cerrar menú" : "Abrir menú")}
        aria-expanded={open}
        className="flex h-full items-center gap-3 rounded-md pr-3 text-left transition hover:bg-white/10"
      >
        <Menu className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="text-base font-semibold">{translateText("Hamacas Nica")}</span>
      </button>
    </header>
  );
}

export { AppHeader };
