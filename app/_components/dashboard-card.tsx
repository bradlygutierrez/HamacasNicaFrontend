'use client'
import { useEffect, useState } from "react";

interface dashboardCardProps {
    //categorySelected:string; 
    cardTitle: string;
    cardScore: string;
}

export default function DashboardCard({ cardTitle, cardScore }: dashboardCardProps) {
    return (
        <div className="rounded-lg p-5 flex flex-col items-center w-[18rem] h-[12rem] bg-[var(--color-foreground-secondary)] text-[var(--color-foreground)]">
            <h2 className="text-[1.5rem]">
                {cardTitle}
            </h2 >
            <h1 className="text-[6rem] font-bold">
                {cardScore}</h1>
        </div>
    );
}

