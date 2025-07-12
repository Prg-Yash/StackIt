import { connectDB } from '@/lib/mongoose';
import User from '@/models/Users';
import { getServerSession } from 'next-auth';
import { authOptions } from '../options';
import { sendVerificationEmail, generateVerificationToken } from '@/lib/email';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return Response.json({ error: 'Email is already verified' }, { status: 400 });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Update user with new verification token
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = expiresAt;
    await user.save();

    // Fetch the user again to confirm
    const updatedUser = await User.findById(user._id).select('email emailVerificationToken emailVerificationExpires');
    console.log('Token saved to database for user:', updatedUser);

    // Send verification email
    await sendVerificationEmail(user.email, user.name, verificationToken);

    return Response.json({ 
      message: 'Verification email sent successfully',
      expiresAt: expiresAt,
      debugUser: updatedUser
    });
  } catch (err) {
    console.error('Error sending verification email:', err);
    return Response.json({ error: 'Failed to send verification email', details: err.message }, { status: 500 });
  }
} 