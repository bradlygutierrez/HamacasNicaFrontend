'use client'

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
        <button
            type="button"
            onClick={onClick}
            className={`
                text-center px-3 py-2 w-1/2 md:w-[30%] rounded-[7px] text-base md:text-xl font-medium border-2 cursor-pointer transition-all
                ${isSelected
                    ? "bg-[var(--color-foreground-secondary)] text-[var(--color-foreground)]"
                    : "bg-[var(--color-foreground)] text-[var(--color-foreground-secondary)] border-gray-300 hover:bg-gray-200"}
            `}
        >
            {categoryName}
        </button>
    );
}
