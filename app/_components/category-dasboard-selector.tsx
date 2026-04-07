'use client'
import { useEffect, useState } from "react";

interface categorySelectorProps {
    categoryName: string;
    isSelected: boolean;
    onClick: () => void;
}

export default function CategoryDasboardSelector({
    categoryName,
    isSelected,
    onClick
}: categorySelectorProps) {

    return (
        <div
            onClick={onClick}
            className={`
                text-center p-1 w-[30%] rounded-[7px] text-2xl font-medium border-2 cursor-pointer transition-all
                ${isSelected
                    ? "bg-[var(--color-foreground-secondary)] text-[var(--color-foreground)]"
                    : "bg-[var(--color-foreground)] text-[var(--color-foreground-secondary)] border-gray-300 hover:bg-gray-200"}
            `}
        >
            {categoryName}
        </div>
    );
}