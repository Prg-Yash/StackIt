import { connectDB } from "@/lib/mongoose";
import Question from "@/models/Questions";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../../auth/options";

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

    const { questionId, answerId, replyId } = params;

    if (!questionId || !answerId || !replyId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const question = await Question.findById(questionId)
      .populate("author", "name")
      .populate("answers.author", "name")
      .populate("answers.replies.author", "name");

    if (!question) {
      return new Response(JSON.stringify({ error: "Question not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const answer = question.answers.id(answerId);
    if (!answer) {
      return new Response(JSON.stringify({ error: "Answer not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const reply = answer.replies.id(replyId);
    if (!reply) {
      return new Response(JSON.stringify({ error: "Reply not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const userId = session.user.id;
    const hasVoted = reply.votes.some((vote) => vote.toString() === userId);

    if (hasVoted) {
      // Remove vote
      reply.votes = reply.votes.filter((vote) => vote.toString() !== userId);
    } else {
      // Add vote
      reply.votes.push(userId);
    }

    await question.save();

    // Re-fetch to get populated data
    const updatedQuestion = await Question.findById(questionId)
      .populate("author", "name")
      .populate("answers.author", "name")
      .populate("answers.replies.author", "name");

    return new Response(
      JSON.stringify({
        message: hasVoted ? "Vote removed" : "Vote added",
        question: updatedQuestion,
        hasVoted: !hasVoted,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing vote:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process vote",
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
