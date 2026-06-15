'use client'

interface categorySelectorProps {
    categoryName: string;
    isSelected: boolean;
    onClick: () => void;
}

export default function CategoryProductsSelector({
    categoryName,
    isSelected,
    onClick
}: categorySelectorProps) {

    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                text-center px-3 py-2 w-full sm:w-auto md:w-[15%] rounded-[7px] text-sm md:text-lg font-medium border-2 cursor-pointer transition-all
                ${isSelected
                    ? "bg-[var(--color-foreground)] text-[var(--color-foreground-secondary)]"
                    : "bg-[var(--color-background-secondary)] text-[var(--color-foreground)]  border-gray-300 hover:bg-gray-200"}
            `}
        >
            {categoryName}
        </button>
    );
}
