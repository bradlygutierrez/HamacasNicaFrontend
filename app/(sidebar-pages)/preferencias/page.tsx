"use client";

import { usePreferences, type AppLanguage, type AppTheme } from "@/app/_components/preferences-provider";

export default function PreferencesPage() {
  const { language, setLanguage, theme, setTheme, t } = usePreferences();

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 px-3 py-5 text-[var(--color-foreground)] sm:px-4 sm:py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{t("Preferencias")}</h1>
        <p className="text-sm text-white/75">
          {t("Configuración personal")}
        </p>
      </header>

      <div className="space-y-5 rounded-xl border border-[var(--color-foreground)]/15 bg-[var(--color-background-secondary)] p-4 shadow-lg sm:p-6">
        <label className="grid gap-2 text-sm font-semibold">
          {t("Idioma")}
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as AppLanguage)}
            className="h-11 w-full rounded-md border border-[var(--color-foreground)]/20 bg-[var(--color-background-secondary)] px-3 text-sm"
          >
            <option value="es">{t("Español")}</option>
            <option value="en">{t("Inglés")}</option>
          </select>
        </label>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold">{t("Tema")}</legend>
          <div className="grid grid-cols-2 gap-3">
            {(["light", "dark"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={theme === value}
                onClick={() => setTheme(value as AppTheme)}
                className={`min-h-12 rounded-md border px-4 text-sm font-semibold transition ${
                  theme === value
                    ? "border-[#e3b72e] bg-[#e3b72e]/15"
                    : "border-[var(--color-foreground)]/20 bg-[var(--color-background-secondary)] hover:bg-[var(--color-foreground)]/5"
                }`}
              >
                {t(value === "light" ? "Claro" : "Oscuro")}
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--color-foreground)]/70">
            {t("El tema oscuro usa tonos gris oscuro en toda la aplicación.")}
          </p>
        </fieldset>

        <p role="status" className="text-xs text-[var(--color-foreground)]/70">
          {t("Tus preferencias se guardan en este dispositivo.")}
        </p>
      </div>
    </section>
  );
}
