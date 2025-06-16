import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';   
import connectDB from './config/db.js';

const app = express();

dotenv.config();

app.use('/api/auth', authRoutes);




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