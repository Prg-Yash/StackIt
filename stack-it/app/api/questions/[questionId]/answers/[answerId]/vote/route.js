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
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const { questionId, answerId } = params;
    const question = await Question.findById(questionId);

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

    const userId = session.user.id;
    const hasVoted = answer.votes.includes(userId);

    if (hasVoted) {
      // Remove vote
      answer.votes = answer.votes.filter((id) => id.toString() !== userId);
    } else {
      // Add vote
      answer.votes.push(userId);
    }

    await question.save();

    return new Response(
      JSON.stringify({
        message: hasVoted ? "Vote removed" : "Vote added",
        votes: answer.votes.length,
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
    console.error("Error voting:", error);
    return new Response(JSON.stringify({ error: "Failed to process vote" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
