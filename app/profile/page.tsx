"use client";
import React from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

const ProfilePage = () => {
  const { user } = useUser();

  console.log("user info in profile", user);
  console.log("user profile", user?.imageUrl);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 mt-3">
        <h1 className="text-center text-2xl font-bold text-gray-800 mb-6">
          Profile
        </h1>

        {/* Profile Image */}
        <div className="flex justify-center mb-6">
          <div className="w-28 h-28 rounded-full bg-blue-300 flex items-center justify-center text-white text-4xl font-bold shadow-md overflow-hidden">
            {user.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt="Profile"
                width={112}
                height={112}
                className="w-full h-full rounded-full object-cover"
                priority
              />
            ) : (
              <span>{user.firstName?.[0] || user.username?.[0] || "U"}</span>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-6 text-gray-700">
          <div className="flex justify-between gap-2">
            <span className="font-semibold">Name:</span>
            <span className="text-right">{user.fullName || "N/A"}</span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="font-semibold">Email:</span>
            <span className="text-right break-all">
              {user.primaryEmailAddress?.emailAddress || "N/A"}
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="font-semibold">Member Since:</span>
            <span className="text-right">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;