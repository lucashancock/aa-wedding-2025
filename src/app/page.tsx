"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import { signInAnonymously, updateProfile, User } from "firebase/auth";
import { ArrowRight, Image, User as UserIcon } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [user, setUser] = useState<User>();
  const [isLoading, setIsLoading] = useState(false);

  // Check for magic token in URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token === process.env.MAGIC_TOKEN) {
      setIsLoading(true);
      signInAnonymously(auth)
        .then((cred) => {
          setUser(cred.user);
          setShowNamePrompt(true);
        })
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [router]);

  // Handle saving the display name the user enters when prompted after anonymous sign-in
  const handleSaveName = async () => {
    if (!user || !displayName.trim()) return;

    setIsLoading(true);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      router.replace("/gallery");
    } catch (err) {
      console.error("Error saving display name:", err);
    } finally {
      console.log("Redirecting to gallery...");
      // setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveName();
    }
  };

  return (
    <div className="h-dvh min-w-xs bg-black flex items-center justify-center p-4">
      {/* Loading state */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="p-6 rounded-lg border border-white/20 bg-black text-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-white/60">Loading...</p>
          </div>
        </div>
      )}

      {/* Display Name Modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="p-6 rounded-lg border border-white/20 bg-black max-w-sm w-full text-center">
            <div className="mb-6">
              <UserIcon className="w-8 h-8 text-white/60 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-white mb-2">
                Welcome!
              </h2>
              <p className="text-white/70 text-sm">
                Please enter your name to continue to the gallery
              </p>
            </div>

            <div className="mb-6">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Your name"
                className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-colors"
                autoFocus
              />
            </div>

            <button
              onClick={handleSaveName}
              disabled={!displayName.trim() || isLoading}
              className="w-full bg-white text-black font-medium py-3 rounded-lg transition-colors hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2"></div>
                  Loading...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <p>Continue to Gallery</p>
                  <ArrowRight className="inline-block w-4 h-4 ml-1" />
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Default Card */}
      {!showNamePrompt && (
        <div className="max-w-sm w-full">
          <div className=" p-6 rounded-lg border border-white/20 text-center">
            <div className="mb-6">
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image className="w-12 h-12 text-white mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-white mb-2">
                A&A Wedding Photo Share
              </h1>
            </div>

            {/* Card description */}
            <p className="text-white/70 leading-relaxed mb-6 text-sm">
              Welcome to our special day! Please scan the QR code or use the
              provided link to access our wedding photo album.
            </p>

            {/* Pulsing 3 dots at the bottom of the card */}
            <div className="flex items-center justify-center space-x-2 text-white/40">
              <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse delay-150"></div>
              <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
