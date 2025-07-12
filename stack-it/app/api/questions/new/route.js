// /app/api/question/new/route.js
import { connectDB } from "@/lib/mongoose";
import Question from "@/models/Questions";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/options";

export async function POST(req) {
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

    const body = await req.json();
    const { title, description, tags } = body;

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

    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();

    const question = await Question.create({
      title,
      description,
      slug,
      tags,
      images: null, // Set to null for now, will be updated with S3 URLs later
      author: session.user.id,
    });

    return new Response(
      JSON.stringify({ message: "Question posted successfully", question }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error creating question:", error);
    return new Response(JSON.stringify({ error: "Failed to post question" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
