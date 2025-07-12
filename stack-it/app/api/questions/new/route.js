// /app/api/question/new/route.js
import { connectDB } from '@/lib/mongodb';
import Question from '@/models/Question';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req) {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const body = await req.json();
  const { title, description, tags } = body;

  if (!title || !description) {
    return new Response(JSON.stringify({ error: 'Title and description are required' }), { status: 400 });
  }

  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();

  try {
    const question = await Question.create({
      title,
      description,
      slug,
      tags,
      author: session.user._id || session.user.id,
    });

    return new Response(JSON.stringify({ message: 'Question posted successfully', question }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to post question' }), {
      status: 500,
    });
  }
}
