import { connectDB } from '@/lib/mongoose';
import User from '@/models/Users';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Get current user's verification info
    const currentUser = await User.findById(session.user.id).select('email emailVerified emailVerificationToken emailVerificationExpires');
    
    // Get all users with verification tokens (for debugging)
    const usersWithTokens = await User.find({
      emailVerificationToken: { $exists: true, $ne: null }
    }).select('email emailVerificationToken emailVerificationExpires createdAt');
    
    return Response.json({
      currentUser,
      usersWithTokens,
      currentTime: new Date(),
      totalUsersWithTokens: usersWithTokens.length
    });
  } catch (err) {
    console.error('Error in debug route:', err);
    return Response.json({ error: 'Debug failed' }, { status: 500 });
  }
} 