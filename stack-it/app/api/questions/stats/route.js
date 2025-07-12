import { connectDB } from "@/lib/mongoose";
import Question from "@/models/Questions";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/options";

export async function GET(req) {
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

    const userId = session.user.id;

    // Find all questions by the user
    const userQuestions = await Question.find({ author: userId });

    // Calculate stats
    const totalQuestions = userQuestions.length;
    const totalAnswers = userQuestions.reduce(
      (sum, q) => sum + (q.answers?.length || 0),
      0
    );
    const totalViews = userQuestions.reduce(
      (sum, q) => sum + (q.views || 0),
      0
    );

    return new Response(
      JSON.stringify({
        totalQuestions,
        totalAnswers,
        totalViews,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch user stats" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
