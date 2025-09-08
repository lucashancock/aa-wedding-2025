import { CheckSquare, LogOut, Upload } from "lucide-react";
import { useCallback } from "react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function GalleryFooter({
  setShowUploadModal,
  isSelectionMode,
  setSelectionMode,
  setUserSelectedFiles,
}: {
  setShowUploadModal: (show: boolean) => void;
  isSelectionMode: boolean;
  setSelectionMode: (isSelectionMode: boolean) => void;
  setUserSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
}) {
  const router = useRouter();
  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error signing out:", err);
    } finally {
      // navigate back to home back after sign out
      router.replace("/");
    }
  }, [router]);

  const toggleSelectionMode = () => {
    setSelectionMode(!isSelectionMode);
  };

  return (
    <nav className="border-t border-white/10 px-0 py-3">
      <div className="flex items-center gap-5 px-5 justify-center">
        <button
          onClick={toggleSelectionMode}
          className={`flex flex-col w-full justify-center items-center space-y-1 transition-colors ${
            isSelectionMode ? "text-white" : "text-white/70"
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-xs">Select</span>
        </button>

        <label
          htmlFor="file-upload"
          className={`flex flex-col w-full items-center justify-center active:scale-95 transition-transform duration-300 ease-out ${
            isSelectionMode ? "" : ""
          } items-center space-y-1 text-white/70`}
        >
          <Upload className="w-5 h-5" />
          <span className="text-xs">Share</span>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                setUserSelectedFiles(Array.from(e.target.files));
                setShowUploadModal(true);
              }
              e.target.value = "";
            }}
            className="hidden"
          />
        </label>

        <button
          onClick={handleSignOut}
          className="flex flex-col items-center w-full justify-center space-y-1 text-white/70 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
