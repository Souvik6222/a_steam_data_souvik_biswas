import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './src/config/db.js';
import userRoutes from './src/routes/userRoutes.js';
import { notFound, errorHandler } from './src/middlewares/errorMiddleware.js';

// Load environment variables from .env file
dotenv.config();

// Establish database connection
connectDB();

const app = express();

// Set up standard middlewares
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'healthy', message: 'API is up and running successfully.' });
});

// Bind route handlers
app.use('/api/users', userRoutes);

// Bind custom fallback and global error handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
