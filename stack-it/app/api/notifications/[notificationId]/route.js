import { connectDB } from '@/lib/mongoose';
import Notification from '@/models/Notifications';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/options';

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { notificationId } = params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: session.user.id
    });

    if (!notification) {
      return Response.json({ error: 'Notification not found' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('Error deleting notification:', err);
    return Response.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
} 