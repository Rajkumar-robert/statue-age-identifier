"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [prediction, setPrediction] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const storedPrediction = localStorage.getItem("prediction");
    const storedImage = localStorage.getItem("previewUrl");

    if (storedPrediction && storedImage) {
      setPrediction(JSON.parse(storedPrediction));
      setPreviewUrl(storedImage);
    }
  }, []);

  if (!prediction || !previewUrl) {
    return <p className="text-center mt-10 text-xl">Loading...</p>;
  }

  return (
    <div className="flex h-[88vh] w-full p-4 gap-4">
      <div className="w-1/3 bg-gray-200 flex items-center justify-center p-4 rounded-lg border-1 border-black">
        <Image
          src={previewUrl}
          alt="Uploaded Statue"
          width={500}
          height={600}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      <div className="w-2/3 flex flex-col gap-4">
        <div className="flex gap-4 h-1/3">
          <div className="font-sans w-1/2 bg-gray-200 flex items-center justify-center rounded-lg border-1 border-black text-2xl font-bold">
            <p>Age: ~{prediction.estimated_age} years</p>
          </div>
          <div className="font-sans w-1/2 bg-gray-200 flex items-center justify-center rounded-lg border-1 border-black text-2xl font-bold">
            <p>Year: {prediction.predicted_year}</p>
            </div>
          <div className="w-1/2 bg-gray-200 flex items-center justify-center rounded-lg border-1 border-black text-2xl font-bold">
            <p>Era: {prediction.predicted_period}</p>
          </div>
        </div>

        <div className="h-2/3 px-10 font-mono bg-gray-500 flex flex-col items-center justify-center rounded-lg border-1 border-black p-4 text-white text-lg">
          <p>
            This statue dates back approximately {prediction.estimated_age} years, belonging to the{" "}
            {prediction.predicted_period} era. It showcases significant features of its time and may provide insight
            into regional or cultural artistry.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
