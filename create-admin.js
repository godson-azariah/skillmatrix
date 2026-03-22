const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdmin() {
await mongoose.connect('mongodb://127.0.0.1:27017/skillmatrix');

  const User = mongoose.model('User', new mongoose.Schema({
    registerNumber: String,
    staffId: String,
    name: String,
    role: String,
    department: String,
    password: String,
    profile: Object,
    createdAt: { type: Date, default: Date.now }
  }));

  const hashedPassword = await bcrypt.hash('adminadmin', 10);

  const existingAdmin = await User.findOne({ role: 'admin' });

  if (existingAdmin) {
    console.log('Admin already exists. Login with:');
    console.log('ID: ADMIN003');
    console.log('Password: adminadmin');
  } else {
    await User.create({
      registerNumber: 'ADMIN003',
      staffId: 'ADMIN003',
      name: 'System Administrator',
      role: 'admin',
      department: 'Administration',
      password: hashedPassword,
      profile: {
        profilePic: '/placeholder.png',
        bio: 'System Administrator',
        interests: ['Management', 'Administration']
      }
    });
    console.log('Admin created!');
    console.log('ID: ADMIN003');
    console.log('Password: adminadmin');
  }

  await mongoose.disconnect();
}

createAdmin().catch(console.error);