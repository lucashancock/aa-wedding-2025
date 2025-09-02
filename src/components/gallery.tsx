import { PhotoProvider, PhotoView } from "react-photo-view";
import { useState, useEffect } from "react";
import { CheckSquare, CircleSlash, Square } from "lucide-react";
import { db } from "@/lib/firebase";
import Image from "next/image";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { User } from "firebase/auth";

type UploadFile = {
  id: string;
  url: string;
  type: string;
  createdAt: Timestamp;
  uploadedBy: string;
};

export default function Gallery({
  isSelectionMode,
  user,
  setSelectedImages,
  selectedImages,
}: {
  isSelectionMode: boolean;
  user?: User;
  setSelectedImages: React.Dispatch<React.SetStateAction<Set<string>>>;
  selectedImages: Set<string>;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [files, setFiles] = useState<UploadFile[]>([]);

  // Toggle selection of an image by its ID
  const toggleImageSelection = (id: string) => {
    setSelectedImages((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  };

  // Gets real-time updates of the "uploads" collection in Firestore
  useEffect(() => {
    const q = query(collection(db, "uploads"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFiles(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<UploadFile, "id">),
        }))
      );
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <main className="flex-1 p-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-white/60">Loading...</p>
          </div>
        </div>
      ) : files.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <CircleSlash className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">
              No photos yet
            </h3>
            <p className="text-white/60 text-sm">
              Photos will appear here once uploaded
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <PhotoProvider speed={() => 500}>
            {files.map((file) =>
              file.type.startsWith("image/") ? (
                <div
                  key={file.id}
                  className="relative aspect-[9/16] overflow-hidden bg-white/5"
                >
                  <div className="">
                    <PhotoView key={file.id} src={file.url}>
                      <Image
                        src={file.url}
                        alt="Uploaded wedding photo"
                        fill
                        className="object-cover w-full h-full"
                      />
                    </PhotoView>
                    {isSelectionMode && (
                      <div
                        className="absolute inset-0 z-20 cursor-pointer"
                        style={{
                          background: "rgba(0,0,0,0)",
                          pointerEvents: "auto",
                        }}
                        onClick={() => toggleImageSelection(file.id)}
                      />
                    )}
                  </div>
                  {isSelectionMode && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 bg-black/50 rounded flex items-center justify-center">
                        {selectedImages.has(file.id) ? (
                          <Square className="w-5 h-5 fill-white" />
                        ) : (
                          <Square className="w-5 h-5 " />
                        )}
                      </div>
                    </div>
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
