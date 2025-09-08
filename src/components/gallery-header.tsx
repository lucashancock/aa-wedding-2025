import { User } from "firebase/auth";
import { Download, Wine } from "lucide-react";
import { useState } from "react";
import { Timestamp } from "firebase/firestore";
import { ref, getBlob } from "firebase/storage";
import { storage } from "@/lib/firebase"; // your initialized Firebase
import FilterBar from "./filter-bar";

type UploadFile = {
  id: string;
  url: string;
  type: string;
  createdAt: Timestamp;
  uploadedBy: string;
};

export default function GalleryHeader({
  user,
  isSelectionMode,
  selectedImages,
  setSelectedImages,
  files,
  // isLoading,
  setSearchString,
  setSortOrder,
  sortOrder,
}: {
  user?: User;
  isSelectionMode?: boolean;
  selectedImages: Set<string>;
  setSelectedImages?: React.Dispatch<React.SetStateAction<Set<string>>>;
  files: UploadFile[];
  // isLoading: boolean;
  setSearchString: React.Dispatch<React.SetStateAction<string>>; // required
  setSortOrder: React.Dispatch<React.SetStateAction<"asc" | "desc">>; // required
  sortOrder: "asc" | "desc"; // required
}) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (selectedImages?.size === 0) return;
    setIsSharing(true);

    const selectedFiles = files.filter((f) => selectedImages.has(f.id));

    // Helper to get File directly from Firebase Storage
    const storageUrlToFile = async (
      url: string,
      name: string
    ): Promise<File | null> => {
      try {
        // Convert public URL to Storage path
        // Firebase SDK needs path like 'uploads/...'
        const pathStart = url.indexOf("/o/") + 3;
        const pathEnd = url.indexOf("?alt=media");
        const path = decodeURIComponent(url.substring(pathStart, pathEnd));

        const storageRef = ref(storage, path);
        const blob = await getBlob(storageRef);
        return new File([blob], name, { type: blob.type });
      } catch (err) {
        console.error("Failed to fetch file from storage", err);
        return null;
      }
    };

    try {
      // Fetch all selected files as File objects
      const fileBlobs = await Promise.all(
        selectedFiles.map((f) => storageUrlToFile(f.url, `wedding-${f.id}.jpg`))
      );

      const validFiles = fileBlobs.filter((f): f is File => f !== null);

      if (validFiles.length === 0) {
        alert("No files could be prepared for sharing.");
        return;
      }

      // Mobile share
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: validFiles })
      ) {
        await navigator.share({
          files: validFiles,
          title: "Wedding Photos",
          text: "Here are some wedding photos to save!",
        });
      } else {
        // Desktop fallback: trigger downloads
        validFiles.forEach((file) => {
          const url = URL.createObjectURL(file);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          console.log("Share was cancelled by the user");
        }
      } else {
        console.log("Unknown error sharing: ", err);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between bg-black border-b border-white/10 px-6 py-3 relative z-50">
        <div className="flex flex-grow items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wine className="w-6 h-6 text-white" />
            <div>
              {/* <link
                href="https://fonts.googleapis.com/css2?family=Dancing+Script&display=swap"
                rel="stylesheet"
              /> */}
              <h1 className="text-xl font-bold text-white">
                A&A Wedding Gallery
              </h1>
              {user?.displayName ? (
                <p className="text-sm text-white/60">
                  Logged in as: {user.displayName}
                </p>
              ) : (
                <p className="text-sm text-white/60">...</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-50">
        <FilterBar
          setSortOrder={setSortOrder}
          sortOrder={sortOrder}
          setSearchString={setSearchString}
        />
      </div>
      <div
        className={`
           relative border-b border-white/10 text-white/70 text-sm bg-black px-6
          transition-all duration-300 ease-in-out overflow-hidden z-0
          ${isSelectionMode ? "py-1" : "h-0"}
        `}
      >
        <div className="flex items-center justify-between">
          <span
            className={
              isSelectionMode ? "opacity-100" : "opacity-0 duration-200"
            }
          >
            {selectedImages.size} images selected
          </span>
          <span
            className={
              isSelectionMode ? "opacity-100" : "opacity-100 duration-200"
            }
          >
            <button
              disabled={
                isSharing || !selectedImages || selectedImages.size === 0
              }
              className={`
    flex gap-1 items-center px-3 py-1 rounded 
    ${
      !isSharing && selectedImages && selectedImages.size > 0
        ? "text-white cursor-pointer"
        : ""
    }
  `}
              onClick={handleShare}
            >
              <Download className="w-4 h-4" />
              {isSharing ? "Preparing..." : "Download"}
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
