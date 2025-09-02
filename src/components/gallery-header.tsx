import { User } from "firebase/auth";
import { Download, Grid3X3 } from "lucide-react";

export default function GalleryHeader({
  user,
  isSelectionMode,
  selectedImages,
  setSelectedImages,
}: {
  user?: User;
  isSelectionMode?: boolean;
  selectedImages?: Set<string>;
  setSelectedImages?: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  return (
    <div className="relative">
      <div className="bg-black border-b border-white/10 px-6 py-4 relative z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Grid3X3 className="w-6 h-6 text-white" />
            <div>
              <h1 className="text-xl font-semibold text-white">Gallery</h1>
              {user?.displayName ? (
                <p className="text-sm text-white/60">{user.displayName}</p>
              ) : (
                <p className="text-sm text-white/60">...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`
          border-b border-white/10 text-white/70 text-sm bg-black px-6
          transition-all duration-200 ease-in-out overflow-hidden min-h-0
          ${isSelectionMode ? "py-4 h-fit" : "h-0 py-0"}
        `}
      >
        <div className="flex items-center justify-between">
          <span
            className={
              isSelectionMode ? "opacity-100" : "opacity-0 duration-200"
            }
          >
            {selectedImages?.size} images selected
          </span>
          <span
            className={
              isSelectionMode ? "opacity-100" : "opacity-0 duration-200"
            }
          >
            <button className="flex gap-1 items-center text-white/70">
              <Download className="w-4 h-4" />
              Download
            </button>
          </span>
          <span
            className={
              isSelectionMode ? "opacity-100" : "opacity-0 duration-200"
            }
          >
            <button
              onClick={() => setSelectedImages?.(new Set())}
              className="text-white/70"
            >
              Clear Selection
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
