// posts/upload/route.js - UPDATED TO SAVE FILES TO DISK
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request) {
  console.log('📤 POST /api/posts/upload called');
  
  try {
    // Connect to database
    await dbConnect();
    console.log('✅ Database connected');
    
    // Parse form data
    const formData = await request.formData();
    
    // Get form fields
    const title = formData.get('title');
    const description = formData.get('description');
    const type = formData.get('type'); // 'certificate' or 'project'
    const userId = formData.get('userId');
    const tags = formData.get('tags') || '';
    const techStack = formData.get('techStack') || '';
    const issuedBy = formData.get('issuedBy') || '';
    const file = formData.get('file');
    
    console.log('📝 Upload data received:', { 
      title, 
      type, 
      userId,
      descriptionLength: description?.length,
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size 
    });

    // Validate required fields
    if (!title || !description || !type || !userId || !file) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields. Please fill all fields and select a file.' 
        },
        { status: 400 }
      );
    }

    // Check if user exists
    console.log('👤 Checking user:', userId);
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found:', userId);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    console.log('✅ User found:', user.name);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Invalid file type:', file.type);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid file type. Only JPEG, PNG, GIF, WebP images are allowed.' 
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB now)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.log('❌ File too large:', file.size, 'bytes');
      return NextResponse.json(
        { 
          success: false, 
          error: 'File too large. Maximum size is 5MB.' 
        },
        { status: 400 }
      );
    }

    console.log('📁 Saving file to disk...');
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Generate unique filename
    const fileExt = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Convert file to buffer and save to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);
    
    // Create relative URL for the file
    const fileUrl = `/uploads/${fileName}`;
    
    // Prepare media object (store URL instead of Base64)
    const media = [{
      url: fileUrl, // Changed from base64Data to fileUrl
      type: 'image',
      filename: file.name,
      size: file.size,
      mimeType: file.type
    }];

    // Prepare post data
    const postData = {
      owner: userId,
      type,
      title,
      description,
      media,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()  // Explicitly set it here
    };

    // Add type-specific fields
    if (type === 'certificate') {
      postData.issuedBy = issuedBy || 'Self';
      if (tags) {
        postData.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
    } else if (type === 'project') {
      if (techStack) {
        postData.techStack = techStack.split(',').map(tech => tech.trim()).filter(tech => tech);
      }
      if (tags) {
        postData.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
    }

    console.log('💾 Saving post to database...');
    
    // Create and save post
    const post = new Post(postData);
    await post.save();
    
    console.log('✅ Post created with ID:', post._id);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Upload successful',
      post: {
        _id: post._id,
        title: post.title,
        description: post.description,
        type: post.type,
        media: post.media,
        issuedBy: post.issuedBy,
        tags: post.tags || [],
        techStack: post.techStack || [],
        createdAt: post.createdAt,
        owner: {
          _id: user._id,
          name: user.name,
          registerNumber: user.registerNumber,
          profile: user.profile
        }
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Upload failed',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}