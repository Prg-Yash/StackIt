import mongoose from "mongoose";

const { Schema } = mongoose;

const ReplySchema = new Schema(
  {
    content: {
      type: Schema.Types.Mixed,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    votes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { _id: true }
);

const AnswerSchema = new Schema(
  {
    content: {
      type: Schema.Types.Mixed,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isAccepted: {
      type: Boolean,
      default: false,
    },
    replies: {
      type: [ReplySchema],
      default: [],
    },
  },
  { _id: true }
);

const QuestionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: Schema.Types.Mixed,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: {
      type: [AnswerSchema],
      default: [],
    },
    tags: {
      type: [String],
      index: true,
      default: [],
    },
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      default: null,
    },
  },
  { timestamps: true }
);

QuestionSchema.index({ title: "text", description: "text" });

export default mongoose.models.Question ||
  mongoose.model("Question", QuestionSchema);
