import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import apiRouter from './routes/apiRouter.js';
import sendMail from './service/email.js';
import Menu from './model/menu_model.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const mongoURI = process.env.MONGODB_URI;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect MongoDB
mongoose.connect(mongoURI, {
  tls: true,
  tlsAllowInvalidCertificates: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error.message));

// Middlewares
app.use(cors({
  origin: 'http://localhost', // change to your frontend domain in prod
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// API Routes
app.use('/api', apiRouter);

// ✅ Serve frontend build
const distPath = path.join(__dirname, './dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
