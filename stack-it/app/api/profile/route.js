import { connectDB } from '@/lib/mongoose';
import User from '@/models/Users';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const user = await User.findById(session.user.id).select('-password -emailVerificationToken -emailVerificationExpires');
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return Response.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { name, bio, image } = await request.json();

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { name, bio, image },
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -emailVerificationExpires');

    if (!updatedUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json(updatedUser);
  } catch (err) {
    console.error('Error updating profile:', err);
    return Response.json({ error: 'Failed to update profile' }, { status: 500 });
  }
} 