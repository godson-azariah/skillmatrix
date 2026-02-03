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

    // Create user WITHOUT any hooks
    const user = new User({
      registerNumber,
      name,
      dob: new Date(dob),
      batchYear: parseInt(batchYear),
      department,
      password: hashedPassword,
      role: 'student',
      profile: {
        profilePic: '/placeholder.png',
        bio: '',
        interests: []
      }
    });

    // Save without triggering any hooks
    await user.save({ validateBeforeSave: true });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({
      message: 'Registration successful',
      user: userResponse,
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    
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