// Import the mongoose library which is an ODM (Object Data Modeling) library for MongoDB and Node.js
import mongoose from 'mongoose';

/**
 * Asynchronous function to establish a connection to the MongoDB database.
 * This is called during server startup in server.js.
 */
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the URI specified in the environment variables (process.env.MONGO_URI).
    // mongoose.connect returns a connection object once the promise resolves.
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    // Log a success message to the console, showing the database host name (e.g., localhost or atlas host)
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, catch the error and log the error message
    console.error(`Error: ${error.message}`);
    
    // Terminate the Node.js process with exit code 1 (failure) to prevent running the server without a DB
    process.exit(1);
  }
};

// Export the connectDB function as the default export of this module
export default connectDB;
