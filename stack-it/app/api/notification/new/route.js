import { connectDB } from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req) {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { userId, type, message, link } = await req.json();

  if (!userId || !type || !message || !link) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
  }

  try {
    await Notification.create({
      user: userId,
      type,
      message,
      link,
    });

    return new Response(JSON.stringify({ message: 'Notification created' }), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Failed to create notification' }), { status: 500 });
  }
}