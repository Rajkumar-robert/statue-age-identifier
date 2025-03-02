"use client";
import { useRef, useState } from "react";
import Image from "next/image";

export default function UploadForm() {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Generate preview URL
    const objectUrl = URL.createObjectURL(file);
    console.log(objectUrl);
    setPreviewUrl(objectUrl);
    setSelectedFile(file); // Store file but do not upload yet
  };

  // Handle upload when button is clicked
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    setIsUploading(true);
    const data = new FormData();
    data.set("file", selectedFile);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      console.log(response);
      const signedUrl = await response.json();
      // setPreviewUrl(signedUrl); // Set preview to uploaded image URL
      console.log(previewUrl);
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Image upload failed.");
    }

    setIsUploading(false);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 rounded-lg shadow-md">
      <input
        ref={fileInputRef}
        type="file"
        disabled={isUploading}
        onChange={handleFileChange}
        className="mb-4 text-gray-700"
        accept="image/*"
      />

      {previewUrl && (
        <div className="relative w-40 h-40 mb-4">
          <img
            src={previewUrl}
            alt="Preview"
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={isUploading || !selectedFile}
        className={`px-4 py-2 text-white rounded-lg ${
          isUploading || !selectedFile
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-700"
        }`}
      >
        {isUploading ? "Uploading..." : "Upload Image"}
      </button>
    </div>
  );
}
