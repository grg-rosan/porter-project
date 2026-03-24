import { useState } from "react";
import { uploadAPI } from "../api/api";   // ← use uploadAPI not getAPI

export const useDocumentUpload = ({ onSuccess }) => {
  const [files, setFiles] = useState({
    license: null,
    citizenshipId: null,
    vehicleRegistration: null,
  });

  const [vehicle, setVehicle] = useState({
    type: "",
    plateNumber: "",
    model: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (key, file) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleVehicleChange = (key, value) => {
    setVehicle((prev) => ({ ...prev, [key]: value }));
  };

  const allDocumentsUploaded = ["license", "citizenshipId", "vehicleRegistration"]
    .every((key) => files[key]);

  const vehicleComplete = vehicle.type && vehicle.plateNumber && vehicle.model;
  const canSubmit = allDocumentsUploaded && vehicleComplete;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      // append files
      Object.entries(files).forEach(([key, file]) => {
        formData.append(key, file);
      });

      // append vehicle info
      formData.append("vehicleType", vehicle.type);
      formData.append("plateNumber", vehicle.plateNumber);
      formData.append("vehicleModel", vehicle.model);

      const data = await uploadAPI("rider/documents", formData);  // ← clean

      if (data.status !== "success") {
        setError(data.message || "Upload failed");
        return;
      }

      setSubmitted(true);
      if (onSuccess) onSuccess();

    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return {
    files, vehicle,
    loading, error, submitted,
    canSubmit,
    handleFileChange,
    handleVehicleChange,
    handleSubmit,
  };
};