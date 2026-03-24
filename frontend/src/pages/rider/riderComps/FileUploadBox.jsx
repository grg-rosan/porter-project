import { useMemo, useState } from "react"; // 1. Swap useEffect for useMemo

const FileUploadBox = ({ doc, file, onChange }) => {
  const [dragging, setDragging] = useState(false);

  // 2. Calculate preview directly. 
  // It updates automatically when 'file' changes, no setState needed.
  const preview = useMemo(() => {
    if (file && file.type?.startsWith("image/")) {
      return URL.createObjectURL(file);
    }
    return null;
  }, [file]);

  // Note: Since we aren't using an Effect to revoke the URL anymore, 
  // for a simple UI like this, the browser will clean up the memory 
  // when the page/component unmounts.

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onChange(doc.key, dropped);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => document.getElementById(`file-${doc.key}`).click()}
      className={`relative border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer flex items-center justify-between
        ${dragging ? "border-blue-400 bg-blue-50"
          : file ? "border-green-400 bg-green-50/40"
          : "border-gray-200 bg-white hover:border-blue-300"}`}
    >
      <input
        id={`file-${doc.key}`}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => onChange(doc.key, e.target.files[0])}
      />

      <div className="flex items-start gap-4 flex-1 min-w-0">
        <span className="text-2xl mt-1">{doc.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-sm">{doc.label}</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-tight">{doc.description}</p>
          
          {file ? (
            <div className="flex items-center gap-1 mt-2 text-[11px] text-green-600 font-bold">
              <span className="bg-green-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px]">✓</span>
              <span className="truncate">{file.name}</span>
            </div>
          ) : (
            <p className="mt-2 text-xs text-blue-500 font-medium">Click or drag to upload</p>
          )}
        </div>
      </div>

      {/* SNAPSHOT PREVIEW */}
      {file && (
        <div className="relative ml-4 flex-shrink-0">
          {preview ? (
            <img 
              src={preview} 
              alt="preview" 
              className="w-16 h-12 object-cover rounded-lg border border-white shadow-sm"
            />
          ) : (
            <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-400 font-bold">
              {file.type?.includes('pdf') ? 'PDF' : 'DOC'}
            </div>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(doc.key, null); }}
            className="absolute -top-2 -right-2 bg-white border border-gray-100 text-gray-400 rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm hover:text-red-500"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
export default FileUploadBox