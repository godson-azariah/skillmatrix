import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { 
      registerNumber, 
      name, 
      dob, 
      batchYear, 
      department, 
      password 
    } = await request.json();

    // Basic validation
    if (!registerNumber || !name || !dob || !batchYear || !department || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if register number already exists
    const existingUser = await User.findOne({ registerNumber });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Register number already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user - explicitly set staffId to undefined for students
    const userData = {
      registerNumber,
      name,
      dob: new Date(dob),
      batchYear: parseInt(batchYear),
      department,
      password: hashedPassword,
      role: 'student',
      staffId: undefined, // Explicitly set to undefined
      profile: {
        profilePic: '/placeholder.png',
        bio: '',
        interests: []
      }
    };

    console.log('💾 Creating user with data:', userData);

    const user = new User(userData);
    
    // Try saving WITHOUT any hooks
    await user.save({ validateBeforeSave: true });

    console.log('✅ User created:', user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({
      message: 'Registration successful',
      user: userResponse,
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('Error stack:', error.stack);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Register number already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Registration failed: ' + error.message },
      { status: 500 }
    );
  }
}