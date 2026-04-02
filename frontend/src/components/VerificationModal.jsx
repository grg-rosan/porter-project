// components/VerificationModal.jsx
import { useEffect } from "react";
import RiderDocumentUpload from "../pages/rider/rider-comps/RiderDocumentUpload";

const Icon = ({ name, size = 20, className = "" }) => (
  <span className={`material-symbols-rounded select-none ${className}`} style={{ fontSize: size, lineHeight: 1 }}>
    {name}
  </span>
);

export default function VerificationModal({ open, onClose }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    // FIX: z-[9999] beats Leaflet's z-index (400–1000 range)
    // FIX: using a portal-like stacking with isolation
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">

      {/* Backdrop — sits below the sheet */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative z-10 w-full sm:max-w-lg bg-white
                   sm:rounded-2xl rounded-t-2xl shadow-2xl
                   flex flex-col"
        // FIX: explicit max-h + flex column so content scrolls INSIDE the modal,
        // not the page behind it
        style={{ maxHeight: "92dvh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky header — never scrolls away */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3
                        flex items-center justify-between z-10 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-900">Verify Your Account</span>
            <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
              Required
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full
                       hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Scrollable body — FIX: overflow lives here, not on the page */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          {/* FIX: RiderDocumentUpload strips min-h-screen — see updated component */}
          <RiderDocumentUpload onSuccess={onClose} />
        </div>
      </div>
    </div>
  );
}