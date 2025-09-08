import { useState, useEffect } from "react";

// --- Extracted Modal Component ---
export default function SlideUpModal({
  show,
  onClose,
  children,
}: {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(show);

  // Handle mount/unmount for animation
  useEffect(() => {
    if (show) setVisible(true);
    else setTimeout(() => setVisible(false), 300);
  }, [show]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/40 transition-all duration-300 ${
          show ? "backdrop-blur-sm opacity-100" : "backdrop-blur-0 opacity-0"
        }`}
        onClick={onClose}
      />
      {/* Modal */}
      <div
        className={`relative w-full h-1/2 mx-auto bg-black border-t border-t-white/20 shadow-lg p-6 ${
          show ? "animate-slideUp" : "animate-slideDown"
        }`}
      >
        {children}
      </div>
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
  );
}
