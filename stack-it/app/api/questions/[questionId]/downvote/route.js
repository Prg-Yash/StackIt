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
    const hasDownvoted = question.downvotes?.includes(userId);

    // Initialize arrays if they don't exist
    if (!question.upvotes) question.upvotes = [];
    if (!question.downvotes) question.downvotes = [];

    // Handle downvote
    if (hasDownvoted) {
      // Remove downvote
      question.downvotes = question.downvotes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      // Add downvote and remove upvote if exists
      question.downvotes.push(userId);
      if (hasUpvoted) {
        question.upvotes = question.upvotes.filter(
          (id) => id.toString() !== userId
        );
      }
    }

    await question.save();

    return new Response(
      JSON.stringify({
        message: hasDownvoted ? "Downvote removed" : "Downvote added",
        upvotes: question.upvotes.length,
        downvotes: question.downvotes.length,
        hasUpvoted: false,
        hasDownvoted: !hasDownvoted,
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
