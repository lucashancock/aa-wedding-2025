"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Frown, Home } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push("/"), 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="h-dvh bg-black flex items-center justify-center p-4">
      <div className="text-center">
        <div className="p-6 rounded-lg border border-white/20 text-center max-w-sm w-full">
          <div className="mb-6">
            <Frown className="w-12 h-12 text-white mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2">404</h1>
          </div>

          <h2 className="text-lg font-semibold text-white mb-2">
            Page Not Found
          </h2>
          <p className="text-white/70 mb-6 text-sm">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => router.push("/")}
              className="w-full bg-white text-black font-medium py-3 rounded-lg transition-colors hover:bg-white/90 flex items-center justify-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </button>

            <div className="flex items-center justify-center space-x-2 text-white/40">
              <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
              <span className="text-sm">Redirecting in 5 seconds...</span>
              <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
