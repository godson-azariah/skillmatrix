// posts/upload/route.js - UPDATED WITH SEMESTER
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  console.log('📤 POST /api/posts/upload called');
  
  try {
    await dbConnect();
    console.log('✅ Database connected');
    
    const formData = await request.formData();
    
    const title = formData.get('title');
    const description = formData.get('description');
    const type = formData.get('type');
    const userId = formData.get('userId');
    const tags = formData.get('tags') || '';
    const techStack = formData.get('techStack') || '';
    const issuedBy = formData.get('issuedBy') || '';
    // 👇 NEW: semester
    const semester = formData.get('semester');
    const file = formData.get('file');
    
    console.log('📝 Upload data received:', { 
      title, type, userId, semester,
      descriptionLength: description?.length,
      hasFile: !!file, fileName: file?.name, fileSize: file?.size 
    });

    // Validate required fields
    if (!title || !description || !type || !userId || !file) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Missing required fields. Please fill all fields and select a file.' },
        { status: 400 }
      );
    }

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
        { success: false, error: 'Invalid file type. Only JPEG, PNG, GIF, WebP images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      console.log('❌ File too large:', file.size, 'bytes');
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    console.log('📁 Saving file to disk...');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const fileExt = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);
    
    const fileUrl = `/uploads/${fileName}`;
    
    const media = [{
      url: fileUrl,
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
      updatedAt: new Date()
    };

    // 👇 Add semester if valid
    if (semester && !isNaN(parseInt(semester))) {
      const sem = parseInt(semester);
      if (sem >= 1 && sem <= 8) {
        postData.semester = sem;
      }
    }

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
    const post = new Post(postData);
    await post.save();
    
    console.log('✅ Post created with ID:', post._id);
    
    return NextResponse.json({
      success: true,
      message: 'Upload successful',
      post: {
        _id: post._id,
        title: post.title,
        description: post.description,
        type: post.type,
        semester: post.semester, // 👈 include in response
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