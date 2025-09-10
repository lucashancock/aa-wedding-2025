import { PhotoProvider, PhotoView } from "react-photo-view";
import { CheckSquare, Square, CircleSlash, Download } from "lucide-react";
import Image from "next/image";
import { Timestamp } from "firebase/firestore";
import { getBlob, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { useState, useEffect } from "react";

type UploadFile = {
  id: string;
  url: string;
  blurDataURL: string;
  type: string;
  createdAt: Timestamp;
  uploadedBy: string;
};

export default function Gallery({
  isSelectionMode,
  setSelectedImages,
  selectedImages,
  files,
  isLoading,
  searchString,
  sortOrder,
}: {
  isSelectionMode: boolean;
  setSelectedImages: React.Dispatch<React.SetStateAction<Set<string>>>;
  selectedImages: Set<string>;
  files: UploadFile[];
  isLoading: boolean;
  searchString: string;
  sortOrder: "asc" | "desc";
}) {
  const toggleImageSelection = (id: string) => {
    setSelectedImages((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) newSelection.delete(id);
      else newSelection.add(id);
      return newSelection;
    });
  };

  // Filter files based on search string
  let filteredFiles = searchString
    ? files.filter((f) =>
        f.uploadedBy.toLowerCase().includes(searchString.toLowerCase())
      )
    : files;

  // Sort by createdAt based on sortOrder
  filteredFiles = [...filteredFiles].sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;
    return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
  });

  const handleShare = async (images: any, index: number) => {
    const photo = images.at(index);
    if (!photo) {
      alert("Photo couldn't be downloaded, try again.");
      return;
    }
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
      const fileBlob = await storageUrlToFile(
        photo.src,
        `wedding-${photo.key}.jpg`
      );
      if (!fileBlob) {
        alert("File couldn't be downloaded, try again.");
        return;
      }

      // Mobile share
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [fileBlob] })
      ) {
        await navigator.share({
          files: [fileBlob],
          title: "Wedding Photos",
          text: "Here are some wedding photos to save!",
        });
      } else {
        // Desktop fallback: trigger downloads
        const url = URL.createObjectURL(fileBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileBlob.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        console.log("Share was cancelled by the user");
      } else {
        console.error("Unknown error sharing: ", err);
      }
    }
  };

  return (
    <main className="flex-1 p-4">
      {files.length === 0 && isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-white/60">Loading...</p>
          </div>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <CircleSlash className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">
              No photos yet
            </h3>
            <p className="text-white/60 text-sm">
              {searchString
                ? `No photos found for "${searchString}"`
                : "Photos will appear here once uploaded"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-[7px]">
          <PhotoProvider
            toolbarRender={({ images, index }) => {
              return (
                <Download
                  className="w-5 h-5 mx-4 cursor-pointer"
                  onClick={() => {
                    handleShare(images, index);
                  }}
                />
              );
            }}
            speed={() => 500}
          >
            {filteredFiles.map((file) =>
              file.type.startsWith("image/") ? (
                <div
                  key={file.id}
                  className="relative aspect-[9/16] overflow-hidden bg-white/5"
                >
                  <FadeImage file={file} />
                  {isSelectionMode && (
                    <>
                      <div
                        className="absolute inset-0 z-20 cursor-pointer"
                        style={{
                          background: "rgba(0,0,0,0)",
                          pointerEvents: "auto",
                        }}
                        onClick={() => toggleImageSelection(file.id)}
                      />
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-black/50 rounded flex items-center justify-center">
                          {selectedImages.has(file.id) ? (
                            <CheckSquare className="w-6 h-6" />
                          ) : (
                            <Square className="w-6 h-6" />
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div
                  key={file.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-white/5"
                ></div>
              )
            )}
          </PhotoProvider>
        </div>
      )}
    </main>
  );
}

export function FadeImage({ file }: { file: UploadFile }) {
  const [load, setLoad] = useState(true);
  return (
    <PhotoView key={file.id} src={file.url}>
      <Image
        src={file.url}
        alt="Uploaded wedding photo"
        fill
        priority
        placeholder={file.blurDataURL ? "blur" : undefined}
        blurDataURL={file.blurDataURL}
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        className={`object-cover w-full h-full transition-all duration-400 ${
          load ? "blur-xl" : ""
        }`}
        onLoad={() => setLoad(false)}
      />
    </PhotoView>
  );
}
