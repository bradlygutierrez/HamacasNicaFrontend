'use client'
import { LucideIcon } from "lucide-react";

interface dashboardCardProps {
    cardTitle: string;
    cardScore: string;
    icon: LucideIcon;
}

export default function DashboardCardBlue({ cardTitle, cardScore, icon: Icon }: dashboardCardProps) {
    return (
        <div>
             <h2 className="text-bold text-[1.3rem] text-left  text-[var(--color-foreground-secondary)]">
                        {cardTitle}
                </h2>
            <div className="rounded-lg border-1 p-5 flex justify-between items-center w-[18rem] h-[8rem] 
                 text-[var(--color-foreground-secondary)] bg-[var(--color-foreground)">

                {/* Icono */}
                <div className="text-4xl opacity-80">
                    <Icon />
                </div>

                {/* Texto */}
                <div className="flex flex-col items-end">
                   
                    <h1 className="text-5xl font-bold">
                        {cardScore}
                    </h1>
                </div>
            </div>
        </div>

    );
}