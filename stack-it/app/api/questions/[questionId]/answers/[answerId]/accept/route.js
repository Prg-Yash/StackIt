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

    const { questionId, answerId } = await params;
    const question = await Question.findById(questionId);

    if (!question) {
      return new Response(JSON.stringify({ error: "Question not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if user is the question author
    if (question.author.toString() !== session.user.id) {
      return new Response(
        JSON.stringify({
          error: "Only the question author can accept answers",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Reset all answers' accepted status
    question.answers.forEach((answer) => {
      answer.isAccepted = false;
    });

    // Set the selected answer as accepted
    const answer = question.answers.id(answerId);
    if (!answer) {
      return new Response(JSON.stringify({ error: "Answer not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    answer.isAccepted = true;
    await question.save();

    return new Response(
      JSON.stringify({ message: "Answer marked as accepted" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error accepting answer:", error);
    return new Response(JSON.stringify({ error: "Failed to accept answer" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
