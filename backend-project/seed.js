require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    // Clear out existing users just in case schema mismatch causes issues
    await User.deleteMany({});

    await User.create({
      username: 'admin',
      email: 'admin@hotelpro.rw',
      password: 'password123',
      role: 'Admin'
    });
    console.log('Admin User created successfully.');
  } catch(e) {
    console.error(e);
  }
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
