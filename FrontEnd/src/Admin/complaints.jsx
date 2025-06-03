import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './navbar';
import SideBar from './sidebar';
import '../styles.css';

const A_Complaints = () => {
  const [complaintsList, setComplaintsList] = useState([]);

  useEffect(() => {
    axios
      .get('/api/admin/complaints')
      .then((res) => setComplaintsList(res.data))
      .catch((err) => console.error('Error fetching complaints:', err));
  }, []);

  const handleStatusUpdate = async (complaintId, status) => {
    const endpoint = status === 'Discarded' ? '/api/admin/complaints/discard' : '/api/admin/complaints/completed';
    try {
      await axios.post(endpoint, { complaintId });
      
      // Update the local state to reflect the new status
      setComplaintsList(
        complaintsList.map((complaint) =>
          complaint._id === complaintId ? { ...complaint, status } : complaint
        )
      );
    } catch (err) {
      console.error(`Error updating complaint status to ${status}:`, err);
      alert(`Failed to update complaint status to ${status}.`);
    }
  };

  const handleDiscard = (complaintId) => {
    handleStatusUpdate(complaintId, 'Discarded');
  };

  const handleApprove = (complaintId) => {
    handleStatusUpdate(complaintId, 'Completed');
  };

  const handleLogout = () => console.log('Logged out');

  // Function to determine the dot color based on category
  const getCategoryColor = (category) => {
    const colorMap = {
      Mess: 'bg-red-500',
      'Hostel Rooms': 'bg-green-500',
      'Hostel Washroom': 'bg-yellow-500',
      MPH: 'bg-purple-500',
      Gym: 'bg-orange-500',
      Others: 'bg-blue-500',
    };
    return colorMap[category] || 'bg-gray-400';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar onLogout={handleLogout} />
      <SideBar />
      <div className="pt-20 sm:pl-64 min-h-screen">
        <div className="p-6">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">
              Complaints Management
            </h1>
            
            {/* Container with gradient border */}
            <div
              className="p-[1px] rounded-2xl overflow-hidden bg-gradient-to-r from-amber-500 to-red-600"
            >
              <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-white">All Student Complaints</h2>
                  <div className="flex space-x-2">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">Pending</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Completed</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">Discarded</span>
                  </div>
                </div>

                {/* Vertical scrollable container */}
                <div className="h-96 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-3">
                    {complaintsList.length === 0 ? (
                      <p className="text-gray-400 text-center italic w-full">No complaints filed yet.</p>
                    ) : (
                      complaintsList.map((item) => (
                        <div
                          key={item._id}
                          className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:bg-gray-650 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`w-3 h-3 rounded-full ${getCategoryColor(item.category)}`}
                              />
                              <span className="font-medium text-gray-200">{item.category}</span>
                            </div>
                            <span className="text-sm text-gray-400">{item.date}</span>
                          </div>
                          
                          <p className="text-gray-300 mb-3">{item.text}</p>

                          {/* Displaying User Details */}
                          <div className="mb-3 text-sm text-gray-400">
                            <p><strong>Email:</strong> {item.user.email}</p>
                            <p><strong>Name:</strong> {item.user.name}</p>
                            <p><strong>Phone :</strong> {item.user.phone}</p>
                            <p><strong>Room Number :</strong> {item.user.roomNumber}</p>
                          </div>

                          <div className="border-t border-gray-600 pt-3 mt-2">
                            <div className="flex justify-between items-center">
                              <span
                                className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                                  item.status === 'Pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : item.status === 'Completed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {item.status}
                              </span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleApprove(item._id)}
                                  disabled={item.status !== 'Pending'}
                                  className="bg-green-600 text-white px-3 py-1 text-xs rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Completed
                                </button>
                                <button
                                  onClick={() => handleDiscard(item._id)}
                                  disabled={item.status !== 'Pending'}
                                  className="bg-red-600 text-white px-3 py-1 text-xs rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Discard
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default A_Complaints;
