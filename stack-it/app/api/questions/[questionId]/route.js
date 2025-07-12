// /app/api/questions/[questionId]/route.js
import { connectDB } from "@/lib/mongoose";
import Question from "@/models/Questions";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/options";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { questionId } = await params; // Fix: await params first

    const question = await Question.findById(questionId)
      .populate("author", "name image")
      .populate("answers.author", "name image")
      .populate("answers.replies.author", "name image");

    if (!question) {
      return new Response(JSON.stringify({ error: "Question not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Increment view count
    question.views += 1;
    await question.save();

    return new Response(JSON.stringify(question), {
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
