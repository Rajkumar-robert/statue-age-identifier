"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function UploadForm() {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [metadata, setMetadata] = useState({
    main_material: "stone",
    context: "",
    material_and_technique: "",
    geographic_context: "",
    cultural_context: "",
    gallery_name: "",
    object_type: "",
    museum_name: "",
    classification: "",
  });

  const router = useRouter();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    setMetadata((prev) => ({ ...prev, [name]: value }));
  };

  const metadataKeyMap = {
    main_material: "main_material",
    context: "context",
    material_and_technique: "material_and_technique",
    geographic_context: "geographic_context",
    cultural_context: "cultural_context",
    gallery_name: "gallery_name",
    object_type: "object_type",
    museum_name: "museum_name",
    classification: "classification",
  };

  const handleSubmit = async () => {
    if (!selectedFile) return alert("Image is required.");
    if (!metadata.main_material.trim()) return alert("Main material is required.");

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("main_material", metadata.main_material);

    // Append optional fields only if filled
    for (const key in metadata) {
      if (key !== "main_material" && metadata[key].trim()) {
        formData.append(key, metadata[key]);
      }
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Prediction failed");
      const result = await res.json();

      localStorage.setItem("prediction", JSON.stringify(result));
      localStorage.setItem("previewUrl", previewUrl);

      router.push("/details");
    } catch (error) {
      console.error("Prediction Error:", error);
      alert("Prediction failed.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col mt-16 items-center p-6 border border-black rounded-md bg-white bg-opacity-80 mx-2">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="mb-4 text-gray-700"
        accept="image/*"
        required
      />

      {previewUrl && (
        <div className="relative w-64 h-64 mb-4">
          <Image
            src={previewUrl}
            alt="Preview"
            className="object-cover rounded-md"
            fill
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-lg">
        {Object.keys(metadata).map((key) => (
          <input
            key={key}
            type="text"
            name={key}
            placeholder={key.replace(/_/g, " ")}
            value={metadata[key]}
            onChange={handleMetadataChange}
            className={`p-2 border rounded bg-white text-black placeholder:text-gray-600 ${
              key === "main_material" ? "border-red-500" : ""
            }`}
            required={key === "main_material"}
          />
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`mt-4 px-4 py-2 text-white rounded-lg font-mono ${
          isSubmitting ? "bg-blue-500" : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {isSubmitting ? "Submitting..." : "Submit for Prediction"}
      </button>
    </div>
  );
}
