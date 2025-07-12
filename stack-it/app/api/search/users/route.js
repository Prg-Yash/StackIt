import { connectDB } from '@/lib/mongoose';
import User from '@/models/Users';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/options';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    if (!query.trim()) {
      return Response.json({ 
        users: [], 
        total: 0, 
        page, 
        totalPages: 0,
        message: 'Please enter a search query' 
      });
    }

    await connectDB();

    // Search users by username (case-insensitive)
    const searchRegex = new RegExp(query, 'i');
    
    const skip = (page - 1) * limit;
    
    const users = await User.find({
      username: searchRegex,
      _id: { $ne: session.user.id } // Exclude current user
    })
    .select('username name bio createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await User.countDocuments({
      username: searchRegex,
      _id: { $ne: session.user.id }
    });

    const totalPages = Math.ceil(total / limit);

    return Response.json({
      users,
      total,
      page,
      totalPages,
      hasMore: page < totalPages
    });
  } catch (err) {
    console.error('Error searching users:', err);
    return Response.json({ error: 'Failed to search users' }, { status: 500 });
  }
} 