"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { User } from "firebase/auth";
// import { v4 as uuidv4 } from "uuid";
import GalleryHeader from "@/components/gallery-header";
import GalleryFooter from "@/components/gallery-footer";
import Gallery from "@/components/gallery";
import UploadModal from "@/components/upload-modal";

export default function GalleryPage() {
  const [user, setUser] = useState<User>();
  // const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [userSelectedFiles, setUserSelectedFiles] = useState<File[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  // Check that there is a logged in user and if not, redirect to home.
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace("/");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  });

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-black">
      {/* Header (fixed height, not scrollable) */}
      <div className="shrink-0">
        <GalleryHeader
          user={user}
          isSelectionMode={isSelectionMode}
          selectedImages={selectedImages}
          setSelectedImages={setSelectedImages}
        />
      </div>

      {/* Main (only scrollable section) */}
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <Gallery
          isSelectionMode={isSelectionMode}
          setSelectedImages={setSelectedImages}
          selectedImages={selectedImages}
        />
      </main>

      {/* Footer (fixed height, not scrollable) */}
      <div className="shrink-0">
        <GalleryFooter
          setShowUploadModal={setShowUploadModal}
          isSelectionMode={isSelectionMode}
          setSelectionMode={setIsSelectionMode}
          setUserSelectedFiles={setUserSelectedFiles}
        />
      </div>

      {showUploadModal && (
        <UploadModal
          setShowUploadModal={setShowUploadModal}
          userSelectedFiles={userSelectedFiles}
          setUserSelectedFiles={setUserSelectedFiles}
        />
      )}
    </div>
  );
}
