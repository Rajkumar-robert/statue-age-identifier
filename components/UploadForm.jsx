"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function UploadForm() {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadSuccess, setIsUploadSuccess] = useState(false);
  const [imageCID, setImageCID] = useState(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Generate preview URL
    const objectUrl = URL.createObjectURL(file);
    console.log(objectUrl);
    setPreviewUrl(objectUrl);
    setSelectedFile(file); 
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
      const {signedUrl,cid} = await response.json();
      if(response.status === 200) {
        setIsUploadSuccess(true);
      }
      console.log(signedUrl);
      console.log(cid);
      setPreviewUrl(signedUrl); // Set preview to uploaded image URL
      setImageCID(cid);
      console.log(previewUrl);
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Image upload failed.");
    }

    setIsUploading(false);
  };

  return (
    <div className="flex flex-col items-center p-6 border-1 border-black rounded-md z-50 backdrop-blur-2xl bg-white bg-opacity-50 mx-2">
      <input
        ref={fileInputRef}
        type="file"
        disabled={isUploading}
        onChange={handleFileChange}
        className="mb-4 text-gray-700"
        accept="image/*"
      />

      {previewUrl && (
        <div className="relative w-64 h-86 mb-4">
          <Image
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover rounded-md"
            fill
          />
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={isUploading || !selectedFile}
        className={`px-4 py-2 text-white rounded-lg font-mono ${
          isUploading || !selectedFile
            ? "bg-blue-500"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {isUploading ? "Uploading..." : "Upload Image"}
      </button>
      {
        isUploadSuccess && (
          <div className="px-4 py-2 text-white rounded-lg bg-green-500 hover:bg-green-600 mt-2">
            <Link 
            href={`/details/${imageCID}`}
            className="text-white- font-mono">
            Identify Age and Era
            </Link>
           
          </div>
        )
      }
    </div>
  );
}
