import { connectDB } from "@/lib/mongoose";
import Question from "@/models/Questions";
import Notification from "@/models/Notifications";
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
    const { content } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: "Answer content is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return new Response(JSON.stringify({ error: "Question not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    question.answers.push({
      content,
      author: session.user.id,
    });

    await question.save();

    // Create notification for the question author (only if the answer author is different from question author)
    if (question.author.toString() !== session.user.id) {
      try {
        await Notification.create({
          user: question.author,
          type: 'new_answer',
          message: `Someone answered your question: "${question.title}"`,
          link: `/questions/${questionId}`,
        });
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the answer submission if notification fails
      }
    }

    // Populate the author details of the new answer
    const populatedQuestion = await Question.findById(questionId)
      .populate("author", "name image")
      .populate("answers.author", "name image");

    return new Response(
      JSON.stringify({
        message: "Answer posted successfully",
        question: populatedQuestion,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error posting answer:", error);
    return new Response(JSON.stringify({ error: "Failed to post answer" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
