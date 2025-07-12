import { connectDB } from "@/lib/mongoose";
import Question from "@/models/Questions";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/options";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { userId } = params;
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const sortBy = searchParams.get("sortBy") || "newest";
    const skip = (page - 1) * limit;

    // Build the sort options
    let sortOptions = {};
    switch (sortBy) {
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      case "most-voted":
        sortOptions = { "votes.length": -1, createdAt: -1 };
        break;
      case "most-answers":
        sortOptions = { "answers.length": -1, createdAt: -1 };
        break;
      case "most-views":
        sortOptions = { views: -1, createdAt: -1 };
        break;
      case "newest":
      default:
        sortOptions = { createdAt: -1 };
    }

    // Fetch questions by user
    const questions = await Question.find({ author: userId })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate("author", "name image username")
      .lean();

    // Get total count for pagination
    const total = await Question.countDocuments({ author: userId });
    const hasMore = skip + limit < total;

    return new Response(
      JSON.stringify({
        questions,
        pagination: {
          page,
          limit,
          total,
          hasMore,
          totalPages: Math.ceil(total / limit),
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching user questions:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch user questions" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
} 