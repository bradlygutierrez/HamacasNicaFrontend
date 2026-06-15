'use client'

import { LucideIcon } from "lucide-react";

interface dashboardCardProps {
    cardTitle: string;
    cardScore: string;
    icon: LucideIcon;
}

export default function DashboardCardBlue({ cardTitle, cardScore, icon: Icon }: dashboardCardProps) {
    return (
        <div className="space-y-2">
            <h2 className="text-left text-sm font-semibold text-[var(--color-foreground-secondary)] md:text-base">
                {cardTitle}
            </h2>

            <div className="flex min-h-[7rem] items-center justify-between rounded-lg border border-white/10 bg-[var(--color-foreground)] p-4 text-[var(--color-foreground-secondary)] shadow-md">
                <div className="text-3xl opacity-80 md:text-4xl">
                    <Icon />
                </div>

                <div className="flex flex-col items-end">
                    <h1 className="text-4xl font-bold md:text-5xl">{cardScore}</h1>
                </div>
            </div>
        </div>
    );
}
