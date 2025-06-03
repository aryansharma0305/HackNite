import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Components/NavBar';
import SideBar from './Components/SideBar';

const LeavePortal = () => {
  const [leaveType, setLeaveType] = useState('Medical');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveList, setLeaveList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [leaveId, setLeaveId] = useState(null);

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        const res = await axios.get('/api/student/leave/show', { withCredentials: true });
        setLeaveList(res.data);
      } catch (err) {
        console.error('Error fetching leave requests:', err);
      }
    };
    fetchLeaveData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || !startDate || !endDate) {
      alert('Please fill in all fields.');
      return;
    }

    setIsRequestingOtp(true);
    try {
      const res = await axios.post(
        '/api/student/leave/new',
        { leaveType, reason, startDate, endDate },
        { withCredentials: true }
      );
      setLeaveId(res.data.leaveId);
      setShowOtpModal(true);
    } catch (err) {
      console.error('OTP request failed:', err);
      alert('Failed to request OTP.');
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp.trim()) {
      alert('Please enter the OTP.');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(
        '/api/student/leave/verify',
        { otp, leaveId },
        { withCredentials: true }
      );
      const newLeave = {
        id: Date.now(),
        leaveType,
        reason,
        startDate,
        endDate,
        status: 'Pending',
      };
      setLeaveList([...leaveList, newLeave]);
      setReason('');
      setStartDate('');
      setEndDate('');
      setOtp('');
      setShowOtpModal(false);
    } catch (err) {
      console.error('OTP verification failed:', err);
      alert('Invalid OTP or verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => async () => {
    try {
      const res = await axios.post(`/api/student/leave/delete`, { id });
      if (res.status === 200) {
        setLeaveList(leaveList.filter((item) => item._id !== id));
      } else {
        alert('Failed to delete leave request.');
      }
    } catch (err) {
      console.error('Error deleting leave request:', err);
      alert('Failed to delete leave request.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      <SideBar />
      <div className="pt-20 sm:pl-64 min-h-screen">
        <div className="p-6">
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">
              Leave Application Portal
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Leave Form */}
              <div
                className="
                  p-[1px]
                  rounded-2xl        /* match inner */
                  overflow-hidden     /* clip overflow */
                  bg-gradient-to-r from-purple-500 to-pink-500
                "
              >
                <div className="bg-gray-800 rounded-2xl shadow-xl p-6 h-[600px] overflow-hidden flex flex-col">
                  <h2 className="text-2xl font-semibold mb-4">Apply for Leave</h2>
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pr-2 flex-1"
                  >
                    <div>
                      <label className="block mb-1">Leave Type</label>
                      <select
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg"
                      >
                        <option value="Medical">Medical</option>
                        <option value="Personal">Personal</option>
                        <option value="Family Emergency">Family Emergency</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1">Start Date</label>
                      <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">End Date</label>
                      <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Reason</label>
                      <textarea
                        rows="4"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      disabled={isRequestingOtp}
                      className="w-full bg-blue-600 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isRequestingOtp ? 'Requesting OTP...' : 'Apply for Leave'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Leave List */}
              <div
                className="
                  p-[1px]
                  rounded-2xl        /* match inner */
                  overflow-hidden     /* clip overflow */
                  bg-gradient-to-r from-amber-500 to-red-600
                "
              >
                <div className="bg-gray-800 rounded-2xl shadow-xl p-6 h-[600px] overflow-hidden flex flex-col">
                  <h2 className="text-2xl font-semibold mb-4">Your Leave Requests</h2>
                  {leaveList.length === 0 ? (
                    <p className="text-gray-400 italic text-center">No leave applications yet.</p>
                  ) : (
                    <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pr-2 flex-1 space-y-4">
                      {leaveList.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:bg-gray-600"
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
                            <button
                              onClick={handleDelete(item._id)}
                              className="bg-red-600 text-white px-3 py-1 text-xs rounded-lg hover:bg-red-700 transition-all"
                            >
                              Delete Request
                            </button>
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

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-semibold text-center mb-4">Enter OTP</h2>
            <p className="text-gray-300 text-center mb-4">
              Please enter the OTP sent to your parent's email.
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 mb-4 bg-gray-700 border border-gray-600 rounded-lg"
              placeholder="Enter OTP"
            />
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setOtp('');
                  setShowOtpModal(false);
                }}
                className="bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleOtpSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit OTP'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavePortal;
