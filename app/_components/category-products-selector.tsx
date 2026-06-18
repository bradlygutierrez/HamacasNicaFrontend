type Props = {
  categoryName: string;
  isSelected: boolean;
  onClick: () => void;
};

export default function CategoryProductsSelector({
  categoryName,
  isSelected,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-[44px] w-full rounded-[8px] px-4 text-base font-semibold shadow-md transition sm:w-auto sm:min-w-[260px] sm:text-lg ${
        isSelected
          ? "bg-[#123852] text-white"
          : "bg-[#f7f7f7] text-[#08264d]"
      }`}
    >
      {categoryName}
    </button>
  );
}