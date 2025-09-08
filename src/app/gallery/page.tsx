"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { User } from "firebase/auth";
import GalleryHeader from "@/components/gallery-header";
import GalleryFooter from "@/components/gallery-footer";
import Gallery from "@/components/gallery";
import UploadModal from "@/components/upload-modal";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";

type UploadFile = {
  id: string;
  url: string;
  type: string;
  createdAt: Timestamp;
  uploadedBy: string;
};

export default function GalleryPage() {
  const [user, setUser] = useState<User>();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [userSelectedFiles, setUserSelectedFiles] = useState<File[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchString, setSearchString] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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
    <div className="h-dvh flex flex-col overflow-hidden bg-black">
      {/* Header (fixed height, not scrollable) */}
      <div className="shrink-0">
        <GalleryHeader
          user={user}
          isSelectionMode={isSelectionMode}
          selectedImages={selectedImages}
          setSelectedImages={setSelectedImages}
          files={files}
          // isLoading={isLoading}
          setSearchString={setSearchString}
          setSortOrder={setSortOrder}
          sortOrder={sortOrder}
        />
      </div>
      {/* Main (only scrollable section) */}
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <Gallery
          isSelectionMode={isSelectionMode}
          setSelectedImages={setSelectedImages}
          selectedImages={selectedImages}
          files={files}
          searchString={searchString}
          isLoading={isLoading}
          sortOrder={sortOrder}
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
          user={user}
          setShowUploadModal={setShowUploadModal}
          userSelectedFiles={userSelectedFiles}
          setUserSelectedFiles={setUserSelectedFiles}
        />
      )}
    </div>
  );
}
