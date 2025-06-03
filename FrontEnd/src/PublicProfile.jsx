import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Import useParams
import axios from "axios";
import SideBar from "./Components/SideBar";
import Navbar from "./Components/NavBar";

const PublicProfilePage = () => {
  const { userId } = useParams(); // Extract userId from URL
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) {
        console.error("userId is undefined or not provided from URL:", userId);
        setError("User ID is required or invalid.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching profile for userId:", userId);
        const res = await axios.get(`/api/user/${userId}`, { withCredentials: true });
        console.log("API Response:", res.data);

        if (res.data && res.data.student) {
          setProfileData(res.data.student);
        } else if (res.data) {
          setProfileData(res.data);
        } else {
          setError("Profile data not found.");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile data:", err.response ? err.response.data : err.message);
        setError("Failed to load profile data. " + (err.response?.data?.message || ""));
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-800 dark:bg-gray-900 text-white">
        <SideBar />
        <Navbar />
        <main className="pt-16 sm:ml-64 p-6">
          <div className="max-w-4xl mx-auto text-center">Loading...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-800 dark:bg-gray-900 text-white">
        <SideBar />
        <Navbar />
        <main className="pt-16 sm:ml-64 p-6">
          <div className="max-w-4xl mx-auto text-center text-red-500">{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 dark:bg-gray-900 text-white">
      <SideBar />
      <Navbar />
      <main className="pt-16 sm:ml-64 p-6">
        <div className="max-w-4xl mx-auto space-y-6 mt-6">
          <div className="bg-slate-900 p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-6 mb-6">
              <img
                src={profileData.avatarURL || "../public/img/default-avatar.png"}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-blue-500"
              />
              <div>
                <h1 className="text-2xl font-bold">{profileData.name || "N/A"}</h1>
                <p className="text-gray-400">{profileData.email || "N/A"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                <div className="bg-gray-800 p-3 rounded">{profileData.name || "N/A"}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone</label>
                <div className="bg-gray-800 p-3 rounded">{profileData.phone || "N/A"}</div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Batch</label>
                <div className="bg-gray-800 p-3 rounded">{profileData.batch || "N/A"}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Room Number</label>
                <div className="bg-gray-800 p-3 rounded">{profileData.roomNumber || "N/A"}</div>
              </div>
              
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Gender</label>
                <div className="bg-gray-800 p-3 rounded">{profileData.gender || "N/A"}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date of Birth</label>
                <div className="bg-gray-800 p-3 rounded">
                  {profileData.dob ? new Date(profileData.dob).toLocaleDateString() : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicProfilePage;