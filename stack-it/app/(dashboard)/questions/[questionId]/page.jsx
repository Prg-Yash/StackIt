"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Tag,
  Calendar,
  Send,
  Reply,
  ChevronDown,
  ChevronUp,
  Eye,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  const [hasFetched, setHasFetched] = useState(false);
  const [summary, setSummary] = useState("");

  useEffect(() => {
    if (!hasFetched) {
      fetchQuestion();
      setHasFetched(true);
    }
  }, [params.questionId, hasFetched]);

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

  const handleVoteQuestion = async (voteType = "vote") => {
    if (!session) {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      // Check if user has already voted
      const hasVoted = question.upvotes?.includes(session.user.id);

      // Update UI immediately
      setQuestion((prevQuestion) => ({
        ...prevQuestion,
        upvotes: prevQuestion.upvotes?.includes(session.user.id)
          ? prevQuestion.upvotes.filter((id) => id !== session.user.id)
          : [...(prevQuestion.upvotes || []), session.user.id],
      }));

      const response = await fetch(
        `/api/questions/${params.questionId}/${voteType}`,
        {
          method: "POST",
        }
      );
      const data = await response.json();

      if (!response.ok) {
        // Revert UI change on error
        setQuestion((prevQuestion) => ({
          ...prevQuestion,
          upvotes: data.upvotes || prevQuestion.upvotes,
        }));
        throw new Error(data.error || "Failed to vote");
      }

      toast.success(hasVoted ? "Vote removed" : "Vote added");
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to vote");
    }
  };

  const handleVoteAnswer = async (answerId, voteType = "vote") => {
    if (!session) {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      const response = await fetch(
        `/api/questions/${params.questionId}/answers/${answerId}/${voteType}`,
        {
          method: "POST",
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to vote");
      }

      fetchQuestion(); // Refresh question data
      toast.success(data.message);
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to vote");
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    if (!session) {
      toast.error("Please sign in to accept answers");
      return;
    }

    try {
      const response = await fetch(
        `/api/questions/${params.questionId}/answers/${answerId}/accept`,
        {
          method: "POST",
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to accept answer");
      }

      fetchQuestion(); // Refresh question data
      toast.success(data.message);
    } catch (error) {
      console.error("Error accepting answer:", error);
      toast.error("Failed to accept answer");
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerContent.trim()) return;

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

      setAnswerContent("");
      fetchQuestion(); // Refresh question data
      toast.success("Answer posted successfully");
    } catch (error) {
      console.error("Error posting answer:", error);
      toast.error("Failed to post answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowReplyEditor = (answerId) => {
    setShowReplyEditor((prev) => ({
      ...prev,
      [answerId]: !prev[answerId],
    }));
  };

  const handleToggleReplies = (answerId) => {
    setShowReplies((prev) => ({
      ...prev,
      [answerId]: !prev[answerId],
    }));
  };

  //   const handleToxicityCheck = async (text) => {
  //   try {
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_FLASKAUTH_URL}/toxic-analyze`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ "text": text }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to check toxicity");
  //     }

  //     const data = await response.json();
  //     console.log("Toxicity check response:", data);
  //     return data.flagged;
  //   } catch (error) {
  //     console.error("Error checking toxicity:", error);
  //     return false;
  //   }
  // };

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

  const handleReplyChange = (answerId, value) => {
    setReplyContent((prev) => ({
      ...prev,
      [answerId]: value,
    }));
  };

  const handleSubmitReply = async (answerId) => {
    if (!replyContent[answerId]?.trim()) return;

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
        throw new Error(data.error || "Failed to post reply");
      }

      setReplyContent((prev) => ({ ...prev, [answerId]: "" }));
      setShowReplyEditor((prev) => ({ ...prev, [answerId]: false }));
      fetchQuestion(); // Refresh question data
      toast.success("Reply posted successfully");
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("Failed to post reply");
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
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to vote");
      }

      fetchQuestion(); // Refresh question data
      toast.success(data.message);
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to vote");
    }
  };

  //   const handleSummarize = async (text) => {
  //   try {
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_FLASKAUTH_URL}/summarize`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ "text": text }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to check toxicity");
  //     }

  //     const data = await response.json();
  //     console.log("Summary response:", data.summary);
  //     setSummary(data.summary);
  //   } catch (error) {
  //     console.error("Error checking toxicity:", error);
  //     return null;
  //   }
  // };

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

  const calculateAnswerQuality = (answer) => {
    const upvotes = answer.upvotes?.length || 0;
    const downvotes = answer.downvotes?.length || 0;
    const total = upvotes + downvotes;

    if (total === 0) return 0;
    return Math.round((upvotes / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-6">Loading...</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-6">Question not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Question */}
        <Card className="mb-6 bg-white/70 backdrop-blur-md border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground bg-white/50 rounded-full px-2 py-1">
                    <Eye className="w-4 h-4" />
                    {question.views} views
                  </div>
                </div>

                <h1 className="text-3xl font-bold mb-4 text-gray-800">
                  {question.title}
                </h1>

                <div
                  className="prose prose-sm max-w-none mb-4"
                  dangerouslySetInnerHTML={{ __html: question.description }}
                />

                {question.images?.length > 0 && (
                  <div className="mb-4">
                    {question.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Question image ${index + 1}`}
                        className="rounded-lg border max-w-full h-auto shadow-lg mb-2"
                      />
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {question.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {question.author?.name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {question.author?.name || "Anonymous"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(question.createdAt)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVoteQuestion("vote")}
                  disabled={!session}
                  className={`flex items-center gap-1 bg-white/50 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white transition-all duration-300 hover:scale-110 group ${
                    question.upvotes?.includes(session?.user?.id)
                      ? "text-green-600"
                      : ""
                  }`}
                >
                  <ArrowUp className="w-4 h-4 group-hover:animate-bounce" />
                </Button>
                <span className="text-sm font-medium">
                  {question.upvotes?.length || 0}
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Answers Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              {question.answers.length}{" "}
              {question.answers.length === 1 ? "Answer" : "Answers"}
            </h2>
          </div>

          {/* Answer Form */}
          {/* {session && (
            <Card className="bg-white/70 backdrop-blur-md border-0 shadow-lg">
              <CardContent className="p-6">
                <TiptapEditor
                  content={answerContent}
                  onChange={setAnswerContent}
                  placeholder="Write your answer..."
                />
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={isSubmitting || !answerContent.trim()}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  >
                    Post Answer
                  </Button>
                </div>
              </CardContent>
            </Card>
          )} */}

          {/* Answers List */}
          <div className="space-y-6">
            {question.answers
              .sort((a, b) => {
                // Sort by accepted status first
                if (a.isAccepted && !b.isAccepted) return -1;
                if (!a.isAccepted && b.isAccepted) return 1;
                // Then by vote count
                return (
                  (b.upvotes?.length || 0) -
                  (b.downvotes?.length || 0) -
                  (a.upvotes?.length || 0) +
                  (a.downvotes?.length || 0)
                );
              })
              .map((answer) => (
                <Card
                  key={answer._id}
                  className={`bg-white/70 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                    answer.isAccepted ? "border-2 border-green-500" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    {answer.isAccepted && (
                      <div className="flex items-center gap-2 mb-4">
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-600 border-green-200"
                        >
                          ✓ Accepted Answer
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-600 border-green-200"
                        >
                          Best Answer
                        </Badge>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVoteAnswer(answer._id, "vote")}
                          disabled={!session}
                          className={
                            answer.upvotes?.includes(session?.user?.id)
                              ? "text-green-600"
                              : ""
                          }
                        >
                          <ArrowUp className="h-5 w-5" />
                        </Button>
                        <span className="text-sm font-medium">
                          {(answer.upvotes?.length || 0) -
                            (answer.downvotes?.length || 0)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleVoteAnswer(answer._id, "downvote")
                          }
                          disabled={!session}
                          className={
                            answer.downvotes?.includes(session?.user?.id)
                              ? "text-red-600"
                              : ""
                          }
                        >
                          <ArrowDown className="h-5 w-5" />
                        </Button>
                      </div>

                      <div className="flex-1">
                        <div
                          className="prose prose-sm max-w-none mb-4"
                          dangerouslySetInnerHTML={{ __html: answer.content }}
                        />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                  {answer.author?.name
                                    ?.charAt(0)
                                    .toUpperCase() || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {answer.author?.name || "Anonymous"}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(answer.createdAt)}
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-500"
                                  style={{
                                    width: `${calculateAnswerQuality(answer)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">
                                Answer Quality: {calculateAnswerQuality(answer)}
                                %
                              </span>
                            </div>

                            {session?.user?.id === question.author._id &&
                              !answer.isAccepted && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAcceptAnswer(answer._id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  Mark as Accepted
                                </Button>
                              )}
                          </div>
                        </div>

                        {/* Reply section */}
                        {session && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-4 gap-2"
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

                        {showReplyEditor[answer._id] && (
                          <div className="mt-4 pl-6 border-l-2">
                            <TiptapEditor
                              content={replyContent[answer._id] || ""}
                              onChange={(value) =>
                                handleReplyChange(answer._id, value)
                              }
                              placeholder="Write your reply..."
                            />
                            <div className="flex justify-end mt-2">
                              <Button
                                size="sm"
                                onClick={() => handleSubmitReply(answer._id)}
                                disabled={!replyContent[answer._id]?.trim()}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                              >
                                Post Reply
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Replies */}
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
                              {answer.replies.length === 1
                                ? "Reply"
                                : "Replies"}
                            </Button>

                            {showReplies[answer._id] && (
                              <div className="space-y-4 mt-2 pl-6 border-l-2">
                                {answer.replies.map((reply) => (
                                  <div
                                    key={reply._id}
                                    className="relative bg-white/50 rounded-lg p-4"
                                  >
                                    <div className="flex gap-4">
                                      {/* Vote buttons for reply */}
                                      <div className="flex flex-col items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleVoteReply(
                                              answer._id,
                                              reply._id
                                            )
                                          }
                                          disabled={!session}
                                          className={`h-6 w-6 p-0 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300 ${
                                            reply.votes.includes(
                                              session?.user?.id
                                            )
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
                                          <Avatar className="w-5 h-5">
                                            <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                              {reply.author?.name
                                                ?.charAt(0)
                                                .toUpperCase() || "?"}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span>
                                            {reply.author?.name || "Anonymous"}
                                          </span>
                                          <span>•</span>
                                          <span>
                                            {formatDate(reply.createdAt)}
                                          </span>
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
                  </CardContent>
                </Card>
              ))}
          </div>

          <Separator className="my-8" />

          {/* Add Answer Form */}
          {session ? (
            <Card className="bg-white/70 backdrop-blur-md border-0 shadow-xl">
              <CardHeader>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Your Answer
                </h3>
                <p className="text-muted-foreground">
                  Share your knowledge and help the community
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <TiptapEditor
                  content={answerContent}
                  onChange={setAnswerContent}
                  placeholder="Write your answer here..."
                />

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium">💡 Tips for a great answer:</p>
                    <ul className="text-xs mt-1 space-y-1">
                      <li>• Be specific and provide examples</li>
                      <li>• Include code snippets when relevant</li>
                      <li>• Explain your reasoning</li>
                    </ul>
                  </div>
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!answerContent.trim() || isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Submitting..." : "Submit Answer"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-6">
                <p className="text-center text-muted-foreground">
                  Please{" "}
                  <Link
                    href="/sign-in"
                    className="text-primary hover:underline"
                  >
                    sign in
                  </Link>{" "}
                  to answer this question.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;
