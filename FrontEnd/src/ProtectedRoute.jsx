// ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await axios.post("/api/verify", {}, { withCredentials: true });
        if (res.data.message === "cookie verified") {
          setVerified(true);
        } else {
          navigate("/");
        }
      } catch (err) {
        navigate("/");
      } finally {
        setChecking(false);
      }
    };
    verifyUser();
  }, []);

  if (checking) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900">
        <div className="relative flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          <span className="mt-4 text-white text-sm tracking-wide">Verifying user...</span>
        </div>
      </div>
    );
  }
  
  

  return verified ? children : null;
};

export default ProtectedRoute;
