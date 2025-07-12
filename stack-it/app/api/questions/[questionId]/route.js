// /app/api/questions/[questionId]/route.js
import { connectDB } from "@/lib/mongoose";
import Question from "@/models/Questions";
import User from "@/models/Users";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/options";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { questionId } = await params;
    const session = await getServerSession(authOptions);

    // First fetch the question to check author
    const question = await Question.findById(questionId);

    if (!question) {
      return new Response(JSON.stringify({ error: "Question not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Only process view if user is authenticated
    if (session?.user?.id) {
      const user = await User.findById(session.user.id);
      const hasViewed = user?.viewedQuestions?.includes(questionId) || false;
      const isAuthor = question.author.toString() === session.user.id;

      console.log("View count debug:", {
        userId: session.user.id,
        hasViewed,
        isAuthor,
        currentViews: question.views,
      });

      // Only increment view and update user's viewed questions if:
      // 1. User is not the author
      // 2. User hasn't viewed this question before
      if (!isAuthor && !hasViewed) {
        console.log("Incrementing view count");
        // Increment view count
        await Question.findByIdAndUpdate(questionId, { $inc: { views: 1 } });

        // Add question to user's viewed questions
        await User.findByIdAndUpdate(session.user.id, {
          $addToSet: { viewedQuestions: questionId },
        });
      }
    }

    // Then fetch the updated question with all its data
    const populatedQuestion = await Question.findById(questionId)
      .populate("author", "name image")
      .populate("answers.author", "name image")
      .populate("answers.replies.author", "name image");

    return new Response(JSON.stringify(populatedQuestion), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch question" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export async function PUT(req, { params }) {
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

    const { questionId } = await params; // Fix: await params first
    const { title, description, tags } = await req.json();

    if (!title || !description) {
      return new Response(
        JSON.stringify({ error: "Title and description are required" }),
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

    if (
      question.author.toString() !== session.user._id &&
      question.author.toString() !== session.user.id
    ) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Not your question" }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    question.title = title;
    question.description = description;
    question.tags = tags || [];
    question.slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();

    await question.save();

    return new Response(
      JSON.stringify({ message: "Question updated successfully", question }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export async function DELETE(req, { params }) {
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

    const { questionId } = await params; // Fix: await params first

    const question = await Question.findById(questionId);

    if (!question) {
      return new Response(JSON.stringify({ error: "Question not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (
      question.author.toString() !== session.user._id &&
      question.author.toString() !== session.user.id
    ) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Not your question" }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Embedded answers will be deleted with the question — nothing extra needed
    await question.deleteOne();

    return new Response(
      JSON.stringify({ message: "Question deleted successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
