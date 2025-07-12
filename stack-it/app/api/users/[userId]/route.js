import { connectDB } from '@/lib/mongoose';
import User from '@/models/Users';
import Question from '@/models/Questions';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/options';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = params;

    await connectDB();

    // Get user details
    const user = await User.findById(userId).select('username name email bio createdAt');
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's questions
    const questions = await Question.find({ author: userId })
      .select('title content createdAt views answers')
      .sort({ createdAt: -1 })
      .populate('author', 'username name');

    return Response.json({
      user,
      questions,
      questionCount: questions.length
    });
  } catch (err) {
    console.error('Error fetching user details:', err);
    return Response.json({ error: 'Failed to fetch user details' }, { status: 500 });
  }
} 