// /app/api/questions/[questionId]/route.js
import { connectDB } from '@/lib/mongodb';
import Question from '@/models/Question';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(req, { params }) {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { questionId } = params;
  const { title, description, tags } = await req.json();

  if (!title || !description) {
    return new Response(JSON.stringify({ error: 'Title and description are required' }), { status: 400 });
  }

  try {
    const question = await Question.findById(questionId);

    if (!question) {
      return new Response(JSON.stringify({ error: 'Question not found' }), { status: 404 });
    }

    if (question.author.toString() !== session.user._id && question.author.toString() !== session.user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden: Not your question' }), { status: 403 });
    }

    question.title = title;
    question.description = description;
    question.tags = tags || [];
    question.slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    await question.save();

    return new Response(JSON.stringify({ message: 'Question updated successfully', question }), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { questionId } = params;

  try {
    const question = await Question.findById(questionId);

    if (!question) {
      return new Response(JSON.stringify({ error: 'Question not found' }), { status: 404 });
    }

    if (question.author.toString() !== session.user._id && question.author.toString() !== session.user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden: Not your question' }), { status: 403 });
    }

    // Embedded answers will be deleted with the question — nothing extra needed
    await question.deleteOne();

    return new Response(JSON.stringify({ message: 'Question deleted successfully' }), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
