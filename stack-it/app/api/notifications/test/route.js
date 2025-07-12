import { connectDB } from '@/lib/mongoose';
import Notification from '@/models/Notifications';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/options';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Create sample notifications
    const sampleNotifications = [
      {
        user: session.user.id,
        type: 'new_answer',
        message: 'John Doe answered your question about React hooks',
        link: '/questions/123',
        isRead: false
      },
      {
        user: session.user.id,
        type: 'question_upvote',
        message: 'Your question about Next.js got 5 upvotes',
        link: '/questions/456',
        isRead: false
      },
      {
        user: session.user.id,
        type: 'answer_upvote',
        message: 'Your answer about MongoDB received 3 upvotes',
        link: '/questions/789',
        isRead: true
      },
      {
        user: session.user.id,
        type: 'new_answer',
        message: 'Sarah Smith provided a detailed answer to your question',
        link: '/questions/101',
        isRead: false
      },
      {
        user: session.user.id,
        type: 'question_upvote',
        message: 'Your question about TypeScript is trending',
        link: '/questions/202',
        isRead: true
      }
    ];

    const createdNotifications = await Notification.insertMany(sampleNotifications);

    return Response.json({ 
      success: true, 
      message: 'Test notifications created',
      count: createdNotifications.length
    });
  } catch (err) {
    console.error('Error creating test notifications:', err);
    return Response.json({ error: 'Failed to create test notifications' }, { status: 500 });
  }
} 