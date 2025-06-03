import React, { useState, useEffect } from "react";
import { FiEdit2 } from "react-icons/fi";
import { FaQuestionCircle, FaTimes } from "react-icons/fa";
import axios from "axios";
import SideBar from "../Components/SideBar";
import Navbar from "../Components/NavBar";
import { storage } from "../firebase"; // Adjust the import based on your firebase config file
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const A_Profile = () => {
  const [profileData, setProfileData] = useState({
    name: "",
    dob: "",
    gender: "",
    profileImage: "",
    roomNo: "",
    phoneNo: "",
    branch: "",
    emailId: "",
    parentsEmailId: "",
    parentsPhoneNo: "", // Added parents phone number
  });

  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [isPersonalPopupOpen, setIsPersonalPopupOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);


  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get("/api/student/info", {
          withCredentials: true,
        });
        if (response.data.student) {
          console.log(response.data.student);
          setProfileData({
            name: response.data.student.name,
            dob: response.data.student.dob,
            gender: response.data.student.gender,
            profileImage:
              response.data.student.avatarURL ||
              "../public/img/default-avatar.png",
            roomNo: response.data.student.roomNumber,
            phoneNo: response.data.student.phone,
            branch: response.data.student.batch,
            emailId: response.data.student.email,
            parentsEmailId: response.data.student.parentEmail,
            parentsPhoneNo: response.data.student.parentPhone,
          });
        } else {
          console.log("No student data found");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchProfileData();
  }, []);

  const handleChange = (e) =>
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  const handleSave = () => console.log(profileData);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      setLoading(true);
      const fileRef = ref(storage, `profileImages/${profileData.emailId}`);
      try {
        await uploadBytes(fileRef, selectedFile);
        const downloadURL = await getDownloadURL(fileRef);
  
        setProfileData((prev) => ({ ...prev, profileImage: downloadURL }));
  
        await axios.put(
          "/api/student/update",
          { avatarURL: downloadURL },
          { withCredentials: true }
        );
        localStorage.setItem("avatarURL", downloadURL);
  
        setIsProfilePopupOpen(false);
        setSelectedFile(null);
        setPreviewImage(null);
        console.log("Upload successful:", downloadURL);
      } catch (error) {
        console.error("Firebase upload error:", error);
      }
      setLoading(false);
    }
  };
  

  const handleDelete = async () => {
    setSelectedFile(null);
    setPreviewImage(null);
    setProfileData({
      ...profileData,
      profileImage: "../public/img/default-avatar.png",
    });
    await axios.put(
      "/api/student/update",
      { avatarURL: "" },
      { withCredentials: true }
    );

    localStorage.setItem("avatarURL", "");
    setIsProfilePopupOpen(false);

    console.log("Profile picture deleted");
  };

  const handlePersonalSave = async () => {
    try {
      const response = await axios.put("/api/student/update", profileData, {
        withCredentials: true,
      });
      if (response.data.student) {
        console.log("Personal data updated successfully");
        setIsPersonalPopupOpen(false);
      } else {
        console.log("Failed to update personal data");
      }
    } catch (error) {
      console.error("Error updating personal data:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 dark:bg-gray-900 text-white ">
      <SideBar />
      <Navbar />
      <main className="pt-16 sm:ml-64 p-6">
      <div className="max-w-4xl mx-auto space-y-6 mt-6">
        {/* Profile Card (Full Width) */}
        <div className="bg-slate-800 rounded-lg p-6 w-full relative shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Profile Picture</h2>
            <div className="relative group">
           
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <img
              src={profileData.profileImage || "/img/default-avatar.png"}
              alt="Profile"
              className="w-20 h-20 rounded-full border-2 border-blue-500"
            />
            <div>
              <h3 className="text-xl font-bold">{profileData.name}</h3>
              <p className="text-gray-400">{profileData.title}</p>
            </div>
          </div>
          <button
            className="mt-6 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 flex items-center space-x-2"
            onClick={() => setIsProfilePopupOpen(true)}
          >
            <FiEdit2 />
            <span>Edit</span>
          </button>

          {isProfilePopupOpen && (
           <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
           <div className="bg-slate-800/80 backdrop-blur-md rounded-lg p-6 w-96 shadow-lg relative">
             <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">
                    Update Profile Picture
                  </h2>
                  <button
                    className="text-gray-400 hover:text-white"
                    onClick={() => setIsProfilePopupOpen(false)}
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="flex flex-col items-center space-y-4 mb-4">
                  <img
                    src={
                      previewImage ||
                      profileData.profileImage ||
                      "/img/default-avatar.png"
                    }
                    alt="Current Profile"
                    className="w-20 h-20 rounded-full border-2 border-blue-500"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full p-2 rounded bg-slate-700 text-white"
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-300">{selectedFile.name}</p>
                  )}
                </div>
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
                  onClick={handleUpload}
                >
                  Save
                </button>

                {isProfilePopupOpen && (
                  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-lg p-6 w-96 shadow-lg relative">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">
                          Update Profile Picture
                        </h2>
                        <button
                          className="text-gray-400 hover:text-white"
                          onClick={() => setIsProfilePopupOpen(false)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                      <div className="flex flex-col items-center space-y-4 mb-4">
                        <img
                          src={
                            previewImage ||
                            profileData.profileImage ||
                            "/img/default-avatar.png"
                          }
                          alt="Current Profile"
                          className="w-20 h-20 rounded-full border-2 border-blue-500"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="w-full p-2 rounded bg-slate-700 text-white"
                        />
                        {selectedFile && (
                          <p className="text-sm text-gray-300">
                            {selectedFile.name}
                          </p>
                        )}
                      </div>
                      <button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded flex justify-center items-center"
                        onClick={handleUpload}
                        disabled={loading}
                      >
                        {loading ? (
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            ></path>
                          </svg>
                        ) : (
                          "Save"
                        )}
                      </button>


                      <button
                        className="w-full bg-red-600 hover:bg-blue-700 text-white font-semibold py-2 rounded mt-5"
                        onClick={handleDelete}
                      >
                        Delete
                      </button>



                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Additional Personal Info */}
        <div className="w-full max-w-5xl mx-auto mt-8 bg-slate-800 rounded-lg p-6 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <button
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 flex items-center space-x-2"
              onClick={() => setIsPersonalPopupOpen(true)}
            >
              <FiEdit2 />
              <span>Edit</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400">Name</label>
              <p className="text-white">{profileData.name}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400">Room No</label>
              <p className="text-white">{profileData.roomNo}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400">Phone No</label>
              <p className="text-white">{profileData.phoneNo}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400">Branch</label>
              <p className="text-white">{profileData.branch}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400">Email ID</label>
              <p className="text-white">{profileData.emailId}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400">
                Parent's Email
              </label>
              <p className="text-white">{profileData.parentsEmailId}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400">
                Parent's Phone
              </label>
              <p className="text-white">{profileData.parentsPhoneNo}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400">
                Date of Birth
              </label>
                  <p className="text-white">
      {new Date(profileData.dob).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
    </p>

            </div>
          </div>
        </div>

        {/* Popup for Editing Personal Info */}
        {isPersonalPopupOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-96 shadow-lg relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  Update Personal Information
                </h2>
                <button
                  className="text-gray-400 hover:text-white"
                  onClick={() => setIsPersonalPopupOpen(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400">Room No</label>
                  <input
                    type="text"
                    name="roomNo"
                    value={profileData.roomNo}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400">
                    Phone No
                  </label>
                  <input
                    type="text"
                    name="phoneNo"
                    value={profileData.phoneNo}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400">Branch</label>
                  <input
                    type="text"
                    name="branch"
                    value={profileData.branch}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400">
                    Parent's Email
                  </label>
                  <input
                    type="email"
                    name="parentsEmailId"
                    value={profileData.parentsEmailId}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400">
                    Parent's Phone
                  </label>
                  <input
                    type="text"
                    name="parentsPhoneNo"
                    value={profileData.parentsPhoneNo}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <button
                  className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                  onClick={handlePersonalSave}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </main>
    </div>
  );
};

export default A_Profile;
