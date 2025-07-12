// /app/api/notifications/[userId]/route.js
import { connectDB } from '@/lib/mongodb';
import Notification from '@/models/Notification';

export async function GET(_, { params }) {
  await connectDB();
  const { userId } = await params;

  try {
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return new Response(JSON.stringify(notifications), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Failed to fetch notifications' }), { status: 500 });
  }
}
