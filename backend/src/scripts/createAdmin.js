const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const connectDB = require('../config/db');
const User = require('../models/User');

async function createAdmin() {
  console.log('Connecting to database...');
  await connectDB();
  
  const email = 'admin@example.com';
  const password = 'adminpassword123';
  
  console.log(`Checking if user ${email} already exists...`);
  await User.deleteOne({ email });
  
  console.log(`Creating admin user: ${email}...`);
  // Directly create the admin user with role 'admin'
  const admin = new User({
    name: 'Admin User',
    email: email,
    password: password,
    role: 'admin'
  });
  
  await admin.save();
  
  console.log('Admin user created successfully!');
  console.log('----------------------------');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log('Role: admin');
  console.log('----------------------------');
  
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
  process.exit(0);
}

createAdmin().catch(async (err) => {
  console.error('Failed to create admin user:', err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
