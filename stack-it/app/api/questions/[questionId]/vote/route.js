import { connectDB } from "@/lib/mongoose";
import Question from "@/models/Questions";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/options";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const { questionId } = params;
    const question = await Question.findById(questionId);

    if (!question) {
      return new Response(JSON.stringify({ error: "Question not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const userId = session.user.id;
    const hasUpvoted = question.upvotes?.includes(userId);

    // Initialize arrays if they don't exist
    if (!question.upvotes) question.upvotes = [];

    // Handle upvote
    if (hasUpvoted) {
      // Remove upvote
      question.upvotes = question.upvotes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      // Add upvote
      question.upvotes.push(userId);
    }

    await question.save();

    return new Response(
      JSON.stringify({
        message: hasUpvoted ? "Vote removed" : "Vote added",
        upvotes: question.upvotes.length,
        hasUpvoted: !hasUpvoted,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error voting:", error);
    return new Response(JSON.stringify({ error: "Failed to process vote" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
