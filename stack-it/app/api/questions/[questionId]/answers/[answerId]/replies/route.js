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
    const { content } = await req.json();

    if (!content?.trim()) {
      return new Response(
        JSON.stringify({ error: "Reply content is required" }),
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

    // Add the reply
    answer.replies.push({
      content,
      author: session.user.id,
      createdAt: new Date(),
      votes: [],
    });

    await question.save();

    // Re-fetch to get populated data
    const updatedQuestion = await Question.findById(questionId)
      .populate("author", "name")
      .populate("answers.author", "name")
      .populate("answers.replies.author", "name");

    return new Response(
      JSON.stringify({
        message: "Reply added successfully",
        question: updatedQuestion,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error adding reply:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to add reply",
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

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { questionId, answerId } = params;
    const question = await Question.findById(questionId).populate(
      "answers.replies.author",
      "name"
    );

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

    return new Response(
      JSON.stringify({
        replies: answer.replies,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching replies:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch replies",
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
