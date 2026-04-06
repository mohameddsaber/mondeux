import { X } from "lucide-react";
import type { CatalogFacetOption } from "@/hooks/useStoreData";

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sortBy: string;
  sortOptions: Array<{ value: string; label: string }>;
  categoryOptions?: CatalogFacetOption[];
  subCategoryOptions?: CatalogFacetOption[];
  materialOptions: CatalogFacetOption[];
  availabilityOptions: CatalogFacetOption[];
  selectedCategory: string;
  selectedSubCategory: string;
  selectedMaterials: string[];
  selectedAvailability: string[];
  minPrice: string;
  maxPrice: string;
  onSortChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSubCategoryChange: (value: string) => void;
  onToggleMaterial: (value: string) => void;
  onToggleAvailability: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onClearAll: () => void;
  onApply: () => void;
}

const FacetCheckboxGroup = ({
  title,
  options,
  selectedValues,
  onToggle,
}: {
  title: string;
  options: CatalogFacetOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}) => {
  if (options.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 px-[30px] py-[18px]">
      <p className="mb-4 text-[12px] font-[Karla] tracking-widest text-[#121212]">
        {title}
      </p>
      <div className="space-y-3">
        {options.map((option) => (
          <label key={option.value} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedValues.includes(option.value)}
                onChange={() => onToggle(option.value)}
                className="h-4 w-4 border-gray-400 rounded"
              />
              <span className="text-sm text-[#121212]">{option.label}</span>
            </span>
            <span className="text-xs text-gray-500">{option.count}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

function FilterSidebar({
  isOpen,
  onClose,
  sortBy,
  sortOptions,
  categoryOptions = [],
  subCategoryOptions = [],
  materialOptions,
  availabilityOptions,
  selectedCategory,
  selectedSubCategory,
  selectedMaterials,
  selectedAvailability,
  minPrice,
  maxPrice,
  onSortChange,
  onCategoryChange,
  onSubCategoryChange,
  onToggleMaterial,
  onToggleAvailability,
  onMinPriceChange,
  onMaxPriceChange,
  onClearAll,
  onApply,
}: FilterSidebarProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 ml-8 flex w-[calc(100%-4rem)] max-w-xl animate-slide-in flex-col bg-white">
        <div className="relative flex items-center justify-center border-b border-gray-300 p-3">
          <h2 className="text-xl font-medium font-[Karla] tracking-wide">Filter</h2>
          <button onClick={onClose} className="absolute right-3">
            <X size={18} className="cursor-pointer text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-gray-200 px-[30px] py-[18px]">
            <p className="mb-4 text-[12px] font-[Karla] tracking-widest text-[#121212]">
              SORT BY
            </p>
            <select
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-3 text-sm text-[#121212] outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {categoryOptions.length > 0 ? (
            <div className="border-b border-gray-200 px-[30px] py-[18px]">
              <p className="mb-4 text-[12px] font-[Karla] tracking-widest text-[#121212]">
                CATEGORY
              </p>
              <select
                value={selectedCategory}
                onChange={(event) => onCategoryChange(event.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-3 text-sm text-[#121212] outline-none"
              >
                <option value="">All Categories</option>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.count})
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {subCategoryOptions.length > 0 ? (
            <div className="border-b border-gray-200 px-[30px] py-[18px]">
              <p className="mb-4 text-[12px] font-[Karla] tracking-widest text-[#121212]">
                SUBCATEGORY
              </p>
              <select
                value={selectedSubCategory}
                onChange={(event) => onSubCategoryChange(event.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-3 text-sm text-[#121212] outline-none"
              >
                <option value="">All Subcategories</option>
                {subCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.count})
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <FacetCheckboxGroup
            title="MATERIAL"
            options={materialOptions}
            selectedValues={selectedMaterials}
            onToggle={onToggleMaterial}
          />

          <FacetCheckboxGroup
            title="AVAILABILITY"
            options={availabilityOptions}
            selectedValues={selectedAvailability}
            onToggle={onToggleAvailability}
          />

          <div className="border-b border-gray-200 px-[30px] py-[18px]">
            <p className="mb-4 text-[12px] font-[Karla] tracking-widest text-[#121212]">
              PRICE RANGE
            </p>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={minPrice}
                onChange={(event) => onMinPriceChange(event.target.value)}
                className="rounded border border-gray-300 px-3 py-3 text-sm outline-none"
              />
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={maxPrice}
                onChange={(event) => onMaxPriceChange(event.target.value)}
                className="rounded border border-gray-300 px-3 py-3 text-sm outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t p-6">
          <button
            onClick={onClearAll}
            className="w-full py-3 text-[12px] font-[Karla] font-medium tracking-widest text-[#121212D9] underline"
          >
            REMOVE ALL
          </button>
          <button
            onClick={onApply}
            className="w-full bg-black py-3 font-[Karla] font-medium text-white"
          >
            APPLY
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default FilterSidebar;
