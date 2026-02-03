import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function GET(request, { params }) {
  console.log('🔍 GET /api/users/[id] called');
  
  try {
    await dbConnect();
    
    // IMPORTANT: Await params in Next.js 13+
    const { id } = await params;
    console.log('Looking for user with ID:', id);
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Clean the ID
    const cleanId = id.toString().trim();
    console.log('Cleaned ID:', cleanId);
    
    // SIMPLE search: Just try to find by registerNumber
    const user = await User.findOne({ registerNumber: cleanId }).select('-password');
    
    if (user) {
      console.log('✅ Found user by registerNumber:', user.name);
      return NextResponse.json({ 
        success: true, 
        user: user.toObject()
      });
    }
    
    // If not found by registerNumber, try MongoDB _id
    console.log('Not found by registerNumber, trying by _id...');
    try {
      const userById = await User.findById(cleanId).select('-password');
      if (userById) {
        console.log('✅ Found user by _id:', userById.name);
        return NextResponse.json({ 
          success: true, 
          user: userById.toObject()
        });
      }
    } catch (err) {
      console.log('Not a valid MongoDB ID format');
    }
    
    console.log('❌ User not found with any ID type');
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
    
  } catch (error) {
    console.error('❌ GET user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  console.log('🔄 PUT /api/users/[id] called');
  
  try {
    await dbConnect();
    
    // IMPORTANT: Await params
    const { id } = await params;
    const { userId, role, updates } = await request.json();

    console.log('Updating user:', id, 'Request from user:', userId);

    // Find user by registerNumber (NOT by _id - that was the error!)
    const targetUser = await User.findOne({ registerNumber: id });
    
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isAdmin = role === 'admin';
    const isSelf = targetUser._id.toString() === userId;

    if (!isAdmin && !isSelf) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Prepare update
    const updateObj = {};
    
    if (updates.profile) {
      updateObj.profile = {
        ...targetUser.profile,
        bio: updates.profile.bio || '',
        interests: Array.isArray(updates.profile.interests) 
          ? updates.profile.interests 
          : updates.profile.interests?.split(',').map(i => i.trim()).filter(i => i) || []
      };
    }

    // Update using _id
    const updatedUser = await User.findByIdAndUpdate(
      targetUser._id,  // Use the _id, not the registerNumber
      { $set: updateObj },
      { new: true }
    ).select('-password');

    console.log('✅ User updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Profile updated',
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ PUT user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}