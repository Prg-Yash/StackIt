import { connectDB } from '@/lib/mongoose';
import User from '@/models/Users';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/options';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await request.json();
    
    if (!token) {
      return Response.json({ error: 'Token required' }, { status: 400 });
    }

    await connectDB();
    
    console.log('Testing token verification for token:', token);
    
    // Find user with the verification token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });
    
    // Also check for any user with this token (regardless of expiration)
    const anyUserWithToken = await User.findOne({ emailVerificationToken: token });
    
    // Get all tokens in the database for comparison
    const allTokens = await User.find({
      emailVerificationToken: { $exists: true, $ne: null }
    }).select('email emailVerificationToken emailVerificationExpires');
    
    return Response.json({
      tokenProvided: token,
      tokenLength: token.length,
      userFound: !!user,
      anyUserWithToken: !!anyUserWithToken,
      currentTime: new Date(),
      allTokensInDatabase: allTokens.map(u => ({
        email: u.email,
        token: u.emailVerificationToken,
        tokenLength: u.emailVerificationToken?.length,
        expires: u.emailVerificationExpires,
        isExpired: u.emailVerificationExpires < new Date()
      })),
      totalTokensInDB: allTokens.length
    });
  } catch (err) {
    console.error('Error in token verification debug:', err);
    return Response.json({ error: 'Debug failed' }, { status: 500 });
  }
} 