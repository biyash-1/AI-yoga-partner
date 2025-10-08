"use client"
import React from "react";

import { useUser } from "@clerk/nextjs";
const ProfilePage = () => {
  const { user } = useUser();

  console.log("user info in profile",user);
  console.log("user profile",user?.imageUrl)

  if (!user) {
    return <div>Loading...</div>;
  }
  return (
    <div className="flex justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 mt-3 ">
        <h1 className="text-center text-2xl font-bold text-gray-800 mb-6">
          Profile
        </h1>

        {/* Profile Image */}
        <div className="flex justify-center mb-6">
          <div className="w-28 h-28 rounded-full bg-blue-300 flex items-center justify-center text-white text-4xl font-bold shadow-md">
            <img
              src={user.imageUrl || "/default-profile.png"}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-6  text-gray-700">
          <div className="flex justify-between gap-2">
            <span className="font-semibold">Name:</span>
            <span>{user.fullName}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Email:</span>
            <span>{user.primaryEmailAddress?.emailAddress}</span>
          </div> 

          <div className="flex justify-between">
            <span className="font-semibold">Member Since:</span>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
          
        </div>
        


      </div>
    </div>
  );
};

export default ProfilePage;
