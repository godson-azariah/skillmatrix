const mongoose = require('mongoose');

async function fixAllUsersIdentifiers() {
  try {
    console.log('🔧 Fixing ALL user identifiers...');
    
    await mongoose.connect('mongodb://127.0.0.1:27017/skillmatrix');
    
    const User = mongoose.model('User', new mongoose.Schema({
      registerNumber: String,
      staffId: String,
      name: String,
      role: String,
      batchYear: Number
    }));
    
    // Get ALL users
    const allUsers = await User.find({});
    
    console.log(`Processing ${allUsers.length} users...\n`);
    
    for (const user of allUsers) {
      console.log(`🔧 ${user.role.toUpperCase()}: ${user.name}`);
      
      let updates = {};
      
      // Fix based on role
      if (user.role === 'student') {
        // Students: should have registerNumber, NO staffId
        if (user.staffId && user.staffId !== 'null' && user.staffId !== 'undefined') {
          console.log(`   ❌ Student has staffId: "${user.staffId}"`);
        }
        updates.staffId = null;
        
        // Ensure registerNumber is clean
        if (user.registerNumber === 'undefined' || user.registerNumber === 'null') {
          console.log(`   ❌ Bad registerNumber: "${user.registerNumber}"`);
          updates.registerNumber = null;
        }
        
      } else if (user.role === 'staff') {
        // Staff: should have staffId, NO registerNumber
        if (user.registerNumber && user.registerNumber !== 'null' && user.registerNumber !== 'undefined') {
          console.log(`   ❌ Staff has registerNumber: "${user.registerNumber}"`);
        }
        updates.registerNumber = null;
        
        // Ensure staffId is clean
        if (user.staffId === 'undefined' || user.staffId === 'null') {
          console.log(`   ❌ Bad staffId: "${user.staffId}"`);
          updates.staffId = null;
        }
        
      } else if (user.role === 'admin') {
        // Admin: can have both, but clean up
        if (user.registerNumber === 'undefined' || user.registerNumber === 'null') {
          updates.registerNumber = null;
        }
        if (user.staffId === 'undefined' || user.staffId === 'null') {
          updates.staffId = null;
        }
      }
      
      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        await User.updateOne({ _id: user._id }, { $set: updates });
        console.log(`   ✅ Fixed:`, updates);
      } else {
        console.log(`   ✓ Already correct`);
      }
    }
    
    // Show final state
    console.log('\n📋 FINAL USER LIST:');
    console.log('===================\n');
    
    const finalUsers = await User.find({}).sort({ role: 1, name: 1 });
    
    finalUsers.forEach(user => {
      console.log(`${user.role.toUpperCase()}: ${user.name}`);
      console.log(`   registerNumber: ${JSON.stringify(user.registerNumber)}`);
      console.log(`   staffId: ${JSON.stringify(user.staffId)}`);
      console.log(`   Batch: ${user.batchYear || 'N/A'}`);
      console.log('');
    });
    
    await mongoose.disconnect();
    
    console.log('🎉 All users fixed!');
    console.log('Student profile: http://localhost:3000/profile/951322104012');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixAllUsersIdentifiers();