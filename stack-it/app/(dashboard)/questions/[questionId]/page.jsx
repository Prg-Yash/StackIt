"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Tag,
  Reply,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TiptapEditor from "@/components/ui/tiptap-editor";
import { toast } from "sonner";

const QuestionPage = ({ params: rawParams }) => {
  const params = use(rawParams);
  const { data: session } = useSession();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyContent, setReplyContent] = useState({});
  const [showReplyEditor, setShowReplyEditor] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [summary, setSummary] = useState("");

  useEffect(() => {
    fetchQuestion();
  }, [params.questionId]); // Add params.questionId as dependency

  const fetchQuestion = async () => {
    try {
      const response = await fetch(`/api/questions/${params.questionId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch question");
      }

      setQuestion(data);
    } catch (error) {
      console.error("Error fetching question:", error);
      toast.error("Failed to fetch question");
    } finally {
      setLoading(false);
    }
  };

  const handleVoteQuestion = async () => {
    if (!session) {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      const response = await fetch(`/api/questions/${params.questionId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to vote");
      }

      setQuestion((prev) => ({
        ...prev,
        votes: data.hasVoted
          ? [...prev.votes, session.user.id]
          : prev.votes.filter((id) => id !== session.user.id),
      }));

      toast.success(data.message);
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to process vote");
    }
  };

  const handleVoteAnswer = async (answerId) => {
    if (!session) {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      const response = await fetch(
        `/api/questions/${params.questionId}/answers/${answerId}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to vote");
      }

      setQuestion((prev) => ({
        ...prev,
        answers: prev.answers.map((answer) => {
          if (answer._id === answerId) {
            return {
              ...answer,
              votes: data.hasVoted
                ? [...answer.votes, session.user.id]
                : answer.votes.filter((id) => id !== session.user.id),
            };
          }
          return answer;
        }),
      }));

      toast.success(data.message);
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to process vote");
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!session || !answerContent.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/questions/${params.questionId}/answers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: answerContent }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to post answer");
      }

      setQuestion(data.question);
      setAnswerContent("");
    } catch (error) {
      console.error("Error posting answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowReplyEditor = (answerId) => {
    setShowReplyEditor((prev) => ({
      ...prev,
      [answerId]: !prev[answerId],
    }));
    if (!showReplyEditor[answerId]) {
      setReplyContent((prev) => ({
        ...prev,
        [answerId]: "",
      }));
    }
  };

  const handleToggleReplies = (answerId) => {
    setShowReplies((prev) => ({
      ...prev,
      [answerId]: !prev[answerId],
    }));
  };

    const handleToxicityCheck = async (text) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_FLASKAUTH_URL}/toxic-analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ "text": text }),
      });

      if (!response.ok) {
        throw new Error("Failed to check toxicity");
      }

      const data = await response.json();
      console.log("Toxicity check response:", data);
      return data.flagged;
    } catch (error) {
      console.error("Error checking toxicity:", error);
      return false;
    }
  };

  const handleReplySubmit = async (answerId) => {
    if (!session || !replyContent[answerId]?.trim()) return;

    try {
      const response = await fetch(
        `/api/questions/${params.questionId}/answers/${answerId}/replies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: replyContent[answerId] }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add reply");
      }

      setQuestion(data.question);
      setReplyContent((prev) => ({
        ...prev,
        [answerId]: "",
      }));
      setShowReplyEditor((prev) => ({
        ...prev,
        [answerId]: false,
      }));
      setShowReplies((prev) => ({
        ...prev,
        [answerId]: true,
      }));
      toast.success("Reply added successfully");
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Failed to add reply");
    }
  };

  const handleVoteReply = async (answerId, replyId) => {
    if (!session) {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      const response = await fetch(
        `/api/questions/${params.questionId}/answers/${answerId}/replies/${replyId}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to vote");
      }

      setQuestion(data.question);
      toast.success(data.message);
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to process vote");
    }
  };

    const handleSummarize = async (text) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_FLASKAUTH_URL}/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ "text": text }),
      });

      if (!response.ok) {
        throw new Error("Failed to check toxicity");
      }

      const data = await response.json();
      console.log("Summary response:", data.summary);
      setSummary(data.summary);
    } catch (error) {
      console.error("Error checking toxicity:", error);
      return null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-6">Loading...</div>;
  }

  if (!question) {
    return (
      <div className="container mx-auto px-4 py-6">Question not found</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Back Button */}
      <Link href="/questions" className="inline-block mb-6">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Questions
        </Button>
      </Link>

      {/* Question */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex gap-4">
            {/* Vote buttons */}
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoteQuestion}
                disabled={!session}
                className={`h-8 w-8 p-0 ${
                  question.votes.includes(session?.user?.id)
                    ? "text-primary"
                    : ""
                }`}
              >
                <ArrowUp className="h-6 w-6" />
              </Button>
              <span className="font-semibold">{question.votes.length}</span>
            </div>

            <div className="flex-1">
              <CardTitle className="text-2xl mb-4">{question.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-2 text-sm mb-4">
                <span className="text-muted-foreground">
                  Asked by {question.author?.name || "Anonymous"}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {formatDate(question.createdAt)}
                </span>
              </div>
              <div className="flex gap-2 mb-6">
                {question.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm sm:prose-base dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: question.description }}
          />
        </CardContent>
      </Card>

      {/* Answers */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">
          {question.answers.length}{" "}
          {question.answers.length === 1 ? "Answer" : "Answers"}
        </h2>

        {question.answers.map((answer) => (
          <Card key={answer._id}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                {/* Vote buttons */}
                <div className="flex flex-col items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVoteAnswer(answer._id)}
                    disabled={!session}
                    className={`h-8 w-8 p-0 ${
                      answer.votes.includes(session?.user?.id)
                        ? "text-primary"
                        : ""
                    }`}
                  >
                    <ArrowUp className="h-6 w-6" />
                  </Button>
                  <span className="font-semibold">{answer.votes.length}</span>
                </div>

                <div className="flex-1">
                  <div
                    className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-4"
                    dangerouslySetInnerHTML={{ __html: answer.content }}
                  />
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      Answered by {answer.author?.name || "Anonymous"}
                    </span>
                    <span>•</span>
                    <span>{formatDate(answer.createdAt)}</span>
                    {session && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleShowReplyEditor(answer._id)}
                      >
                        <Reply className="h-4 w-4" />
                        Reply
                      </Button>
                    )}
                    {session && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleSummarize(answer.content)}
                        disabled={!answer.content.trim()}
                      >
                        Summarize
                      </Button>
                    )}
                  </div>

                  {/* Reply Editor */}
                  {showReplyEditor[answer._id] && (
                    <div className="mt-4 pl-4 border-l-2">
                      <TiptapEditor
                        content={replyContent[answer._id]}
                        onChange={(content) =>
                          setReplyContent((prev) => ({
                            ...prev,
                            [answer._id]: content,
                          }))
                        }
                        placeholder="Write your reply..."
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowReplyEditor(answer._id)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReplySubmit(answer._id)}
                          disabled={!replyContent[answer._id]?.trim()}
                        >
                          Post Reply
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Replies Section */}
                  {answer.replies?.length > 0 && (
                    <div className="mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleToggleReplies(answer._id)}
                      >
                        {showReplies[answer._id] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        {answer.replies.length}{" "}
                        {answer.replies.length === 1 ? "Reply" : "Replies"}
                      </Button>

                      {showReplies[answer._id] && (
                        <div className="pl-8 mt-2 space-y-4 border-l-2">
                          {answer.replies.map((reply) => (
                            <div key={reply._id} className="relative">
                              <div className="flex gap-4">
                                {/* Vote buttons for reply */}
                                <div className="flex flex-col items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleVoteReply(answer._id, reply._id)
                                    }
                                    disabled={!session}
                                    className={`h-6 w-6 p-0 ${
                                      reply.votes.includes(session?.user?.id)
                                        ? "text-primary"
                                        : ""
                                    }`}
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                  </Button>
                                  <span className="text-sm font-semibold">
                                    {reply.votes.length}
                                  </span>
                                </div>

                                <div className="flex-1">
                                  <div
                                    className="prose prose-sm dark:prose-invert max-w-none mb-2"
                                    dangerouslySetInnerHTML={{
                                      __html: reply.content,
                                    }}
                                  />
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>
                                      {reply.author?.name || "Anonymous"}
                                    </span>
                                    <span>•</span>
                                    <span>{formatDate(reply.createdAt)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Answer */}
        {session ? (
          <Card>
            <CardHeader>
              <CardTitle>Your Answer</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitAnswer} className="space-y-4">
                <TiptapEditor
                  content={answerContent}
                  onChange={setAnswerContent}
                  onBlur={(html) => {
                    handleToxicityCheck(html).then((isToxic) => {
                      if (isToxic) {
                        console.warn("Toxic content detected, clearing description");
                        setAnswerContent("");
                      }
                    });
                  }}
                  placeholder="Write your answer here..."
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !answerContent.trim()}
                  >
                    {isSubmitting ? "Posting..." : "Post Answer"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-6">
              <p className="text-center text-muted-foreground">
                Please{" "}
                <Link href="/sign-in" className="text-primary hover:underline">
                  sign in
                </Link>{" "}
                to answer this question.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QuestionPage;
