import { connectDB } from '@/lib/mongoose';
import Notification from '@/models/Notifications';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/options';

export async function PATCH() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const result = await Notification.updateMany(
      { user: session.user.id, isRead: false },
      { isRead: true }
    );

    return Response.json({ 
      success: true, 
      updatedCount: result.modifiedCount 
    });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    return Response.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
  }
} 