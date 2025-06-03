import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './navbar';
import SideBar from './sidebar';

const A_Leave = () => {
  const [leaveList, setLeaveList] = useState([]);

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        const res = await axios.get('/api/admin/leave', { withCredentials: true });
        console.log('Leave data:', res.data);
        setLeaveList(res.data);
      } catch (err) {
        console.error('Error fetching leave requests:', err);
      }
    };
    fetchLeaveData();
  }, []);

  

  const handleApprove = (id) => async () => {
    try {
      const res = await axios.post(`/api/admin/leave/accept`, { id });
      if (res.status === 200) {
        setLeaveList(leaveList.map((item) =>
          item._id === id ? { ...item, status: 'Approved' } : item
        ));
      } else {
        alert('Failed to approve leave request.');
      }
    } catch (err) {
      console.error('Error approving leave request:', err);
      alert('Failed to approve leave request.');
    }
  };

  const handleReject = (id) => async () => {
    try {
      const res = await axios.post(`/api/admin/leave/reject`, { id });
      if (res.status === 200) {
        setLeaveList(leaveList.map((item) =>
          item._id === id ? { ...item, status: 'Rejected' } : item
        ));
      } else {
        alert('Failed to reject leave request.');
      }
    } catch (err) {
      console.error('Error rejecting leave request:', err);
      alert('Failed to reject leave request.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      <SideBar />
      <div className="pt-20 sm:pl-64 min-h-screen">
        <div className="p-6">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">
              Leave Approval
            </h1>
            <div
              className="p-[1px] rounded-2xl overflow-hidden bg-gradient-to-r from-amber-500 to-red-600"
            >
              <div className="bg-gray-800 rounded-2xl shadow-xl p-6 min-h-[600px] overflow-hidden flex flex-col">
                {leaveList.length === 0 ? (
                  <p className="text-gray-400 italic text-center">No leave applications yet.</p>
                ) : (
                  <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pr-2 flex-1 space-y-4">
                    {leaveList.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-800 p-4 rounded-lg border border-gray-600 hover:bg-gray-700"
                      >
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-3 h-3 rounded-full ${
                                {
                                  Medical: 'bg-red-500',
                                  Personal: 'bg-blue-500',
                                  'Family Emergency': 'bg-yellow-500',
                                  Other: 'bg-green-500',
                                }[item.leaveType] || 'bg-gray-400'
                              }`}
                            ></span>
                            <span className="font-medium">{item.leaveType}</span>
                          </div>
                          <span className="text-sm text-gray-400">
                            {new Date(item.startDate).toLocaleDateString()} -{' '}
                            {new Date(item.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-300">{item.reason}</p>

                        {/* Display User Information */}
                        <div className="mt-2 text-sm text-gray-400 space-y-1">
                          <p><strong>Name:</strong> {item.userId?.name}</p>
                          <p><strong>Email:</strong> {item.userId?.email}</p>
                          <p><strong>Phone:</strong> {item.userId?.phone}</p>
                          <p><strong>Room:</strong> {item.userId?.roomNumber}</p>
                          <p><strong>Gender:</strong> {item.userId?.gender}</p>
                          <p><strong>Batch:</strong> {item.userId?.batch}</p>
                        </div>

                        <div className="mt-2 flex justify-between items-center">
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-semibold ${
                              item.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : item.status === 'Approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.status}
                          </span>

                          {/* Conditionally render approve and reject buttons for 'Pending' requests */}
                          {item.status === 'Pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={handleApprove(item._id)}
                                className="bg-green-600 text-white px-3 py-1 text-xs rounded-lg hover:bg-green-700 transition-all"
                              >
                                Approve
                              </button>
                              <button
                                onClick={handleReject(item._id)}
                                className="bg-red-600 text-white px-3 py-1 text-xs rounded-lg hover:bg-red-700 transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          )}

                     
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default A_Leave;
