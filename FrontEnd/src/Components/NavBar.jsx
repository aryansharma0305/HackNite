import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarMenuOpen, setIsSidebarMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const navigate = useNavigate();

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleSidebarMenu = () => setIsSidebarMenuOpen(!isSidebarMenuOpen);

  const fetchAllUsers = async () => {
    try {
      const res = await fetch('/api/users', { credentials: 'include' });
      const data = await res.json();
      setAllUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length === 0) {
      setFilteredUsers([]);
      return;
    }

    if (allUsers.length === 0) fetchAllUsers();

    const filtered = allUsers.filter((user) =>
      user.name.toLowerCase().includes(value.toLowerCase()) ||
      user.email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
    setSearchTerm('');
    setFilteredUsers([]);
    setIsSearchActive(false);
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 w-64 h-full bg-gray-800 text-white z-40 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <span className="text-lg font-semibold">Menu</span>
          <button onClick={toggleSidebar}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <button onClick={toggleSidebarMenu} className="w-full py-2 px-4 text-white hover:bg-gray-700 rounded-lg">
            Sidebar Menu
          </button>
          {isSidebarMenuOpen && (
            <ul className="space-y-2 mt-4">
              <li>
                <a href="/dashboard/Profile" className="block py-2 px-4 hover:bg-gray-700 rounded-lg">Profile</a>
              </li>
              <li>
                <a href="#" onClick={onLogout} className="block py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg">Log out</a>
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="fixed top-0 z-50 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-md">
        <div className="flex justify-between items-center px-4 py-3 lg:px-6">
          {/* Left - Logo and Sidebar Toggle */}
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="p-2 text-gray-500 sm:hidden hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <a href="" className="flex items-center ms-3 md:me-24">
                <svg
                  className="w-8 h-8 mr-2 text-blue-600 dark:text-blue-400 transition-transform duration-200 hover:scale-105"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
                  Hostel Management System
                </span>
              </a>
          </div>

          {/* Right - Search and Avatar */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative hidden sm:block">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchActive(true)}
                onBlur={() => setTimeout(() => setIsSearchActive(false), 200)}
                placeholder="Search users..."
                className="w-60 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
              />
              {isSearchActive && filteredUsers.length > 0 && (
                <ul className="absolute left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <li
                      key={user._id}
                      onClick={() => handleUserClick(user._id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 cursor-pointer"
                    >
                      <img
                        src={user.avatarURL || '../public/img/default-avatar.png'}
                        alt="avatar"
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm dark:text-white">{user.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button onClick={toggleDropdown} className="flex text-sm rounded-full focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-600">
                <img
                  className="w-9 h-9 rounded-full border-2 border-blue-500 dark:border-blue-400 object-cover"
                  src={localStorage.getItem('avatarURL') || '/img/default-avatar.png'}
                  alt="user"
                />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white text-white dark:bg-gray-700 rounded-xl shadow-xl z-50">
                  <ul className="py-2">
                    <li>
                      <a href="/dashboard/Profile" className="block px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-gray-600">Profile</a>
                    </li>
                    <li>
                      <a href="/admin" className="block px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-gray-600">Admin</a>
                    </li>
                    <li>
                      <a
                        href="/"
                        onClick={async () => {
                          const response = await fetch('/api/logout', {
                            method: 'POST',
                            credentials: 'include',
                          });
                          if (response.ok) navigate('/');
                        }}
                        className="block px-4 py-2 mt-1 text-sm text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg mx-2"
                      >
                        Log out
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;