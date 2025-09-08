import { PhotoProvider, PhotoView } from "react-photo-view";
import { CheckSquare, Square, CircleSlash } from "lucide-react";
import Image from "next/image";
import { Timestamp } from "firebase/firestore";

type UploadFile = {
  id: string;
  url: string;
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

  return (
    <main className="flex-1 p-4">
      {isLoading ? (
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
          <PhotoProvider speed={() => 500}>
            {filteredFiles.map((file) =>
              file.type.startsWith("image/") ? (
                <div
                  key={file.id}
                  className="relative aspect-[9/16] overflow-hidden bg-white/5"
                >
                  <PhotoView key={file.id} src={file.url}>
                    <Image
                      src={file.url}
                      alt="Uploaded wedding photo"
                      fill
                      priority
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover w-full h-full"
                    />
                  </PhotoView>

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
                >
                  <video
                    src={file.url}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              )
            )}
          </PhotoProvider>
        </div>
      )}
    </main>
  );
}
