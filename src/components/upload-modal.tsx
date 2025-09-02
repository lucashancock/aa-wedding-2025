import { useEffect, useState } from "react";
import Image from "next/image";
import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function UploadModal({
  setShowUploadModal,
  userSelectedFiles,
  setUserSelectedFiles,
}: {
  setShowUploadModal: (show: boolean) => void;
  userSelectedFiles: File[];
  setUserSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
}) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    // Generate preview URLs for each file
    const urls = userSelectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(urls);

    // Cleanup: revoke object URLs to avoid memory leaks
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [userSelectedFiles]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
      <div className="flex flex-col gap-4 p-4 rounded-lg max-w-sm bg-black/90 w-full h-3/4 text-center border border-white/10">
        <h2 className="text-xl font-semibold text-white">
          Upload Photos/Videos
        </h2>
        <p className="relative text-md text-white/20 wrap-break-word w-fit">
          Are you sure you want to upload the following photos?
        </p>

        <div className="relative flex flex-grow border border-white/10 p-5 rounded-lg">
          <div className="relative w-full h-full">
            <div className="z-20 absolute top-3 right-2 bg-black px-4 py-1 rounded-xl">
              {idx + 1} / {previews.length}
            </div>
            <div
              className="absolute z-20 top-1/2 left-2 bg-black p-2 rounded-full "
              onClick={() => {
                if (idx === 0) return;
                setIdx(idx - 1);
              }}
            >
              <ArrowLeft />
            </div>
            <div
              className="absolute z-20 top-1/2 right-2 bg-black p-2 rounded-full "
              onClick={() => {
                if (idx === previews.length - 1) return;
                setIdx(idx + 1);
              }}
            >
              <ArrowRight />
            </div>
            <div className="relative w-full h-full flex items-center justify-center">
              {previews[idx] && (
                <Image
                  src={previews[idx]}
                  alt="Image preview"
                  fill
                  className="object-cover"
                  key={previews[idx]}
                  onLoadingComplete={(img) => img.classList.remove("opacity-0")}
                />
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            // onClick={handleUpload}
            // disabled={selectedFiles?.length === 0 || uploading}
            className="w-full flex-grow text-white font-medium py-3 rounded-lg outline outline-white/10 transition-colors disabled:opacity-50"
          >
            {/* {uploading ? "Uploading..." : "Upload"} */}
            <p>Upload</p>
          </button>

          <button
            onClick={() => {
              setShowUploadModal(false);
              setUserSelectedFiles([]);
              //   setPreviewUrl([]);
            }}
            className="flex bg-white px-4 text-black font-medium py-3 rounded-lg transition-colors hover:bg-white/90"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
