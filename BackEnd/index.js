import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import apiRouter from './routes/apiRouter.js';
import sendMail from './service/email.js';

import Menu from './model/menu_model.js';

dotenv.config();




const PORT = process.env.PORT || 5000;
const app = express();

const mongoURI = process.env.MONGODB_URI;







mongoose.connect(mongoURI, {
    tls: true, 
    tlsAllowInvalidCertificates: true, 
  }).then(async() => {
    console.log('Connected to MongoDB');
    




  }).catch((error) => {
    console.error('MongoDB connection error:', error.message);
  });
  


//Setting up some middleware
app.use(cors({
    origin: 'http://localhost:5174',
    credentials: true,
}));



app.use(express.json());    
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cookieParser());




//Setting up the routes
app.use('/api', apiRouter);














app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

