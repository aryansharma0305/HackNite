import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleLogin = () => {
    // Clear previous errors
    setError('');
    
    // Check if credentials match
    if (adminId === 'admin' && password === 'password') {
      navigate('/admin/dashboard/Complaints'); // Redirect to admin dashboard
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center relative">
        <img
          src="../public/img/Hostel.jpg"
          alt="Hostel"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />

        <header className="text-center space-y-4 relative z-10 px-16 py-12 mt-12">
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500"
            style={{ lineHeight: '1.2', paddingBottom: '0.5rem' }}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            Admin Portal
          </motion.h1>
        </header>

        <main className="mt-1 relative z-10">
          <section className="text-center max-w-xl space-y-6">
            <p className="text-gray-200 text-lg">
              Welcome to the admin portal. Please login to access the hostel management system.
            </p>
          </section>
        </main>

        <footer className="mt-16 relative z-10 w-full max-w-md">
          <div className="bg-gray-800 bg-opacity-70 p-8 rounded-lg shadow-lg">
            {error && (
              <div className="mb-4 p-3 bg-red-500 bg-opacity-30 border border-red-600 rounded-md text-white">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="adminId" className="block text-sm font-medium text-gray-300 mb-1">
                Admin ID
              </label>
              <input
                type="text"
                id="adminId"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter admin ID"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter password"
              />
            </div>
            
            <button 
              onClick={handleLogin} 
              className="w-full px-8 py-3 text-lg font-semibold rounded-lg text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-purple-300 transition duration-300"
            >
              Login
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Admin;