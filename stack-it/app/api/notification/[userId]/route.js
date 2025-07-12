// /app/api/notifications/[userId]/route.js
import { connectDB } from '@/lib/mongoose';
import Notification from '@/models/Notifications';

export async function GET(_, { params }) {
  try {
    await connectDB();
    const { userId } = params;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return Response.json(notifications);
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
