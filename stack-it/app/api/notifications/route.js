import { connectDB } from '@/lib/mongoose';
import Notification from '@/models/Notifications';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/options';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const filter = searchParams.get('filter') || 'all';
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Build query based on filters
    let query = { user: session.user.id };
    
    if (filter === 'unread') {
      query.isRead = false;
    } else if (filter === 'read') {
      query.isRead = true;
    }
    
    if (search) {
      query.message = { $regex: search, $options: 'i' };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const hasMore = skip + limit < total;

    return Response.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        hasMore,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return Response.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { notificationId, isRead } = await request.json();

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: session.user.id },
      { isRead },
      { new: true }
    );

    if (!notification) {
      return Response.json({ error: 'Notification not found' }, { status: 404 });
    }

    return Response.json(notification);
  } catch (err) {
    console.error('Error updating notification:', err);
    return Response.json({ error: 'Failed to update notification' }, { status: 500 });
  }
} 