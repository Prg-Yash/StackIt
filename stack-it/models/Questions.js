// /models/Question.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const VoteSchema = new Schema(
  {
    voter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    value: { type: Number, enum: [1, -1], required: true },
  },
  { _id: false }
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
      ref: 'User',
      required: true,
    },
    answers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Answer',
      },
    ],
    acceptedAnswer: {
      type: Schema.Types.ObjectId,
      ref: 'Answer',
      default: null,
    },
    tags: {
      type: [String],
      index: true,
      default: [],
    },
    votes: {
      type: [VoteSchema],
      default: [],
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

QuestionSchema.index({ title: 'text', description: 'text' });

export default mongoose.models.Question ||
  mongoose.model('Question', QuestionSchema);
