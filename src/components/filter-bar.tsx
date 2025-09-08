import { Check, SortAscIcon, SortDescIcon, X } from "lucide-react";
import { useState } from "react";
import SlideUpModal from "./filter-modal";

export default function FilterBar({
  setSearchString,
  setSortOrder,
  sortOrder,
}: {
  setSearchString: React.Dispatch<React.SetStateAction<string>>;
  setSortOrder: React.Dispatch<React.SetStateAction<"asc" | "desc">>;
  sortOrder: "asc" | "desc";
}) {
  const [search, setSearch] = useState("");
  const [showSortModal, setShowSortModal] = useState(false);

  const handleClear = () => {
    setSearch("");
    setSearchString("");
  };

  const handleSortClick = () => {
    setShowSortModal(true);
  };

  const handleCloseModal = () => {
    setShowSortModal(false);
  };

  const handleSortOption = (order: "asc" | "desc") => {
    setSortOrder(order);
  };

  return (
    <div className="relative">
      {/* Search + Sort Bar */}
      <div className="py-2 px-4 relative z-50 flex gap-2 items-center">
        <div className="flex flex-grow items-center bg-white/10 rounded-lg py-1">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSearchString(e.target.value);
            }}
            placeholder="Search by uploader..."
            className="w-full bg-transparent outline-none px-2 text-white placeholder-white/50 transition"
          />
          {search && (
            <button
              onClick={handleClear}
              className="text-white/40 hover:text-white/80 transition p-1"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Button */}
        <button
          onClick={handleSortClick}
          className="flex items-center justify-center rounded p-2 text-white/50 hover:bg-white/5 transition"
          aria-label="Sort"
        >
          {sortOrder === "asc" ? (
            <SortAscIcon className="w-5 h-5" />
          ) : (
            <SortDescIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Sort Modal */}
      <SlideUpModal show={showSortModal} onClose={handleCloseModal}>
        <div className="flex justify-between items-center mb-4">
          <span className="text-white text-lg font-semibold">Sort</span>
          <button
            onClick={handleCloseModal}
            className="text-white hover:text-white transition"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col gap-2 py-4">
          {/* Oldest First */}
          <button
            onClick={() => handleSortOption("asc")}
            className="flex items-center gap-2 px-4 py-2 rounded hover:bg-white/10 text-left"
          >
            {sortOrder === "asc" && <Check className="w-5 h-5 text-white" />}
            <span className="text-white ml-1">Oldest First</span>
          </button>

          {/* Newest First */}
          <button
            onClick={() => handleSortOption("desc")}
            className="flex items-center gap-2 px-4 py-2 rounded hover:bg-white/10 text-left"
          >
            {sortOrder === "desc" && <Check className="w-5 h-5 text-white" />}
            <span className="text-white ml-1">Newest First</span>
          </button>
        </div>
      </SlideUpModal>
    </div>
  );
}
