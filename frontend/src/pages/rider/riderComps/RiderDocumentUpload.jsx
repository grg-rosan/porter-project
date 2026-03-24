import FileUploadBox from "./FileUploadBox";
import VehicleInfoForm from "./VehicleInfoForm";
import VerificationSuccess from "./VerificationSuccess";
import {useDocumentUpload} from "../../../hooks/useDocumentUpload"
const DOCUMENTS = [
  { key: "license",             label: "Driving License",       description: "Front and back of your valid driving license", icon: "🪪" },
  { key: "citizenshipId",       label: "Citizenship ID",        description: "Your national citizenship certificate",         icon: "📄" },
  { key: "vehicleRegistration", label: "Vehicle Registration",  description: "Bluebook (vehicle registration document)",      icon: "🚗" },
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-xl mx-auto">

        <div className="mb-8 pt-4">
          <h1 className="text-2xl font-bold text-gray-900">Rider Verification</h1>
          <p className="text-gray-500 mt-1 text-sm">Submit your documents to start accepting orders.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {DOCUMENTS.map((doc) => (
            <div key={doc.key} className={`h-1.5 flex-1 rounded-full transition-all duration-500
              ${files[doc.key] ? "bg-green-400" : "bg-gray-200"}`} />
          ))}
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {DOCUMENTS.filter((d) => files[d.key]).length}/{DOCUMENTS.length} docs
          </span>
        </div>

        {/* Documents */}
        <div className="space-y-3 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Documents</h2>
          {DOCUMENTS.map((doc) => (
            <FileUploadBox key={doc.key} doc={doc} file={files[doc.key]} onChange={handleFileChange} />
          ))}
        </div>

        {/* Vehicle */}
        <div className="mb-6">
          <VehicleInfoForm vehicle={vehicle} onChange={handleVehicleChange} />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all
            ${canSubmit && !loading
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
        >
          {loading ? "Uploading..." : "Submit for Verification"}
        </button>

      </div>
    </div>
  );
};

export default RiderDocumentUpload;