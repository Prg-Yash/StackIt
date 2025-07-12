import { connectDB } from "@/lib/mongoose";

export async function GET() {
  try {
    await connectDB();
    return Response.json({ connected: true, message: "Database connected successfully" });
  } catch (error) {
    console.error("Database connection failed:", error);
    return Response.json({ 
      connected: false, 
      message: "Database connection failed",
      error: error.message 
    }, { status: 500 });
  }
} 