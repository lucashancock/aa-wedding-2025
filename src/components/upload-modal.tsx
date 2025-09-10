import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Upload, X } from "lucide-react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { storage, db } from "@/lib/firebase"; // your initialized Firebase
import { User } from "firebase/auth";
import { getPlaiceholder } from "plaiceholder";

export default function UploadModal({
  user,
  setShowUploadModal,
  userSelectedFiles,
  setUserSelectedFiles,
}: {
  user?: User | undefined;
  setShowUploadModal: (show: boolean) => void;
  userSelectedFiles: File[];
  setUserSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
}) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(true);
  const [visible, setVisible] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Carousel gesture state
  const startX = useRef<number | null>(null);
  const deltaX = useRef<number>(0);

  useEffect(() => {
    if (show) setVisible(true);
    else setTimeout(() => setVisible(false), 300);
  }, [show]);

  useEffect(() => {
    const urls = userSelectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(urls);

    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [userSelectedFiles]);

  const handleCloseModal = () => {
    setShow(false);
    setTimeout(() => setShowUploadModal(false), 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    deltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX.current !== null) {
      deltaX.current = e.touches[0].clientX - startX.current;
    }
  };

  const handleTouchEnd = () => {
    if (deltaX.current > 50 && idx > 0) setIdx(idx - 1);
    else if (deltaX.current < -50 && idx < previews.length - 1) setIdx(idx + 1);
    startX.current = null;
    deltaX.current = 0;
  };

  // Upload helper
  const handleFileUpload = async (
    file: File,
    onProgress: (percent: number) => void
  ) => {
    return new Promise<void>((resolve, reject) => {
      const storageRef = ref(
        storage,
        `gs://aa-wedding-photo-share.firebasestorage.app/uploads/${
          user?.uid
        }/${Date.now()}_${file.name}`
      );
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const percent =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(percent);
        },
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const abuffer = await file.arrayBuffer();
          // const payload = { abuffer: abuffer }; // your data
          const res = await fetch("/api/generate-blur", {
            method: "POST",
            headers: { "Content-Type": "application/octet-stream" },
            body: abuffer,
          });
          const data = await res.json();
          const base64 = data.base64;

          await addDoc(collection(db, "uploads"), {
            name: file.name,
            type: file.type,
            size: file.size,
            url: downloadURL,
            blurDataURL: base64, // <-- Next.js Image placeholder
            uploadedBy: user?.displayName,
            createdAt: serverTimestamp(),
          });

          resolve();
        }
      );
    });
  };

  const handleUploadAll = async () => {
    if (userSelectedFiles.length === 0) return;
    setUploading(true);
    setProgress(0);

    try {
      const totalFiles = userSelectedFiles.length;
      const progresses = Array(totalFiles).fill(0);
      let completedFiles = 0;

      // Map files to upload promises
      const uploadPromises = userSelectedFiles.map((file, index) =>
        handleFileUpload(file, (percent) => {
          progresses[index] = percent;
          // Compute overall progress = avg of all files
          const overallPercent =
            progresses.reduce((a, b) => a + b, 0) / totalFiles;
          setProgress(Math.floor(overallPercent));
        })
      );

      // Wait for all uploads in parallel
      await Promise.all(uploadPromises);

      // Done 🎉
      setProgress(100);
    } catch (err) {
      console.log(err);
      alert("Failed to upload files. Try again later.");
    } finally {
      setUserSelectedFiles([]);
      setUploading(false);
      setTimeout(() => {
        setProgress(0);
        handleCloseModal();
      }, 250); // slight delay so user sees 100%
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Overlay */}
      <div
        className={`absolute inset-0  bg-black/40 transition-all duration-300 ${
          show ? "backdrop-blur-sm opacity-100" : "backdrop-blur-0 opacity-0"
        }`}
        onClick={handleCloseModal}
      />

      {/* Modal */}
      <div
        className={`relative w-full flex h-11/12 flex-col bg-black border-t border-t-white/20 shadow-lg pt-5 px-5 ${
          show ? "animate-slideUp" : "animate-slideDown"
        }`}
      >
        <div className="flex-col">
          <div className="flex justify-between">
            <div className="flex-col ">
              <h2 className="flex-grow text-xl font-semibold text-white">
                Upload Photos/Videos
              </h2>
              <p className="relative flex text-md text-white/30 my-2 wrap-break-word w-fit">
                Are you sure you want to upload the following photos?
              </p>
            </div>
            <button
              onClick={handleCloseModal}
              className="text-white cursor-pointer flex h-fit p-2"
              aria-label="Close"
              disabled={uploading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Carousel Preview */}
        <div className="relative flex flex-grow flex-col items-center justify-center select-none">
          <div className="z-20 absolute top-5 right-0 bg-black px-4 py-1 rounded-xl">
            {idx + 1} / {previews.length}
          </div>
          <div className="flex-grow items-center justify-center w-full flex">
            <button
              className="flex z-20 p-2 mr-1 rounded-full cursor-pointer"
              onClick={() => idx > 0 && setIdx(idx - 1)}
              disabled={idx === 0}
              aria-label="Previous"
              style={{ opacity: idx === 0 ? 0.3 : 1 }}
            >
              <ArrowLeft />
            </button>
            <div
              className="relative flex-grow flex max-w-xl items-center justify-center h-full overflow-visible"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {previews.map((src, i) => {
                if (Math.abs(i - idx) > 1) return null;
                const style: React.CSSProperties = {
                  position: "absolute",
                  margin: "auto",
                  transition:
                    "transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.1s",
                  zIndex: i === idx ? 30 : 20 - Math.abs(i - idx),
                  opacity: i === idx ? 1 : 0.7,
                  transform:
                    i === idx
                      ? "scale(1) translateX(0px)"
                      : i < idx
                      ? "scale(0.92) translateX(-60px) rotate(-8deg)"
                      : "scale(0.92) translateX(60px) rotate(8deg)",
                  width: "80%",
                  height: "80%",
                };
                return (
                  <div
                    key={src}
                    className="relative rounded-xl outline-6 outline-black"
                    style={style}
                  >
                    <Image
                      src={src}
                      alt={`Preview ${i + 1}`}
                      fill
                      className="object-cover w-full rounded-xl"
                      draggable={false}
                    />
                  </div>
                );
              })}
            </div>
            <button
              className="flex z-20 ml-1 shadow p-2 rounded-full cursor-pointer"
              onClick={() => idx < previews.length - 1 && setIdx(idx + 1)}
              disabled={idx === previews.length - 1}
              aria-label="Next"
              style={{ opacity: idx === previews.length - 1 ? 0.3 : 1 }}
            >
              <ArrowRight />
            </button>
          </div>
        </div>

        {/* Upload Button */}
        <div className="rounded-xl flex justify-center items-center mb-8">
          <button
            onClick={handleUploadAll}
            disabled={userSelectedFiles.length === 0 || uploading}
            className="relative w-5/6 outline outline-white/10 max-w-2xl overflow-hidden text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {/* Progress Background */}
            {uploading && (
              <span
                className="absolute top-0 left-0 h-full bg-white/60 z-0 transition-all"
                style={{ width: `${progress}%` }}
              />
            )}

            {/* Button Content */}
            <span className="relative z-10 flex items-center justify-center">
              {uploading ? (
                `Uploading... ${progress}%`
              ) : (
                <Upload className="w-5 h-5 mx-auto" />
              )}
            </span>
          </button>
          {/* Progress Bar
          {uploading && (
            <div className="w-5/6 max-w-2xl bg-white/20 h-2 rounded-xl mt-2">
              <div
                className="bg-white h-2 rounded-xl transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )} */}
        </div>

        {/* Animations */}
        <style jsx>{`
          .animate-slideUp {
            animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .animate-slideDown {
            animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
          @keyframes slideDown {
            from {
              transform: translateY(0);
            }
            to {
              transform: translateY(100%);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
