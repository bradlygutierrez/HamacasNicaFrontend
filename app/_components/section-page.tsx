import { translateText } from "@/app/_lib/localization";
import type { ReactNode } from "react";

type SectionPageProps = {
    title: string;
    description?: string;
    children?: ReactNode;
};

export default function SectionPage({ title, description, children }: SectionPageProps) {
    return (
        <div className="space-y-4">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold text-[var(--color-foreground-secondary)] md:text-5xl">
                    {translateText(title)}
                </h1>
                {description ? (
                    <p className="max-w-2xl text-sm text-[var(--color-foreground-secondary)]/80 md:text-base">
                        {translateText(description)}
                    </p>
                ) : null}
            </header>

            <section className="rounded-2xl bg-[var(--color-background-secondary)] p-5 text-[var(--color-foreground)]">
                {children ?? (
                    <p className="text-sm md:text-base">
                        {translateText("Módulo en construcción. La navegación ya está activa y esta sección puede conectarse al backend cuando se necesite CRUD completo.\n                    ")}</p>
                )}
            </section>
        </div>
    );
}
