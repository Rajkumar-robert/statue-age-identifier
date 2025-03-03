"use client";
import React from "react";
import Image from "next/image";

const Dashboard = () => {
  // Sample uploaded images
  const uploadedImages = [
    "/statue_images/1.png",
    "/statue_images/9.png",
    "/statue_images/3.png",
    "/statue_images/4.png",
  ];

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100">
      {/* Sidebar - User Profile */}
      <div className="w-full lg:w-1/3 bg-white shadow-lg p-6 flex flex-col items-center lg:h-full overflow-y-auto min-h-[300px] sm:min-h-[400px] md:min-h-[450px]">
        <Image
          src="/pfp.jpg"
          alt="User Avatar"
          width={120}
          height={120}
          className="rounded-full mb-4"
        />
        <h2 className="text-lg lg:text-xl font-semibold text-gray-800 text-center">John Doe</h2>
        <p className="text-gray-500 text-sm lg:text-base text-center">Antique Enthusiast</p>
        <p className="text-gray-500 text-sm lg:text-base mt-1 text-center">johndoe@example.com</p>
        <div className="mt-4 w-full max-w-xs">
          <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="w-full lg:w-2/3 p-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard</h1>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-6">
          <div className="bg-white p-4 border border-gray-300 rounded-lg">
            <h2 className="text-md font-semibold text-gray-800">Total Uploads</h2>
            <p className="text-2xl lg:text-3xl font-bold text-blue-600">45</p>
          </div>

          <div className="bg-white p-4 border border-gray-300 rounded-lg">
            <h2 className="text-md font-semibold text-gray-800">Verified Statues</h2>
            <p className="text-2xl lg:text-3xl font-bold text-green-600">30</p>
          </div>

          <div className="bg-white p-4 border border-gray-300 rounded-lg">
            <h2 className="text-md font-semibold text-gray-800">Pending Reviews</h2>
            <p className="text-2xl lg:text-3xl font-bold text-yellow-600">10</p>
          </div>

          <div className="bg-white p-4 border border-gray-300 rounded-lg">
            <h2 className="text-md font-semibold text-gray-800">Rejections</h2>
            <p className="text-2xl lg:text-3xl font-bold text-red-600">5</p>
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="mt-6 w-full">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Recent Uploads</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {uploadedImages.map((src, index) => (
              <Image
                key={index}
                src={src}
                alt={`Upload ${index + 1}`}
                width={90}
                height={90}
                className="rounded-md object-cover"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
