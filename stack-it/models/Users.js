// /models/User.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const ROLES = ["user", "admin"];
const PROVIDERS = ["credentials"];

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    provider: {
      type: String,
      enum: PROVIDERS,
      default: "credentials",
    },
    emailVerified: Date,
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    image: String,
    bio: String,
    role: {
      type: String,
      enum: ROLES,
      default: "user",
    },
    viewedQuestions: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Question",
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// Remove the duplicate index declaration
// UserSchema.index({ email: 1 });

export default mongoose.models.User || mongoose.model("User", UserSchema);
