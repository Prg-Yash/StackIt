import { connectDB } from '@/lib/mongoose';
import User from '@/models/Users';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    console.log('Verification attempt with token:', token);

    if (!token) {
      console.log('No token provided');
      return NextResponse.redirect(new URL('/profile?error=invalid-token', request.url));
    }

    await connectDB();
    
    // Find user with the verification token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });
    
    console.log('User found with token:', user ? 'Yes' : 'No');
    if (user) {
      console.log('User email:', user.email);
      console.log('Token expires at:', user.emailVerificationExpires);
      console.log('Current time:', new Date());
    }
    
    if (!user) {
      // Let's check if there's a user with this token but expired
      const expiredUser = await User.findOne({ emailVerificationToken: token });
      if (expiredUser) {
        console.log('Token found but expired. Expires at:', expiredUser.emailVerificationExpires);
        return NextResponse.redirect(new URL('/profile?error=invalid-or-expired-token', request.url));
      }
      
      console.log('No user found with this token');
      return NextResponse.redirect(new URL('/profile?error=invalid-or-expired-token', request.url));
    }

    // Mark email as verified
    user.emailVerified = new Date();
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    console.log('Email verified successfully for:', user.email);

    // Redirect to profile page with success message
    return NextResponse.redirect(new URL('/profile?success=email-verified', request.url));
  } catch (err) {
    console.error('Error verifying email:', err);
    return NextResponse.redirect(new URL('/profile?error=verification-failed', request.url));
  }
} 