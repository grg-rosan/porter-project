// components/VerificationModal.jsx
import { useEffect } from "react";
import RiderDocumentUpload from "../pages/rider/riderComps/RiderDocumentUpload";
export default function VerificationModal({ open, onClose }) {
  // Lock body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Sheet / Modal */}
      <div
        className="relative z-10 w-full sm:max-w-lg bg-white sm:rounded-2xl rounded-t-2xl
                   shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3
                        flex items-center justify-between z-10 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-900">Verify Your Account</span>
            <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
              Pending
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full
                       hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
          >
            <span className="material-symbols-rounded" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        {/* Inject the full verification flow */}
        <RiderDocumentUpload onSuccess={onClose} />
      </div>
    </div>
  );
}