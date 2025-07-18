import { connectDB } from "@/lib/mongoose";
import Question from "@/models/Questions";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../auth/options";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { questionId, answerId } = params;
    const question = await Question.findById(questionId);

    if (!question) {
      return new Response(JSON.stringify({ error: "Question not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const answer = question.answers.id(answerId);
    if (!answer) {
      return new Response(JSON.stringify({ error: "Answer not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = session.user.id;
    const hasUpvoted = answer.upvotes?.includes(userId);
    const hasDownvoted = answer.downvotes?.includes(userId);

    // Initialize arrays if they don't exist
    if (!answer.upvotes) answer.upvotes = [];
    if (!answer.downvotes) answer.downvotes = [];

    // Handle upvote
    if (hasUpvoted) {
      // Remove upvote
      answer.upvotes = answer.upvotes.filter((id) => id.toString() !== userId);
    } else {
      // Add upvote and remove downvote if exists
      answer.upvotes.push(userId);
      if (hasDownvoted) {
        answer.downvotes = answer.downvotes.filter(
          (id) => id.toString() !== userId
        );
      }
    }

    await question.save();

    return new Response(
      JSON.stringify({
        message: hasUpvoted ? "Vote removed" : "Vote added",
        upvotes: answer.upvotes.length,
        downvotes: answer.downvotes.length,
        hasUpvoted: !hasUpvoted,
        hasDownvoted: false,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error voting answer:", error);
    return new Response(JSON.stringify({ error: "Failed to process vote" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
