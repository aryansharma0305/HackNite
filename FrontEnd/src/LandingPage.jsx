import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';


import { signInWithPopup } from 'firebase/auth'
import { auth } from './firebase'
import { provider } from './firebase'
import axios from 'axios'

const LandingPage = () => {

  const navigate = useNavigate();
   

  const handleLogin = async() => {
  
        // sign in with popup
        
          signInWithPopup(auth, provider).then((loginResponse) => {
            
            const userDetails = {
                email: loginResponse.user.email,
                name: loginResponse.user.displayName,
                token: loginResponse.user.accessToken
            }
  
            // cheking if user is from @iiitb.ac.in or not
            if (userDetails.email.endsWith('@iiitb.ac.in')) {
              // send user details 
              axios.post('/api/login', userDetails)
                .then((response) => {
                  if (response.data.route === "/signup") {
                    navigate("/signup", { state: { userDetails } });
                  }
                  else if(response.data.route === "/dashboard"){
                  

                    localStorage.setItem('email', userDetails.email);
                    localStorage.setItem('name', userDetails.name);
                    localStorage.setItem('avatarURL', response.data.avatarURL);

                    console.log(response.data)
                    navigate("/dashboard");
                  }
                })
                .catch((error) => {
                  console.log(error)
                  alert("Login Failed")
                });
            }
            else{
              alert("Please use your @iiitb.ac.in email to login")
            }
  
        })
        .catch((error) => {
          console.log(error)
        });
  
      }

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
            className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text  bg-gradient-to-r from-purple-500 to-pink-500"
            style={{ lineHeight: '1.2', paddingBottom: '0.5rem' }}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            Hostel Management System
          </motion.h1>
        </header>

        <main className="mt-1 relative z-10">
          <section className="text-center max-w-xl space-y-6">
            <p className="text-gray-200 text-lg">
              Simplify the management of your hostel with ease.<br />
              Our system allows you to manage hostel rooms, reservations, and tenants, all from one place.
            </p>
          </section>
        </main>

        <footer className="mt-16 relative z-10">

          <button onClick={handleLogin} class="relative inline-flex items-center justify-center px-8 py-3 mb-2 border-2 border-white text-lg font-semibold rounded-lg text-white bg-transparent hover:bg-black hover:text-black-900 focus:outline-none focus:ring-4 focus:ring-black-200 dark:text-white dark:border-gray-500 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 transition duration-300 animate-slide-up">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
              alt="Microsoft Logo"
              className="h-5 w-5 mr-2"
            />
            Sign in with Microsoft
          </button>

        {/* <button onClick={handleLogin} class="relative inline-flex items-center justify-center px-8 py-3 mb-2 border-2 border-white text-lg font-semibold rounded-lg text-white bg-transparent hover:bg-white hover:text-black-900 focus:outline-none focus:ring-4 focus:ring-black-200 dark:text-white dark:border-gray-500 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 transition duration-300">
          Login
        </button> */}

        </footer>
      </div>

    </div>
  );
};

export default LandingPage;
