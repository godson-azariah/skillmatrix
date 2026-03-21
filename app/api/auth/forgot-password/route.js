import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import OTP from '@/lib/models/OTP';
import { sendOTPEmail } from '@/lib/mailer';

export async function POST(request) {
  try {
    await dbConnect();
    const { identifier, email, role } = await request.json();

    if (!identifier || !email || !role) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by ID FIRST — identifier is mandatory
    let user = null;
    if (role === 'student') {
      user = await User.findOne({ registerNumber: identifier, role: 'student' });
    } else if (role === 'staff') {
      user = await User.findOne({ staffId: identifier, role: 'staff' });
    }

    if (!user) {
      return NextResponse.json({ success: false, error: 'No account found with this ID' }, { status: 404 });
    }

    if (!user.email || user.email.trim() === '') {
      return NextResponse.json({ success: false, error: 'No email registered for this account. Please contact admin.' }, { status: 400 });
    }

    if (user.email.toLowerCase().trim() !== normalizedEmail) {
      return NextResponse.json({ success: false, error: 'Email does not match our records' }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.deleteMany({ identifier });
    await OTP.create({ identifier, email: normalizedEmail, otp, expiresAt });

    await sendOTPEmail(normalizedEmail, otp);

    console.log('✅ OTP sent to registered email:', normalizedEmail);

    return NextResponse.json({ success: true, message: 'OTP sent to your registered email address.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: false, error: 'Unable to process request. Please try again later.' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}