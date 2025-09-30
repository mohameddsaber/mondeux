import { useState } from "react";
import { X, Plus, Minus } from "lucide-react";

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

function FilterSidebar({ isOpen, onClose, sortBy, onSortChange }: FilterSidebarProps) {
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
//   const [sortOpen, setSortOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);

  const availabilityOptions = ["In Stock", "Out of Stock", "Pre-Order"];
  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "newest", label: "Newest" },
    { value: "best-selling", label: "Best Selling" },
  ];

  const toggleAvailability = (option: string) => {
    setSelectedAvailability((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const handleRemoveAll = () => {
    setSelectedAvailability([]);
    onSortChange("featured");
  };

  const handleApply = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Sidebar */}
        <div className="absolute inset-y-0 right-0 w-[calc(100%-4rem)] max-w-xl bg-white flex flex-col animate-slide-in ml-8">
        {/* Header */}
        <div className="relative flex items-center justify-center p-3 border-b border-gray-300">
        <h2 className="text-xl font-medium font-[Karla] tracking-wide">Filter</h2>
        <button onClick={onClose} className="absolute right-3">
            <X size={18} className="text-gray-400 cursor-pointer"/>
        </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto mt-10">
          {/* Availability */}
          <div className="">
            <button
              onClick={() => setAvailabilityOpen(!availabilityOpen)}
              className="w-full flex items-center justify-between px-[30px] py-[15px] text-sm font-medium tracking-wide"
            >
              <span className="text-[#121212] text-[12px] font-[Karla] tracking-widest">AVAILABILITY</span>
              {availabilityOpen ? <Minus size={12} /> : <Plus size={12} />}
            </button>

            {availabilityOpen && (
              <div className="px-6 pb-6 space-y-3">
                {availabilityOptions.map((option) => (
                  <label key={option} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAvailability.includes(option)}
                      onChange={() => toggleAvailability(option)}
                      className="w-5 h-5 border-gray-400 rounded"
                    />
                    <span className="ml-3 text-sm">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Sort By */}
            <div className="">
            <div className="flex items-center justify-between px-[30px] py-[15px] text-sm font-medium tracking-wide">
                <span className="text-[#121212] text-[12px] font-[Karla] tracking-widest">SORT BY</span>
                <div className="flex items-center gap-2">
                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="appearance-none border-0 text-gray-500 rounded px-1 py-4 text-[12px] bg-white cursor-pointer focus:outline-none focus:border-3 focus:border-gray-600 focus:ring-0"
                >
                    {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                    ))}
                </select>
                <Plus size={12} className="text-gray-700" />
                </div>
            </div>
            </div>

        </div>

        {/* Footer */}
        <div className="border-t p-6 flex justify-between items-center gap-4">
        <button
            onClick={handleRemoveAll}
            className="w-full max-w-[267px] py-3 text-[#121212D9] text-[12px] font-[Karla]  font-medium underline tracking-widest"
        >
            REMOVE ALL
        </button>
        <button
            onClick={handleApply}
            className="w-full max-w-[250px] py-3  font-[Karla] font-medium bg-black text-white"
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
