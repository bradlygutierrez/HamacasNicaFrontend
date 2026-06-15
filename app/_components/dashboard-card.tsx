'use client'

interface dashboardCardProps {
    //categorySelected:string; 
    cardTitle: string;
    cardScore: string;
}

export default function DashboardCard({ cardTitle, cardScore }: dashboardCardProps) {
    return (
        <div className="flex h-full min-h-[8rem] flex-col items-center justify-center rounded-lg bg-[var(--color-foreground-secondary)] p-5 text-[var(--color-foreground)]">
            <h2 className="text-center text-base font-medium md:text-xl">
                {cardTitle}
            </h2 >
            <h1 className="text-4xl font-bold md:text-6xl">
                {cardScore}</h1>
        </div>
    );
}
