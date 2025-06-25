import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';   
import userRoutes from './routes/user.routes.js';
import connectDB from './db/connectMongo.js';
import cookieParser from 'cookie-parser';
import {v2 as cloudinary}  from 'cloudinary';
const PORT = process.env.PORT || 8000;

const app = express();

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET

})

app.use(cookieParser()); // Middleware to parse cookies from requests
app.use(express.json()); app.use(express.urlencoded({ extended: true }));
// Middleware to parse JSON and URL-encoded data


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); 


app.get('/',(req,res)=>{
  res.send('Welcome to the backend server');
})




async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to database', err);
  }
}

startServer();