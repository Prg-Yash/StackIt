import { connectDB } from "@/lib/mongoose";
import Question from "@/models/Questions";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const query = searchParams.get("query");
    const sortBy = searchParams.get("sortBy") || "newest";
    const tags = searchParams.get("tags")?.split(",").filter(Boolean) || [];

    // Build the search query
    let searchQuery = {};

    if (query) {
      searchQuery.$text = { $search: query };
    }

    if (tags.length > 0) {
      searchQuery.tags = { $in: tags };
    }

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
      case "newest":
      default:
        sortOptions = { createdAt: -1 };
    }

    const questions = await Question.find(searchQuery)
      .sort(sortOptions)
      .populate("author", "name image")
      .lean();

    return new Response(JSON.stringify(questions), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch questions" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
