import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Label, TextInput, Button, Alert, Select, Datepicker } from 'flowbite-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Signup = () => {

  const navigate = useNavigate();
  const location = useLocation();  
  const [phone, setPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState(null); // Changed from string to Date object
  const [batch, setBatch] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const userDetails = location.state?.userDetails; // Access the state passed from the previous page
    console.log(userDetails); 
    if (!userDetails) {
      navigate('/'); // Redirect to the landing page
    }

  }, [location, navigate]);

  const handleSubmit = () => {

    //print everything in console
    console.log(phone , parentEmail , parentPhone , dob , roomNumber , batch, gender);

    if (!phone || !parentEmail || !parentPhone || !roomNumber || !gender || !dob || !batch) {
      setError('Please fill in all fields.');
      return;
    }
    if(phone.length !== 10){
      setError('Phone number must be 10 digits long.');
      return;
    }
    if(parentPhone.length !== 10){
      setError('Parent phone number must be 10 digits long.');  
      return;
    }
    if(parentEmail.length < 5 || !parentEmail.includes('@')){
      setError('Please enter a valid parent email address.');
      return;
    }
    if(roomNumber.length < 3){
      setError('Room number must be at least 3 characters long.');
      return;
    }
    if(batch.length < 5){
      setError('Invalid Batch format.');
      return;
    }

    setError(null); // Clear any previous error
    
    

    axios.post('/api/signup', {
      email: location.state.userDetails.email,
      name: location.state.userDetails.name,
      token: location.state.userDetails.token,
      phone: phone,
      parentEmail: parentEmail,
      parentPhone: parentPhone,
      roomNumber: roomNumber,
      batch: batch,
      gender:gender,
      dob:dob,
    })
      .then((response) => {
        console.log(response.data);
        if (response.data.message === "user already in database") {
          navigate('/dashboard');
        } else if (response.data.message === "user created") {
          navigate('/dashboard');
        } else {
          alert("Something went wrong. Please try again.");
        }
      })
      .catch((error) => {
        console.error(error);
        alert("An error occurred. Please try again.");
      });
    
    
    return

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-visible text-white">
      <img
        src="../public/img/Hostel.jpg"
        alt="Hostel"
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />

      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 0.88 }}
        transition={{ duration: 0.7 }}
        className="z-10 w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg p-10"
      >
        <h2 className="text-3xl font-bold text-center mb-1 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Complete Signup
        </h2>
        <p className="text-center text-gray-300 mb-6">Enter your details to proceed</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="mb-1 block text-sm font-medium text-white">Phone Number</Label>
            <TextInput type="tel"  value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>

          <div>
            <Label className="mb-1 block text-sm font-medium text-white">Date of Birth</Label>
            <Datepicker
              value={dob}
              onChange={(date) => {
                console.log("Selected Date: ", date);
                setDob(date);
              }}
              maxDate={new Date()}
              showClearButton
              className="w-full z-[999]"
            />
          </div>

          <div>
            <Label className="mb-1 block text-sm font-medium text-white">Parent's Email</Label>
            <TextInput type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} required />
          </div>

          <div>
            <Label className="mb-1 block text-sm font-medium text-white">Parent's Phone</Label>
            <TextInput type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} required />
          </div>

          <div>
            <Label className="mb-1 block text-sm font-medium text-white">Room Number</Label>
            <TextInput type="text" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} required />
          </div>

          <div>
            <Label className="mb-1 block text-sm font-medium text-white">Gender</Label>
            <Select value={gender} onChange={(e) => setGender(e.target.value)} required>
              <option value="" disabled>Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
          </div>

          <div>
            <Label className="mb-1 block text-sm font-medium text-white">Batch</Label>
            <TextInput type="text" placeholder="e.g. BT24-CSE , IMT23-ECE" value={batch} onChange={(e) => setBatch(e.target.value)} required />
          </div>
        </div>

        {error && (
          <Alert color="failure" className="mt-6">
            {error}
          </Alert>
        )}

        <Button onClick={handleSubmit} className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition duration-300">
          Finish Signup
        </Button>
      </motion.div>
    </div>
  );
};

export default Signup;
