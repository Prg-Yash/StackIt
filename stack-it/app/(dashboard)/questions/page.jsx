"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ArrowUp,
  MessageSquare,
  Tag,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";

const page = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTags, setSelectedTags] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState([]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (searchQuery) {
        queryParams.set("query", searchQuery);
      }

      if (sortBy) {
        queryParams.set("sortBy", sortBy);
      }

      if (selectedTags.length > 0) {
        queryParams.set("tags", selectedTags.join(","));
      }

      const response = await fetch(`/api/questions?${queryParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch questions");
      }

      setQuestions(data);

      // Extract unique tags from questions
      const uniqueTags = [...new Set(data.flatMap((q) => q.tags))].sort();
      setAllTags(uniqueTags);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [searchQuery, sortBy, selectedTags]);

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
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

  return (
    <div>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Filters</h3>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Sort */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort by</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="most-voted">Most Voted</SelectItem>
                    <SelectItem value="most-answers">Most Answers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tags Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Tags</label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allTags.map((tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={tag}
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={() => handleTagToggle(tag)}
                      />
                      <label htmlFor={tag} className="text-sm cursor-pointer">
                        {tag}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Sheet */}
          <div className="lg:hidden">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Filter and sort questions
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-4 mt-6">
                    {/* Sort */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sort by</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest</SelectItem>
                          <SelectItem value="oldest">Oldest</SelectItem>
                          <SelectItem value="most-voted">Most Voted</SelectItem>
                          <SelectItem value="most-answers">
                            Most Answers
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tags Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Filter by Tags
                      </label>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {allTags.map((tag) => (
                          <div
                            key={tag}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`mobile-${tag}`}
                              checked={selectedTags.includes(tag)}
                              onCheckedChange={() => handleTagToggle(tag)}
                            />
                            <label
                              htmlFor={`mobile-${tag}`}
                              className="text-sm cursor-pointer"
                            >
                              {tag}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Questions</h1>
              <Link href="/ask">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ask Question
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading questions...</div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No questions found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <Link key={question._id} href={`/questions/${question._id}`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                      <CardHeader>
                        <div className="flex gap-4">
                          {/* Vote count */}
                          <div className="flex flex-col items-center justify-center min-w-[60px] text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="cursor-default"
                            >
                              <ArrowUp className="h-4 w-4 mr-1" />
                              {question.votes?.length || 0}
                            </Button>
                          </div>

                          <div className="flex-1">
                            <h2 className="text-xl font-semibold mb-2">
                              {question.title}
                            </h2>
                            <div
                              className="prose prose-sm sm:prose-base dark:prose-invert mb-4"
                              dangerouslySetInnerHTML={{
                                __html: question.description,
                              }}
                            />
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <div className="flex gap-1">
                                {question.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">
                                Asked by {question.author?.name || "Anonymous"}
                              </span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">
                                {formatDate(question.createdAt)}
                              </span>
                              <span className="text-muted-foreground ml-auto flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                {question.answers?.length || 0} answers
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default page;
