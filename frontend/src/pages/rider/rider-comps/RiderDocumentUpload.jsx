// pages/rider/rider-comps/RiderDocumentUpload.jsx
import FileUploadBox       from "./FileUploadBox";
import VehicleInfoForm     from "./VehicleInfoForm";
import VerificationSuccess from "./VerificationSuccess";
import { useDocumentUpload } from "../../../hooks/useDocumentUpload";

const DOCUMENTS = [
  { key: "license",             label: "Driving License",      description: "Front and back of your valid driving license", icon: "🪪" },
  { key: "citizenshipId",       label: "Citizenship ID",       description: "Your national citizenship certificate",         icon: "📄" },
  { key: "vehicleRegistration", label: "Vehicle Registration", description: "Bluebook (vehicle registration document)",      icon: "🚗" },
];

const RiderDocumentUpload = ({ onSuccess }) => {
  const {
    files, vehicle,
    loading, error, submitted,
    canSubmit,
    handleFileChange,
    handleVehicleChange,
    handleSubmit,
  } = useDocumentUpload({ onSuccess });

  if (submitted) return <VerificationSuccess />;

  return (
    // FIX: removed min-h-screen — the modal controls height now
    // bg-gray-50 kept so it looks clean inside the white modal
    <div className="bg-gray-50 p-4 pb-8">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="mb-6 pt-2">
          <h1 className="text-xl font-bold text-gray-900">Rider Verification</h1>
          <p className="text-gray-500 mt-1 text-sm">Submit your documents to start accepting orders.</p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-6">
          {DOCUMENTS.map((doc) => (
            <div
              key={doc.key}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500
                ${files[doc.key] ? "bg-green-400" : "bg-gray-200"}`}
            />
          ))}
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {DOCUMENTS.filter((d) => files[d.key]).length}/{DOCUMENTS.length} docs
          </span>
        </div>

        {/* Documents */}
        <div className="space-y-3 mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Documents</h2>
          {DOCUMENTS.map((doc) => (
            <FileUploadBox
              key={doc.key}
              doc={doc}
              file={files[doc.key]}
              onChange={handleFileChange}
            />
          ))}
        </div>

        {/* Vehicle info */}
        <div className="mb-6">
          <VehicleInfoForm vehicle={vehicle} onChange={handleVehicleChange} />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all
            ${canSubmit && !loading
              ? "bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
        >
          {loading ? "Uploading..." : "Submit for Verification"}
        </button>

      </div>
    </div>
  );
};

export default RiderDocumentUpload;